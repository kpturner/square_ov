import prisma from '~/server/utils/dbClient';
import type { Officer } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const ovId = Number(getQuery(event).ovId);
  const officers = await readBody(event);

  await Promise.all(
    officers.map(async (o: Officer) => {
      if (o.id) {
        await prisma.officer.update({
          where: { id: o.id },
          data: {
            ...o,
            rank: o.rank?.trim() ? o.rank : null,
            grandRank: o.grandRank?.trim() ? o.grandRank : null,
            ovId: undefined,
          },
        });
      } else {
        const { id, ...officerData } = o;
        await prisma.officer.create({
          data: {
            ...officerData,
            rank: officerData.rank?.trim() ? officerData.rank : null,
            grandRank: officerData.grandRank?.trim() ? officerData.grandRank : null,
            email: officerData.email?.trim() ? officerData.email : null,
            phone: officerData.phone?.trim() ? officerData.phone : null,
            ovId,
          },
        });
      }
    })
  );

  return { success: true };
});
