import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (value: unknown, minLength: number, maxLength: number): string | null => {
  if (typeof value !== 'string') return null;

  const text = value.trim();
  return text.length >= minLength && text.length <= maxLength ? text : null;
};

const readPassword = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;

  return value.length >= 8 && Buffer.byteLength(value, 'utf8') <= 72 ? value : null;
};

const toUserRole = (role: string): 'ADMIN' | 'CUSTOMER' =>
  role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

export const registerUser = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!isRecord(request.body)) {
    return reply.code(400).send({ error: 'Invalid registration data' });
  }

  const firstName = readText(request.body.firstName, 1, 80);
  const lastName = readText(request.body.lastName, 1, 80);
  const email = readText(request.body.email, 3, 254)?.toLowerCase();
  const phone = readText(request.body.phone, 7, 30);
  const password = readPassword(request.body.password);

  if (!firstName || !lastName || !email || !phone || !password || !emailPattern.test(email)) {
    return reply.code(400).send({ error: 'Provide valid registration details and a password of at least 8 characters.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.code(409).send({ error: 'An account already exists for this email address.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        // Public registration must never grant administrative access.
        role: 'CUSTOMER',
      },
      select: { id: true, email: true, role: true },
    });

    const role = toUserRole(user.role);
    const token = await reply.jwtSign({ id: user.id, role, email: user.email });
    return reply.code(201).send({ token, user: { id: user.id, email: user.email, role } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return reply.code(409).send({ error: 'An account already exists for this email address.' });
    }

    request.log.error({ error }, 'Registration failed');
    return reply.code(500).send({ error: 'Registration failed' });
  }
};

export const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!isRecord(request.body)) {
    return reply.code(400).send({ error: 'Invalid login data' });
  }

  const email = readText(request.body.email, 3, 254)?.toLowerCase();
  const password = readPassword(request.body.password);

  if (!email || !password || !emailPattern.test(email)) {
    return reply.code(400).send({ error: 'Provide a valid email address and password.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const role = toUserRole(user.role);
    const token = await reply.jwtSign({ id: user.id, role, email: user.email });
    return reply.send({ token, user: { id: user.id, email: user.email, role } });
  } catch (error) {
    request.log.error({ error }, 'Login failed');
    return reply.code(500).send({ error: 'Login failed' });
  }
};

export const getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        role: toUserRole(user.role),
      },
    });
  } catch (error) {
    request.log.error({ error }, 'Unable to load the current user');
    return reply.code(500).send({ error: 'Unable to load the current user' });
  }
};
