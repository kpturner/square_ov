<template>
  <v-container fluid class="pa-4">
    <client-only>
      <v-overlay v-model="loading" absolute class="d-flex align-center justify-center">
        <v-progress-circular indeterminate size="64" color="primary" />
      </v-overlay>
    </client-only>
    <v-card class="no-print">
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
          <span v-if="officialVisit" class="text-subtitle-1 text-lg-h6"
            >Officers for OV to {{ officialVisit?.name || '...' }}</span
          >
          <v-row v-if="officialVisit" class="mb-2" dense>
            <v-col cols="12" sm="auto">
              <v-btn
                color="secondary"
                prepend-icon="mdi-seat"
                class="w-100"
                small
                @click="reservations"
              >
                Seat reservations
              </v-btn>
            </v-col>
            <v-col cols="12" sm="auto">
              <v-btn
                v-if="officialVisit"
                color="info"
                prepend-icon="mdi-file"
                class="w-100"
                small
                @click="attendance"
              >
                Attendance report
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-card-title>

      <v-container fluid class="pa-4">
        <!-- Top Actions -->
        <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2">
          <v-btn
            v-if="!hasVIP"
            color="red"
            class="me-sm-2 mb-2 mb-sm-0 w-100 w-sm-auto"
            prepend-icon="mdi-plus"
            @click="addVIPDialog = true"
          >
            Add VIP
          </v-btn>

          <v-btn
            color="success"
            class="me-sm-2 mb-2 mb-sm-0 w-100 w-sm-auto"
            prepend-icon="mdi-plus"
            @click="addOfficerDialog = true"
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

        <Officers :officers @delete-officer="deleteOfficer" @save-changes="saveAll" />

        <!-- Bottom Actions -->
        <div v-if="!loading" class="d-flex flex-column flex-sm-row justify-end mb-2">
          <v-btn
            v-if="!hasVIP"
            color="red"
            class="me-sm-2 mb-2 mb-sm-0 w-100 w-sm-auto"
            prepend-icon="mdi-plus"
            @click="addVIPDialog = true"
          >
            Add VIP
          </v-btn>

          <v-btn
            color="success"
            class="me-sm-2 mb-2 mb-sm-0 w-100 w-sm-auto"
            prepend-icon="mdi-plus"
            @click="addOfficerDialog = true"
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

    <v-card>
      <div class="no-print d-flex align-center">
        <v-checkbox
          v-model="alignActiveWardens"
          label="Align active wardens?"
          class="no-print"
          dense
          hide-details
        />
        <v-checkbox
          v-model="activeDCsFront"
          class="no-print ms-3"
          label="Active DCs at front?"
          dense
          hide-details
        />
        <v-checkbox
          v-if="activeDCsFront"
          v-model="includeGrandOfficers"
          class="no-print ms-3"
          label="GO DCs at front also?"
          dense
          hide-details
        />
      </div>
    </v-card>

    <Procession
      v-if="!loading && officialVisit"
      :officers="officers.filter((o) => !o.excludeFromProcession && o.attending)"
      :official-visit
    />

    <v-card v-if="!loading" class="no-print">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="w-100 d-flex flex-column" style="align-items: flex-start">
          <v-row v-if="officialVisit" class="mb-2" dense>
            <v-col cols="12" sm="auto">
              <v-btn
                color="secondary"
                prepend-icon="mdi-seat"
                class="w-100"
                small
                @click="reservations"
              >
                Seat reservations
              </v-btn>
            </v-col>
            <v-col cols="12" sm="auto">
              <v-btn
                v-if="officialVisit"
                color="info"
                prepend-icon="mdi-file"
                class="w-100"
                small
                @click="attendance"
              >
                Attendance report
              </v-btn>
            </v-col>
          </v-row>
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

    <v-dialog v-model="addVIPDialog" max-width="400">
      <v-card>
        <v-card-title>Add VIP</v-card-title>
        <v-card-text>
          Either select a VIP from the master list or leave unselected to add the VIP details
          yourself
          <v-autocomplete
            v-model="selectedVIPId"
            :items="activeVIPSelectionList"
            density="compact"
            clearable
            :placeholder="`${masonicYear} VIPs`"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="addVIPDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addVIP">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addOfficerDialog" max-width="400">
      <v-card>
        <v-card-title>Add Officer</v-card-title>
        <v-card-text>
          Either select an officer from the master list or leave unselected to add the officer
          details yourself
          <v-autocomplete
            v-model="selectedActiveOfficerId"
            :items="activeOfficerSelectionList"
            density="compact"
            clearable
            :placeholder="`${masonicYear} Active Officers`"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="addOfficerDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addOfficer">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Officer"
      :message="`Are you sure you want to delete
    '${officerToDelete?.name}'?`"
      color="red"
      @confirm="confirmedDeletion"
    />
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import type { OV, ActiveOfficer, Officer, VIP } from '@prisma/client';

const logger = useLogger('officers');

const makeToast = useToast();

const showDeleteConfirm = ref(false);
const officerToDelete = ref<Officer | null>(null);
const route = useRoute();
const router = useRouter();
const officers = ref<Officer[]>([]);
const officialVisit = ref<OV | null>(null);
const addOfficerDialog = ref(false);
const addVIPDialog = ref(false);
const { masonicYear } = useMasonicYear();
const activeOfficers = ref<ActiveOfficer[]>([]);
const selectedActiveOfficerId = ref(null);
const vips = ref<VIP[]>([]);
const selectedVIPId = ref(null);

const activeDCsFront = ref(false);
const includeGrandOfficers = ref(false);
const alignActiveWardens = ref(true);

const loading = ref(true);

const _positionsRes = await $fetch('/api/ov/positions');
type Position = (typeof _positionsRes)[number];

onMounted(async () => {
  await loadVIPs();
  await loadActiveOfficers();
  await loadOfficers();
});

const activeVIPSelectionList = computed(() => {
  return vips.value.map((vip) => {
    return {
      value: vip.id,
      title: `${vip.provincialRank} - ${vip.name}`,
    };
  });
});

const activeOfficerSelectionList = computed(() => {
  return activeOfficers.value.map((ao) => {
    return {
      value: ao.id,
      title: `${ao.number}: ${ao.givenName} ${ao.familyName}`,
    };
  });
});

const hasVIP = computed(() => officers.value.find((o) => o.position === 'vip'));

async function loadActiveOfficers() {
  activeOfficers.value = await $fetch<ActiveOfficer[]>(`/api/active-officers?year=${masonicYear}`);
}

async function loadVIPs() {
  vips.value = await $fetch<VIP[]>(`/api/vip?year=${masonicYear}`);
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
  alignActiveWardens.value = officialVisit.value?.alignWardens ?? false;
  activeDCsFront.value = officialVisit.value?.activeDCsFront ?? false;
  includeGrandOfficers.value = officialVisit.value?.includeGrandOfficers ?? false;
  loading.value = false;
}

async function addOfficer() {
  addOfficerDialog.value = false;
  if (selectedActiveOfficerId.value) {
    const ao = activeOfficers.value.find(
      (ao) => ao.id === selectedActiveOfficerId.value
    ) as ActiveOfficer;
    selectedActiveOfficerId.value = null;
    const firstName = ao.familiarName ?? ao.givenName.split(' ')[0];
    const name = `${firstName} ${ao.familyName} (${ao.number})`;
    officers.value.push({
      id: 0,
      name,
      rank: ao.provincialRank.replace('Prov', '').toUpperCase(),
      provOfficerYear: null,
      grandOfficer: false,
      grandOfficerYear: null,
      grandActive: false,
      grandRank: null,
      active: true,
      position: 'automatic',
      excludeFromProcession: false,
      original: false,
      attending: true,
      ovId: Number(route.params.id),
    });
    makeToast(`${name} ${ao.provincialRank} added to list.`);
    await saveAll();
    return;
  }
  await saveAll();
  makeToast('Blank officer added to list. Please add and save their details.');
  addEmptyOfficer();
}

async function addVIP() {
  addVIPDialog.value = false;
  if (selectedVIPId.value) {
    const vip = vips.value.find((vip) => vip.id === selectedVIPId.value) as VIP;
    selectedVIPId.value = null;
    officers.value.push({
      id: 0,
      name: vip.name,
      rank: vip.provincialRank,
      provOfficerYear: null,
      grandOfficer: false,
      grandOfficerYear: null,
      grandActive: false,
      grandRank: null,
      active: true,
      position: 'vip',
      excludeFromProcession: false,
      original: true,
      attending: true,
      ovId: Number(route.params.id),
    });
    makeToast(`${vip.name} ${vip.provincialRank} added to list.`);
    await saveAll();
    return;
  }
  await saveAll();
  makeToast('Blank VIP added to list. Please add and save their details.');
  addEmptyOfficer('vip');
}

function addEmptyOfficer(position?: Position) {
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
    position: position ?? 'automatic',
    excludeFromProcession: false,
    original: false,
    attending: true,
    ovId: Number(route.params.id),
  });
}

async function deleteOfficer(officer: Officer) {
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

async function attendance() {
  await saveAll();
  router.push(`/ov/${officialVisit.value?.id}.attendance`);
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

let timeout: ReturnType<typeof setTimeout>;
const saveBooleans = () => {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    try {
      const body = {
        ...officialVisit.value,
        alignWardens: alignActiveWardens.value,
        activeDCsFront: activeDCsFront.value,
        includeGrandOfficers: includeGrandOfficers.value,
      };
      officialVisit.value = await $fetch<OV>(`/api/ov/${officialVisit.value?.id}.put`, {
        method: 'PUT',
        body,
      });
    } catch (err) {
      logger.error('Failed to update booleans:', err);
    }
  }, 400);
};

watch([alignActiveWardens, activeDCsFront, includeGrandOfficers], saveBooleans);
</script>

<style lang="scss" scoped></style>
