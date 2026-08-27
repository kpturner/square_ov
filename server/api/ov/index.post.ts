import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { ovType, name, ovDate, userId, comments } = body;

  if (!ovType || !name || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' });
  }

  return prisma.oV.create({
    data: {
      ovType,
      name,
      comments,
      ovDate: ovDate ? new Date(ovDate) : null,
      userId,
    },
  });
});
