<template>
  <v-app>
    <v-app-bar
      flat
      class="mb-4 no-print"
    >
      <v-btn
        color="grey"
        variant="text"
        small
        @click="logOff"
      >
        Log Off
      </v-btn>
      <v-spacer />
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="toggleTheme"
        variant="text"
      />
    </v-app-bar>
    <v-main>
      <v-container
        fluid
        class="pa-4"
      >
        <v-overlay
          v-model="loading"
          absolute
          class="d-flex align-center justify-center"
        >
          <v-progress-circular
            indeterminate
            size="64"
            color="primary"
          />
        </v-overlay>
        <v-card class="no-print">
          <v-card-title class="d-flex justify-space-between align-center">
            <div
              class="d-flex flex-column"
              style="align-items: flex-start"
            >
              <v-btn
                color="primary"
                prepend-icon="mdi-home"
                @click="$router.push('/home')"
                class="mb-2"
                small
              >
                Home
              </v-btn>
              <span>Officers for OV to {{ OV?.name || '...' }}</span>
            </div>

            <div class="d-flex">
              <v-btn
                class="me-2"
                color="green"
                @click="addOfficer"
                prepend-icon="mdi-plus"
              >
                Add Officer
              </v-btn>
              <v-btn
                color="primary"
                @click="saveAll"
                prepend-icon="mdi-content-save"
              >
                Save Changes
              </v-btn>
            </div>
          </v-card-title>

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
                @click="deleteOfficer(item)"
              />
            </template>

            <template #bottom>
              <div class="d-flex justify-end pa-2">
                <div class="d-flex">
                  <v-btn
                    class="me-2"
                    color="green"
                    @click="addOfficer"
                    prepend-icon="mdi-plus"
                  >
                    Add Officer
                  </v-btn>
                  <v-btn
                    color="primary"
                    @click="saveAll"
                    prepend-icon="mdi-content-save"
                  >
                    Save Changes
                  </v-btn>
                </div>
              </div>
            </template>
          </v-data-table>
        </v-card>
        <hr />
        <Procession
          :officers
          :OV
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { OV, Officer } from '@prisma/client';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const { theme, toggleTheme } = useSetTheme();

type GridOfficer = Officer & { isNew?: boolean };

const route = useRoute();
const officers = ref<GridOfficer[]>([]);
const OV = ref<OV | null>(null);

const loading = ref(true);

const { ranks } = useRuntimeConfig().public;

const positionsRes = await $fetch('/api/ov/positions');
const positions = positionsRes ?? [];

const availablePositions = computed(() => {
  return positions.filter((pos: string) => {
    return pos === 'automatic' || !officers.value.some((officer) => officer.position === pos);
  });
});

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Provincial Rank', key: 'rank', width: '200px' },
  { title: 'Active', key: 'active', align: 'center' as const, width: '80px' },
  { title: 'Position in procession', key: 'position', width: '210px' },
  { title: 'Grand Officer', key: 'grandOfficer', align: 'center' as const, width: '80px' },
  { title: 'Grand Rank', key: 'grandRank', width: '200px' },
  { title: 'Active', key: 'grandActive', align: 'center' as const, width: '80px' },
  { title: 'Year', key: 'grandOfficerYear', width: '115px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const, width: '120px' },
];

onMounted(async () => {
  await loadOfficers();
});

function logOff() {
  authStore.user = null;
  navigateTo('/');
}

async function loadOfficers() {
  const ovId = Number(route.params.id);
  const res = await $fetch(`/api/officers?ovId=${ovId}`);
  officers.value = res.officers;
  OV.value = res.ov
    ? {
        ...res.ov,
        createdAt: new Date(res.ov.createdAt),
        ovDate: new Date(res.ov.ovDate),
      }
    : null;
  loading.value = false;
}

async function addOfficer() {
  await saveAll();
  officers.value.push({
    id: 0,
    name: '',
    rank: null,
    grandOfficer: false,
    grandOfficerYear: null,
    grandActive: false,
    grandRank: null,
    active: true,
    position: 'automatic',
    ovId: Number(route.params.id),
    isNew: true,
  });
}

async function deleteOfficer(officer: GridOfficer) {
  if (!officer.id) {
    officers.value = officers.value.filter((o) => o !== officer);
    return;
  }

  if (confirm(`Delete officer ${officer.name}?`)) {
    await $fetch(`/api/officers/${officer.id}`, { method: 'DELETE' });
    await loadOfficers();
  }
}

async function saveAll() {
  const ovId = Number(route.params.id);
  await $fetch(`/api/officers?ovId=${ovId}`, {
    method: 'PUT',
    body: officers.value.map((o) => ({
      ...o,
      grandOfficerYear: o.grandOfficerYear ? Number(o.grandOfficerYear) : null,
    })),
  });
  await loadOfficers();
}
</script>

<style scoped>
@media print {
  /* Hide everything except the Procession component */
  body * {
    visibility: hidden;
  }
  /* Hide all "no-print" buttons and controls */
  .no-print {
    display: none !important;
  }
}
</style>
