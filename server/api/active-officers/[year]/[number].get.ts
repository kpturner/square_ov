import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const year = decodeURIComponent(event.context.params?.year ?? '');
  const number = parseInt(event.context.params?.number ?? '');
  if (isNaN(number)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const officer = await prisma.activeOfficer.findUnique({
    where: {
      year_number: {
        year,
        number,
      },
    },
  });

  if (!officer) throw createError({ statusCode: 404, statusMessage: 'Active officer not found' });
  return officer;
});
