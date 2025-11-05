<template>
  <v-app>
    <v-app-bar flat class="mb-4">
      <v-btn color="grey" variant="text" small @click="logOff"> Log Off </v-btn>
      <v-spacer />
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        @click="toggleTheme"
      />
    </v-app-bar>
    <v-main>
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
                    color="red-darken-3"
                    prepend-icon="mdi-import"
                    class="mb-2 w-100 w-sm-auto"
                    small
                    title="Here be dragons!!"
                    @click="$router.push('/admin/import')"
                  >
                    Imports
                  </v-btn>
                  <span class="text-h5">Official Visits</span>
                </div>
              </v-card-title>
              <!-- Top Actions -->
              <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2 no-print">
                <v-btn
                  color="green"
                  class="me-sm-2 mb-2 mb-sm-0 w-100 w-sm-auto"
                  prepend-icon="mdi-plus"
                  @click="openDialog()"
                >
                  Add Official Visit
                </v-btn>
              </div>
              <!-- DESKTOP -->
              <v-responsive class="hidden-md-and-down">
                <v-data-table :headers="headers" :items="formattedOVs" class="mt-4">
                  <template #item.ovDate="{ item }">
                    {{ item.displayDate }}
                  </template>
                  <template #item.actions="{ item }">
                    <v-btn class="me-2" icon="mdi-pencil" size="small" @click="editOV(item)" />
                    <v-btn
                      class="me-2"
                      icon="mdi-content-copy"
                      size="small"
                      color="blue"
                      variant="elevated"
                      title="Copy OV"
                      @click="copyOV(item)"
                    />
                    <v-btn
                      class="me-2"
                      icon="mdi-account-group"
                      size="small"
                      color="green"
                      variant="elevated"
                      title="Procession"
                      @click="goToOfficers(item)"
                    />
                    <v-btn
                      class="me-2"
                      icon="mdi-seat"
                      size="small"
                      color="secondary"
                      variant="elevated"
                      title="Reservations"
                      @click="$router.push(`/ov/${item.id}.reservations`)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      color="red"
                      variant="elevated"
                      title="Delete OV"
                      @click="confirmOVDeletion(item)"
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
                        <v-col cols="12">
                          <v-text-field
                            v-model="item.name"
                            label="Date"
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
                      </v-row>
                      <v-row dense align="center" justify="end" class="mt-2">
                        <v-btn
                          icon="mdi-pencil"
                          size="small"
                          variant="text"
                          title="Edit OV"
                          class="me-2"
                          @click="editOV(item)"
                        />

                        <v-btn
                          icon="mdi-content-copy"
                          size="small"
                          color="blue"
                          variant="elevated"
                          title="Copy OV"
                          class="me-2"
                          @click="copyOV(item)"
                        />

                        <v-btn
                          icon="mdi-account-group"
                          size="small"
                          color="green"
                          variant="elevated"
                          title="Procession"
                          class="me-2"
                          @click="goToOfficers(item)"
                        />

                        <v-btn
                          class="me-2"
                          icon="mdi-seat"
                          size="small"
                          color="secondary"
                          variant="elevated"
                          title="Reservations"
                          @click="$router.push(`/ov/${item.id}.reservations`)"
                        />

                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          color="red"
                          variant="elevated"
                          title="Delete OV"
                          @click="confirmOVDeletion(item)"
                        />
                      </v-row>
                    </v-card>
                  </v-col> </v-row
              ></v-responsive>
              <!-- Bottom Actions -->
              <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2 no-print">
                <v-btn
                  color="green"
                  class="me-sm-2 mb-2 mb-sm-0 w-100 w-sm-auto"
                  prepend-icon="mdi-plus"
                  @click="openDialog()"
                >
                  Add Official Visit
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>{{ editedOV.id ? 'Edit OV' : 'Add OV' }}</v-card-title>
        <v-card-text v-show="!editedOV.id">
          Either select from the master list
          <v-autocomplete
            v-model="selectedMasterOvId"
            class="hidden-sm-and-down"
            :items="ovSelectionList"
            density="compact"
            clearable
            :placeholder="`${masonicYear} Official Visit`"
          />
          <v-select
            v-model="selectedMasterOvId"
            class="hidden-md-and-up"
            :items="ovSelectionList"
            density="compact"
            clearable
            :placeholder="`${masonicYear} Official Visit`"
          />
        </v-card-text>
        <v-card-text v-if="!selectedMasterOvId">
          <span v-if="!editedOV.id">OR enter the details yourself</span>
          <v-text-field v-model="editedOV.name" label="Name" />
          <v-text-field v-model="editedOV.ovDate" label="Date" type="date" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveOV">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Official Visit"
      :message="`Are you sure you want to delete
    '${ovToDelete?.name}'?`"
      color="red"
      @confirm="deleteOV()"
    />
  </v-app>
</template>

<script setup lang="ts">
import type { OV, OVMaster, ActiveOfficer, VIP, Officer } from '@prisma/client';
import { useAuthStore } from '~/stores/auth';

const makeToast = useToast();
const logger = useLogger('home');

const _positionsRes = await $fetch('/api/ov/positions');
type Position = (typeof _positionsRes)[number];

const showDeleteConfirm = ref(false);
const ovToDelete = ref<Partial<OV | null>>(null);
const activeOfficers = ref<ActiveOfficer[]>([]);

const authStore = useAuthStore();
const { theme, toggleTheme } = useSetTheme();

const loading = ref(true);

function formatDate(dateStr: string | Date) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

const formattedOVs = computed(() => {
  return ovs.value.map((ov) => ({
    ...ov,
    displayDate: formatDate(ov.ovDate),
  }));
});

const { masonicYear } = useMasonicYear();
const selectedMasterOvId = ref<number | null>(null);
const ovs = ref<OV[]>([]);
const ovMasters = ref<OVMaster[]>([]);
const dialog = ref(false);
type EditedOV = { id?: number; name?: string; ovDate?: string };
const editedOV = ref<EditedOV>({});
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Date', key: 'ovDate' },
  { title: 'Actions', key: 'actions', sortable: false },
];

async function loadOVs() {
  ovs.value = await $fetch<OV[]>(`/api/ov?userId=${authStore.user?.id}`);
  ovMasters.value = await $fetch<OVMaster[]>(`/api/ov-master?year=${masonicYear}`);
  loading.value = false;
}

async function loadActiveOfficers() {
  activeOfficers.value = await $fetch<ActiveOfficer[]>(`/api/active-officers?year=${masonicYear}`);
}

const ovSelectionList = computed(() => {
  return ovMasters.value.map((ov) => {
    return {
      value: ov.id,
      title: `${ov.number}: ${ov.lodgeName} ${ov.lodgeName.toLowerCase().indexOf('lodge') < 0 ? 'Lodge' : ''} No. ${ov.lodgeNumber.replace('L', '')} on ${formatDate(ov.date)}`,
    };
  });
});

function logOff() {
  authStore.user = null;
  navigateTo('/');
}

function openDialog() {
  editedOV.value = {};
  dialog.value = true;
}

function formatForDateInput(date: Date | string | null | undefined): string {
  if (!date) return '';

  // Convert string to Date if necessary
  const d = typeof date === 'string' ? new Date(date) : date;

  // Ensure valid date
  if (isNaN(d.getTime())) return '';

  // Return YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function editOV(item: OV) {
  selectedMasterOvId.value = null;
  const ovDate = formatForDateInput(item.ovDate);
  editedOV.value = {
    ...item,
    ovDate,
  };
  dialog.value = true;
}

async function copyOV(item: OV) {
  if (!item.id) return;

  loading.value = true;
  try {
    await $fetch(`/api/ov/${item.id}/copy`, { method: 'POST' });
    await loadOVs();
  } catch (err) {
    logger.error('Failed to copy OV:', err);
    alert('An error occurred while copying this OV.');
  } finally {
    loading.value = false;
  }
}

const selectedMasterOV = computed(() =>
  ovMasters.value.find((ov) => ov.id === selectedMasterOvId.value)
);

const selectedOVName = computed(() => {
  if (!selectedMasterOV.value) {
    return '';
  }
  return `${selectedMasterOV.value.lodgeName.trim()}${selectedMasterOV.value.lodgeName.toLowerCase().indexOf('lodge') < 0 ? ' Lodge ' : ' '}No. ${selectedMasterOV.value.lodgeNumber.replace('L', '')}`;
});

const addVIP = async (ovId: number, vipName: string) => {
  const vip = await $fetch<VIP>(`/api/vip/${masonicYear}/${vipName}`);
  return {
    id: 0,
    name: vipName,
    rank: vip.provincialRank,
    provOfficerYear: null,
    grandOfficer: ['SGW', 'JGW'].includes(vip.provincialRank) ? false : true,
    grandOfficerYear: null,
    grandActive: false,
    grandRank: null,
    active: true,
    position: 'vip',
    ovId,
  };
};

const addDC = async (ovId: number, name: string) => {
  const dc = activeOfficers.value.find((ao) => {
    const compareName = `${ao.familiarName ? ao.familiarName : ao.givenName} ${ao.familyName}`;
    return compareName.toUpperCase() === name.toUpperCase();
  });
  if (!dc) {
    return {
      id: 0,
      name,
      rank: null,
      provOfficerYear: null,
      grandOfficer: false,
      grandOfficerYear: null,
      grandActive: false,
      grandRank: null,
      active: true,
      position: 'head_of_south',
      ovId,
    };
  }
  return {
    id: 0,
    name,
    rank: dc.provincialRank.replace('Prov', '').toUpperCase(),
    provOfficerYear: null,
    grandOfficer: dc.provincialRank.toUpperCase() === 'PROVGDC',
    grandOfficerYear: null,
    grandActive: false,
    grandRank: null,
    active: true,
    position: 'head_of_south',
    ovId,
  };
};

const addOfficer = async (
  ovId: number,
  officers: Officer[],
  officerNo: number,
  position: Position
) => {
  const activeOfficer = activeOfficers.value.find((ao) => ao.number === officerNo) as ActiveOfficer;
  const firstName = activeOfficer.familiarName ?? activeOfficer.givenName.split(' ')[0];
  officers.push({
    id: 0,
    name: `${firstName} ${activeOfficer.familyName}`,
    rank: activeOfficer.provincialRank.replace('Prov', '').toUpperCase(),
    provOfficerYear: null,
    grandOfficer: false,
    grandOfficerYear: null,
    grandActive: false,
    grandRank: null,
    active: true,
    position,
    excludeFromProcession: false,
    ovId,
  });
};

async function saveOV() {
  if (editedOV.value.id) {
    await $fetch(`/api/ov/${editedOV.value.id}`, {
      method: 'PUT',
      body: { ...editedOV.value, userId: authStore.user?.id },
    });
  } else {
    // Depends on whether they selected a master OV or entered stuff manually
    if (selectedMasterOvId.value) {
      if (selectedMasterOV.value) {
        const name = selectedOVName.value.trim();
        const existing = ovs.value.find((ov) => ov.name.trim() === name);
        if (existing) {
          makeToast(`An official visit for "${selectedOVName.value}" already exists`, 'error');
          return;
        }
        editedOV.value = {
          name,
          ovDate: formatForDateInput(selectedMasterOV.value.date),
        };
      }
    }

    try {
      const updatedOV = await $fetch('/api/ov', {
        method: 'POST',
        body: { ...editedOV.value, userId: authStore.user?.id },
      });

      // Populate the officers if selected from the master list
      if (selectedMasterOV.value) {
        const officers: Officer[] = [];
        // Always do the VIP first so we can guarantee he is at the top
        const vip = await addVIP(updatedOV.id, selectedMasterOV.value.vip);
        await $fetch(`/api/officers?ovId=${updatedOV.id}`, {
          method: 'PUT',
          body: [vip],
        });
        // DC second
        const dc = await addDC(updatedOV.id, selectedMasterOV.value.dc);
        await $fetch(`/api/officers?ovId=${updatedOV.id}`, {
          method: 'PUT',
          body: [dc],
        });
        // Now the rest
        if (selectedMasterOV.value.sword) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.sword, 'sword_bearer');
        }
        if (selectedMasterOV.value.standard) {
          await addOfficer(
            updatedOV.id,
            officers,
            selectedMasterOV.value.standard,
            'standard_bearer'
          );
        }
        if (selectedMasterOV.value.steward) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.steward, 'automatic');
        }
        if (selectedMasterOV.value.officer1) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.officer1, 'automatic');
        }
        if (selectedMasterOV.value.officer2) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.officer2, 'automatic');
        }
        if (selectedMasterOV.value.officer3) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.officer3, 'automatic');
        }
        if (selectedMasterOV.value.officer4) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.officer4, 'automatic');
        }
        if (selectedMasterOV.value.officer5) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.officer5, 'automatic');
        }
        if (selectedMasterOV.value.officer6) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.officer6, 'automatic');
        }
        if (selectedMasterOV.value.officer7) {
          await addOfficer(updatedOV.id, officers, selectedMasterOV.value.officer7, 'automatic');
        }
        await $fetch(`/api/officers?ovId=${updatedOV.id}`, {
          method: 'PUT',
          body: officers,
        });
      }
    } catch (err) {
      makeToast((err as Error).message, 'error');
    }
  }
  dialog.value = false;
  selectedMasterOvId.value = null;
  await loadOVs();
}

function confirmOVDeletion(item: Partial<OV>) {
  ovToDelete.value = item;
  showDeleteConfirm.value = true;
}

async function deleteOV() {
  await $fetch(`/api/ov/${ovToDelete.value?.id}`, { method: 'DELETE' });
  await loadOVs();
}

function goToOfficers(item: OV) {
  navigateTo(`/ov/${item.id}`);
}

onMounted(async () => {
  await loadActiveOfficers();
  await loadOVs();
});
</script>
