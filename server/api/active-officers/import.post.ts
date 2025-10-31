import prisma from '~/server/utils/dbClient';
import { z } from 'zod';

const officerSchema = z.object({
  number: z.number(),
  provincialRank: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  familiarName: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { year, officers } = z
    .object({ year: z.string(), officers: z.array(z.record(z.string(), z.any())) })
    .parse(body);

  const columnMap: Record<string, keyof typeof officerSchema.shape> = {
    Number: 'number',
    'Provincial Rank': 'provincialRank',
    'Given Name': 'givenName',
    'Family Name': 'familyName',
    'Familiar Name': 'familiarName',
  };

  const validatedOfficers = officers.map((row) =>
    officerSchema.parse(
      Object.fromEntries(
        Object.entries(columnMap).map(([key, field]) => [
          field,
          row[key] === undefined || row[key] === '' ? null : row[key],
        ])
      )
    )
  );

  const promises = validatedOfficers.map((officer) =>
    prisma.activeOfficer.upsert({
      where: { year_number: { year, number: officer.number } },
      update: officer,
      create: { ...officer, year },
    })
  );

  await Promise.all(promises);

  return { success: true, imported: validatedOfficers.length };
});
