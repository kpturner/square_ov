import prisma from '~/server/utils/dbClient';
import type { OVMaster } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const year = String(getQuery(event).year);
  const ovs: OVMaster[] = await prisma.oVMaster.findMany({
    where: { year },
    orderBy: { number: 'asc' },
  });

  return ovs;
});
