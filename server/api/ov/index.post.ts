import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { ovType, name, ovDate, userId } = body;

  if (!ovType || !name || !ovDate || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' });
  }

  return prisma.oV.create({
    data: {
      ovType,
      name,
      ovDate: new Date(ovDate),
      userId,
    },
  });
});
