import prisma from '~/server/utils/dbClient';
import type { AuthUser } from '~/types/user';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string; email: string; password: string }>(event);

  if (!body.name || !body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: 'User already exists' });
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: body.password,
    },
  });

  const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };

  return { success: true, authUser };
});
