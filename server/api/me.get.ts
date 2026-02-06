import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const { passwordHash, passwordResetToken, passwordResetExpires, ...authUser } = user;
  return authUser;
});
