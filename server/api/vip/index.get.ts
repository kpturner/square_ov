import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const year = String(getQuery(event).year);
  return await prisma.vIP.findMany({
    where: {
      year,
      NOT: {
        provincialRank: { in: ['DC', 'SEC'] },
      },
    },
    orderBy: { name: 'asc' },
  });
});
