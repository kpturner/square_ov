import type { OVType } from '@prisma/client';

export const useContactDetailsApi = () => {
  const importContactDetails = async (
    ovType: OVType,
    data: Record<string, unknown>[],
    year: string
  ) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      '/api/active-officers/ra-import-contact-details',
      {
        method: 'POST',
        body: { ovType, data, year },
      }
    );
    return res;
  };

  return { import: importContactDetails };
};
