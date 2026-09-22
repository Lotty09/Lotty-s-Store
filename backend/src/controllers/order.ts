import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (request: FastifyRequest, reply: FastifyReply) => {
  const { customerName, customerEmail, customerPhone, address, totalAmount, items } = request.body as any;

  try {
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        address,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      }
    });

    reply.code(201).send(order);
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Failed to process checkout' });
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
  const { status } = request.body as { status: string };

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });
    
    reply.send(updatedOrder);
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Failed to update order status' });
  }
};

export const trackOrder = async (request: FastifyRequest, reply: FastifyReply) => {
  const { orderId, email } = request.body as { orderId: string, email: string };
  
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        customerEmail: email
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