import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const year = String(getQuery(event).year);
  return await prisma.vIP.findMany({
    where: { year },
    orderBy: { id: 'asc' },
  });
});
