import prisma from '~/server/utils/dbClient';
import type { AuthUser } from '~/types/user';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const body = await readBody(event);

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...body,
    },
  });

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  return { success: true, authUser };
});
