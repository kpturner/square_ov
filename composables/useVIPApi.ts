import type { OVType } from '@prisma/client';

export const useVIPApi = () => {
  const importVIPs = async (ovType: OVType, data: Record<string, unknown>[], year: string) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      `/api/vip/${ovType === 'ra' ? 'ra-' : ''}import`,
      {
        method: 'POST',
        body: { ovType, data, year },
      }
    );
    return res;
  };

  return { import: importVIPs };
};
