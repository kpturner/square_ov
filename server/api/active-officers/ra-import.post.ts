/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const { ovType, year, data } = z
    .object({
      ovType: z.enum(OVType),
      year: z.string(),
      data: z.array(z.record(z.string(), z.any())),
    })
    .parse(body);

  const cfg = useRuntimeConfig().public;
  const ranks = (ovType === 'craft' ? cfg.ranks : cfg.raRanks) as Rank[];

  // Extract the raw officer data
  let megsFound = false;
  let provNumber = 0;
  const officers: Record<string, any>[] = data
    .filter((rd) => {
      if (rd.__EMPTY === 'MEGS') {
        megsFound = true;
      }
      if (!megsFound) return false;
      // MEGS, the principals and the assistants are VIPs so we don't need them here
      if (rd.__EMPTY === 'MEGS') {
        return false;
      }
      if (rd.__EMPTY?.toUpperCase() === 'SECOND PROVINCIAL GRAND PRINCIPAL') {
        return false;
      }
      if (rd.__EMPTY?.toUpperCase() === 'THIRD PROVINCIAL GRAND PRINCIPAL') {
        return false;
      }
      if (rd.__EMPTY_3 && rd.__EMPTY_3.toUpperCase() === 'APGP') {
        return false;
      }
      if (!rd.__EMPTY_3) {
        return false;
      }
      return true;
    })
    .map((rd) => {
      provNumber++;
      return {
        Number: provNumber,
        'Provincial Rank': rd.__EMPTY_3.trim(),
        'Given Name': rd.__EMPTY_1,
        'Family Name': rd.__EMPTY_2,
        'Familiar Name': rd.__EMPTY_1,
        'Post Nominals': '',
        'Primary Email': rd.__EMPTY_4.trim(),
        'Preferred Phone No.': '',
      };
    });

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
      let value = row[column];
      if (value === undefined || value === '') value = null;
      // Validate the rank
      if (field === 'provincialRank' && value) {
        const bareRank = value.replace('Prov', '').toUpperCase();
        if (!ranks.find((r) => r.value === bareRank)) {
          importErrors.push(`${bareRank} rank found in spreadsheet but not in config`);
        }
      }
      // Validate the email
      if (field === 'primaryEmail' && value) {
        const emails = officers.filter((o) => o['Primary Email'] === value);
        if (emails.length > 1) {
          importErrors.push(`${value} is not a unique email address for the imnported officers`);
        }
      }
      mapped[field] = value;
    }

    return officerSchema.parse(mapped);
  });

  const promises = validatedOfficers.map((officer) =>
    prisma.activeOfficer.upsert({
      where: { type_year_number: { ovType, year, number: officer.number } },
      update: officer,
      create: { ...officer, year, ovType },
    })
  );

  await Promise.all(promises);

  return { success: true, imported: validatedOfficers.length, importErrors };
});
