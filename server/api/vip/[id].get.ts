import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const vip = await prisma.vIP.findUnique({
    where: { id },
  });

  if (!vip) throw createError({ statusCode: 404, statusMessage: 'VIP not found' });
  return vip;
});
