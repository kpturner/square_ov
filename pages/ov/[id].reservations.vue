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
    <v-main>
      <v-container fluid class="pa-4">
        <client-only>
          <v-overlay v-model="loading" absolute class="d-flex align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary" />
          </v-overlay>
        </client-only>
        <v-card class="no-print">
          <v-card-title class="d-flex flex-column align-start w-100">
            <v-btn
              color="primary"
              prepend-icon="mdi-home"
              class="mb-2 w-100 w-sm-auto"
              small
              @click="$router.back()"
            >
              Back
            </v-btn>

            <div
              class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between w-100"
            >
              <div v-if="officialVisit" class="text-subtitle-1 text-lg-h6 mb-2 mb-sm-0 text-wrap">
                Seat reservations for OV to {{ officialVisit?.name || '...' }}
              </div>

              <v-btn
                color="primary"
                prepend-icon="mdi-printer"
                class="w-100 w-sm-auto"
                @click="printReservations"
              >
                Print
              </v-btn>
            </div>
          </v-card-title>

          <v-text-field
            v-model="spares"
            type="number"
            label="Spares"
            class="w-auto"
            style="max-width: 100px"
          />

          <SeatReservations :officers :spares />
        </v-card>

        <v-card v-if="!loading" class="no-print">
          <v-card-title
            class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between w-100"
          >
            <v-btn
              color="primary"
              prepend-icon="mdi-home"
              class="mb-2 w-100 w-sm-auto no-print"
              small
              @click="$router.back()"
            >
              Back
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-printer"
              class="w-100 w-sm-auto no-print"
              @click="printReservations"
            >
              Print
            </v-btn>
          </v-card-title>
        </v-card>
      </v-container>
    </v-main>
    <SeatReservations class="only-print" :officers print-mode :spares />
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
const officialVisit = ref<OV | null>(null);
const spares = ref(2);

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

function printReservations() {
  window.print();
}
</script>

<style lang="scss" scoped></style>
