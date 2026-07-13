import type { OVType } from '@prisma/client';

export const useActiveOfficerApi = () => {
  const importActiveOfficers = async (
    ovType: OVType,
    data: Record<string, unknown>[],
    year: string
  ) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      `/api/active-officers/${ovType === 'ra' ? 'ra-' : ''}import`,
      {
        method: 'POST',
        body: { ovType, data, year },
      }
    );
    return res;
  };

  return { import: importActiveOfficers };
};
