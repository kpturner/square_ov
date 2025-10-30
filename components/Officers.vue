<template>
  <v-responsive class="hidden-md-and-down">
    <v-data-table
      :headers
      :items="officers"
      :items-per-page="officers.length"
      item-value="id"
      class="mt-2"
    >
      <template #item.name="{ item }">
        <v-text-field
          v-model="item.name"
          density="compact"
          hide-details
          placeholder="Name"
        />
      </template>

      <template #item.rank="{ item }">
        <v-select
          v-model="item.rank"
          :items="[{ value: '' }, ...ranks]"
          item-title="value"
          item-value="value"
          density="compact"
          hide-details
          placeholder="Prov rank"
        />
      </template>

      <template #item.provOfficerYear="{ item }">
        <v-text-field
          v-model="item.provOfficerYear"
          type="number"
          density="compact"
          hide-details
        />
      </template>

      <template #item.active="{ item }">
        <div class="checkbox-cell">
          <v-checkbox
            v-model="item.active"
            hide-details
            density="compact"
          />
        </div>
      </template>

      <template #item.grandOfficer="{ item }">
        <div class="checkbox-cell">
          <v-checkbox
            v-model="item.grandOfficer"
            hide-details
            density="compact"
          />
        </div>
      </template>

      <template #item.grandOfficerYear="{ item }">
        <v-text-field
          v-model="item.grandOfficerYear"
          type="number"
          density="compact"
          hide-details
          :disabled="!item.grandOfficer"
        />
      </template>

      <template #item.grandRank="{ item }">
        <v-select
          v-model="item.grandRank"
          :items="[{ value: '' }, ...ranks].filter((r) => !['PGM', 'DPGM', 'APGM'].includes(r.value))"
          item-title="value"
          item-value="value"
          density="compact"
          hide-details
          placeholder="Grand rank"
          :disabled="!item.grandOfficer"
        />
      </template>

      <template #item.grandActive="{ item }">
        <div class="checkbox-cell">
          <v-checkbox
            v-model="item.grandActive"
            hide-details
            density="compact"
            :disabled="!item.grandOfficer"
          />
        </div>
      </template>

      <template #item.position="{ item }">
        <v-select
          v-model="item.position"
          :items="availablePositions"
          density="compact"
          hide-details
        />
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-delete"
          size="small"
          color="red"
          @click="emits('delete-officer', item)"
        />
      </template>
    </v-data-table>
  </v-responsive>

  <!-- MOBILE / TABLET CARDS -->
  <v-responsive class="hidden-lg-and-up">
    <v-row dense>
      <v-col
        v-for="(item, i) in officers"
        :key="item.id ?? i"
        cols="12"
      >
        <v-card
          class="officer-card pa-3 mb-2"
          elevation="3"
          variant="tonal"
        >
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="item.name"
                label="Name"
                density="compact"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="item.rank"
                :items="[{ value: '' }, ...ranks]"
                item-title="value"
                item-value="value"
                label="Provincial Rank"
                density="compact"
                placeholder="Prov rank"
              />
            </v-col>

            <v-col cols="6">
              <v-checkbox
                v-model="item.active"
                label="Active"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="item.provOfficerYear"
                type="number"
                label="Provincial Officer Year"
                density="compact"
              />
            </v-col>

            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="item.position"
                :items="availablePositions"
                label="Position"
                density="compact"
              />
            </v-col>

            <v-col cols="6">
              <v-checkbox
                v-model="item.grandOfficer"
                label="Grand Officer"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col
              cols="6"
              v-if="item.grandOfficer"
            >
              <v-checkbox
                v-model="item.grandActive"
                label="Active"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col
              cols="12"
              v-if="item.grandOfficer"
            >
              <v-select
                v-model="item.grandRank"
                :items="[{ value: '' }, ...ranks].filter((r) => !['PGM', 'DPGM', 'APGM'].includes(r.value))"
                item-title="value"
                item-value="value"
                label="Grand rank"
                density="compact"
                placeholder="Grand rank"
              />
            </v-col>

            <v-col
              cols="12"
              v-if="item.grandOfficer"
            >
              <v-text-field
                v-model="item.grandOfficerYear"
                type="number"
                label="Grand Officer Year"
                density="compact"
              />
            </v-col>
          </v-row>
          <v-row
            dense
            align="center"
            justify="end"
            class="mt-2"
          >
            <v-btn
              class="me-2"
              icon="mdi-content-save"
              color="success"
              size="small"
              title="save changes"
              @click="emits('save-changes')"
            />
            <v-btn
              icon="mdi-delete"
              color="red"
              size="small"
              title="Delete officer"
              @click="emits('delete-officer', item)"
            />
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-responsive>
</template>

<script setup lang="ts">
import type { GridOfficer } from '~/types/officers';

const props = defineProps<{ officers: GridOfficer[] }>();

const emits = defineEmits(['load-officers', 'delete-officer', 'save-changes']);

const { ranks } = useRuntimeConfig().public;

const positionsRes = await $fetch('/api/ov/positions');
const positions = positionsRes ?? [];

const availablePositions = computed(() => {
  return positions.filter((pos: string) => {
    return pos === 'automatic' || !props.officers.some((officer) => officer.position === pos);
  });
});

const headers = [
  { title: 'Name', key: 'name', minWidth: '230px' },
  { title: 'Provincial Rank', key: 'rank', width: '200px' },
  { title: 'Active', key: 'active', align: 'center' as const, width: '80px' },
  { title: 'Prov year', key: 'provOfficerYear', width: '115px' },
  { title: 'Position in procession', key: 'position', width: '210px' },
  { title: 'Grand Officer', key: 'grandOfficer', align: 'center' as const, width: '80px' },
  { title: 'Grand Rank', key: 'grandRank', width: '200px' },
  { title: 'Active', key: 'grandActive', align: 'center' as const, width: '80px' },
  { title: 'GR year', key: 'grandOfficerYear', width: '115px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const, width: '120px' },
];
</script>

<style lang="scss" scoped>
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
</style>
