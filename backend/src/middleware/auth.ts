import { FastifyRequest, FastifyReply } from 'fastify';

// Checks if the user is logged in
export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized: Please log in' });
  }
};

// Checks if the user is logged in AND is an admin
export const verifyAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
    const user: any = request.user;
    
    if (user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Forbidden: Admin access required' });
    }
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized: Invalid token' });
  }
};