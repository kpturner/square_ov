<template>
  <v-app>
    <v-app-bar
      flat
      class="mb-4"
    >
      <v-btn
        color="grey"
        variant="text"
        small
        @click="logOff"
      >
        Log Off
      </v-btn>
      <v-spacer />
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="toggleTheme"
        variant="text"
      />
    </v-app-bar>
    <v-main>
      <v-container>
        <v-overlay
          v-model="loading"
          absolute
          class="d-flex align-center justify-center"
        >
          <v-progress-circular
            indeterminate
            size="64"
            color="primary"
          />
        </v-overlay>
        <v-row>
          <v-col>
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <span class="text-h5">Official Visits</span>
                </div>

                <div class="d-flex align-center gap-2">
                  <v-btn
                    color="green"
                    @click="openDialog()"
                  >
                    Add OV
                  </v-btn>
                </div>
              </v-card-title>

              <v-data-table
                :headers="headers"
                :items="formattedOVs"
                class="mt-4"
              >
                <template #item.ovDate="{ item }">
                  {{ item.displayDate }}
                </template>
                <template #item.actions="{ item }">
                  <v-btn
                    class="me-2"
                    icon="mdi-pencil"
                    size="small"
                    @click="editOV(item)"
                  />
                  <v-btn
                    class="me-2"
                    icon="mdi-delete"
                    size="small"
                    @click="deleteOV(item)"
                  />
                  <v-btn
                    icon="mdi-account-group"
                    size="small"
                    color="green"
                    variant="elevated"
                    title="Procession"
                    @click="goToOfficers(item)"
                  />
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <v-dialog
          v-model="dialog"
          max-width="400"
        >
          <v-card>
            <v-card-title>{{ editedOV.id ? 'Edit OV' : 'Add OV' }}</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="editedOV.name"
                label="Name"
              />
              <v-text-field
                v-model="editedOV.ovDate"
                label="Date"
                type="date"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                variant="text"
                @click="dialog = false"
                >Cancel</v-btn
              >
              <v-btn
                color="primary"
                @click="saveOV"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import type { OV } from '@prisma/client';
import { useAuthStore } from '~/stores/auth';

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

const ovs = ref<OV[]>([]);
const dialog = ref(false);
const editedOV = ref<Partial<OV>>({});
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Date', key: 'ovDate' },
  { title: 'Actions', key: 'actions', sortable: false },
];

async function fetchOVs() {
  ovs.value = await $fetch<OV[]>(`/api/ov?userId=${authStore.user?.id}`);
  loading.value = false;
}

function logOff() {
  authStore.user = null;
  navigateTo('/');
}

function openDialog() {
  editedOV.value = {};
  dialog.value = true;
}

function editOV(item: OV) {
  editedOV.value = { ...item, ovDate: item.ovDate?.toISOString?.()?.substr(0, 10) || item.ovDate.split('T')[0] };
  dialog.value = true;
}

async function saveOV() {
  if (editedOV.value.id) {
    await $fetch(`/api/ov/${editedOV.value.id}`, {
      method: 'PUT',
      body: { ...editedOV.value, userId: authStore.user?.id },
    });
  } else {
    await $fetch('/api/ov', { method: 'POST', body: { ...editedOV.value, userId: authStore.user?.id } });
  }
  dialog.value = false;
  await fetchOVs();
}

async function deleteOV(item: Partial<OV>) {
  if (confirm(`Delete ${item.name} Official Visit?`)) {
    await $fetch(`/api/ov/${item.id}`, { method: 'DELETE' });
    await fetchOVs();
  }
}

function goToOfficers(item: OV) {
  navigateTo(`/ov/${item.id}`);
}

onMounted(fetchOVs);
</script>
