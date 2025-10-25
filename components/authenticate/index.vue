<template>
  <div class="text-center pa-4">
    <v-dialog
      v-model="dialog"
      transition="dialog-bottom-transition"
      fullscreen
    >
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Authenticate yourself</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-toolbar-items>
            <v-btn
              text="Log in"
              variant="text"
              @click="authenticate"
            ></v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-list lines="two">
          <v-form @submit.prevent>
            <v-text-field
              label="Password"
              placeholder="password"
              type="password"
              v-model="password"
              @keyup.enter="authenticate"
              autocomplete="current-password"
            ></v-text-field>

            <v-alert
              v-if="incorrectPwd"
              type="error"
              variant="outlined"
            >
              The password you provided is incorrect
            </v-alert>
          </v-form>
        </v-list>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
const { $authenticated, $authenticate } = useNuxtApp();

const dialog = ref(!$authenticated.value);
const password = ref('');
const incorrectPwd = ref(false);

watch($authenticated, (value) => {
  dialog.value = !value;
  incorrectPwd.value = !value;
});

async function authenticate() {
  incorrectPwd.value = false;
  await $authenticate(password.value);
  incorrectPwd.value = !$authenticated.value;
}
</script>
