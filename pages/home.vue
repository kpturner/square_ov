<template>
  <v-container fluid class="pa-4">
    <client-only>
      <v-overlay v-model="loading" absolute class="d-flex align-center justify-center">
        <v-progress-circular indeterminate size="64" color="primary" />
      </v-overlay>
    </client-only>

    <v-row>
      <v-col>
        <v-card>
          <div class="d-flex gap-2">
            <v-btn
              color="red-darken-3"
              prepend-icon="mdi-import"
              small
              title="Here be dragons!!"
              @click="$router.push('/admin/import')"
            >
              Imports
            </v-btn>

            <v-btn
              v-if="isAdmin || isImpersonating"
              color="secondary"
              class="ms-2"
              prepend-icon="mdi-account-group"
              @click="goToUsers"
              >Users
            </v-btn>
          </div>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="w-100 d-flex flex-column align-start">
              <div class="mb-2 w-100 d-flex justify-space-between align-start"></div>
              <span class="text-h5">My Official Visits</span>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-clipboard-list"
              small
              title="Master OV list"
              @click="$router.push('/ov/list')"
            >
              Master OV list
            </v-btn>
          </v-card-title>

          <!-- Top Actions -->
          <div
            v-if="!loading"
            class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center ga-2 mb-2 no-print"
          >
            <!-- Search field on the left -->
            <v-text-field
              v-model="search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              hide-details
              class="mb-2 mb-sm-0 w-100 w-sm-auto"
              @click:prepend-inner="loadOVs"
              @keyup.enter="loadOVs"
            />

            <!-- Add Official Visit button on the right -->
            <v-btn
              color="success"
              class="w-100 w-sm-auto"
              prepend-icon="mdi-plus"
              @click="openDialog()"
            >
              Add Official Visit
            </v-btn>
          </div>

          <v-data-table :headers="headers" :items="ovs" class="mt-4">
            <template #item.ovDate="{ item }">
              {{ formatDate(item.ovDate) }}
            </template>
            <template #item.actions="{ item }">
              <!-- Inline buttons for md+ screens -->
              <div class="d-none d-md-flex align-center">
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
                  color="success"
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
                  class="me-2"
                  icon="mdi-file"
                  size="small"
                  color="info"
                  variant="elevated"
                  title="Attendance"
                  @click="$router.push(`/ov/${item.id}.attendance`)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="red"
                  variant="elevated"
                  title="Delete OV"
                  @click="confirmOVDeletion(item)"
                />
              </div>
              <!-- Three-dot menu for xs and sm screens -->
              <div class="d-flex d-md-none">
                <v-menu
                  activator="parent"
                  offset-y
                  transition="scale-transition"
                  content-class="context-menu-content bg-surface-light dark:bg-surface-dark rounded-pill"
                >
                  <template #activator="{ props }">
                    <v-btn icon size="small" v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <div
                    class="d-flex align-center px-3 py-1 rounded-pill border border-2"
                    :class="
                      isDark ? 'border-white bg-surface-dark' : 'border-gray-500 bg-surface-light'
                    "
                  >
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
                      color="success"
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
                      class="me-2"
                      icon="mdi-file"
                      size="small"
                      color="info"
                      variant="elevated"
                      title="Attendance"
                      @click="$router.push(`/ov/${item.id}.attendance`)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      color="red"
                      variant="elevated"
                      title="Delete OV"
                      @click="confirmOVDeletion(item)"
                    />
                  </div>
                </v-menu>
              </div>
            </template>
          </v-data-table>

          <!-- Bottom Actions -->
          <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2 no-print">
            <v-btn
              color="success"
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
    <DialogConfirm
      v-model="showDeleteConfirm"
      title="Delete Official Visit"
      :message="`Are you sure you want to delete
    '${ovToDelete?.name}'?`"
      color="red"
      @confirm="deleteOV()"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { OV, OVMaster, ActiveOfficer, VIP, Officer } from '@prisma/client';

const makeToast = useToast();
const logger = useLogger('home');

const _positionsRes = await $fetch('/api/ov/positions');
type Position = (typeof _positionsRes)[number];

const showDeleteConfirm = ref(false);
const ovToDelete = ref<Partial<OV | null>>(null);
const activeOfficers = ref<ActiveOfficer[]>([]);
const search = ref('');
const { isDark } = useIsDark();
const isAdmin = useIsAdmin();
const isImpersonating = ref(false);

const authStore = useAuthStore();

const loading = ref(true);

function formatDate(dateStr: string | Date) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

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
  { title: '', key: 'actions', sortable: false },
];

function goToUsers() {
  navigateTo('/users');
}

async function loadOVs() {
  ovs.value = await useApi()<OV[]>(`/api/ov?userId=${authStore.user?.id}`);
  ovMasters.value = await useApi()<OVMaster[]>(`/api/ov-master?year=${masonicYear}`);
  if (search.value && search.value.trim().length > 0) {
    const searchLower = search.value.trim().toLowerCase();
    ovs.value = ovs.value.filter(
      (ov) =>
        ov.name.toLowerCase().includes(searchLower) ||
        formatDate(ov.ovDate).toLowerCase().includes(searchLower)
    );
  }
  loading.value = false;
}

async function loadActiveOfficers() {
  activeOfficers.value = await useApi()<ActiveOfficer[]>(
    `/api/active-officers?year=${masonicYear}`
  );
}

const ovSelectionList = computed(() => {
  return ovMasters.value.map((ov) => {
    return {
      value: ov.id,
      title: `${ov.number}: ${ov.lodgeName} ${ov.lodgeName.toLowerCase().indexOf('lodge') < 0 ? 'Lodge' : ''} No. ${ov.lodgeNumber.replace('L', '')} on ${formatDate(ov.date)}`,
    };
  });
});

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
    await useApi()(`/api/ov/${item.id}/copy`, { method: 'POST' });
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

const addVIP = async (ovId: number, vipName: string): Promise<Officer> => {
  const vip = await useApi()<VIP>(`/api/vip/${masonicYear}/${vipName}`);
  return {
    id: 0,
    name: vipName,
    rank: vip.provincialRank,
    email: vip.email,
    phone: vip.mobile ? vip.mobile : (vip.phone ?? null),
    provOfficerYear: null,
    grandOfficer: ['SGW', 'JGW'].includes(vip.provincialRank) ? false : true,
    grandOfficerYear: null,
    grandActive: false,
    grandRank: null,
    active: true,
    position: 'vip',
    original: true,
    attending: true,
    excludeFromProcession: null,
    ovId,
  };
};

const addDC = async (ovId: number, name: string): Promise<Officer> => {
  const dc = activeOfficers.value.find((ao) => {
    const compareName = `${ao.familiarName ? ao.familiarName : ao.givenName} ${ao.familyName}`;
    return compareName.toUpperCase() === name.toUpperCase();
  });
  if (!dc) {
    return {
      id: 0,
      name,
      rank: null,
      email: null,
      phone: null,
      provOfficerYear: null,
      grandOfficer: false,
      grandOfficerYear: null,
      grandActive: false,
      grandRank: null,
      active: true,
      position: 'head_of_south',
      original: true,
      attending: true,
      excludeFromProcession: null,
      ovId,
    };
  }
  return {
    id: 0,
    name: `${name} (${dc.number})`,
    rank: dc.provincialRank.replace('Prov', '').toUpperCase(),
    email: dc.primaryEmail,
    phone: dc.preferredPhoneNo,
    provOfficerYear: null,
    grandOfficer: dc.provincialRank.toUpperCase() === 'PROVGDC',
    grandOfficerYear: null,
    grandActive: false,
    grandRank: null,
    active: true,
    position: 'head_of_south',
    original: true,
    attending: true,
    excludeFromProcession: null,
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
  const suffix = `${activeOfficer.postNominals ? activeOfficer.postNominals : ''} (${activeOfficer.number})`;
  officers.push({
    id: 0,
    name: `${firstName} ${activeOfficer.familyName} ${suffix}`,
    rank: activeOfficer.provincialRank.replace('Prov', '').toUpperCase(),
    email: activeOfficer.primaryEmail,
    phone: activeOfficer.preferredPhoneNo,
    provOfficerYear: null,
    grandOfficer: false,
    grandOfficerYear: null,
    grandActive: false,
    grandRank: null,
    active: true,
    position,
    excludeFromProcession: null,
    original: true,
    attending: true,
    ovId,
  });
};

async function saveOV() {
  if (editedOV.value.id) {
    await useApi()(`/api/ov/${editedOV.value.id}`, {
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
      const updatedOV = await useApi()<OV>('/api/ov', {
        method: 'POST',
        body: { ...editedOV.value, userId: authStore.user?.id },
      });

      // Populate the officers if selected from the master list
      if (selectedMasterOV.value) {
        const officers: Officer[] = [];
        // Always do the VIP first so we can guarantee he is at the top
        const vip = await addVIP(updatedOV.id, selectedMasterOV.value.vip);
        await useApi()(`/api/officers?ovId=${updatedOV.id}`, {
          method: 'PUT',
          body: [vip],
        });
        // DC second
        const dc = await addDC(updatedOV.id, selectedMasterOV.value.dc);
        await useApi()(`/api/officers?ovId=${updatedOV.id}`, {
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
        await useApi()(`/api/officers?ovId=${updatedOV.id}`, {
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
  await useApi()(`/api/ov/${ovToDelete.value?.id}`, { method: 'DELETE' });
  await loadOVs();
}

function goToOfficers(item: OV) {
  navigateTo(`/ov/${item.id}`);
}

onMounted(async () => {
  await loadActiveOfficers();
  await loadOVs();
  isImpersonating.value = await useApi()('/api/impersonating');
});
</script>
