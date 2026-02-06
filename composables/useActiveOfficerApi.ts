export const useActiveOfficerApi = () => {
  const importActiveOfficers = async (officers: Record<string, unknown>[], year: string) => {
    const res = await useApi()<{ success: boolean; imported: number; importErrors: string[] }>(
      '/api/active-officers/import',
      {
        method: 'POST',
        body: { officers, year },
      }
    );
    return res;
  };

  return { import: importActiveOfficers };
};
