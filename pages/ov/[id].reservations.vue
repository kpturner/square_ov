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

      <div class="d-flex flex-column flex-sm-row align-start ga-3 mb-4">
        <v-text-field
          v-model="spares"
          type="number"
          label="Spares"
          hide-details
          style="width: 100px; max-width: 100px"
        />

        <v-select
          v-model="selectedOfficerIds"
          :items="attendingOfficers"
          item-title="name"
          item-value="id"
          label="Officers to include"
          multiple
          hide-details
          class="flex-grow-1"
          style="max-width: 500px"
        >
          <template #prepend-item>
            <v-list-item title="Select all" @click="selectAllOfficers">
              <template #prepend>
                <v-checkbox-btn
                  :model-value="allOfficersSelected"
                  :indeterminate="someOfficersSelected"
                />
              </template>
            </v-list-item>

            <v-divider />
          </template>

          <template #selection="{ index }">
            <span v-if="index === 0" class="text-body-2">
              {{ selectedOfficerSummary }}
            </span>
          </template>
        </v-select>
      </div>

      <SeatReservations
        v-if="officialVisit"
        :ov-type="officialVisit.ovType"
        :officers="selectedOfficers"
        :spares
      />
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

    <SeatReservations
      v-if="officialVisit"
      class="only-print"
      :ov-type="officialVisit.ovType"
      :officers="selectedOfficers"
      print-mode
      :spares
    />
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { OV, Officer } from '@prisma/client';

const route = useRoute();
const officers = ref<Officer[]>([]);
const officialVisit = ref<OV | null>(null);
const spares = ref(2);
const selectedOfficerIds = ref<number[]>([]);

const allOfficerIds = computed(() => attendingOfficers.value.map((o) => o.id));

const allOfficersSelected = computed(
  () => selectedOfficerIds.value.length === allOfficerIds.value.length
);

const someOfficersSelected = computed(
  () =>
    selectedOfficerIds.value.length > 0 &&
    selectedOfficerIds.value.length < allOfficerIds.value.length
);

const selectedOfficerSummary = computed(() => {
  const count = selectedOfficerIds.value.length;
  const total = allOfficerIds.value.length;

  if (count === total) {
    return `All officers (${total})`;
  }

  return `${count} of ${total} officers`;
});

function selectAllOfficers() {
  if (allOfficersSelected.value) {
    selectedOfficerIds.value = [];
  } else {
    selectedOfficerIds.value = [...allOfficerIds.value];
  }
}

const loading = ref(true);

onMounted(async () => {
  await loadOfficers();
});

const attendingOfficers = computed(() => {
  return officers.value.filter((o) => o.attending);
});

const selectedOfficers = computed(() => {
  return attendingOfficers.value.filter((o) => selectedOfficerIds.value.includes(o.id));
});

async function loadOfficers() {
  const ovId = Number(route.params.id);
  const res = await useApi()<{ officers: Officer[]; ov: OV }>(`/api/officers?ovId=${ovId}`);
  officers.value = res.officers;
  officialVisit.value = res.ov
    ? {
        ...res.ov,
        createdAt: new Date(res.ov.createdAt),
        ovDate: res.ov.ovDate ? new Date(res.ov.ovDate) : null,
      }
    : null;

  selectedOfficerIds.value = attendingOfficers.value.map((o) => o.id);

  loading.value = false;
}

function printReservations() {
  window.print();
}
</script>

<style lang="scss" scoped></style>
