import prisma from '~/server/utils/dbClient';
import type { OV } from '@prisma/client';

export default defineEventHandler(async (event) => {
  // Fetch all OVs with their related Officers and User
  const userId = Number(getQuery(event).userId);
  const ovs: OV[] = await prisma.oV.findMany({
    where: { userId },
    include: {
      officers: true,
      user: true,
    },
    orderBy: { ovDate: 'desc' },
  });

  return ovs;
});
