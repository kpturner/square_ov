<template>
  <v-row dense>
    <v-col v-for="(item, i) in officers" :key="item.id ?? i" cols="12">
      <v-card
        class="reservation-card mb-1"
        :elevation="printMode ? '0' : '3'"
        :variant="printMode ? 'default' : 'tonal'"
      >
        <v-row dense class="align-center text-center no-gutters">
          <!-- Left Column: Crest with right border -->
          <v-col cols="2" class="d-flex justify-center align-center crest-column">
            <img class="w-50" :src="hiowCrest" alt="HIoW Crest" />
          </v-col>

          <!-- Right Column: Text -->
          <v-col cols="10" class="text-column">
            <v-row class="text-h5 font-weight-bold mb-1 mt-1 old-english justify-center">
              Provincial Grand Lodge of Hampshire & Isle of Wight
            </v-row>
            <v-row class="mb-1 justify-center">
              <div class="text-h5 font-weight-bold">
                {{ salutation(item) }} {{ item.name.toUpperCase() }}
              </div>
            </v-row>
            <v-row class="mb-1 justify-center">
              <div class="text-h5">{{ provincialRankPrefix(item) }} {{ provincialRank(item) }}</div>
            </v-row>
            <v-row class="mb-1 justify-center">
              <div class="text-h5">{{ grandRankPrefix(item) }} {{ grandRank(item) }}</div>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { GridOfficer } from '~/types/officers'
import hiowCrest from '~/assets/images/hiowcrest.png'

const props = defineProps<{ officers: GridOfficer[]; printMode: boolean }>()

const { ranks } = useRuntimeConfig().public

const salutation = (officer: GridOfficer) => {
  if (officer.rank === 'PGM') {
    return 'R. W. BRO.'
  }
  if (officer.rank === 'DPGM') {
    return 'V. W. BRO.'
  }
  return 'W. BRO.'
}

const provincialRank = (officer: GridOfficer) => {
  if (!officer.rank) {
    return ''
  }
  return ranks.find((r) => r.value === officer.rank)?.text
}

const provincialRankPrefix = (officer: GridOfficer) => {
  if (!officer.rank) {
    return ''
  }
  if (['PGM', 'DPGM', 'APGM'].includes(officer.rank)) {
    return ''
  }
  return officer.active ? 'Provincial' : 'Past Provincial'
}

const grandRank = (officer: GridOfficer) => {
  if (!officer.grandOfficer) {
    return
  }
  return ranks.find((r) => r.value === officer.grandRank)?.text
}

const grandRankPrefix = (officer: GridOfficer) => {
  if (!officer.grandOfficer) {
    return
  }
  return officer.grandActive ? '' : 'Past'
}
</script>

<style lang="scss" scoped>
.reservation-card {
  min-height: 200px;
  border: 4px solid #1565c0;
  padding: 0;
  box-sizing: border-box;
}

.crest-column {
  border-right: 4px solid #1565c0; /* Single divider */
  padding: 16px;
  box-sizing: border-box;
  min-height: 200px;
}

.text-column {
  padding: 16px;
  box-sizing: border-box;
}

@media print {
  .reservation-card {
    color: #1565c0;
    page-break-inside: avoid; /* Prevent splitting across pages */
    break-inside: avoid;
  }
}
</style>
