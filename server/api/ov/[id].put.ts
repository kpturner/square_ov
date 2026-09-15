import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const body = await readBody(event);

  return prisma.oV.update({
    where: { id },
    data: {
      name: body.name,
      comments: body.comments,
      alignWardens: body.alignWardens,
      activeDCsFront: body.activeDCsFront,
      activeADCsFront: body.activeADCsFront,
      activeDepsFront: body.activeDepsFront,
      includeGrandOfficers: body.includeGrandOfficers,
      reverseStewardOrder: body.reverseStewardOrder,
      carpetCapacity:
        typeof body.carpetCapacity === 'string'
          ? parseInt(body.carpetCapacity)
          : body.carpetCapacity,
      noOfProcessions:
        typeof body.noOfProcessions === 'string'
          ? parseInt(body.noOfProcessions)
          : body.noOfProcessions,
      splitByRow: body.splitByRow,
      ovDate: body.ovDate ? new Date(body.ovDate) : undefined,
    },
  });
});
