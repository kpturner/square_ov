<template>
  <div>
    <div v-if="printMode" class="text-h6 mb-2 mb-sm-0 text-wrap">
      Attendance report for OV to {{ officialVisit?.name || '...' }} on
      {{ formatDate(officialVisit?.ovDate) }}
    </div>
    <v-responsive v-if="!printMode">
      <v-data-table
        :headers
        :items="sortedOfficers"
        :items-per-page="officers.length"
        item-value="id"
        class="mt-2"
        density="compact"
      >
        <template #item.attending="{ item }">
          <div class="checkbox-cell">
            <v-checkbox v-model="item.attending" hide-details density="compact" />
          </div>
        </template>

        <template #item.original="{ item }">
          <div class="checkbox-cell">
            <v-checkbox v-model="item.original" hide-details density="compact" />
          </div>
        </template>

        <template #item.fullName="{ item }">
          <div>{{ fullName(item) }}</div>
        </template>
      </v-data-table>
    </v-responsive>
    <template v-else
      ><v-card v-for="item in sortedOfficers" :key="item.id" class="officer-card ma-1">
        <v-row dense class="align-center">
          <v-col cols="8"> {{ fullName(item) }}</v-col>
          <v-col cols="2">
            <v-checkbox v-model="item.attending" label="Attended" hide-details density="compact"
          /></v-col>
          <v-col cols="2">
            <v-checkbox v-model="item.original" label="Allocated" hide-details density="compact"
          /></v-col>
        </v-row> </v-card
    ></template>
  </div>
</template>

<script setup lang="ts">
import type { Officer, OV } from '@prisma/client';

const props = defineProps<{
  officialVisit: OV | null;
  officers: Officer[];
  printMode?: boolean;
}>();

function formatDate(dateStr?: string | Date) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

const { salutation, provincialRankPrefixAbbrev, grandRankPrefixAbbrev } = useSalutations();

const fullName = (officer: Officer) => {
  let fullName = `${salutation(officer)} ${officer.name}`;
  if (officer.grandRank && officer.grandOfficer) {
    fullName = `${fullName} - ${grandRankPrefixAbbrev(officer)}${officer.grandRank}`;
  }
  if (officer.rank) {
    fullName = `${fullName} - ${provincialRankPrefixAbbrev(officer)}${officer.rank}`;
  }
  return fullName;
};

const sortedOfficers = computed(() => {
  const priority = {
    vip: 1,
    sword_bearer: 2,
    standard_bearer: 3,
    head_of_south: 4,
    head_of_north: 5,
  };

  return [...props.officers].sort((a, b) => {
    const aPriority = priority[a.position as keyof typeof priority] || 999;
    const bPriority = priority[b.position as keyof typeof priority] || 999;
    return aPriority - bPriority;
  });
});

const headers = [
  { title: 'Name', key: 'fullName', sortable: false },
  { title: 'Attended', key: 'attending', align: 'center' as const, width: '80px' },
  { title: 'Allocated officer', key: 'original', align: 'center' as const, width: '80px' },
];
</script>

<style lang="scss" scoped>
.checkbox-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep(.v-data-table th),
::v-deep(.v-data-table td) {
  padding-left: 4px !important;
  padding-right: 4px !important;
}
::v-deep(.officer-card) {
  border: 1px solid rgba(255, 255, 255, 0.12); /* visible in dark mode */
  border-radius: 8px;
}

.theme--light .officer-card {
  border-color: rgba(0, 0, 0, 0.12);
}

.officer-card {
  box-sizing: border-box;
  width: 99%;
}

@media print {
  .officer-card {
    page-break-inside: avoid; /* Prevent splitting across pages */
    break-inside: avoid;
  }
}
</style>
