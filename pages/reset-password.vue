<template>
  <v-container class="d-flex align-center justify-center" style="height: 100vh">
    <v-card width="400" class="pa-6">
      <v-card-title class="text-h5">Reset Your Password</v-card-title>

      <v-card-text>
        <p v-if="!success">Enter your new password below.</p>
        <v-text-field
          v-model="newPassword"
          label="New Password"
          type="password"
          outlined
          class="mt-4"
          @keyup.enter="submitReset"
        />
        <v-text-field
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          outlined
          class="mt-4"
          @keyup.enter="submitReset"
        />
        <v-alert v-if="error" type="error" class="mt-4" density="compact">
          {{ error }}
        </v-alert>
        <v-alert v-if="success" type="success" class="mt-4" density="compact">
          Password successfully reset! You can now <router-link to="/">login</router-link>.
        </v-alert>
      </v-card-text>

      <v-card-actions v-if="!success" class="d-flex flex-column">
        <v-spacer></v-spacer>
        <v-btn color="primary" block @click="submitReset">Reset Password</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="secondary" block @click="navigateTo('/login')">Return to login</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref(false);

const route = useRoute();

// Extract token and email from query params
const token = ref('');
const email = ref('');

onMounted(() => {
  token.value = (route.query.token as string) || '';
  email.value = (route.query.email as string) || '';

  if (!token.value || !email.value) {
    error.value = 'Invalid password reset link.';
  }
});

async function submitReset() {
  error.value = '';

  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Please fill in both fields.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  try {
    await useApi()('/api/password/reset', {
      method: 'POST',
      body: {
        email: email.value,
        token: token.value,
        newPassword: newPassword.value,
      },
    });
    success.value = true;
  } catch (err) {
    error.value =
      (err as { data: { statusMessage: string } })?.data.statusMessage ??
      'Error resetting password';
  }
}
</script>
