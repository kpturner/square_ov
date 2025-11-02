import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const year = decodeURIComponent(event.context.params?.year ?? '');
  const name = decodeURIComponent(event.context.params?.name ?? '');

  const officer = await prisma.vIP.findUnique({
    where: {
      year_name: {
        year,
        name,
      },
    },
  });

  if (!officer) throw createError({ statusCode: 404, statusMessage: 'VIP not found' });
  return officer;
});
