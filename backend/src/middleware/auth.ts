import { FastifyRequest, FastifyReply } from 'fastify';

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
};

export const verifyAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  if (request.user.role !== 'ADMIN') {
    return reply.code(403).send({ error: 'Forbidden: Admin access required' });
  }
};
