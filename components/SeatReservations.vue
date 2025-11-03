<template>
  <v-row dense>
    <v-col v-for="(item, i) in officers" :key="item.id ?? i" cols="12">
      <v-card class="reservation-card ml-1 mb-1" :elevation="printMode ? '0' : '3'" variant="tonal">
        <v-row dense class="align-center text-center no-gutters">
          <v-col cols="2" class="d-flex justify-center align-center crest-column">
            <img class="crest" :src="hiowCrest" alt="HIoW Crest" />
          </v-col>

          <v-col cols="10" class="text-column">
            <v-row class="text-h5 mb-1 mt-1 old-english justify-center">
              Provincial Grand Lodge of Hampshire & Isle of Wight
            </v-row>
            <v-row class="mb-1 justify-center">
              <div class="text-h4 font-weight-bold">
                {{ salutation(item) }} {{ item.name.toUpperCase() }}
              </div>
            </v-row>
            <v-row class="justify-center">
              <div class="text-h5">{{ provincialRankPrefix(item) }} {{ provincialRank(item) }}</div>
            </v-row>
            <v-row class="justify-center">
              <div class="text-h5">{{ grandRankPrefix(item) }} {{ grandRank(item) }}</div>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <template v-if="Number(spares)">
      <v-col v-for="i in Number(spares)" :key="i" cols="12">
        <v-card
          class="reservation-card mb-1"
          :elevation="printMode ? '0' : '3'"
          :variant="printMode ? 'elevated' : 'tonal'"
        >
          <v-row dense class="align-center text-center no-gutters">
            <!-- Left Column: Crest with right border -->
            <v-col cols="2" class="d-flex justify-center align-center crest-column">
              <img class="crest" :src="hiowCrest" alt="HIoW Crest" />
            </v-col>

            <!-- Right Column: Text -->
            <v-col cols="10" class="text-column">
              <v-row class="spare-header text-h5 font-weight-bold mt-1 old-english justify-center">
                Provincial Grand Lodge of Hampshire & Isle of Wight
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </template>
  </v-row>
</template>

<script setup lang="ts">
import type { GridOfficer, Rank } from '~/types/officers';
import hiowCrest from '~/assets/images/hiowcrest.png';

defineProps<{ officers: GridOfficer[]; spares: number; printMode?: boolean }>();

const ranks: Rank[] = useRuntimeConfig().public.ranks as Rank[];

const salutation = (officer: GridOfficer) => {
  if (officer.rank === 'PGM') {
    return 'R. W. BRO.';
  }
  if (officer.rank === 'DPGM') {
    return 'V. W. BRO.';
  }
  return 'W. BRO.';
};

const provincialRank = (officer: GridOfficer) => {
  if (!officer.rank) {
    return '';
  }
  return ranks.find((r) => r.value === officer.rank)?.title;
};

const provincialRankPrefix = (officer: GridOfficer) => {
  if (!officer.rank) {
    return '';
  }
  if (['PGM', 'DPGM', 'APGM'].includes(officer.rank)) {
    return officer.active ? '' : 'Past';
  }
  return officer.active ? 'Provincial' : 'Past Provincial';
};

const grandRank = (officer: GridOfficer) => {
  if (!officer.grandOfficer) {
    return;
  }
  return ranks.find((r) => r.value === officer.grandRank)?.title;
};

const grandRankPrefix = (officer: GridOfficer) => {
  if (!officer.grandOfficer || !officer.grandRank) {
    return;
  }
  return officer.grandActive ? '' : 'Past';
};
</script>

<style lang="scss" scoped>
.reservation-card {
  min-height: 180px;
  border: 2px solid #1565c0;
  outline: 2px solid #1565c0;
  outline-offset: 2px;
  box-sizing: border-box;
  width: 99%;
}

.crest {
  width: 80%;
}

.crest-column {
  border-right: 1px solid #1565c0; /* Single divider */
  padding: 16px;
  box-sizing: border-box;
  min-height: 180px;
}

.title-column {
  padding: 16px;
  box-sizing: border-box;
}

.spare-header {
  margin-bottom: 130px;
}

@media print {
  .reservation-card {
    color: #1565c0;
    page-break-inside: avoid; /* Prevent splitting across pages */
    break-inside: avoid;
  }
}
</style>
