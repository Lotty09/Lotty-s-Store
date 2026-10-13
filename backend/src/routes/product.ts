import { FastifyInstance } from 'fastify';
import { createProduct, getProducts, getProductById, uploadProductImage, deleteProduct } from '../controllers/product';
import { verifyAdmin } from '../middleware/auth';

export async function productRoutes(fastify: FastifyInstance) {
  fastify.get('/', getProducts); 
  
  // NEW: Route to fetch a single product by its ID
  fastify.get('/:id', getProductById); 

  fastify.post('/', { preHandler: [verifyAdmin] }, createProduct); 

  // Route for image uploads
  fastify.post('/:id/image', { preHandler: [verifyAdmin] }, uploadProductImage); 

  // Route for deleting products securely
  fastify.delete('/:id', { preHandler: [verifyAdmin] }, deleteProduct);
}