import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const ovId = Number(getQuery(event).ovId);
  const body = await readBody(event);

  const updates = body.map((o) =>
    prisma.officer.update({
      where: { id: o.id },
      data: {
        rank: o.rank,
        grandOfficer: o.grandOfficer,
        grandOfficerYear: o.grandOfficerYear,
        active: o.active,
        position: o.position,
      },
    })
  );

  await Promise.all(updates);
  return { success: true };
});
