import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const ovId = Number(getQuery(event).ovId);
  return await prisma.officer.findMany({ where: { ovId } });
});
