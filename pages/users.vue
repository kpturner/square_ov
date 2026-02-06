<template>
  <v-container fluid>
    <client-only>
      <v-overlay v-model="loading" absolute class="d-flex align-center justify-center">
        <v-progress-circular indeterminate size="64" color="primary" />
      </v-overlay>
    </client-only>

    <v-row>
      <v-col>
        <v-card>
          <v-btn
            color="primary"
            class="w-100 w-sm-auto"
            prepend-icon="mdi-home"
            @click="$router.push('/home')"
          >
            Home
          </v-btn>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="w-100 d-flex flex-column align-start">
              <div class="mb-2 w-100 d-flex justify-space-between align-start"></div>
              <span class="text-h5">Users</span>
            </div>
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
              @click:prepend-inner="loadUsers"
              @keyup.enter="loadUsers"
            />
          </div>

          <v-data-table :headers="headers" :items="users" class="mt-4">
            <template #item.actions="{ item }">
              <v-btn class="me-2" icon="mdi-pencil" size="small" @click="editUser(item)" />
              <v-btn
                icon="mdi-account-switch"
                size="small"
                color="warning"
                title="Impersonate"
                @click="impersonateUser(item)"
              />
            </template>
          </v-data-table>

          <!-- Bottom Actions -->
          <div
            v-if="!loading"
            class="d-flex flex-column flex-sm-row justify-end mb-2 no-print"
          ></div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>Edit User</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedUser.name" autofocus label="Name" />
          <v-text-field v-model="editedUser.email" label="Email" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <DialogConfirm
      v-model="showImpersonaterDialog"
      title="Impersonate User?"
      :message="`Are you sure you want to impersonate
    '${impersonated?.name}'?`"
      color="red"
      @confirm="impersonate"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { User } from '@prisma/client';
import { useAuthStore } from '~/stores/auth';
import type { ImpersonateResponse } from '~/types';

const makeToast = useToast();
const authStore = useAuthStore();
const isAdmin = useIsAdmin();

const search = ref('');

const loading = ref(true);

const users = ref<User[]>([]);
const showImpersonaterDialog = ref(false);
const impersonated = ref<User | null>(null);
const dialog = ref(false);
const editedUser = ref<Partial<User>>({});
const headers = [
  { title: 'Name', key: 'name' },
  { title: '', key: 'actions', sortable: false },
];

async function loadUsers() {
  users.value = await useApi()<User[]>('/api/user');
  if (search.value && search.value.trim().length > 0) {
    const searchLower = search.value.trim().toLowerCase();
    users.value = users.value.filter((user) => user.name.toLowerCase().includes(searchLower));
  }
  loading.value = false;
}

function editUser(item: User) {
  editedUser.value = {
    ...item,
  };
  dialog.value = true;
}

async function impersonateUser(user: User) {
  impersonated.value = user;
  showImpersonaterDialog.value = true;
}

async function impersonate() {
  const user = impersonated.value as User;
  try {
    const res = await useApi()<ImpersonateResponse>('/api/admin/impersonate', {
      method: 'POST',
      body: { userId: user.id },
    });
    showImpersonaterDialog.value = false;
    if (res.success) {
      authStore.setUser(res.authUser);
      navigateTo('/home');
    } else {
      makeToast('Failed to impersonate user', 'error');
    }
  } catch (err) {
    makeToast('Failed to impersonate user', 'error');
    logger.error(err);
  } finally {
    loading.value = false;
  }
}

async function saveUser() {
  if (editedUser.value?.id) {
    await useApi()(`/api/user/${editedUser.value.id}`, {
      method: 'PUT',
      body: { ...editedUser.value },
    });
  }
  dialog.value = false;
  await loadUsers();
}

onMounted(async () => {
  if (!isAdmin.value) {
    navigateTo('/home');
  }
  await loadUsers();
});
</script>
