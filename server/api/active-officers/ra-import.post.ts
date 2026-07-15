/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '~/server/utils/dbClient';
import { z } from 'zod';
import type { Rank } from '~/types/officers';
import { OVType } from '@prisma/client';

const officerSchema = z.object({
  number: z.number(),
  provincialRank: z.string().nullable().optional(),
  givenName: z.string().nullable().optional(),
  familyName: z.string().nullable().optional(),
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
      // MEGS not needed as an active officer but others are
      if (rd.__EMPTY === 'MEGS') {
        return false;
      }
      if (!rd.__EMPTY) {
        return false;
      }
      return true;
    })
    .map((rd) => {
      provNumber++;
      let givenName = rd.__EMPTY_1;
      let familyName = rd.__EMPTY_2;
      if (!givenName && !familyName && rd[' ']) {
        // Area chairman
        const names = rd[' '].split(' ');
        givenName = names[0];
        familyName = names[1];
      }
      let rank = rd.__EMPTY_3 ? rd.__EMPTY_3.trim() : null;
      if (!rank) {
        if (rd.__EMPTY?.toUpperCase() === 'DEPUTY') {
          rank = 'DGSUPT';
        }
        if (rd.__EMPTY?.toUpperCase() === 'SECOND PROVINCIAL GRAND PRINCIPAL') {
          rank = '2NDPGP';
        }
        if (rd.__EMPTY?.toUpperCase() === 'THIRD PROVINCIAL GRAND PRINCIPAL') {
          rank = '3RDPGP';
        }
      }
      return {
        Number: provNumber,
        'Provincial Rank': rank,
        'Given Name': givenName ?? null,
        'Family Name': familyName ?? null,
        'Familiar Name': givenName ?? null,
        'Post Nominals': null,
        'Primary Email': rd.__EMPTY_4.trim(),
        'Preferred Phone No.': null,
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
