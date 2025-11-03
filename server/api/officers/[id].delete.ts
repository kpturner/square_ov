import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = Number(event.context?.params?.id);
  await prisma.officer.delete({ where: { id } });
  return { success: true };
});
