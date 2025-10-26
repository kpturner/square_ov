<template>
  <v-card class="pa-4">
    <v-card-title class="d-flex justify-space-between mb-2"
      >Procession for OV to {{ OV?.name || '...' }}
      <v-btn
        color="primary"
        prepend-icon="mdi-printer"
        class="mb-4 no-print"
        @click="printProcession"
      >
        Print
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- VIP row at the rear/top with sword and standard bearers -->
      <div
        v-if="vip || swordBearer || standardBearer"
        class="d-flex justify-center mb-4"
      >
        <v-card
          v-if="swordBearer"
          class="pa-3 text-center mr-1 officer-card"
          color="grey lighten-2"
        >
          <strong>{{ swordBearer.name }}</strong>
          <div class="text-caption">Sword Bearer</div>
        </v-card>

        <v-card
          v-if="vip"
          class="pa-3 text-center officer-card"
          color="yellow lighten-2"
        >
          <strong>{{ vip.name }}</strong>
          <div class="text-caption">VIP</div>
        </v-card>

        <v-card
          v-if="standardBearer"
          class="pa-3 text-center ml-1 officer-card"
          color="grey lighten-2"
        >
          <strong>{{ standardBearer.name }}</strong>
          <div class="text-caption">Standard Bearer</div>
        </v-card>
      </div>

      <!-- Rows of officers, top = rear, bottom = front -->
      <div class="d-flex justify-space-between mb-2">
        <div class="flex-1 pl-1">
          <div class="pa-2 text-center">
            <strong>SOUTH</strong>
          </div>
        </div>
        <div class="flex-1 pl-1">
          <div class="pa-2 text-center">
            <strong>NORTH</strong>
          </div>
        </div>
      </div>
      <div
        v-for="(row, idx) in rows"
        :key="idx"
        class="d-flex justify-space-between mb-2"
      >
        <div
          v-if="row.south"
          class="flex-1 pr-1"
        >
          <v-card
            class="pa-2 text-center officer-card"
            :color="row.south.grandOfficer ? 'blue darken-3' : undefined"
            :style="row.south.grandOfficer ? 'color: yellow' : undefined"
          >
            <div>{{ row.south.name }}</div>
            <div class="text-caption">{{ rankPrefix(row.south) }}{{ row.south.rank }}</div>
          </v-card>
        </div>
        <div
          v-if="row.north"
          class="flex-1 pl-1"
        >
          <v-card
            class="pa-2 text-center officer-card"
            :color="row.north.grandOfficer ? 'blue darken-3' : undefined"
            :style="row.north.grandOfficer ? 'color: yellow' : undefined"
          >
            <div>{{ row.north.name }}</div>
            <div class="text-caption">{{ rankPrefix(row.north) }}{{ row.north.rank }}</div>
          </v-card>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Officer, OV } from '@prisma/client';
import { computed } from 'vue';

const { ranks } = useRuntimeConfig().public;

const props = defineProps<{ officers: Officer[]; OV: OV | null }>();

// Special roles
const vip = computed(() => props.officers.find((o) => o.position === 'vip'));
const swordBearer = computed(() => props.officers.find((o) => o.position === 'sword_bearer'));
const standardBearer = computed(() => props.officers.find((o) => o.position === 'standard_bearer'));

// Rear/front/head positions
const rearSouth = computed(() => props.officers.find((o) => o.position === 'rear_of_south'));
const rearNorth = computed(() => props.officers.find((o) => o.position === 'rear_of_north'));
const headSouth = computed(() => props.officers.find((o) => o.position === 'head_of_south'));
const headNorth = computed(() => props.officers.find((o) => o.position === 'head_of_north'));

const rankPrefix = (officer: Officer) => {
  if (officer.grandOfficer) {
    if (!officer.active) {
      return 'P';
    }
  } else {
    if (officer.active) {
      return 'Prov';
    } else {
      return 'P';
    }
  }
  return '';
};

// Automatic officers sorted by seniority
const automatic = computed(() =>
  props.officers
    .filter((o) => o.position === 'automatic')
    .sort((a, b) => {
      // Grand officer first
      if (a.grandOfficer && !b.grandOfficer) return -1;
      if (!a.grandOfficer && b.grandOfficer) return 1;

      // Grand year
      if (a.grandOfficer && b.grandOfficer && a.grandOfficerYear && b.grandOfficerYear) {
        if (a.grandOfficerYear !== b.grandOfficerYear) return a.grandOfficerYear - b.grandOfficerYear;
      }

      // Rank seniority
      const aRankIndex = ranks.findIndex((r: any) => r.value === a.rank);
      const bRankIndex = ranks.findIndex((r: any) => r.value === b.rank);
      if (aRankIndex !== bRankIndex)
        return (aRankIndex !== -1 ? aRankIndex : ranks.length) - (bRankIndex !== -1 ? bRankIndex : ranks.length);

      // Active only matters if rank and grand status are equal
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;

      return 0;
    })
);

// Build marching rows (top = rear, bottom = front)
const rows = computed(() => {
  const result: { south?: Officer; north?: Officer; centre?: Officer[] }[] = [];

  // VIP + sword/standard first (rear)
  const centreRow: Officer[] = [];
  if (swordBearer.value) centreRow.push(swordBearer.value);
  if (vip.value) centreRow.push(vip.value);
  if (standardBearer.value) centreRow.push(standardBearer.value);
  if (centreRow.length > 0) result.push({ centre: centreRow });

  let nextRow: { south?: Officer; north?: Officer } = {};
  if (rearSouth.value) nextRow.south = rearSouth.value;
  if (rearNorth.value) nextRow.north = rearNorth.value;
  if (Object.keys(nextRow).length > 0) result.push(nextRow);

  // Traverse the automatic officers and add rows
  for (const officer of automatic.value) {
    if (!nextRow.south) {
      nextRow.south = officer;
    } else if (!nextRow.north) {
      nextRow.north = officer;
      result.push(nextRow);
      nextRow = {};
    }
  }

  // Cater for heads of rows
  if (headSouth.value || headNorth.value) {
    if (Object.keys(nextRow).length === 0) {
      if (headSouth.value) {
        nextRow.south = headSouth.value;
      }
      if (headNorth.value) {
        nextRow.north = headNorth.value;
      }
      result.push(nextRow);
      nextRow = {};
    } else {
      let hs = headSouth.value;
      let hn = headNorth.value;
      if (hs && hn) {
        nextRow.north = hn;
        hn = undefined;
        result.push(nextRow);
        nextRow = {};
      }
      if (hs) {
        if (nextRow.south) {
          // Swap
          nextRow.north = nextRow.south;
          nextRow.south = hs;
          result.push(nextRow);
          nextRow = {};
        } else {
          nextRow.south = hs;
        }
      }
      if (hn) {
        nextRow.north = hn;
        result.push(nextRow);
        nextRow = {};
      }
      if (Object.keys(nextRow).length > 0) {
        result.push(nextRow);
        nextRow = {};
      }
    }
  }

  return result;
});

function printProcession() {
  window.print();
}
</script>

<style scoped>
.v-card-text {
  display: flex;
  flex-direction: column;
}

.officer-card {
  min-width: 300px;
}

@media print {
  /* Hide everything except the Procession component */
  body * {
    visibility: hidden;
  }

  .procession-print,
  .procession-print * {
    visibility: visible;
  }

  .procession-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Hide all "no-print" buttons and controls */
  .no-print {
    display: none !important;
  }

  @page {
    size: portrait;
    margin: 1.5cm;
  }
}
</style>
