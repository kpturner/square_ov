import type { OVType } from '@prisma/client';
import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const ovType = query.ovType as OVType;
  const year = String(query.year);
  return await prisma.oVMaster.findMany({
    where: { ovType, year },
    orderBy: { number: 'asc' },
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
      additionalOfficers: {
        include: {
          activeOfficer: true,
        },
      },
    },
  });
});
