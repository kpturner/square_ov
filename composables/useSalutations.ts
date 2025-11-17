import type { Rank } from '~/types/officers';
import type { Officer } from '@prisma/client';

export const useSalutations = () => {
  const ranks: Rank[] = useRuntimeConfig().public.ranks as Rank[];

  const salutation = (officer: Officer) => {
    if (officer.rank === 'PGM') {
      return 'R. W. BRO.';
    }
    if (officer.rank === 'DPGM') {
      return 'V. W. BRO.';
    }
    return 'W. BRO.';
  };

  const cleanName = (officerName: string) => {
    return officerName.replace(/\(\d+\)/g, '').trim();
  };

  const provincialRank = (officer: Officer) => {
    if (!officer.rank) {
      return '';
    }
    return ranks.find((r) => r.value === officer.rank)?.title;
  };

  const provincialRankPrefix = (officer: Officer) => {
    if (!officer.rank) {
      return '';
    }
    if (['PGM', 'DPGM', 'APGM'].includes(officer.rank)) {
      return officer.active ? '' : 'Past';
    }
    return officer.active ? 'Provincial' : 'Past Provincial';
  };

  const provincialRankPrefixAbbrev = (officer: Officer) => {
    if (!officer.rank) {
      return '';
    }
    if (['PGM', 'DPGM', 'APGM'].includes(officer.rank)) {
      return officer.active ? '' : 'P';
    }
    return officer.active ? 'Prov' : 'P';
  };

  const grandRank = (officer: Officer) => {
    if (!officer.grandOfficer) {
      return;
    }
    return ranks.find((r) => r.value === officer.grandRank)?.title;
  };

  const grandRankPrefix = (officer: Officer) => {
    if (!officer.grandOfficer || !officer.grandRank) {
      return '';
    }
    return officer.grandActive ? '' : 'Past';
  };

  const grandRankPrefixAbbrev = (officer: Officer) => {
    if (!officer.grandOfficer || !officer.grandRank) {
      return '';
    }
    return officer.grandActive ? '' : 'P';
  };

  return {
    salutation,
    cleanName,
    provincialRank,
    provincialRankPrefix,
    provincialRankPrefixAbbrev,
    grandRank,
    grandRankPrefix,
    grandRankPrefixAbbrev,
  };
};
