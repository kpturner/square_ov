<template>
  <v-app>
    <v-app-bar flat class="mb-4 no-print">
      <v-btn color="grey" variant="text" small @click="logOff"> Log Off </v-btn>
      <v-spacer />
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        @click="toggleTheme"
      />
    </v-app-bar>
    <v-main class="no-print">
      <v-container fluid class="pa-4">
        <client-only>
          <v-overlay v-model="loading" absolute class="d-flex align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary" />
          </v-overlay>
        </client-only>
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="w-100 d-flex flex-column" style="align-items: flex-start">
              <v-btn
                color="primary"
                prepend-icon="mdi-home"
                class="mb-2 w-100 w-sm-auto"
                small
                @click="$router.push('/home')"
              >
                Home
              </v-btn>
              <span v-if="officialVisit" class="text-subtitle-1 text-lg-h6"
                >Officers for OV to {{ officialVisit?.name || '...' }}</span
              >
              <v-btn
                v-if="officialVisit"
                color="secondary"
                prepend-icon="mdi-seat"
                class="mb-2 w-100 w-sm-auto"
                small
                @click="reservations"
              >
                Seat reservations
              </v-btn>
            </div>
          </v-card-title>

          <v-container fluid class="pa-4">
            <!-- Top Actions -->
            <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2">
              <v-btn
                color="green"
                class="me-sm-2 mb-2 mb-sm-0 w-100 w-sm-auto"
                prepend-icon="mdi-plus"
                @click="addOfficer"
              >
                Add Officer
              </v-btn>

              <v-btn
                color="primary"
                prepend-icon="mdi-content-save"
                class="w-100 w-sm-auto"
                @click="saveAll"
              >
                Save Changes
              </v-btn>
            </div>

            <Officers
              :officers
              @load-officers="loadOfficers"
              @delete-officer="deleteOfficer"
              @save-changes="saveAll"
            />

            <!-- Bottom Actions -->
            <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2">
              <v-btn
                color="green"
                class="me-sm-2 mb-2 mb-sm-0 w-100 w-sm-auto"
                prepend-icon="mdi-plus"
                @click="addOfficer"
              >
                Add Officer
              </v-btn>

              <v-btn
                color="primary"
                prepend-icon="mdi-content-save"
                class="w-100 w-sm-auto"
                @click="saveAll"
              >
                Save Changes
              </v-btn>
            </div>
          </v-container>
        </v-card>
        <hr />
        <Procession v-if="!loading && officialVisit" :officers :official-visit />

        <v-card v-if="!loading">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="w-100 d-flex flex-column" style="align-items: flex-start">
              <v-btn
                v-if="officialVisit"
                color="secondary"
                prepend-icon="mdi-seat"
                class="mb-2 w-100 w-sm-auto"
                small
                @click="reservations"
              >
                Seat reservations
              </v-btn>
              <v-btn
                color="primary"
                prepend-icon="mdi-home"
                class="mb-2 w-100 w-sm-auto"
                small
                @click="$router.push('/home')"
              >
                Home
              </v-btn>
            </div>
          </v-card-title>
        </v-card>
      </v-container>
    </v-main>
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Officer"
      :message="`Are you sure you want to delete
    '${officerToDelete?.name}'?`"
      color="red"
      @confirm="confirmedDeletion"
    />
    <Procession class="only-print" :officers :official-visit />
  </v-app>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import type { OV } from '@prisma/client';
import type { GridOfficer } from '~/types/officers';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const { theme, toggleTheme } = useSetTheme();

const showDeleteConfirm = ref(false);
const officerToDelete = ref<GridOfficer | null>(null);
const route = useRoute();
const router = useRouter();
const officers = ref<GridOfficer[]>([]);
const officialVisit = ref<OV | null>(null);

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
  officialVisit.value = res.ov
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

  officerToDelete.value = officer;
  showDeleteConfirm.value = true;
}

async function confirmedDeletion() {
  if (officerToDelete.value) {
    await $fetch(`/api/officers/${officerToDelete.value.id}`, { method: 'DELETE' });
    await loadOfficers();
  }
}

async function reservations() {
  await saveAll();
  router.push(`/ov/${officialVisit.value?.id}.reservations`);
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

<style lang="scss" scoped></style>
