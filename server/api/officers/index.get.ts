import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const ovId = Number(getQuery(event).ovId);
  const officers = await prisma.officer.findMany({ where: { ovId } });
  const ov = await prisma.oV.findUnique({ where: { id: ovId } });
  return { officers, ov };
});
