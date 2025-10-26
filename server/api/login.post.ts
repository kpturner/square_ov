import prisma from '~/server/utils/dbClient';
import type { AuthUser } from '~/types/user';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event);

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || user.password !== body.password) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };

  return { success: true, authUser };
});
