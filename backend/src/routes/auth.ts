import { FastifyInstance } from 'fastify';
import { registerUser, loginUser } from '../controllers/auth';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', registerUser);
  fastify.post('/login', loginUser);
}