import prisma from '~/server/utils/dbClient';
import type { User } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  const users: User[] = await prisma.user.findMany({
    orderBy: { name: 'desc' },
  });

  return users;
});
