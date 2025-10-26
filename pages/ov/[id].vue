<template>
  <v-container>
    <v-card>
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

        <v-btn
          color="green"
          @click="addOfficer"
          prepend-icon="mdi-plus"
        >
          Add Officer
        </v-btn>
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
            :items="ranks"
            item-title="value"
            item-value="value"
            density="compact"
            hide-details
            placeholder="Rank"
          />
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

        <template #item.active="{ item }">
          <div class="checkbox-cell">
            <v-checkbox
              v-model="item.active"
              hide-details
              density="compact"
            />
          </div>
        </template>

        <template #item.position="{ item }">
          <v-select
            v-model="item.position"
            :items="positions"
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
            <v-btn
              color="primary"
              @click="saveAll"
              prepend-icon="mdi-content-save"
            >
              Save Changes
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <Procession :officers="officers" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { OV, Officer } from '@prisma/client';
import { Position } from '@prisma/client';

type GridOfficer = Officer & { isNew?: boolean };

const route = useRoute();
const officers = ref<GridOfficer[]>([]);
const OV = ref<OV | null>(null);

const { ranks } = useRuntimeConfig().public;

const positions = Object.values(Position);

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Rank', key: 'rank', width: '200px' },
  { title: 'Active', key: 'active', align: 'center' as const, width: '80px' },
  { title: 'Position', key: 'position', width: '210px' },
  { title: 'Grand Officer', key: 'grandOfficer', align: 'center' as const, width: '80px' },
  { title: 'Year', key: 'grandOfficerYear', width: '115px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const, width: '120px' },
];

onMounted(async () => {
  await loadOfficers();
});

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
}

function addOfficer() {
  officers.value.push({
    id: 0,
    name: '',
    rank: '',
    grandOfficer: false,
    grandOfficerYear: null,
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

<style scoped></style>
