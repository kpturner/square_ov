import type { OVType } from '@prisma/client';
import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const ovType = String(query.ovType) as OVType;
  const year = String(query.year);
  return await prisma.vIP.findMany({
    where: {
      ovType,
      year,
      NOT: {
        provincialRank: { in: ['DC', 'SEC'] },
      },
    },
    orderBy: { name: 'asc' },
  });
});
