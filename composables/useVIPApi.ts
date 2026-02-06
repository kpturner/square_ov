export const useVIPApi = () => {
  const importVIPs = async (vips: Record<string, unknown>[], year: string) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      '/api/vip/import',
      {
        method: 'POST',
        body: { vips, year },
      }
    );
    return res;
  };

  return { import: importVIPs };
};
