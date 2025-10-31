export const useOVMasterApi = () => {
  const importOfficialVisits = async (ovs: Record<string, unknown>[], year: string) => {
    const res = await $fetch('/api/ov-master/import', {
      method: 'POST',
      body: {
        ovs: ovs.filter((o) => {
          return o['Visit No'] !== undefined;
        }),
        year,
      },
    });
    return res;
  };

  return { import: importOfficialVisits };
};
