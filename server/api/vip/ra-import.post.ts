/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '~/server/utils/dbClient';
import { z } from 'zod';
import { OVType } from '@prisma/client';

const VIPSchema = z.object({
  provincialRank: z.string(),
  name: z.string(),
  address: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
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

  // Extract the raw officer data
  let megsFound = false;
  const vips: Record<string, any>[] = data
    .filter((rd) => {
      if (rd.__EMPTY === 'MEGS') {
        megsFound = true;
      }
      if (!megsFound) return false;
      // MEGS, the principals and the assistants are VIPs so we don't need them here
      if (rd.__EMPTY === 'MEGS') {
        return true;
      }
      if (rd.__EMPTY?.toUpperCase() === 'DEPUTY') {
        return true;
      }
      if (rd.__EMPTY?.toUpperCase() === 'DEPUTY GRAND SUPERINTENDENT') {
        return true;
      }
      if (rd.__EMPTY?.toUpperCase() === 'SECOND PROVINCIAL GRAND PRINCIPAL') {
        return true;
      }
      if (rd.__EMPTY?.toUpperCase() === 'THIRD PROVINCIAL GRAND PRINCIPAL') {
        return true;
      }
      if (rd.__EMPTY_3 && rd.__EMPTY_3.toUpperCase() === 'PROVGSN') {
        return true;
      }
      return false;
    })
    .map((rd) => {
      let office = null;
      if (rd.__EMPTY === 'MEGS') {
        office = 'MEGS';
      }
      if (rd.__EMPTY?.toUpperCase() === 'DEPUTY') {
        office = 'DEPGSUPT';
      }
      if (rd.__EMPTY?.toUpperCase() === 'DEPUTY GRAND SUPERINTENDENT') {
        office = 'DEPGSUPT';
      }
      if (rd.__EMPTY?.toUpperCase() === 'SECOND PROVINCIAL GRAND PRINCIPAL') {
        office = '2NDPGP';
      }
      if (rd.__EMPTY?.toUpperCase() === 'THIRD PROVINCIAL GRAND PRINCIPAL') {
        office = '3RDPGP';
      }
      if (rd.__EMPTY_3 && rd.__EMPTY_3.toUpperCase() === 'PROVGSN') {
        office = 'GSN';
      }
      const splits = rd.__EMPTY_1 ? rd.__EMPTY_1.split(' ') : [];
      let givenName = rd.__EMPTY_1?.trim() ?? '';
      if (splits[0].indexOf('(') === 0) {
        givenName = splits[1].trim();
      }
      return {
        Office: office,
        Name:
          year === '25-26' && rd.__EMPTY_8
            ? rd.__EMPTY_8.trim()
            : `${givenName} ${rd.__EMPTY_2?.toUpperCase().trim() ?? ''}`.trim(),
        Address: '',
        Email: typeof rd.__EMPTY_4 === 'string' ? rd.__EMPTY_4.trim() : '',
        Phone: '',
        Mobile: '',
      };
    });

  const columnMap: Record<string, keyof typeof VIPSchema.shape> = {
    Office: 'provincialRank',
    Name: 'name',
    Address: 'address',
    Email: 'email',
    Phone: 'phone',
    Mobile: 'mobile',
  };

  const validatedVIPs = vips.map((row) => {
    const mapped: Record<string, unknown> = {};

    for (const [column, field] of Object.entries(columnMap)) {
      const value = row[column];
      mapped[field] = value;
    }

    return VIPSchema.parse(mapped);
  });

  const promises = validatedVIPs.map((vip) =>
    prisma.vIP.upsert({
      where: { type_year_name: { ovType, year, name: vip.name } },
      update: vip,
      create: { ...vip, ovType, year },
    })
  );

  await Promise.all(promises);

  return { success: true, imported: validatedVIPs.length, importErrors };
});
