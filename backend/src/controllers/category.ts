import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    });
    reply.send(categories);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, description } = request.body as any;
  try {
    const category = await prisma.category.create({
      data: { name, description }
    });
    reply.code(201).send(category);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to create category' });
  }
};

// NEW: Safely delete a category
export const deleteCategory = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  try {
    // 1. Check if any products are using this category
    const productCount = await prisma.product.count({
      where: { categoryId: Number(id) }
    });

    if (productCount > 0) {
      return reply.code(400).send({ 
        error: `Cannot delete. There are ${productCount} products attached to this category.` 
      });
    }

    // 2. If safe, delete it
    await prisma.category.delete({
      where: { id: Number(id) }
    });
    
    reply.send({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Failed to delete category' });
  }
};