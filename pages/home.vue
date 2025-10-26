<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            <span class="text-h5">Official Visits</span>
            <v-spacer />
            <v-btn
              color="primary"
              @click="openDialog()"
              >Add OV</v-btn
            >
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="ovs"
            class="mt-4"
          >
            <template #item.ovDate="{ item }">
              {{ formatDate(item.ovDate) }}
            </template>
            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                @click="editOV(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                @click="deleteOV(item)"
              />
              <v-btn
                icon="mdi-account-group"
                size="small"
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { OV } from '@prisma/client';
import { useAuthStore } from '~/stores/auth';
import type { AuthUser } from '~/types/user';

const authStore = useAuthStore();

function formatDate(dateStr: string | Date) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

const ovs = ref<OV[]>([]);
const dialog = ref(false);
const editedOV = ref<Partial<OV>>({});
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Date', key: 'ovDate' },
  { title: 'Actions', key: 'actions', sortable: false },
];

async function fetchOVs() {
  ovs.value = await $fetch<OV[]>('/api/ov');
}

function openDialog() {
  editedOV.value = {};
  dialog.value = true;
}

function editOV(item: OV) {
  editedOV.value = { ...item };
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

async function deleteOV(item: OV) {
  await $fetch(`/api/ov/${item.id}`, { method: 'DELETE' });
  await fetchOVs();
}

function goToOfficers(item: OV) {
  navigateTo(`/ov/${item.id}`);
}

onMounted(fetchOVs);
</script>
