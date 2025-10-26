<template>
  <v-card class="pa-4">
    <v-card-title>Procession</v-card-title>
    <v-card-text>
      <!-- VIP centered at the rear (top row) -->
      <div
        v-if="vip"
        class="d-flex justify-center mb-4"
      >
        <v-card
          class="pa-3 text-center"
          color="yellow lighten-2"
        >
          <strong>{{ vip.name }}</strong>
        </v-card>
      </div>

      <!-- Rows of officers, top = rear, bottom = front -->
      <div
        v-for="(row, idx) in rows"
        :key="idx"
        class="d-flex justify-space-between mb-2"
      >
        <div
          v-if="row.south"
          class="flex-1 pr-1"
        >
          <v-card class="pa-2 text-center">
            <div>{{ row.south.name }}</div>
            <div class="text-caption">{{ row.south.rank }}</div>
          </v-card>
        </div>
        <div
          v-if="row.north"
          class="flex-1 pl-1"
        >
          <v-card class="pa-2 text-center">
            <div>{{ row.north.name }}</div>
            <div class="text-caption">{{ row.north.rank }}</div>
          </v-card>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Officer } from '@prisma/client';
import { computed } from 'vue';

const props = defineProps<{ officers: Officer[] }>();

// VIP (always at the rear/top)
const vip = computed(() => props.officers.find((o) => o.position === 'vip'));

// Helper to sort automatic officers by seniority
function sortAutomatic(a: Officer, b: Officer) {
  if (a.grandOfficer && !b.grandOfficer) return -1;
  if (!a.grandOfficer && b.grandOfficer) return 1;

  if (a.grandOfficer && b.grandOfficer && a.grandOfficerYear && b.grandOfficerYear) {
    return a.grandOfficerYear - b.grandOfficerYear;
  }

  if (a.active && !b.active) return -1;
  if (!a.active && b.active) return 1;

  const rankOrder: Record<string, number> = { AGDC: 1, GREG: 2, GORG: 3, GSTWD: 4 };
  return (rankOrder[a.rank] || 99) - (rankOrder[b.rank] || 99);
}

// Separate officers by positions
const rearSouth = computed(() => props.officers.find((o) => o.position === 'rear_of_south'));
const rearNorth = computed(() => props.officers.find((o) => o.position === 'rear_of_north'));
const headSouth = computed(() => props.officers.find((o) => o.position === 'head_of_south'));
const headNorth = computed(() => props.officers.find((o) => o.position === 'head_of_north'));
const automatic = computed(() => props.officers.filter((o) => o.position === 'automatic').sort(sortAutomatic));

// Build marching rows, top = rear, bottom = front
const rows = computed(() => {
  const result: { south?: Officer; north?: Officer }[] = [];
  const auto = [...automatic.value];

  // Add rear positions first
  if (rearSouth.value || rearNorth.value) {
    result.push({ south: rearSouth.value, north: rearNorth.value });
  }

  // Pair automatic officers
  for (let i = 0; i < auto.length; i += 2) {
    result.push({ south: auto[i], north: auto[i + 1] });
  }

  // Determine positions for head officers
  const southLen = result.filter((r) => r.south).length;
  const northLen = result.filter((r) => r.north).length;

  const headRow: { south?: Officer; north?: Officer } = {};
  if (headSouth.value) headRow.south = headSouth.value;

  // Only add headNorth if it exists
  if (headNorth.value) {
    // If south column is longer, align headNorth with last north officer
    if (southLen > northLen) {
      // place headNorth in the last row's north if it’s empty
      for (let i = result.length - 1; i >= 0; i--) {
        if (!result[i].north) {
          result[i].north = headNorth.value;
          headNorth.value = undefined;
          break;
        }
      }
    } else {
      headRow.north = headNorth.value;
    }
  }

  // Add headRow if either side still exists
  if (headRow.south || headRow.north) {
    result.push(headRow);
  }

  return result;
});
</script>

<style scoped>
.v-card-text {
  display: flex;
  flex-direction: column;
}
</style>
