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
          </v-card-title>

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

            <!-- Top Actions -->
            <div class="d-flex justify-end mb-2 no-print">
              <v-btn
                color="green"
                class="me-2"
                prepend-icon="mdi-plus"
                @click="addOfficer"
                >Add Officer</v-btn
              >
              <v-btn
                color="primary"
                prepend-icon="mdi-content-save"
                @click="saveAll"
                >Save Changes</v-btn
              >
            </div>

            <Officers
              :officers
              @load-officers="loadOfficers"
              @delete-officer="deleteOfficer"
            />

            <!-- Bottom Actions -->
            <div class="d-flex justify-end mt-4 no-print">
              <v-btn
                color="green"
                class="me-2"
                prepend-icon="mdi-plus"
                @click="addOfficer"
                >Add Officer</v-btn
              >
              <v-btn
                color="primary"
                prepend-icon="mdi-content-save"
                @click="saveAll"
                >Save Changes</v-btn
              >
            </div>
          </v-container>
        </v-card>
        <hr />
        <Procession
          v-if="!loading && OV"
          :officers
          :OV
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { OV } from '@prisma/client';
import type { GridOfficer } from '~/types/officers';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const { theme, toggleTheme } = useSetTheme();

const route = useRoute();
const officers = ref<GridOfficer[]>([]);
const OV = ref<OV | null>(null);

const loading = ref(true);

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
    provOfficerYear: null,
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
      provOfficerYear: o.provOfficerYear ? Number(o.provOfficerYear) : null,
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
