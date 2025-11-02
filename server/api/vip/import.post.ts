import prisma from '~/server/utils/dbClient';
import { z } from 'zod';

const VIPSchema = z.object({
  provincialRank: z.string(),
  name: z.string(),
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
  };

  const validatedVIPs = vips.map((row) => {
    const mapped: Record<string, unknown> = {};

    for (const [column, field] of Object.entries(columnMap)) {
      let value = row[column];
      if (value === undefined || value === '') value = null;

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
