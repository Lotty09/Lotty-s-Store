import { FastifyInstance } from 'fastify';
import { getCategories, createCategory, deleteCategory } from '../controllers/category';

export async function categoryRoutes(fastify: FastifyInstance) {
  fastify.get('/', getCategories);
  fastify.post('/', createCategory);
  
  // NEW: Delete route
  fastify.delete('/:id', deleteCategory);
}