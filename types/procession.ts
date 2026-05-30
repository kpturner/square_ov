import type { Officer } from '@prisma/client';

export type ProcessionRow = {
  south?: Officer;
  south2?: Officer;
  north?: Officer;
  north2?: Officer;
};
