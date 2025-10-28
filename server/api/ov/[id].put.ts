import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '');
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const body = await readBody(event);

  return prisma.oV.update({
    where: { id },
    data: {
      ...body,
      ovDate: body.ovDate ? new Date(body.ovDate) : undefined,
    },
  });
});
