import prisma from '~/server/utils/dbClient';
import type { OVType } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const year = decodeURIComponent(event.context.params?.year ?? '');
  const number = parseInt(event.context.params?.number ?? '');
  const ovType = decodeURIComponent(event.context.params?.ovtype ?? 'craft') as OVType;
  if (isNaN(number)) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });

  const officer = await prisma.activeOfficer.findUnique({
    where: {
      type_year_number: {
        ovType,
        year,
        number,
      },
    },
  });

  if (!officer) throw createError({ statusCode: 404, statusMessage: 'Active officer not found' });
  return officer;
});
