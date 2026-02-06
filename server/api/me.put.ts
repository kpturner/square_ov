import prisma from '~/server/utils/dbClient';
import type { AuthUser } from '~/types';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  const body = await readBody(event);

  const { id, createdAt, updatedAt, ...data } = body;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  const { passwordHash, passwordResetToken, passwordResetExpires, ...authUserData } = user;

  const authUser: AuthUser = {
    ...authUserData,
  };

  return { success: true, authUser };
});
