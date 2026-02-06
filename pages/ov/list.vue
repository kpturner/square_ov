<template>
  <v-container>
    <client-only>
      <v-overlay v-model="loading" absolute class="d-flex align-center justify-center">
        <v-progress-circular indeterminate size="64" color="primary" />
      </v-overlay>
    </client-only>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="w-100 d-flex flex-column align-start">
              <v-btn
                color="primary"
                prepend-icon="mdi-home"
                class="mb-2 w-100 w-sm-auto"
                small
                @click="$router.push('/home')"
              >
                Home
              </v-btn>
              <span class="text-h5">Official Visit Master</span>
            </div>
          </v-card-title>
          <!-- Top Actions -->
          <div class="d-flex flex-column flex-sm-row justify-end ga-2 mb-2 no-print">
            <v-text-field
              v-model="year"
              label="Masonic year"
              hide-details
              @click:prepend-inner="load"
              @keyup.enter="load"
            />
            <v-text-field
              v-model="search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              hide-details
              @click:prepend-inner="load"
              @keyup.enter="load"
            />
          </div>
          <!-- DESKTOP -->
          <v-responsive class="hidden-md-and-down">
            <v-data-table :headers="headers" :items="ovMasters" class="mt-4">
              <template #item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template #item.actions="{ item }">
                <v-btn
                  class="me-2"
                  icon="mdi-account-multiple"
                  size="small"
                  color="success"
                  variant="elevated"
                  title="Allocated Officers"
                  @click="goToOfficers(item)"
                />
              </template>
            </v-data-table>
          </v-responsive>

          <!-- MOBILE -->
          <v-responsive class="hidden-lg-and-up"
            ><v-row dense>
              <v-col v-for="(item, i) in formattedOVs" :key="item.id ?? i" cols="12">
                <v-card class="officer-card pa-3 mb-2" elevation="3" variant="tonal">
                  <v-row dense>
                    <v-col cols="8">
                      <v-text-field
                        v-model="item.lodgeName"
                        label="Name"
                        density="compact"
                        readonly
                      />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field
                        v-model="item.lodgeNumber"
                        label="No"
                        density="compact"
                        readonly
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-text-field
                        v-model="item.displayDate"
                        label="Date"
                        density="compact"
                        readonly
                      />
                    </v-col>

                    <v-col cols="6">
                      <v-text-field v-model="item.vip" label="VIP" density="compact" readonly />
                    </v-col>

                    <v-col cols="6">
                      <v-text-field v-model="item.dc" label="DC" density="compact" readonly />
                    </v-col>
                  </v-row>
                  <v-row dense align="center" justify="end" class="mt-2">
                    <v-btn
                      icon="mdi-account-multiple"
                      size="small"
                      color="success"
                      variant="elevated"
                      title="Allocated officers"
                      class="me-2"
                      @click="goToOfficers(item)"
                    />
                  </v-row>
                </v-card>
              </v-col> </v-row
          ></v-responsive>
          <!-- Bottom Actions -->
          <div
            v-if="!loading"
            class="d-flex flex-column flex-sm-row justify-end mb-2 no-print"
          ></div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showAllocatedOfficers" :max-width="mdAndDown ? '100%' : '50%'">
      <v-card v-if="selectedOV">
        <v-card-title>Allocated officers for {{ selectedOV.lodgeName }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-if="swordBearer"
              ><v-text-field v-model="swordBearerName" label="Sword bearer" hide-details readonly
            /></v-col>
          </v-row>
          <v-row>
            <v-col v-if="standardBearer"
              ><v-text-field
                v-model="standardBearerName"
                label="Standard bearer"
                hide-details
                readonly
            /></v-col>
          </v-row>
          <v-row>
            <v-col v-if="steward"
              ><v-text-field v-model="stewardName" label="Steward" hide-details readonly
            /></v-col>
          </v-row>
          <v-row v-for="(officer, i) in officers" :key="i">
            <v-col v-if="steward"
              ><v-text-field
                v-model="officer.name"
                :label="`Officer ${i + 1}`"
                hide-details
                readonly
            /></v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import type { OVMaster, ActiveOfficer } from '@prisma/client';
import { useDisplay } from 'vuetify';

const { mdAndDown } = useDisplay();
const loading = ref(true);
const showAllocatedOfficers = ref(false);
const selectedOV = ref<OVMaster | null>(null);
const swordBearer = ref<ActiveOfficer | null>(null);
const standardBearer = ref<ActiveOfficer | null>(null);
const steward = ref<ActiveOfficer | null>(null);
const activeOfficers = ref<ActiveOfficer[]>([]);
const officers = ref<{ name: string | null }[]>([]);

function formatDate(dateStr: string | Date) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

const { masonicYear } = useMasonicYear();
const ovMasters = ref<OVMaster[]>([]);

const year = ref(masonicYear);
const search = ref('');

const formattedOVs = computed(() => {
  return ovMasters.value.map((ov) => ({
    ...ov,
    displayDate: formatDate(ov.date),
  }));
});

const headers = [
  { title: 'Name', key: 'lodgeName' },
  { title: 'No', key: 'lodgeNumber' },
  { title: 'Date', key: 'date' },
  { title: 'VIP', key: 'vip' },
  { title: 'DC', key: 'dc' },
  { title: '', key: 'actions', sortable: false },
];

async function loadOVs() {
  ovMasters.value = await useApi()<OVMaster[]>(`/api/ov-master?year=${year.value}`);
  if (search.value && search.value.trim().length > 0) {
    const searchLower = search.value.trim().toLowerCase();
    ovMasters.value = ovMasters.value.filter(
      (ov) =>
        ov.lodgeName.toLowerCase().includes(searchLower) ||
        ov.lodgeNumber.toString().includes(searchLower) ||
        (ov.vip && ov.vip.toLowerCase().includes(searchLower)) ||
        (ov.dc && ov.dc.toLowerCase().includes(searchLower))
    );
  }
}

async function loadActiveOfficers() {
  activeOfficers.value = await useApi()<ActiveOfficer[]>(
    `/api/active-officers?year=${masonicYear}`
  );
}

const officerName = (ao: ActiveOfficer | null) => {
  return ao
    ? `${ao.number}: ${ao.familyName}, ${ao.familiarName ?? ao.givenName} - ${ao.provincialRank}`
    : ao;
};

const swordBearerName = computed(() => officerName(swordBearer.value!));
const standardBearerName = computed(() => officerName(standardBearer.value!));
const stewardName = computed(() => officerName(steward.value!));

const getActiveOfficer = (aon: number) => {
  return aon ? (activeOfficers.value.find((ao) => ao.number === aon) ?? null) : null;
};

function goToOfficers(item: OVMaster) {
  selectedOV.value = item;
  if (selectedOV.value && activeOfficers.value) {
    if (selectedOV.value.sword) {
      swordBearer.value = getActiveOfficer(selectedOV.value?.sword);
    }
    if (selectedOV.value.standard) {
      standardBearer.value = getActiveOfficer(selectedOV.value?.standard);
    }
    if (selectedOV.value.steward) {
      steward.value = getActiveOfficer(selectedOV.value?.steward);
    }

    officers.value = [];
    if (selectedOV.value.officer1) {
      officers.value.push({ name: officerName(getActiveOfficer(selectedOV.value.officer1)) });
    }
    if (selectedOV.value.officer2) {
      officers.value.push({ name: officerName(getActiveOfficer(selectedOV.value.officer2)) });
    }
    if (selectedOV.value.officer3) {
      officers.value.push({ name: officerName(getActiveOfficer(selectedOV.value.officer3)) });
    }
    if (selectedOV.value.officer4) {
      officers.value.push({ name: officerName(getActiveOfficer(selectedOV.value.officer4)) });
    }
    if (selectedOV.value.officer5) {
      officers.value.push({ name: officerName(getActiveOfficer(selectedOV.value.officer5)) });
    }
    if (selectedOV.value.officer6) {
      officers.value.push({ name: officerName(getActiveOfficer(selectedOV.value.officer6)) });
    }
    if (selectedOV.value.officer7) {
      officers.value.push({ name: officerName(getActiveOfficer(selectedOV.value.officer7)) });
    }
  }
  showAllocatedOfficers.value = true;
}

async function load() {
  loading.value = true;
  await loadOVs();
  await loadActiveOfficers();
  loading.value = false;
}

onMounted(async () => {
  await load();
});
</script>
