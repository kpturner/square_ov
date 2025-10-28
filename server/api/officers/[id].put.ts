import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const ovId = Number(getQuery(event).ovId);
  const body = await readBody(event);

  const updates = body.map((o) =>
    prisma.officer.update({
      where: { id: o.id },
      data: {
        rank: o.rank?.trim() ? o.rank : null,
        provOfficerYear: o.provOfficerYear,
        active: o.active,
        grandOfficer: o.grandOfficer,
        grandOfficerYear: o.grandOfficerYear,
        grandRank: o.grandRank?.trim() ? o.grandRank : null,
        grandActive: o.grandActive,
        position: o.position,
      },
    })
  );

  await Promise.all(updates);
  return { success: true };
});
