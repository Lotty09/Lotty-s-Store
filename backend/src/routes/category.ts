import { FastifyInstance } from 'fastify';
import { getCategories, createCategory, deleteCategory } from '../controllers/category';
import { verifyAdmin } from '../middleware/auth';

export async function categoryRoutes(fastify: FastifyInstance) {
  fastify.get('/', getCategories);
  fastify.post('/', { preHandler: [verifyAdmin] }, createCategory);
  fastify.delete('/:id', { preHandler: [verifyAdmin] }, deleteCategory);
}
