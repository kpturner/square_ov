import prisma from '~/server/utils/dbClient';
import { z } from 'zod';
import type { Rank } from '~/types/officers';
import { OVType } from '@prisma/client';

const officerSchema = z.object({
  number: z.number(),
  provincialRank: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  familiarName: z.string().nullable().optional(),
  postNominals: z.string().nullable().optional(),
  primaryEmail: z.string().nullable().optional(),
  preferredPhoneNo: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const importErrors: string[] = [];
  const body = await readBody(event);
  const {
    ovType,
    year,
    data: officers,
  } = z
    .object({
      ovType: z.enum(OVType),
      year: z.string(),
      data: z.array(z.record(z.string(), z.any())),
    })
    .parse(body);

  const cfg = useRuntimeConfig().public;
  const ranks = (ovType === 'craft' ? cfg.ranks : cfg.raRanks) as Rank[];

  const columnMap: Record<string, keyof typeof officerSchema.shape> = {
    Number: 'number',
    'Provincial Rank': 'provincialRank',
    'Given Name': 'givenName',
    'Family Name': 'familyName',
    'Familiar Name': 'familiarName',
    'Post Nominals': 'postNominals',
    'Primary Email': 'primaryEmail',
    'Preferred Phone No.': 'preferredPhoneNo',
  };

  const validatedOfficers = officers.map((row) => {
    const mapped: Record<string, unknown> = {};
    for (const [column, field] of Object.entries(columnMap)) {
      // Convert to 26-27 format if required
      let col = column;
      if (year === '26-27') {
        if (column === 'Number') col = 'Prov No.';
        if (column === 'Provincial Rank') col = 'Actual Rank';
        if (column === 'Given Name') col = 'Nominee';
        if (column === 'Family Name') col = 'Nominee';
      }

      let value = row[col];
      if (value === undefined || value === '') value = null;
      // Validate the rank
      if (field === 'provincialRank' && value) {
        const bareRank = value.replace('Prov', '').toUpperCase();
        if (!ranks.find((r) => r.value === bareRank)) {
          importErrors.push(`${bareRank} rank found in spreadsheet but not in config`);
        }
      }
      // Deal with names in 26-27 format
      if (year === '26-27' && col === 'Nominee') {
        const names = value.split(' ');
        if (field === 'givenName') {
          value = value.replace(names[0], '').trim();
        }
        if (field === 'familyName') {
          value = names[0];
        }
      }

      mapped[field] = value;
    }

    return officerSchema.parse(mapped);
  });

  const promises = validatedOfficers.map((officer) => {
    const o = { ...officer, year, ovType };
    logger.debug(o, 'Creating active officer');
    return prisma.activeOfficer.upsert({
      where: { type_year_number: { ovType, year, number: o.number } },
      update: o,
      create: o,
    });
  });

  await Promise.all(promises);

  return { success: true, imported: validatedOfficers.length, importErrors };
});
