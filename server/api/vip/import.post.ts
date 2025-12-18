import prisma from '~/server/utils/dbClient';
import { z } from 'zod';

const VIPSchema = z.object({
  provincialRank: z.string(),
  name: z.string(),
  address: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const importErrors: string[] = [];
  const body = await readBody(event);
  const { year, vips } = z
    .object({ year: z.string(), vips: z.array(z.record(z.string(), z.any())) })
    .parse(body);

  const columnMap: Record<string, keyof typeof VIPSchema.shape> = {
    Office: 'provincialRank',
    Name: 'name',
    Address: 'address',
    Email: 'email',
    Phone: 'phone',
    Mobile: 'mobile',
  };

  const validatedVIPs = vips.map((row) => {
    const mapped: Record<string, unknown> = {};

    for (const [column, field] of Object.entries(columnMap)) {
      let value = row[column];
      if (value === undefined || value === '') value = null;
      if (value === 'JW') value = 'JGW';
      if (value === 'SW') value = 'SGW';
      mapped[field] = value;
    }

    return VIPSchema.parse(mapped);
  });

  const promises = validatedVIPs.map((vip) =>
    prisma.vIP.upsert({
      where: { year_name: { year, name: vip.name } },
      update: vip,
      create: { ...vip, year },
    })
  );

  await Promise.all(promises);

  return { success: true, imported: validatedVIPs.length, importErrors };
});
