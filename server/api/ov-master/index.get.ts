import type { OVType } from '@prisma/client';
import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const ovType = query.ovType as OVType;
  const year = String(query.year);
  return await prisma.oVMaster.findMany({
    where: { ovType, year },
    orderBy: { number: 'asc' },
  });
});
