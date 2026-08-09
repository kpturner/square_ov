<template>
  <hr v-if="processionNo && processionNo > 1" />
  <v-card
    class="pa-0 pa-lg-4"
    :class="{
      'new-page': processionNo && processionNo > 1 && !printProcessionNo,
      'no-print': printProcessionNo !== processionNo && !isPrintSplitProcession,
    }"
  >
    <v-card-title class="mb-2">
      <v-row class="align-center" no-gutters>
        <!-- Text: always centered -->
        <v-col cols="12" md="auto" class="text-center">
          <span class="text-subtitle-1 text-lg-h6">
            {{ `Procession ${noOfProcessions ? processionNo : ''}` }} for OV to
            {{ officialVisit?.name || '...' }}
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
            @click="printProcessionNumber(processionNo)"
          >
            Print
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <v-row
        :class="isPrintSplitProcession || printProcessionNo !== processionNo ? 'no-print' : ''"
      >
        <v-col cols="3" class="d-none d-sm-block sm:pa-0">
          <rank-order :ov-type="officialVisit?.ovType ?? null" />
        </v-col>

        <v-col cols="12" sm="9">
          <ProcessionContent
            :officers="officers"
            :official-visit="officialVisit"
            :procession-total
            :no-of-processions
            :procession-no
          />
        </v-col>
      </v-row>

      <v-row v-if="noOfProcessions === 1" :class="isPrintSplitProcession ? '' : 'no-print'">
        <v-col cols="12">
          <ProcessionContent
            :officers="officers"
            :official-visit="officialVisit"
            :procession-total
            :no-of-processions
            :procession-no
            carpet-split-mode
            @split-by-row-change="splitByRowChange"
            @print-split-procession="printSplitProcession"
          />
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
  processionTotal: number | null;
  noOfProcessions: number | null;
  processionNo: number | null;
}>();

const emits = defineEmits(['split-by-row-change', 'print-split-procession']);
const isPrintSplitProcession = ref(false);
const printProcessionNo = ref<number | null>(null);

async function printProcession() {
  window.print();
}

function splitByRowChange(val: boolean) {
  emits('split-by-row-change', val);
}

async function printSplitProcession() {
  isPrintSplitProcession.value = true;
  await nextTick();
  printProcession();
  await nextTick();
  isPrintSplitProcession.value = false;
}

async function printProcessionNumber(processionNo: number | null) {
  if (!processionNo) return;
  printProcessionNo.value = processionNo;
  await nextTick();
  printProcession();
  await nextTick();
  printProcessionNo.value = null;
}
</script>

<style lang="scss" scoped>
.v-card-text {
  display: flex;
  flex-direction: column;
}

@media print {
  .new-page {
    break-before: page;
  }
}
</style>
