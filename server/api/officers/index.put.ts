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
        await prisma.officer.create({
          data: {
            name: o.name,
            rank: o.rank?.trim() ? o.rank : null,
            provOfficerYear: o.provOfficerYear,
            active: o.active,
            grandOfficer: o.grandOfficer,
            grandRank: o.grandRank?.trim() ? o.grandRank : null,
            grandOfficerYear: o.grandOfficerYear,
            grandActive: o.grandActive,
            position: o.position,
            excludeFromProcession: o.excludeFromProcession,
            attending: o.attending,
            original: o.original,
            ovId,
          },
        });
      }
    })
  );

  return { success: true };
});
