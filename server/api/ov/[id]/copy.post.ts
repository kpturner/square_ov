import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid OV ID' });

  const body = await readBody(event);
  const toUserId = body?.toUserId;

  // Fetch the existing OV including its officers
  const ov = await prisma.oV.findUnique({
    where: { id },
    include: { officers: true },
  });

  if (!ov) throw createError({ statusCode: 404, statusMessage: 'OV not found' });

  // Create a new OV with a modified name and duplicated officers

  let name = `${ov.name} (Copy)`;
  if (toUserId) {
    const fromUser = await prisma.user.findUnique({ where: { id: ov.userId } });
    name = `${ov.name} (${fromUser?.name})`;
  }

  const newOV = await prisma.oV.create({
    data: {
      name,
      ovType: ov.ovType,
      ovDate: ov.ovDate,
      userId: toUserId ? Number(toUserId) : ov.userId,
      alignWardens: ov.alignWardens,
      activeDCsFront: ov.activeDCsFront,
      activeDepsFront: ov.activeDepsFront,
      includeGrandOfficers: ov.includeGrandOfficers,
      reverseStewardOrder: ov.reverseStewardOrder,
      carpetCapacity: ov.carpetCapacity,
      splitByRow: ov.splitByRow,
      officers: {
        create: ov.officers.map(({ id, ovId, ...officer }) => officer),
      },
    },
  });

  return newOV;
});
