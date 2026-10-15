import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async () => {
  const years = await prisma.oVMaster.findMany({
    select: {
      year: true,
    },
    distinct: ['year'],
    orderBy: {
      year: 'desc',
    },
  });

  return years.map(({ year }) => year);
});
