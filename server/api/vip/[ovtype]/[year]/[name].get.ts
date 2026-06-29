import type { OVType } from '@prisma/client';
import prisma from '~/server/utils/dbClient';

export default defineEventHandler(async (event) => {
  const ovType = decodeURIComponent(event.context.params?.ovType ?? 'craft') as OVType;
  const year = decodeURIComponent(event.context.params?.year ?? '');
  const name = decodeURIComponent(event.context.params?.name ?? '');

  const officer = await prisma.vIP.findUnique({
    where: {
      type_year_name: {
        ovType,
        year,
        name,
      },
    },
  });

  if (!officer) throw createError({ statusCode: 404, statusMessage: 'VIP not found' });
  return officer;
});
