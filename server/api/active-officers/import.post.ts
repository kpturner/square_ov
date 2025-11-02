import prisma from '~/server/utils/dbClient';
import { z } from 'zod';
import type { Rank } from '~/types/officers';

const ranks = useRuntimeConfig().public.ranks as Rank[];

const officerSchema = z.object({
  number: z.number(),
  provincialRank: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  familiarName: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const importErrors: string[] = [];
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

  const validatedOfficers = officers.map((row) => {
    const mapped: Record<string, unknown> = {};
    for (const [column, field] of Object.entries(columnMap)) {
      let value = row[column];
      if (value === undefined || value === '') value = null;
      // Validate the rank
      if (field === 'provincialRank' && value) {
        const bareRank = value.replace('Prov', '').toUpperCase();
        if (!ranks.find((r) => r.value === bareRank)) {
          importErrors.push(`${bareRank} rank found in spreadsheet but not in config`);
        }
      }

      mapped[field] = value;
    }

    return officerSchema.parse(mapped);
  });

  const promises = validatedOfficers.map((officer) =>
    prisma.activeOfficer.upsert({
      where: { year_number: { year, number: officer.number } },
      update: officer,
      create: { ...officer, year },
    })
  );

  await Promise.all(promises);

  return { success: true, imported: validatedOfficers.length, importErrors };
});
