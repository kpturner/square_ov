<template>
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
            Attendance report for OV to {{ officialVisit?.name || '...' }} on
            {{ formatDate(officialVisit?.ovDate) }}
          </div>
        </div>
      </v-card-title>

      <v-container fluid class="pa-4">
        <!-- Top Actions -->
        <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-printer"
            class="w-100 w-sm-auto me-2 mb-2"
            @click="printReport"
          >
            Print
          </v-btn>
          <v-btn
            color="secondary"
            prepend-icon="mdi-download"
            class="w-100 w-sm-auto me-2 mb-2"
            @click="download"
          >
            Download
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-content-save"
            class="w-100 w-sm-auto"
            @click="saveAll"
          >
            Save Changes
          </v-btn>
        </div>

        <Attendance :official-visit :officers />

        <!-- Bottom Actions -->
        <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-printer"
            class="w-100 w-sm-auto no-print me-2"
            @click="printReport"
          >
            Print
          </v-btn>
          <v-btn
            color="secondary"
            prepend-icon="mdi-download"
            class="w-100 w-sm-auto me-2 mb-2"
            @click="download"
          >
            Download
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-content-save"
            class="w-100 w-sm-auto"
            @click="saveAll"
          >
            Save Changes
          </v-btn>
        </div>
      </v-container>
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
      </v-card-title>
    </v-card>

    <Attendance class="only-print" :official-visit :officers print-mode />
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { OV, Officer } from '@prisma/client';

const route = useRoute();
const officers = ref<Officer[]>([]);
const officialVisit = ref<OV | null>(null);
const ovId = Number(route.params.id);

const loading = ref(true);

onMounted(async () => {
  await loadOfficers();
});

const download = () => {
  const url = `/api/officers/export?ovId=${ovId}`;
  window.location.href = url;
};

function formatDate(dateStr: string | Date) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

async function loadOfficers() {
  const res = await useApi()<{ officers: Officer[]; ov: OV }>(`/api/officers?ovId=${ovId}`);
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

async function saveAll() {
  const ovId = Number(route.params.id);
  await useApi()(`/api/officers?ovId=${ovId}`, {
    method: 'PUT',
    body: officers.value.map((o) => ({
      ...o,
      provOfficerYear: o.provOfficerYear ? Number(o.provOfficerYear) : null,
      grandOfficerYear: o.grandOfficerYear ? Number(o.grandOfficerYear) : null,
    })),
  });
  await loadOfficers();
}

async function printReport() {
  await saveAll();
  window.print();
}
</script>

<style lang="scss" scoped></style>
