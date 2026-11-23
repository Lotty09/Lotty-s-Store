import { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (value: unknown, minLength: number, maxLength: number): string | null => {
  if (typeof value !== 'string') return null;

  const text = value.trim();
  return text.length >= minLength && text.length <= maxLength ? text : null;
};

const parseId = (value: string): number | null => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

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
  if (!isRecord(request.body)) {
    return reply.code(400).send({ error: 'Invalid category data' });
  }

  const name = readText(request.body.name, 1, 120);
  const rawDescription = request.body.description;
  const description = rawDescription === undefined || rawDescription === null || rawDescription === ''
    ? null
    : readText(rawDescription, 1, 2_000);

  if (!name || (rawDescription !== undefined && rawDescription !== null && rawDescription !== '' && !description)) {
    return reply.code(400).send({ error: 'Provide a category name and an optional description of up to 2,000 characters.' });
  }

  try {
    const category = await prisma.category.create({
      data: { name, description }
    });
    return reply.code(201).send(category);
  } catch (error) {
    request.log.error({ error }, 'Failed to create category');
    return reply.code(500).send({ error: 'Failed to create category' });
  }
};

export const deleteCategory = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const categoryId = parseId(id);
  if (!categoryId) {
    return reply.code(400).send({ error: 'Category ID must be a positive integer.' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { _count: { select: { products: true } } },
    });

    if (!category) {
      return reply.code(404).send({ error: 'Category not found' });
    }

    if (category._count.products > 0) {
      return reply.code(409).send({
        error: 'Cannot delete a category that still has products.',
      });
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return reply.send({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return reply.code(409).send({ error: 'Cannot delete a category that still has products.' });
    }

    request.log.error({ error }, 'Failed to delete category');
    return reply.code(500).send({ error: 'Failed to delete category' });
  }
};
