<template>
  <v-layout class="rounded rounded-md">
    <client-only>
      <v-app-bar>
        <v-app-bar-nav-icon
          variant="text"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon
        ><v-toolbar-title>SquareEvents Monitor</v-toolbar-title></v-app-bar
      >

      <v-navigation-drawer v-model="drawer">
        <v-list>
          <v-list-item title="Navigation drawer"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main
        class="d-flex"
        style="min-height: 300px"
      >
        <Authenticate v-if="!$authenticated" />
        <Customers v-if="$authenticated" />
      </v-main>
    </client-only>
  </v-layout>
</template>

<script lang="ts" setup>
const { $authenticated } = useNuxtApp();

const drawer = ref(false);
</script>
