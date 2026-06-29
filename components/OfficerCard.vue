<template>
  <v-card
    class="pa-2 text-center officer-card"
    :class="officerClasses"
    :color="cardColor"
    :style="cardStyle"
  >
    <div class="d-flex justify-center align-center">
      {{ officer.name }}

      <CornucopiaIcon
        v-if="officer.rank === 'GSTWD' && officer.active"
        class="ms-2"
        style="width: 18px; height: 18px"
      />

      <v-icon
        v-else-if="rankIcons[officer.rank ?? ''] && officer.active"
        :icon="rankIcons[officer.rank ?? '']"
        size="small"
        class="ms-2"
      />

      <v-icon v-if="officer.position?.includes('row_')" icon="mdi-pin" size="small" class="ms-2" />
    </div>

    <div class="text-caption">{{ rankCaption(officer) }}</div>
  </v-card>
</template>

<script setup lang="ts">
import type { Officer, OVType } from '@prisma/client';
import { computed } from 'vue';

const props = defineProps<{
  ovType: OVType | null;
  officer: Officer;
}>();

const rankIcons = computed(() => {
  if (ov.value === 'ra') return raRankIcons;
  return craftRankIcons;
});

const { provincialRankPrefixAbbrev, provincialRankOverridePrefixAbbrev, grandRankPrefixAbbrev } =
  useSalutations(props.ovType);

const craftRankIcons: Record<string, string> = {
  AGDC: 'mdi-auto-fix',
  GDC: 'mdi-magic-staff',
  DEPGDC: 'mdi-magic-staff',
  SGW: 'mdi-star',
  JGW: 'mdi-star',
  APGM: 'mdi-star',
  DPGM: 'mdi-star',
};

const raRankIcons: Record<string, string> = {
  AGDC: 'mdi-auto-fix',
  GDC: 'mdi-magic-staff',
  DEPGDC: 'mdi-magic-staff',
  SGW: 'mdi-star',
  JGW: 'mdi-star',
  APGM: 'mdi-star',
  DPGM: 'mdi-star',
  GSTWD: 'cornucopia',
};

const ovColours = {
  craft: {
    prov: { bg: 'blue-darken-1', border: '#fbc02d' },
    grand: { bg: 'blue-darken-3', border: '#fbc02d' },
    vip: { bg: 'amber-darken-2', border: '#fbc02d' },
  },
  ra: {
    prov: { bg: '#b71c1c', border: '#0d47a1' },
    grand: { bg: '#8e0000', border: '#0d47a1' },
    vip: { bg: '#6a0000', border: '#1e3a8a' },
  },
} as const;

function getTier(officer: Officer): 'prov' | 'grand' | 'vip' {
  if (VIP_RANKS.includes(officer.rank ?? '')) {
    return 'vip';
  }

  if (officer.grandOfficer) {
    return 'grand';
  }

  return 'prov';
}

const ov = computed(() => props.ovType ?? 'craft');
const tier = computed(() => getTier(props.officer));

const officerClasses = computed(() => {
  // ALlows us to add other classes
  const classes: string[] = [tier.value];
  return classes;
});

const isStewardRank = (rank: string | null | undefined) => rank === 'GSTWD';

const cardColor = computed(() => {
  if (ov.value === 'craft' && isStewardRank(props.officer.rank)) {
    return '#a0171d';
  }

  return ovColours[ov.value][tier.value].bg;
});

const cardStyle = computed(() => ({
  borderColor: ovColours[ov.value][tier.value].border,
}));

const rankCaption = (officer: Officer) => {
  let caption = '';

  if (officer.grandOfficer && officer.grandRank) {
    caption += `${grandRankPrefixAbbrev(officer)}${officer.grandRank}`;

    if (officer.grandOfficerYear) {
      caption += ` (${officer.grandOfficerYear})`;
    }
  }

  if (officer.rankOverride) {
    caption += `${provincialRankOverridePrefixAbbrev(officer)}${officer.rankOverride}`;
  }

  if (officer.rank) {
    if (caption.length) caption += ' - ';
    caption += `${provincialRankPrefixAbbrev(officer)}${officer.rank}`;
  }

  return caption;
};
</script>

<style lang="scss" scoped>
.officer-card {
  border: 4px solid #fbc02d;
}

.vip {
  border-width: 8px;
}

.grand {
  border-width: 6px;
}

@media print {
  .officer-card {
    background-color: transparent !important;
    color: black !important;
    border-color: black !important;
    margin-bottom: 50px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
</style>
