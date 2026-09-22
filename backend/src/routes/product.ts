import { FastifyInstance } from 'fastify';
import { createProduct, getProducts, uploadProductImage, deleteProduct } from '../controllers/product';
import { verifyAdmin } from '../middleware/auth';

export async function productRoutes(fastify: FastifyInstance) {
  fastify.get('/', getProducts); 
  fastify.post('/', { preHandler: [verifyAdmin] }, createProduct); 
  
  // Route for image uploads
  fastify.post('/:id/image', { preHandler: [verifyAdmin] }, uploadProductImage); 
  
  // Route for deleting products securely
  fastify.delete('/:id', { preHandler: [verifyAdmin] }, deleteProduct);
}