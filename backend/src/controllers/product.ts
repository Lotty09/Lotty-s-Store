import { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma, type ProductImage } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { prisma } from '../lib/prisma';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (value: unknown, minLength: number, maxLength: number): string | null => {
  if (typeof value !== 'string') return null;

  const text = value.trim();
  return text.length >= minLength && text.length <= maxLength ? text : null;
};

const readOptionalText = (value: unknown, maxLength: number): string | null | undefined => {
  if (value === undefined || value === null || value === '') return null;
  return readText(value, 1, maxLength) ?? undefined;
};

const parseId = (value: string): number | null => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const parseCurrency = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) return null;

  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;

  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

const parseNonNegativeInteger = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) return null;

  const number = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
};

const acceptedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME
  && process.env.CLOUDINARY_API_KEY
  && process.env.CLOUDINARY_API_SECRET,
);

const uploadBuffer = (buffer: Buffer): Promise<string> => new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'lottys-store' },
    (error, result) => {
      if (error || !result?.secure_url) {
        reject(error ?? new Error('Cloud image upload did not return a URL.'));
        return;
      }

      resolve(result.secure_url);
    },
  );

  Readable.from(buffer).pipe(uploadStream);
});

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getProducts = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    reply.send(products);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!isRecord(request.body)) {
    return reply.code(400).send({ error: 'Invalid product data' });
  }

  const name = readText(request.body.name, 1, 160);
  const description = readOptionalText(request.body.description, 5_000);
  const price = parseCurrency(request.body.price);
  const hasOriginalPrice = request.body.originalPrice !== undefined
    && request.body.originalPrice !== null
    && request.body.originalPrice !== '';
  const originalPrice = hasOriginalPrice ? parseCurrency(request.body.originalPrice) : null;
  const stockQuantity = parseNonNegativeInteger(request.body.stockQuantity);
  const categoryId = parseId(String(request.body.categoryId));
  const sku = readOptionalText(request.body.sku, 120);

  if (!name || description === undefined || price === null || (hasOriginalPrice && originalPrice === null) || stockQuantity === null || !categoryId || sku === undefined) {
    return reply.code(400).send({ error: 'Provide valid product details.' });
  }

  if (originalPrice !== null && originalPrice < price) {
    return reply.code(400).send({ error: 'Original price must be greater than or equal to the current price.' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      return reply.code(400).send({ error: 'The selected category does not exist.' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        stockQuantity,
        sku,
        categoryId,
      },
    });
    return reply.code(201).send(product);
  } catch (error) {
    request.log.error({ error }, 'Failed to create product');
    return reply.code(500).send({ error: 'Failed to create product' });
  }
};

export const uploadProductImage = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const productId = parseId(id);
  if (!productId) {
    return reply.code(400).send({ error: 'Product ID must be a positive integer.' });
  }

  if (!cloudinaryConfigured) {
    return reply.code(503).send({ error: 'Image uploads are not configured.' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return reply.code(404).send({ error: 'Product not found' });
    }

    const uploadedImages: ProductImage[] = [];
    const parts = request.files();

    for await (const part of parts) {
      const buffer = await part.toBuffer();

      if (!acceptedImageTypes.has(part.mimetype)) {
        return reply.code(400).send({ error: 'Only JPEG, PNG, WebP, and GIF images are accepted.' });
      }

      if (buffer.length === 0) {
        return reply.code(400).send({ error: 'Uploaded images cannot be empty.' });
      }

      const url = await uploadBuffer(buffer);
      const image = await prisma.productImage.create({
        data: {
          url,
          productId,
        }
      });

      uploadedImages.push(image);
    }

    if (uploadedImages.length === 0) {
      return reply.code(400).send({ error: 'No images uploaded' });
    }

    return reply.send(uploadedImages);
  } catch (error) {
    request.log.error({ error }, 'Cloud image upload failed');
    return reply.code(500).send({ error: 'Cloud image upload failed' });
  }
};

export const deleteProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const productId = parseId(id);
  if (!productId) {
    return reply.code(400).send({ error: 'Product ID must be a positive integer.' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { _count: { select: { orderItems: true } } },
    });

    if (!product) {
      return reply.code(404).send({ error: 'Product not found' });
    }

    if (product._count.orderItems > 0) {
      return reply.code(409).send({ error: 'Products with existing orders cannot be deleted.' });
    }

    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);

    return reply.send({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return reply.code(404).send({ error: 'Product not found' });
    }

    request.log.error({ error }, 'Failed to delete product');
    return reply.code(500).send({ error: 'Failed to delete product' });
  }
};
export const getProductById = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const productId = parseId(id);
  if (!productId) {
    return reply.code(400).send({ error: 'Product ID must be a positive integer.' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, images: true }
    });
    
    if (!product) return reply.code(404).send({ error: 'Product not found' });
    return reply.send(product);
  } catch (error) {
    request.log.error({ error }, 'Failed to fetch product');
    return reply.code(500).send({ error: 'Failed to fetch product' });
  }
};
