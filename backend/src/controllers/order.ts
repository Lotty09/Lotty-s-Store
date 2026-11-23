import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getPaymentProvider, isPaymentEnabled } from '../payments';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (value: unknown, minLength: number, maxLength: number): string | null => {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length >= minLength && text.length <= maxLength ? text : null;
};

const parseId = (value: unknown): number | null => {
  const id = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const parseQuantity = (value: unknown): number | null => {
  const quantity = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedStatuses = new Set(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']);

class InsufficientStockError extends Error {}

export const createOrder = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!isRecord(request.body)) {
    return reply.code(400).send({ error: 'Invalid checkout data' });
  }

  const customerName = readText(request.body.customerName, 2, 160);
  const customerEmail = readText(request.body.customerEmail, 3, 254)?.toLowerCase();
  const customerPhone = readText(request.body.customerPhone, 7, 30);
  const address = readText(request.body.address, 10, 2_000);
  const paymentEnabled = isPaymentEnabled();
  const hasPaymentReference = request.body.paymentReference !== undefined
    && request.body.paymentReference !== null
    && request.body.paymentReference !== '';
  const paymentReference = hasPaymentReference
    ? readText(request.body.paymentReference, 1, 200)
    : null;
  const items = request.body.items;

  if (!customerName || !customerEmail || !customerPhone || !address
    || (hasPaymentReference && !paymentReference)
    || (paymentEnabled && !paymentReference)
    || !emailPattern.test(customerEmail) || !Array.isArray(items) || items.length === 0) {
    return reply.code(400).send({
      error: paymentEnabled
        ? 'Provide valid checkout details and payment information.'
        : 'Provide valid checkout details.',
    });
  }

  const normalizedItems: Array<{ productId: number; quantity: number; image: string | null }> = [];
  for (const item of items) {
    if (!isRecord(item)) {
      return reply.code(400).send({ error: 'Invalid cart item.' });
    }

    const productId = parseId(item.id);
    const quantity = parseQuantity(item.quantity);
    if (!productId || !quantity) {
      return reply.code(400).send({ error: 'Invalid cart item.' });
    }

    const image = typeof item.image === 'string' && item.image.length > 0
      ? readText(item.image, 1, 2_000)
      : null;
    normalizedItems.push({ productId, quantity, image });
  }

  try {
    if (paymentReference) {
      const existingOrder = await prisma.order.findUnique({
        where: { paymentReference },
        select: { id: true },
      });
      if (existingOrder) {
        return reply.code(409).send({ error: 'This payment has already been used.' });
      }
    }

    const productIds = [...new Set(normalizedItems.map(item => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true },
    });

    if (products.length !== productIds.length) {
      return reply.code(400).send({ error: 'One or more cart items are no longer available.' });
    }

    const productById = new Map(products.map(product => [product.id, product]));
    let totalAmount = 0;
    const orderItems = normalizedItems.map(item => {
      const product = productById.get(item.productId);
      if (!product) throw new Error('Cart product unavailable');
      if (product.stockQuantity < item.quantity) {
        throw new InsufficientStockError(`Insufficient stock for ${product.name}.`);
      }

      totalAmount += product.price * item.quantity;
      const acceptedImage = item.image
        && product.images.some(image => image.url === item.image)
        ? item.image
        : null;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        image: acceptedImage,
      };
    });

    totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;
    if (paymentReference) {
      const paymentProvider = getPaymentProvider();
      if (!paymentProvider) {
        return reply.code(503).send({ error: 'The configured payment provider is not supported.' });
      }

      const verification = await paymentProvider.verifyPayment({
        reference: paymentReference,
        expectedAmount: Math.round(totalAmount * 100),
        email: customerEmail,
      });
      if (!verification.ok) {
        return reply.code(verification.status).send({ error: verification.error });
      }
    }

    const order = await prisma.$transaction(async transaction => {
      for (const item of orderItems) {
        const updated = await transaction.product.updateMany({
          where: { id: item.productId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new InsufficientStockError('A cart item is no longer in stock.');
        }
      }

      return transaction.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          address,
          totalAmount,
          status: paymentReference ? 'PAID' : 'PENDING',
          paymentReference,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });

    return reply.code(201).send(order);
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return reply.code(409).send({ error: error.message });
    }
    request.log.error({ error }, 'Failed to process checkout');
    return reply.code(500).send({ error: 'Failed to process checkout' });
  }
};

export const getOrders = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    reply.send(orders);
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Failed to fetch orders' });
  }
};

// NEW: Update the status of a specific order
export const updateOrderStatus = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const orderId = parseId(id);
  if (!orderId) {
    return reply.code(400).send({ error: 'Order ID must be a positive integer.' });
  }

  if (!isRecord(request.body) || typeof request.body.status !== 'string') {
    return reply.code(400).send({ error: 'A valid order status is required.' });
  }

  const status = request.body.status.trim().toUpperCase();
  if (!allowedStatuses.has(status)) {
    return reply.code(400).send({ error: 'Invalid order status.' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    
    return reply.send(updatedOrder);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return reply.code(404).send({ error: 'Order not found' });
    }
    request.log.error({ error }, 'Failed to update order status');
    return reply.code(500).send({ error: 'Failed to update order status' });
  }
};

export const trackOrder = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!isRecord(request.body)) {
    return reply.code(400).send({ error: 'Provide an order ID and email address.' });
  }

  const orderId = parseId(request.body.orderId);
  const email = readText(request.body.email, 3, 254)?.toLowerCase();
  if (!orderId || !email || !emailPattern.test(email)) {
    return reply.code(400).send({ error: 'Provide a valid order ID and email address.' });
  }
  
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerEmail: { equals: email, mode: 'insensitive' }
      },
      include: { items: true } 
    });

    if (!order) {
      return reply.code(404).send({ error: 'Order not found. Please check your Order ID and Email.' });
    }

    reply.send(order);
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Failed to track order' });
  }
};