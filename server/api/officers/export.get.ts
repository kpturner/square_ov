import prisma from '~/server/utils/dbClient';
import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const ovId = Number(query.ovId);

  if (!ovId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing ovId',
    });
  }

  const ov = await prisma.oV.findUnique({ where: { id: ovId } });

  if (!ov) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid OV id',
    });
  }

  // Fetch officers for this ovId
  const officers = await prisma.officer.findMany({
    where: { ovId },
    orderBy: { id: 'asc' },
  });

  // Create workbook & sheet
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Attendance');

  // Header row
  sheet.columns = [
    { header: 'Attended', key: 'attending', width: 10 },
    { header: 'Allocated', key: 'original', width: 10 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Rank', key: 'rank', width: 15 },
    { header: 'Active', key: 'active', width: 10 },
    { header: 'Prov. Officer Year', key: 'provOfficerYear', width: 15 },
    { header: 'Grand Officer', key: 'grandOfficer', width: 12 },
    { header: 'Grand Rank', key: 'grandRank', width: 15 },
    { header: 'Grand Active', key: 'grandActive', width: 12 },
    { header: 'Grand Officer Year', key: 'grandOfficerYear', width: 15 },
    { header: 'Procession?', key: 'excludeFromProcession', width: 20 },
  ];

  const ovDate = new Date(ov!.ovDate);
  const ovDateStr = `${ovDate.getFullYear()}-${ovDate.getMonth()}-${ovDate.getDay()}`;

  // Add rows
  officers.forEach((o) => {
    sheet.addRow({
      ...o,
      attending: o.attending ? 'Yes' : '',
      original: o.original ? 'Yes' : '',
      active: o.active ? 'Yes' : '',
      grandOfficer: o.grandOfficer ? 'Yes' : '',
      grandActive: o.grandActive ? 'Yes' : '',
      excludeFromProcession: o.attending ? (o.excludeFromProcession ? '' : 'Yes') : 'n/a',
    });
  });

  // Write workbook to buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Return XLSX file
  setHeader(
    event,
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="${ov!.name} ${ovDateStr} attendance.xlsx"`
  );

  return buffer;
});
