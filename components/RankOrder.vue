<template>
  <v-card class="pa-0">
    <v-card-title class="d-flex flex-column flex-md-row justify-space-between align-center mb-2">
      <div class="d-flex align-center">
        <span class="text-subtitle-1 text-lg-h7 mr-4 ml-4">Rank Order</span>
      </div>
    </v-card-title>

    <v-card-text>
      <v-list density="compact" slim border class="pa-0">
        <v-list-item v-for="rank in ranks" :key="rank.value" density="compact" class="rank-item">
          {{ rank.value }}
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Rank } from '~/types/officers';

const ranks: Rank[] = useRuntimeConfig().public.ranks as Rank[];
</script>

<style lang="scss" scoped>
.rank-item {
  font-size: 0.7rem;
  line-height: 1.1;
  min-height: 20px;
  padding-top: 2px;
  padding-bottom: 2px;
}
@media (max-width: 600px) {
  .rank-item {
    font-size: 0.35rem;
  }
}
@media print {
  .rank-item {
    font-size: 0.6rem;
  }
}
</style>
