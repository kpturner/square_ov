import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const body = await readBody(event);

  return prisma.officer.update({
    where: { id },
    data: {
      ...body,
      rank: body.rank?.trim() ? body.rank : null,
      grandRank: body.grandRank?.trim() ? body.grandRank : null,
      email: body.email?.trim() ? body.email : null,
      phone: body.phone?.trim() ? body.phone : null,
    },
  });
});
