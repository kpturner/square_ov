import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const ov = await prisma.oV.findUnique({
    where: { id },
    include: { officers: true, user: true },
  });

  if (!ov) throw createError({ statusCode: 404, statusMessage: 'OV not found' });
  return ov;
});
