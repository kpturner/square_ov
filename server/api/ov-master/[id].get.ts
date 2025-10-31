import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const ov = await prisma.oVMaster.findUnique({
    where: { id },
    include: {
      swordOfficer: true,
      standardOfficer: true,
      stewardOfficer: true,
      officer1Officer: true,
      officer2Officer: true,
      officer3Officer: true,
      officer4Officer: true,
      officer5Officer: true,
      officer6Officer: true,
      officer7Officer: true,
    },
  });

  if (!ov) throw createError({ statusCode: 404, statusMessage: 'OV not found' });
  return ov;
});
