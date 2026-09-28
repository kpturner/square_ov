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
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-home"
                  class="mb-2 w-100 w-sm-auto"
                  small
                  @click="$router.push('/home')"
                >
                  Home
                </v-btn>
                <v-btn
                  color="secondary"
                  class="ms-2"
                  prepend-icon="mdi-arrow-left"
                  @click="$router.back()"
                  >Back
                </v-btn>
              </div>
              <span class="text-h5">Active Officers</span>
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
              clearable
              clear-icon="mdi-close-circle"
              @click:prepend-inner="load"
              @keyup.enter="debouncedLoad"
              @click:clear="
                search = '';
                load();
              "
            />
          </div>
          <!-- DESKTOP -->
          <v-responsive class="hidden-md-and-down">
            <v-data-table :headers="headers" :items="officers" class="mt-4">
              <template #item.actions="{ item }">
                <v-badge :model-value="hasOverrides(item)" color="red" dot>
                  <v-btn
                    class="me-2"
                    icon="mdi-pencil"
                    size="small"
                    color="primary"
                    variant="elevated"
                    title="Edit officer details"
                    @click="editOfficer(item)"
                  />
                </v-badge>
              </template>
            </v-data-table>
          </v-responsive>

          <!-- MOBILE -->
          <v-responsive class="hidden-lg-and-up"
            ><v-row dense>
              <v-col v-for="(item, i) in officers" :key="item.id ?? i" cols="12">
                <v-card class="officer-card pa-3 mb-2" elevation="3" variant="tonal">
                  <v-row dense>
                    <v-col cols="2">
                      <v-text-field v-model="item.number" label="Name" density="compact" readonly />
                    </v-col>
                    <v-col cols="8">
                      <v-text-field
                        v-model="item.familyName"
                        label="Name"
                        density="compact"
                        readonly
                      />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field
                        v-model="item.givenName"
                        label="No"
                        density="compact"
                        readonly
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-text-field
                        v-model="item.provincialRank"
                        label="Date"
                        density="compact"
                        readonly
                      />
                    </v-col>
                  </v-row>
                  <v-row dense align="center" justify="end" class="mt-2">
                    <v-badge :model-value="hasOverrides(item)" color="red" dot>
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        color="primary"
                        variant="elevated"
                        title="Edit officer details"
                        class="me-2"
                        @click="editOfficer(item)"
                      />
                    </v-badge>
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

    <v-dialog v-model="showOfficerDialog" :max-width="mdAndDown ? '100%' : '50%'">
      <v-card v-if="selectedOfficer">
        <v-card-title
          >{{ selectedOfficer.number }} {{ selectedOfficer.familyName }},
          {{ selectedOfficer.givenName }}</v-card-title
        >
        <v-card-text>
          <v-select
            v-model="selectedOfficer.rankOverride"
            :items="[{ value: '', title: '' }, ...ranks]"
            label="Provincial Rank Override"
            density="compact"
            placeholder="override procession position"
            clearable
            clear-icon="mdi-close-circle"
            @click:clear="selectedOfficer.rankOverride = null"
          >
            <template #append-inner>
              <v-tooltip
                text="If provided, this will be used for automatic procession ordering instead of the provincial rank"
              >
                <template #activator="{ props: ttprops }">
                  <v-icon v-bind="ttprops" icon="mdi-information-outline" size="18" />
                </template>
              </v-tooltip>
            </template>
          </v-select>
          <v-text-field
            v-model.number="selectedOfficer.provOfficerYearOverride"
            label="Provincial Officer Year Override"
            type="number"
            density="compact"
            clearable
            clear-icon="mdi-close-circle"
            :min="1900"
            @click:clear="selectedOfficer.provOfficerYearOverride = null"
          />
          <v-text-field
            v-model.number="selectedOfficer.salutationOverride"
            label="Salutation Override"
            density="compact"
            clearable
            clear-icon="mdi-close-circle"
            @click:clear="selectedOfficer.salutationOverride = null"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showOfficerDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveOfficer">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import type { ActiveOfficer } from '@prisma/client';
import { useDisplay } from 'vuetify';
import debounce from 'lodash/debounce';
import type { Rank } from '~/types';

const makeToast = useToast();

const { mdAndDown } = useDisplay();
const loading = ref(true);
const showOfficerDialog = ref(false);
const selectedOfficer = ref<ActiveOfficer | null>(null);
const { ovType, saveOvType } = useOvType();

const { masonicYear } = useMasonicYear();
const officers = ref<ActiveOfficer[]>([]);

const year = ref(masonicYear);
const search = ref('');

const cfg = useRuntimeConfig().public;

const headers = [
  { title: 'Number', key: 'number' },
  { title: 'Family Name', key: 'familyName' },
  { title: 'Given Name', key: 'givenName' },
  { title: 'Rank', key: 'provincialRank' },
  { title: '', key: 'actions', sortable: false },
];

const ranks = computed(
  () => (ovType.value === 'craft' || !ovType.value ? cfg.ranks : cfg.raRanks) as Rank[]
);

async function loadOfficers() {
  officers.value = await useApi()<ActiveOfficer[]>(
    `/api/active-officers?ovType=${ovType.value}&year=${year.value}`
  );
  if (search.value && search.value.trim().length > 0) {
    const searchLower = search.value.trim().toLowerCase();
    officers.value = officers.value.filter(
      (o) =>
        o.familyName?.toLowerCase().includes(searchLower) ||
        o.givenName?.toString().includes(searchLower) ||
        o.provincialRank?.toLowerCase().includes(searchLower)
    );
  }
}

function editOfficer(item: ActiveOfficer) {
  selectedOfficer.value = item;
  showOfficerDialog.value = true;
}

async function saveOfficer() {
  if (!selectedOfficer.value) return;

  await useApi()(
    `/api/active-officers/${ovType.value}/${year.value}/${selectedOfficer.value.number}`,
    {
      method: 'PUT',
      body: {
        rankOverride: selectedOfficer.value.rankOverride,
        provOfficerYearOverride: selectedOfficer.value.provOfficerYearOverride,
        salutationOverride: selectedOfficer.value.salutationOverride,
      },
    }
  );

  makeToast(
    `"${selectedOfficer.value.familyName}, ${selectedOfficer.value.givenName}"" saved successfully.`
  );

  showOfficerDialog.value = false;

  await loadOfficers();
}

function hasOverrides(officer: ActiveOfficer): boolean {
  return !!(officer.rankOverride || officer.provOfficerYearOverride || officer.salutationOverride);
}

const debouncedLoad = debounce(load, 500);

async function load() {
  loading.value = true;
  await loadOfficers();
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
