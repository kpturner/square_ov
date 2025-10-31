import prisma from '~/server/utils/dbClient';
import { z } from 'zod';

const officialVisitSchema = z.object({
  number: z.number(),
  date: z.date(),
  lodgeName: z.string(),
  lodgeNumber: z.string(),
  location: z.string(),
  vip: z.string(),
  dc: z.string(),
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
});

function excelSerialToDate(serial: number): Date {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // 1899-12-30
  return new Date(excelEpoch.getTime() + serial * 86400 * 1000);
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { year, ovs } = z
    .object({ year: z.string(), ovs: z.array(z.record(z.string(), z.any())) })
    .parse(body);

  const columnMap: Record<string, keyof typeof officialVisitSchema.shape> = {
    'Visit No': 'number',
    Date: 'date',
    'Lodge number': 'lodgeNumber',
    'Lodge name': 'lodgeName',
    'Lodge  name': 'lodgeName',
    Location: 'location',
    VIP: 'vip',
    DC: 'dc',
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
  };

  const validatedOfficialVisits = ovs.map((row) => {
    const mapped: Record<string, unknown> = {};

    for (const [column, field] of Object.entries(columnMap)) {
      let value = row[column];
      if (value === undefined || value === '') value = null;
      if (['Sword', 'Standard'].includes(column) && value === 'X') {
        value = null;
      }

      // Handle Excel serial date
      if (field === 'date' && typeof value === 'number') {
        value = excelSerialToDate(value);
      }

      mapped[field] = value;
    }

    return officialVisitSchema.parse(mapped);
  });

  const promises = validatedOfficialVisits.map((ov) =>
    prisma.oVMaster.upsert({
      where: { year_number: { year, number: ov.number } },
      update: ov,
      create: { ...ov, year },
    })
  );

  await Promise.all(promises);

  return { success: true, imported: validatedOfficialVisits.length };
});
