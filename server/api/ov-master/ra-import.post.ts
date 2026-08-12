/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '~/server/utils/dbClient';
import { z } from 'zod';
import { OVType } from '@prisma/client';
import type { EnrichedCell } from '~/types';

const officialVisitSchema = z.object({
  number: z.number(),
  date: z.date(),
  lodgeName: z.string(),
  lodgeNumber: z.string(),
  location: z.string(),
  vip: z.string(),
  dc: z.string(),
  adc: z.number().nullable().optional(),
  sword: z.number().nullable().optional(),
  standard: z.number().nullable().optional(),
  steward: z.number().nullable().optional(),
  officer1: z.number().nullable().optional(),
  officer2: z.number().nullable().optional(),
  officer3: z.number().nullable().optional(),
  officer4: z.number().nullable().optional(),
  officer5: z.number().nullable().optional(),
  officer6: z.number().nullable().optional(),
  officer7: z.number().nullable().optional(),

  additionalOfficers: z.array(z.number()).optional(),
});

function excelSerialToDate(serial: number): Date {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // 1899-12-30
  return new Date(excelEpoch.getTime() + serial * 86400 * 1000);
}

export default defineEventHandler(async (event) => {
  const importErrors: string[] = [];
  const body = await readBody(event);
  const { ovType, year } = z
    .object({
      ovType: z.enum(OVType),
      year: z.string(),
    })
    .parse(body);

  const data: EnrichedCell[][] = body.ovs;

  const getCell = (cell: string, row?: EnrichedCell[]): EnrichedCell | null => {
    if (row) {
      return row.find((col) => col.address === cell) ?? null;
    }
    let found: EnrichedCell | undefined = undefined;
    data.find((r) => {
      found = r.find((col) => col.address === cell);
      return !!found;
    });
    return found ?? null;
  };

  const vipColourCell = year === '25-26' ? 'B6' : 'C4';
  const dcColourCell = year === '25-26' ? 'B7' : 'C5';
  const stdbColourCell = year === '25-26' ? 'B8' : 'C6';
  const adcColourCell = year === '25-26' ? 'B9' : 'C7';
  const swdbColourCell = year === '25-26' ? 'B10' : 'C8';

  const vipColour = getCell(vipColourCell)?.colour;
  const dcColour = getCell(dcColourCell)?.colour;
  const stdbColour = [getCell(stdbColourCell)?.colour, '00B0F0'];
  const adcColour = getCell(adcColourCell)?.colour;
  const swdbColour = getCell(swdbColourCell)?.colour;

  const activeOfficers = await prisma.activeOfficer.findMany({
    where: {
      ovType,
      year,
    },
  });

  const VIPs = await prisma.vIP.findMany({
    where: {
      ovType,
      year,
    },
  });

  const ovs: Record<string, any>[] = [];

  const getRowValues = (row: EnrichedCell[], startCell: string) => {
    const values: string[] = [];
    let llFound = false;
    for (const cell of row) {
      if (!llFound && cell.address >= startCell) llFound = true;
      if (llFound) {
        values.push(cell.value as string);
      }
    }
    return values.filter(Boolean);
  };

  // The first row contains the visit numbers from column I onwards
  const ovNumbers = year === '25-26' ? getRowValues(data[0]!, 'I1') : getRowValues(data[1]!, 'F1');

  // The next row contains all the OV chapter names
  const chapterNames =
    year === '25-26' ? getRowValues(data[1]!, 'I1') : getRowValues(data[2]!, 'F1');

  // The next row contains all the OV chapter numbers
  const chapterNos = year === '25-26' ? getRowValues(data[2]!, 'I1') : getRowValues(data[3]!, 'F1');

  // The next row contains all the locations
  const locations = year === '25-26' ? getRowValues(data[3]!, 'I1') : getRowValues(data[4]!, 'F1');

  // The next row contains all the VIPs
  const ovVips =
    year === '25-26'
      ? getRowValues(data[4]!, 'I1').map((v) => {
          if (v.indexOf('MEGS') >= 0) {
            return 'MEGS';
          }
          if (v.indexOf('DGSUPT') >= 0 || v.indexOf('DEPGSUPT') >= 0) {
            return 'DEPGSUPT';
          }
          if (v.indexOf('Scribe N') >= 0) {
            return 'GSN';
          }
          if (v.indexOf('3PGP') >= 0) {
            return '3RDPGP';
          }
          if (v.indexOf('2PGP') >= 0) {
            return '2NDPGP';
          }
          return null;
        })
      : null;

  // The next row contains all the dates
  const ovDates = year === '25-26' ? getRowValues(data[5]!, 'I1') : getRowValues(data[5]!, 'F1');

  const getVIP = (rank: string | null) => {
    if (!rank) return null;
    return VIPs.find((vip) => vip.provincialRank === rank);
  };

  // Construct basic OVs
  for (let n = 0; n < ovNumbers.length; n++) {
    ovs.push({
      'Visit No': ovNumbers[n],
      Date: ovDates[n],
      'Lodge number': chapterNos[n] ? chapterNos[n]?.toString() : '0', // AGM has no lodge number
      'Lodge name': chapterNames[n],
      Location: locations[n],
      VIP: ovVips?.[n] ? getVIP(ovVips[n] as string)?.name : null,
      DC: 'UNKNOWN',
    });
  }

  function getActiveOfficerFromRow(row: EnrichedCell[]) {
    // We can use email in the 25-26 matrix
    if (year === '25-26') {
      const email = row[5]?.value ? (row[5]?.value as string).trim() : '';
      return activeOfficers.find((ao) => ao.primaryEmail === email);
    }

    // Find the active officer by rank and family name (exclusing post nominals)
    const rank = row[3]?.value
      ? (row[3]?.value as string).trim().toUpperCase().replace('PROV', '')
      : '';

    if (rank !== 'RA AREA CHAIR') {
      const additionalSeatingInfo = (row[0]?.value ?? null) as string | null;
      const familyName = (row[2]?.value as string) ?? '';
      return activeOfficers.find((ao) => {
        const cleanFamilyName = familyName
          .replace(ao.postNominals ?? '', '')
          .trim()
          .toUpperCase();
        return (
          (((!ao.provincialRank && rank === '') ||
            ao.provincialRank?.toUpperCase().trim() === rank) &&
            ao.familyName?.toUpperCase().trim() === cleanFamilyName) ||
          additionalSeatingInfo?.toUpperCase().trim() ===
            ao.additionalSeatingInfo?.toUpperCase().trim()
        );
      });
    } else {
      // Column 0 will say which area chair (i.e North Central Area Chairman)
      const area = row[0]?.value ? (row[0]?.value as string).replace('Area Chairman', '') : '';
      return activeOfficers.find(
        (ao) =>
          ao.familyName?.toUpperCase().trim() === 'AREA CHAIRMAN' &&
          ao.givenName?.toUpperCase().trim() === area.toUpperCase().trim()
      );
    }
  }

  function getVIPFromRow(row: EnrichedCell[]) {
    // We can use email in the 25-26 matrix
    if (year === '25-26') {
      const email = row[5]?.value ? (row[5]?.value as string).trim() : '';
      return VIPs.find((ao) => ao.email === email);
    }

    // Find the VIP by rank and name (exclusing post nominals)
    const rank = row[3]?.value
      ? (row[3]?.value as string).trim().toUpperCase().replace('PROV', '')
      : '';
    const familyName = row[2]?.value
      ? (row[2]?.value as string).trim().toUpperCase().split(' ')[0]
      : '';
    let givenName = (row[1]?.value as string) ?? '';
    if (givenName.indexOf('(') === 0) {
      // Cater for "(James) Ian"
      givenName = givenName.split(' ')[1] ?? '';
    }
    const name = `${givenName} ${familyName}`.toUpperCase().trim();
    return VIPs.find(
      (vip) =>
        vip.provincialRank?.toUpperCase().trim() === rank && vip.name?.toUpperCase().trim() === name
    );
  }

  function isOfficerRow(row: EnrichedCell[]) {
    return row.some((c) => c.value === 'YES');
  }

  // Traverse the officers for each visit
  const startRow = year === '25-26' ? 10 : 9;
  for (let r = startRow; r <= data.length; r++) {
    // We only want active officers,
    const row = data[r];
    if (row) {
      if (isOfficerRow(row)) {
        // Officer is named, so add to every visit where the column value is YES
        const ao = getActiveOfficerFromRow(row);
        const vip = getVIPFromRow(row);

        if (ao || vip) {
          row.forEach((col, index) => {
            if (col.value === 'YES') {
              // Get the OV for this
              const ovRow = year === '25-26' ? 0 : 1;
              const ovNumber = data[ovRow] ? data[ovRow][index]?.value : null;
              const ov = ovs.find((ov) => ov['Visit No'] === ovNumber);
              if (!ov) {
                logger.error({ col }, 'Unable to find OV');
                importErrors.push(`Unable to find OV for ${col.address}`);
              } else {
                // Determine if cell is a special
                if (col.colour === vipColour) {
                  ov.VIP = vip?.name;
                } else if (col.colour === dcColour) {
                  ov.DC = `${ao?.familiarName} ${ao?.familyName}`;
                } else if (col.colour === adcColour) {
                  ov.ADC = ao?.number;
                } else if (stdbColour.includes(col.colour)) {
                  ov.Standard = ao?.number;
                } else if (col.colour === swdbColour) {
                  ov.Sword = ao?.number;
                } else {
                  // Just add to the additional officer list
                  if (!ov.Additional) ov.Additional = [];
                  if (ov.Additional.includes(ao?.id)) {
                    logger.warn({ ao }, 'Duplicate active officer');
                  } else {
                    ov.Additional.push(ao?.id);
                  }
                }
              }
            }
          });
        }
      }
    }
  }

  logger.debug({ ovs }, 'OVs');

  // Filter out the erroneous OVs
  const cleaned = ovs.filter((ov) => {
    return !!ov.VIP || !!ov['Lodge name'] || !!ov['Lodge number'];
  });

  // Report errors
  const badOVs = ovs.filter((ov) => !cleaned.some((c) => c['Visit No'] === ov['Visit No']));
  badOVs.forEach((ov) =>
    importErrors.push(`Unable to import erroneous OV for ${ov['Lodge name']}`)
  );

  const columnMap: Record<string, keyof typeof officialVisitSchema.shape> = {
    'Visit No': 'number',
    Date: 'date',
    'Lodge number': 'lodgeNumber',
    'Lodge name': 'lodgeName',
    Location: 'location',
    VIP: 'vip',
    DC: 'dc',
    ADC: 'adc',
    Sword: 'sword',
    Standard: 'standard',
    Steward: 'steward',
    'Officer 1': 'officer1',
    'Officer 2': 'officer2',
    'Extra Officers': 'officer3',
    __EMPTY: 'officer4',
    __EMPTY_1: 'officer5',
    __EMPTY_2: 'officer6',
    __EMPTY_3: 'officer7',
    Additional: 'additionalOfficers',
  };

  const validatedOfficialVisits = cleaned.map((row) => {
    const mapped: Record<string, unknown> = {};

    for (const [column, field] of Object.entries(columnMap)) {
      let value = row[column];
      if (value === undefined || (value === '' && field !== 'dc' && field !== 'vip')) value = null;
      if (['Sword', 'Standard'].includes(column) && value === 'X') {
        value = null;
      }

      // Handle Excel serial date
      if (field === 'date' && typeof value === 'number') {
        value = excelSerialToDate(value);
      }
      if (field === 'additionalOfficers') {
        mapped[field] = [...value];
      } else {
        mapped[field] = value;
      }
    }
    logger.debug(mapped, 'Parsing');
    return officialVisitSchema.parse(mapped);
  });

  await prisma.$transaction(async (tx) => {
    await tx.oVMaster.deleteMany({
      where: {
        ovType,
        year,
      },
    });

    for (const ov of validatedOfficialVisits) {
      const { additionalOfficers, ...fields } = ov;

      const created = await tx.oVMaster.create({
        data: {
          ...fields,
          ovType,
          year,
        },
      });

      if (additionalOfficers?.length) {
        await tx.oVMasterAdditionalOfficer.createMany({
          data: additionalOfficers.map((activeOfficerId) => ({
            ovMasterId: created.id,
            activeOfficerId,
          })),
        });
      }
    }
  });

  return { success: true, imported: validatedOfficialVisits.length, importErrors };
});
