import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  await prisma.officer.deleteMany({ where: { ovId: id } }); // clean up child records

  return prisma.oV.delete({ where: { id } });
});
