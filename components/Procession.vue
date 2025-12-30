<template>
  <v-card class="pa-0 pa-lg-4">
    <v-card-title class="mb-2">
      <v-row class="align-center" no-gutters>
        <!-- Text: always centered -->
        <v-col cols="12" md="auto" class="text-center">
          <span class="text-subtitle-1 text-lg-h6">
            Procession for OV to {{ officialVisit?.name || '...' }}
          </span>
        </v-col>

        <!-- Spacer on medium+ to push button right -->
        <v-spacer class="d-none d-md-flex"></v-spacer>

        <!-- Button: full width on small, normal on md+ -->
        <v-col cols="12" md="auto">
          <v-btn
            color="primary"
            prepend-icon="mdi-printer"
            class="no-print"
            block
            @click="printProcession"
          >
            Print
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="3" class="d-none d-sm-block sm:pa-0">
          <rank-order />
        </v-col>

        <v-col cols="12" sm="9">
          <ProcessionContent :officers="officers" :official-visit="officialVisit" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Officer, OV } from '@prisma/client';

defineProps<{
  officers: Officer[];
  officialVisit: OV | null;
}>();

async function printProcession() {
  window.print();
}
</script>

<style lang="scss" scoped>
.v-card-text {
  display: flex;
  flex-direction: column;
}
</style>
