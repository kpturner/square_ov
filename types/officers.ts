import type { Officer } from '@prisma/client';

export type GridOfficer = Officer & { isNew?: boolean };
