import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const year = String(getQuery(event).year);
  return await prisma.activeOfficer.findMany({
    where: { year },
    orderBy: { number: 'asc' },
  });
});
