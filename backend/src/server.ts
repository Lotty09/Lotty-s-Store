import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { authRoutes } from './routes/auth';
import { categoryRoutes } from './routes/category';
import { productRoutes } from './routes/product';
import { orderRoutes } from './routes/order';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be configured before the API starts.');
}

const server = Fastify({ logger: true });

const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length > 0
  ? configuredOrigins
  : process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGIN must be configured in production.');
}

server.register(cors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

server.register(jwt, {
  secret: jwtSecret,
  sign: { expiresIn: '1h' },
});

server.register(multipart, {
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
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
    const port = Number(process.env.PORT ?? 3001);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid TCP port number.');
    }

    await server.listen({ port, host: '0.0.0.0' });
    console.log(`E-commerce API running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
