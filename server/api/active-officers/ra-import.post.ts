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
  additionalSeatingInfo: z.string().nullable().optional(),
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
      const splits = rd.__EMPTY_1?.split(' ') ?? [];
      let familiarName = splits[0];
      let reconstruct = true;
      // If the givenName has a name in brackets - like "(James) Ian", then that should just become "Ian"
      if (familiarName?.includes('(')) {
        familiarName = splits[1].trim();
        reconstruct = false;
      }
      let givenName = familiarName;
      let additionalSeatingInfo = null;
      if (splits.length > 1 && reconstruct) {
        givenName = `${familiarName} ${splits[1].trim()}`;
      }
      let familyName = rd.__EMPTY_2;
      if (!givenName && !familyName && rd[' ']) {
        // Area chairman on 25-26 format
        const names = rd[' '].split(' ');
        givenName = names[0];
        familyName = names[1];
        // Add in the "Area Chairman" to the familyName
        familyName = `${familyName} - ${rd.__EMPTY.replace('Area Chairman', 'AC').trim()}`;
      }
      let rank = rd.__EMPTY_3 ? rd.__EMPTY_3.trim().toUpperCase().replace('PROV', '') : null;
      if (!rank) {
        if (rd.__EMPTY?.toUpperCase() === 'DEPUTY') {
          rank = 'DEPGSUPT';
        }
        if (rd.__EMPTY?.toUpperCase() === 'SECOND PROVINCIAL GRAND PRINCIPAL') {
          rank = '2NDPGP';
        }
        if (rd.__EMPTY?.toUpperCase() === 'THIRD PROVINCIAL GRAND PRINCIPAL') {
          rank = '3RDPGP';
        }
      }
      if (rank === 'RA AREA CHAIR' || rd.__EMPTY?.toUpperCase().indexOf('AREA CHAIRMAN') > 0) {
        if (!givenName) givenName = rd.__EMPTY.replace('Area Chairman', '').trim();
        if (!familyName) familyName = 'Area Chairman';
        additionalSeatingInfo = rd.__EMPTY;
        rank = null;
      }
      return {
        Number: provNumber,
        'Provincial Rank': rank,
        'Given Name': givenName ?? null,
        'Family Name': familyName.toUpperCase() ?? null,
        'Familiar Name': familiarName ?? null,
        'Post Nominals': null,
        'Primary Email': year === '25-26' && rd.__EMPTY_4 ? rd.__EMPTY_4.trim() : null,
        'Preferred Phone No.': null,
        'Additional Seating Info': additionalSeatingInfo,
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
    'Additional Seating Info': 'additionalSeatingInfo',
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
          importErrors.push(`${value} is not a unique email address for the imported officers`);
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
