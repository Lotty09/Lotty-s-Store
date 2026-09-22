import { FastifyInstance } from 'fastify';
import { createOrder, getOrders, updateOrderStatus, trackOrder } from '../controllers/order';

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.post('/', createOrder);
  fastify.post('/track', trackOrder);
  fastify.get('/', getOrders);
  
  // FIXED: Changed from .patch to .put to bypass strict CORS method blocks
  fastify.put('/:id/status', updateOrderStatus);
}