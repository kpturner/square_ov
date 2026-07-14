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
              <OVTypeSelector v-model="ovType" />
            </div>
          </v-card-title>
          <!-- Top Actions -->
          <div class="d-flex flex-column flex-sm-row justify-end ga-2 mb-2 no-print">
            <v-text-field
              v-model="year"
              label="Masonic year"
              prepend-inner-icon="mdi-calendar"
              hide-details
              @click:prepend-inner="debouncedLoad"
              @keyup.enter="load"
            />
            <v-text-field
              v-model="search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              hide-details
              @click:prepend-inner="load"
              @keyup.enter="debouncedLoad"
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
            <v-col
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
import type { ActiveOfficer } from '@prisma/client';
import { useDisplay } from 'vuetify';
import debounce from 'lodash/debounce';
import type { OVMasterWithAdditionalOfficers } from '~/types';

const { mdAndDown } = useDisplay();
const loading = ref(true);
const showAllocatedOfficers = ref(false);
const selectedOV = ref<OVMasterWithAdditionalOfficers | null>(null);
const swordBearer = ref<ActiveOfficer | null>(null);
const standardBearer = ref<ActiveOfficer | null>(null);
const steward = ref<ActiveOfficer | null>(null);
const officers = ref<{ name: string | null }[]>([]);
const { ovType, saveOvType } = useOvType();

function formatDate(dateStr: string | Date) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

const { masonicYear } = useMasonicYear();
const ovMasters = ref<OVMasterWithAdditionalOfficers[]>([]);

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
  ovMasters.value = await useApi()<OVMasterWithAdditionalOfficers[]>(
    `/api/ov-master?ovType=${ovType.value}&year=${year.value}`
  );
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

const officerName = (ao: ActiveOfficer | null) => {
  return ao
    ? `${ovType.value === 'craft' ? ao.number : ''}${ovType.value === 'craft' ? ':' : ''} ${ao.familyName}, ${ao.familiarName ?? ao.givenName} - ${ao.provincialRank ?? '*rank unknown'}`
    : ao;
};

const swordBearerName = computed(() => officerName(swordBearer.value!));
const standardBearerName = computed(() => officerName(standardBearer.value!));
const stewardName = computed(() => officerName(steward.value!));

function goToOfficers(item: OVMasterWithAdditionalOfficers) {
  selectedOV.value = item;
  if (selectedOV.value) {
    if (selectedOV.value.sword) {
      swordBearer.value = selectedOV.value.swordOfficer;
    }
    if (selectedOV.value.standard) {
      standardBearer.value = selectedOV.value.standardOfficer;
    }
    if (selectedOV.value.steward) {
      steward.value = selectedOV.value.stewardOfficer;
    }

    officers.value = [];
    if (selectedOV.value.officer1) {
      officers.value.push({ name: officerName(selectedOV.value.officer1Officer) });
    }
    if (selectedOV.value.officer2) {
      officers.value.push({ name: officerName(selectedOV.value.officer2Officer) });
    }
    if (selectedOV.value.officer3) {
      officers.value.push({ name: officerName(selectedOV.value.officer3Officer) });
    }
    if (selectedOV.value.officer4) {
      officers.value.push({ name: officerName(selectedOV.value.officer4Officer) });
    }
    if (selectedOV.value.officer5) {
      officers.value.push({ name: officerName(selectedOV.value.officer5Officer) });
    }
    if (selectedOV.value.officer6) {
      officers.value.push({ name: officerName(selectedOV.value.officer6Officer) });
    }
    if (selectedOV.value.officer7) {
      officers.value.push({ name: officerName(selectedOV.value.officer7Officer) });
    }
    officers.value = officers.value.concat(
      selectedOV.value.additionalOfficers.map((ao) => ({ name: officerName(ao.activeOfficer) }))
    );
  }
  showAllocatedOfficers.value = true;
}

const debouncedLoad = debounce(load, 500);

async function load() {
  loading.value = true;
  await loadOVs();
  loading.value = false;
}

onMounted(async () => {
  await load();
});

watch(ovType, async () => {
  await load();
  saveOvType(ovType.value);
});

watch(year, () => {
  debouncedLoad();
});
</script>
