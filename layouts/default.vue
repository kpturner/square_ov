<template>
  <v-app>
    <v-app-bar flat class="mb-4">
      <v-app-bar-title>
        Square OV
        <client-only>
          <span v-if="user?.name"> - {{ user.name }}</span></client-only
        >
      </v-app-bar-title>
      <v-spacer />
      <v-btn
        v-if="$route.path !== '/'"
        color="grey"
        variant="text"
        small
        class="no-print"
        @click="logOff"
      >
        Log Off
      </v-btn>
      <v-btn
        v-if="$route.path !== '/'"
        icon="mdi-account"
        variant="text"
        class="no-print"
        @click="profileDialog = true"
      />
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        class="no-print"
        @click="toggleTheme"
      />
    </v-app-bar>

    <v-main>
      <!-- This is where the page content will appear -->
      <slot />
    </v-main>
    <client-only>
      <v-dialog v-if="user" v-model="profileDialog" max-width="400">
        <v-card>
          <v-card-title>Profile</v-card-title>
          <v-text-field v-model="user.name" label="Name" type="name" class="mt-4" outlined />

          <v-text-field v-model="user.email" label="Email" type="email" class="mt-4" outlined />

          <v-text-field v-model="password" label="New password" type="password" outlined />
          <v-alert v-if="error" type="error" class="mt-4" density="compact">
            {{ error }}
          </v-alert>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="profileDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveProfile">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </client-only>
  </v-app>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import type { AuthUser } from '~/types/user';
import type { User } from '@prisma/client';

const route = useRoute();
const authStore = useAuthStore();
const profileDialog = ref(false);
const user = ref<AuthUser | null>(null);
const password = ref<string | null>(null);
const error = ref('');

const { theme, toggleTheme } = useSetTheme();
function logOff() {
  authStore.user = null;
  navigateTo('/');
}

onMounted(() => {
  if (!authStore.user && route.path !== '/') {
    navigateTo('/');
  }
});

watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      user.value = { ...newUser };
    } else {
      user.value = null;
    }
  },
  { immediate: true, deep: true }
);

async function saveProfile() {
  if (!user.value) {
    return;
  }
  error.value = '';
  try {
    const body: Partial<User> = { ...user.value };
    if (password.value) {
      body.password = password.value;
    }
    const res = await $fetch<{ success: boolean; authUser: AuthUser }>(
      `/api/user/${user.value.id}`,
      {
        method: 'PUT',
        body,
      }
    );
    if (res.success) {
      authStore.setUser(res.authUser);
    }
    profileDialog.value = false;
  } catch (err) {
    error.value = (err as { data: { statusMessage: string } })?.data.statusMessage || 'Error';
  }
}
</script>
