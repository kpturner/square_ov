import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, ovDate, userId } = body;

  if (!name || !ovDate || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' });
  }

  return prisma.oV.create({
    data: {
      name,
      ovDate: new Date(ovDate),
      userId,
    },
  });
});
