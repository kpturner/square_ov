<template>
  <v-row dense>
    <v-col v-for="(item, i) in officersByName" :key="item.id ?? i" cols="12">
      <v-card
        class="reservation-card ml-1 mb-1"
        :style="{ '--accent-colour': accentColour }"
        :elevation="printMode ? '0' : '3'"
        :variant="printMode ? 'elevated' : 'tonal'"
      >
        <v-row dense class="align-center text-center no-gutters">
          <v-col cols="2" class="d-flex justify-center align-center crest-column">
            <img class="crest" :src="hiowCrest" alt="HIoW Crest" />
          </v-col>

          <v-col cols="10" class="text-column">
            <v-row class="text-h5 ma-1 old-english justify-center">
              {{ title }}
            </v-row>
            <v-row class="mb-1 justify-center">
              <div class="text-h4 font-weight-bold name-text">
                {{ salutation(item) }} {{ cleanName(item.name.toUpperCase()) }}
              </div>
            </v-row>
            <v-row class="justify-center">
              <div class="text-h5">{{ grandRankPrefix(item) }} {{ grandRank(item) }}</div>
            </v-row>
            <v-row class="justify-center">
              <div class="text-h5">{{ provincialRankPrefix(item) }} {{ provincialRank(item) }}</div>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <template v-if="Number(spares)">
      <v-col v-for="i in Number(spares)" :key="i" cols="12">
        <v-card
          class="reservation-card mb-1"
          :style="{ '--accent-colour': accentColour }"
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
              <v-row class="spare-header text-h5 mt-1 old-english justify-center">
                {{ title }}
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </template>
  </v-row>
</template>

<script setup lang="ts">
import type { Officer, OVType } from '@prisma/client';
import hiowCrest from '~/assets/images/hiowcrest.png';

const props = defineProps<{
  ovType: OVType;
  officers: Officer[];
  spares: number;
  printMode?: boolean;
}>();

const accentColour = computed(() => (props.ovType === 'ra' ? '#B01801' : '#1565c0'));

const title = computed(() => {
  return ` Provincial Grand ${props.ovType === 'craft' ? 'Lodge' : 'Chapter'} of Hampshire & Isle of
              Wight`;
});

const officersByName = computed(() =>
  [...props.officers].sort((a, b) => a.name.localeCompare(b.name))
);

const { salutation, cleanName, provincialRank, provincialRankPrefix, grandRank, grandRankPrefix } =
  useSalutations(props.ovType);
</script>

<style lang="scss" scoped>
.reservation-card {
  --accent-colour: #1565c0; // default

  min-height: 180px;
  border: 2px solid var(--accent-colour);
  outline: 2px solid var(--accent-colour);
  outline-offset: 2px;
  box-sizing: border-box;
  width: 99%;
}

.crest {
  width: 100%;
}

.crest-column {
  border-right: 1px solid var(--accent-colour); /* Single divider */
  padding: 16px !important;
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

.text-column {
  min-width: 0;
  padding: 8px !important;
}

.name-text {
  width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.1;
}

@media print {
  .reservation-card {
    color: var(--accent-colour);
    page-break-inside: avoid; /* Prevent splitting across pages */
    break-inside: avoid;
  }
}
</style>
