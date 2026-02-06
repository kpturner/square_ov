<template>
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
          :autofocus="mode === 'register'"
          outlined
        />

        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          :class="{ 'mt-4': mode === 'login' }"
          outlined
          :autofocus="mode === 'login'"
        />

        <v-text-field v-model="password" label="Password" type="password" outlined />

        <v-text-field
          v-if="mode === 'register'"
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          outlined
        />

        <v-text-field
          v-if="mode === 'register'"
          v-model="stripeCustomerId"
          label="Customer id (if known)"
          outlined
        />

        <v-btn color="primary" class="mt-4" block @click="submit">
          {{ mode === 'login' ? 'Login' : 'Register' }}
        </v-btn>

        <v-btn
          v-if="mode === 'login'"
          variant="text"
          class="mt-2"
          block
          @click="showResetDialog = true"
        >
          Forgot Password?
        </v-btn>

        <v-btn variant="text" class="mt-2" block @click="toggleMode">
          {{ mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login' }}
        </v-btn>

        <v-alert v-if="error" type="error" class="mt-4" density="compact">
          {{ error }}
        </v-alert>
        <p class="text-caption text-medium-emphasis mt-2 text-center">
          By continuing, you agree to our
          <a href="/privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.
        </p>
      </v-card>
    </v-form>

    <!-- Forgot Password Dialog -->
    <v-dialog v-model="showResetDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Reset Password</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="resetEmail"
            label="Enter your email"
            type="email"
            outlined
            @keyup.enter="submitReset"
          />
          <v-alert v-if="resetError" type="error" dense>{{ resetError }}</v-alert>
          <v-alert type="warning" dense class="mt-2">
            <p>
              You will only receive a reset email if your email address is registered with an
              account.
            </p>
            <p>Make sure you check your SPAM for replies.</p>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showResetDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitReset">Send Reset Email</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import type { AuthUser } from '~/types';

useSeoMeta({
  robots: 'noindex, nofollow',
});

const authStore = useAuthStore();
const makeToast = useToast();

const name = ref('');
const email = ref('');
const password = ref('');
const stripeCustomerId = ref('');
const confirmPassword = ref('');
const mode = ref<'login' | 'register'>('login');
const error = ref('');
const router = useRouter();

const showResetDialog = ref(false);
const resetEmail = ref('');
const resetError = ref('');

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  error.value = '';
}

onMounted(() => {
  if (authStore.user) {
    navigateTo('/home');
  }
});

async function submit() {
  error.value = '';
  if (mode.value === 'register') {
    if (!name.value) {
      error.value = 'Name is required.';
      return;
    }
    if (!email.value) {
      error.value = 'Email is required.';
      return;
    }
    if (!password.value || !confirmPassword.value) {
      error.value = 'Please fill in both password fields.';
      return;
    }
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match.';
      return;
    }
  }
  try {
    const res = await useApi()<{ success: boolean; authUser: AuthUser }>('/api/' + mode.value, {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
        stripeCustomerId: stripeCustomerId.value,
      },
    });
    if (res.success) {
      authStore.setUser(res.authUser);
      router.push('/home');
    }
  } catch (err) {
    error.value = (err as { data: { statusMessage: string } })?.data.statusMessage || 'Error';
  }
}

async function submitReset() {
  resetError.value = '';
  try {
    await useApi()('/api/password/request', {
      method: 'POST',
      body: { email: resetEmail.value },
    });
    makeToast('Password reset email sent!');
    showResetDialog.value = false;
  } catch (err) {
    resetError.value = (err as { data: { statusMessage: string } })?.data.statusMessage || 'Error';
  }
}
</script>
