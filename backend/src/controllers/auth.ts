import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registerUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { firstName, lastName, email, phone, password } = request.body as any;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // The first registered user automatically becomes the ADMIN
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
      }
    });

    const token = await reply.jwtSign({ id: user.id, role: user.role, email: user.email });
    reply.code(201).send({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Registration failed. Email might already exist.' });
  }
};

export const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as any;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = await reply.jwtSign({ id: user.id, role: user.role, email: user.email });
    reply.send({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Login failed' });
  }
};