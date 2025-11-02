export const useVIPApi = () => {
  const importVIPs = async (vips: Record<string, unknown>[], year: string) => {
    const res = await $fetch('/api/vip/import', {
      method: 'POST',
      body: { vips, year },
    });
    return res;
  };

  return { import: importVIPs };
};
