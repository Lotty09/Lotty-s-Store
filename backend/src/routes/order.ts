import { FastifyInstance } from 'fastify';
import { createOrder, getOrders, updateOrderStatus, trackOrder } from '../controllers/order';
import { verifyAdmin } from '../middleware/auth';

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.post('/', createOrder);
  fastify.post('/track', trackOrder);
  fastify.get('/', { preHandler: [verifyAdmin] }, getOrders);
  fastify.put('/:id/status', { preHandler: [verifyAdmin] }, updateOrderStatus);
}