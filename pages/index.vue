<template>
  <v-app>
    <v-app-bar flat class="mb-4">
      <v-spacer />
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        @click="toggleTheme"
      />
    </v-app-bar>
    <v-main>
      <v-container class="d-flex align-center justify-center" style="height: 100vh">
        <v-form @keyup.enter="submit">
          <v-card width="400" class="pa-6">
            <v-card-title class="text-h5">{{
              mode === 'login' ? 'Login' : 'Create Account'
            }}</v-card-title>

            <v-text-field
              v-show="mode === 'register'"
              v-model="name"
              label="Name"
              type="name"
              class="mt-4"
              outlined
            />

            <v-text-field v-model="email" label="Email" type="email" class="mt-4" outlined />

            <v-text-field v-model="password" label="Password" type="password" outlined />

            <v-btn color="primary" class="mt-4" block @click="submit">
              {{ mode === 'login' ? 'Login' : 'Register' }}
            </v-btn>

            <v-btn variant="text" class="mt-2" block @click="toggleMode">
              {{
                mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'
              }}
            </v-btn>

            <v-alert v-if="error" type="error" class="mt-4" density="compact">
              {{ error }}
            </v-alert>
          </v-card>
        </v-form>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import type { AuthUser } from '~/types/user';

const authStore = useAuthStore();
const { theme, toggleTheme } = useSetTheme();

const name = ref('');
const email = ref('');
const password = ref('');
const mode = ref<'login' | 'register'>('login');
const error = ref('');
const router = useRouter();

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  error.value = '';
}

async function submit() {
  error.value = '';
  try {
    const res = await $fetch<{ success: boolean; authUser: AuthUser }>('/api/' + mode.value, {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value },
    });
    if (res.success) {
      authStore.setUser(res.authUser);
      router.push('/home');
    }
  } catch (err: unknown) {
    error.value = err?.data?.statusMessage || 'Error';
  }
}
</script>
