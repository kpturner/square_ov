import prisma from '~/server/utils/dbClient';
import { Officer } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const ovId = Number(getQuery(event).ovId);
  const officers = await readBody(event);

  await Promise.all(
    officers.map(async (o: Officer) => {
      if (o.id) {
        await prisma.officer.update({
          where: { id: o.id },
          data: {
            name: o.name,
            rank: o.rank,
            grandOfficer: o.grandOfficer,
            grandOfficerYear: o.grandOfficerYear,
            active: o.active,
            position: o.position,
          },
        });
      } else {
        await prisma.officer.create({
          data: {
            name: o.name,
            rank: o.rank,
            grandOfficer: o.grandOfficer,
            grandOfficerYear: o.grandOfficerYear,
            active: o.active,
            position: o.position,
            ovId,
          },
        });
      }
    })
  );

  return { success: true };
});
