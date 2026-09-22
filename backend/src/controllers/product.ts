import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const prisma = new PrismaClient();

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
  const { name, description, price, originalPrice, stockQuantity, categoryId, sku } = request.body as any;
  
  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        stockQuantity,
        sku,
        categoryId: Number(categoryId),
      }
    });
    reply.code(201).send(product);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to create product' });
  }
};

export const uploadProductImage = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const data = await request.file();
  
  if (!data) return reply.code(400).send({ error: 'No image uploaded' });

  try {
    const buffer = await data.toBuffer();

    // Stream the buffer to Cloudinary
    const uploadToCloudinary = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'lottys-store' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(buffer).pipe(uploadStream);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    // Save the secure cloud URL to the database
    const image = await prisma.productImage.create({
      data: {
        url: cloudinaryResult.secure_url,
        productId: Number(id),
      }
    });

    reply.send(image);
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Cloud image upload failed' });
  }
};

// Safely delete product by clearing related records first
export const deleteProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const productId = Number(id);

  try {
    // 1. Delete associated order items to prevent foreign key errors
    await prisma.orderItem.deleteMany({
      where: { productId: productId }
    });

    // 2. Delete associated product images
    await prisma.productImage.deleteMany({
      where: { productId: productId }
    });

    // 3. Delete the actual product
    await prisma.product.delete({
      where: { id: productId }
    });
    
    reply.send({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Failed to delete product' });
  }
};