import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { authRoutes } from './routes/auth';
import { categoryRoutes } from './routes/category';
import { productRoutes } from './routes/product';
import { orderRoutes } from './routes/order';

// Ensure uploads directory exists in the backend root
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const server = Fastify({ logger: true });

// FIXED: Highly permissive CORS configuration
server.register(cors, { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'super-secret-development-key'
});

// Register file handling plugins
server.register(multipart);
server.register(staticPlugin, {
  root: uploadDir,
  prefix: '/uploads/',
});

server.get('/', async (request, reply) => {
  return { status: 'ok', message: 'E-commerce API is running' };
});

server.register(authRoutes, { prefix: '/api/auth' });
server.register(categoryRoutes, { prefix: '/api/categories' });
server.register(productRoutes, { prefix: '/api/products' });
server.register(orderRoutes, { prefix: '/api/orders' });

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('E-commerce API running on http://localhost:3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();