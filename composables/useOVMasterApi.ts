import type { OVType } from '@prisma/client';
import type { EnrichedCell } from '~/types';

export const useOVMasterApi = () => {
  const importOfficialVisits = async (
    ovType: OVType,
    ovs: Record<string, unknown>[] | EnrichedCell[][],
    year: string
  ) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      `/api/ov-master/${ovType === 'ra' ? 'ra-' : ''}import`,
      {
        method: 'POST',
        body: {
          ovType,
          ovs:
            ovType === 'ra'
              ? ovs
              : (ovs as Record<string, unknown>[]).filter((o) => {
                  return o['Visit No'] !== undefined;
                }),
          year,
        },
      }
    );
    return res;
  };

  return { import: importOfficialVisits };
};
