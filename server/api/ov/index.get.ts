import prisma from '~/server/utils/dbClient';
import type { OV, OVType } from '@prisma/client';

export default defineEventHandler(async (event) => {
  // Fetch all OVs with their related Officers and User
  const query = getQuery(event);
  const ovType: OVType = query.ovType as OVType;
  const userId = Number(query.userId);
  const ovs: OV[] = await prisma.oV.findMany({
    where: { ovType, userId },
    include: {
      officers: true,
      user: true,
    },
    orderBy: { ovDate: 'desc' },
  });

  return ovs;
});
