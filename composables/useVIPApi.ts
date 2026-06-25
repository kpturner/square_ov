import type { OVType } from '@prisma/client';

export const useVIPApi = () => {
  const importVIPs = async (ovType: OVType, vips: Record<string, unknown>[], year: string) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      '/api/vip/import',
      {
        method: 'POST',
        body: { ovType, vips, year },
      }
    );
    return res;
  };

  return { import: importVIPs };
};
