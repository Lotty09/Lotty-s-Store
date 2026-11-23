import { FastifyInstance } from 'fastify';
import { getCurrentUser, loginUser, registerUser } from '../controllers/auth';
import { verifyToken } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', registerUser);
  fastify.post('/login', loginUser);
  fastify.get('/me', { preHandler: [verifyToken] }, getCurrentUser);
}
