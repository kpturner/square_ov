import prisma from '~/server/utils/dbClient';
import type { OV } from '@prisma/client';

export default defineEventHandler(async () => {
  // Fetch all OVs with their related Officers and User
  const ovs: OV[] = await prisma.oV.findMany({
    include: {
      officers: true,
      user: true,
    },
    orderBy: { ovDate: 'desc' },
  });

  return ovs;
});
