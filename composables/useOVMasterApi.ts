export const useOVMasterApi = () => {
  const importOfficialVisits = async (ovs: Record<string, unknown>[], year: string) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      '/api/ov-master/import',
      {
        method: 'POST',
        body: {
          ovs: ovs.filter((o) => {
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
