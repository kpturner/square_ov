/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '~/server/utils/dbClient';
import { z } from 'zod';
import type { Rank } from '~/types/officers';
import { OVType } from '@prisma/client';

const officerSchema = z.object({
  provincialRank: z.string().nullable().optional(),
  givenName: z.string().nullable().optional(),
  familyName: z.string().nullable().optional(),
  familiarName: z.string().nullable().optional(),
  postNominals: z.string().nullable().optional(),
  primaryEmail: z.string().nullable().optional(),
  preferredPhoneNo: z.string().nullable().optional(),
  salutationOverride: z.string().nullable().optional(),
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
  const officers: Record<string, any>[] = data.map((rd) => {
    const givenName = rd['Given Name']?.trim() ?? null;
    const familyName = rd['Family Name']?.trim() ?? null;
    const familiarName = rd['Familiar Name']?.trim() ?? null;
    const verboseRank = rd['Active Rank']?.trim().toUpperCase().replace('PROVINCIAL ', '') ?? null;
    const rank = ranks.find((r) => r.title.toUpperCase() === verboseRank)?.value ?? null;
    const primaryEmail = rd['Primary Email']?.trim() ?? null;
    const preferredPhoneNo = rd['Preferred Phone No.']?.trim() ?? null;
    const postNominals = rd['Post Nominals']?.trim() ?? null;
    const salutationOverride = rd['Masonic Prefix'] === 'Comp' ? 'COMP.' : null;
    return {
      'Provincial Rank': rank,
      'Given Name': givenName ?? null,
      'Family Name': familyName ?? null,
      'Familiar Name': familiarName ?? null,
      'Post Nominals': postNominals ?? null,
      'Primary Email': primaryEmail ?? null,
      'Preferred Phone No.': preferredPhoneNo ?? null,
      'Salutation Override': salutationOverride,
    };
  });

  const columnMap: Record<string, keyof typeof officerSchema.shape> = {
    'Provincial Rank': 'provincialRank',
    'Given Name': 'givenName',
    'Family Name': 'familyName',
    'Familiar Name': 'familiarName',
    'Post Nominals': 'postNominals',
    'Primary Email': 'primaryEmail',
    'Preferred Phone No.': 'preferredPhoneNo',
    'Salutation Override': 'salutationOverride',
  };

  const validatedOfficers = officers.map((row) => {
    const mapped: Record<string, unknown> = {};
    for (const [column, field] of Object.entries(columnMap)) {
      let value = row[column];
      if (value === undefined || value === '') value = null;
      // Validate the rank
      if (field === 'provincialRank' && !value) {
        importErrors.push(
          `${row['Given Name']} ${row['Family Name']} rank found in spreadsheet but not in config`
        );
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

  const activeOfficers = await prisma.activeOfficer.findMany({
    where: { ovType, year },
  });

  const promises = validatedOfficers.map((officer) => {
    // Try to find the officer to update
    const ao = activeOfficers.filter(
      (ao) =>
        (ao.familyName?.toUpperCase().trim() === officer.familyName?.toUpperCase().trim() ||
          ao.familyName?.toUpperCase().trim() ===
            `${officer.familyName?.toUpperCase().trim()} ${officer.postNominals ?? ''}`.trim()) &&
        ao.provincialRank?.toUpperCase().trim() === officer.provincialRank?.toUpperCase().trim()
    );
    if (ao && ao.length === 1) {
      return prisma.activeOfficer.update({
        where: { id: ao[0]?.id },
        data: {
          primaryEmail: officer.primaryEmail,
          preferredPhoneNo: officer.preferredPhoneNo,
          postNominals: officer.postNominals,
          familyName: officer.familyName,
          familiarName: officer.familiarName ?? officer.givenName,
          salutationOverride: officer.salutationOverride,
        },
      });
    } else {
      importErrors.push(
        `Could not find a unique officer to update for ${officer.givenName} ${officer.familyName} (${officer.provincialRank})`
      );
      // Return a resolved promise to avoid breaking the Promise.all
      return Promise.resolve();
    }
  });

  await Promise.all(promises);

  // Finally see if any active officers are classified as "Area Chairman" have an equivalent
  // ordinary ActiveOfficer record then update the active officer record and remove the area chairman
  // record.  We don't need them in here twice.
  const acs = activeOfficers.filter(
    (ao) =>
      ao.additionalSeatingInfo?.length &&
      ao.additionalSeatingInfo?.toUpperCase().indexOf('AREA CHAIRMAN') > 0
  );

  for (const ac of acs) {
    const pot = activeOfficers.filter((ao) => {
      // Ignore Area Chairmen
      if (
        ao.additionalSeatingInfo?.length &&
        ao.additionalSeatingInfo?.toUpperCase().indexOf('AREA CHAIRMAN') > 0
      )
        return false;
      const familyName = ac.familyName?.replace(ao.postNominals ?? '', '').trim();
      return (
        (ac.givenName?.toUpperCase().trim() === ao.givenName?.toUpperCase().trim() ||
          ac.givenName?.toUpperCase().trim() === ao.familiarName?.toUpperCase().trim()) &&
        familyName?.toUpperCase().trim() === ao.familyName?.toUpperCase().trim()
      );
    });
    if (pot && pot.length === 1) {
      // We have a match
      const officer = pot[0];
      await prisma.oVMaster.updateMany({
        where: {
          activeOfficerId: ac.id,
        },
        data: {
          activeOfficerId: officer?.id,
        },
      });
      await prisma.oVMasterAdditionalOfficer.updateMany({
        where: {
          activeOfficerId: ac.id,
        },
        data: {
          activeOfficerId: officer?.id,
        },
      });
      await prisma.activeOfficer.delete({
        where: { id: ac.id },
      });
      await prisma.activeOfficer.update({
        where: { id: officer?.id },
        data: {
          additionalSeatingInfo: ac.additionalSeatingInfo,
        },
      });
    }
  }

  return { success: true, imported: validatedOfficers.length, importErrors };
});
