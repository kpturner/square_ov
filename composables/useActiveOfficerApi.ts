import type { OVType } from '@prisma/client';

export const useActiveOfficerApi = () => {
  const importActiveOfficers = async (
    ovType: OVType,
    officers: Record<string, unknown>[],
    year: string
  ) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      '/api/active-officers/import',
      {
        method: 'POST',
        body: { ovType, officers, year },
      }
    );
    return res;
  };

  return { import: importActiveOfficers };
};
