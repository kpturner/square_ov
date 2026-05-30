<template>
  <v-card
    class="pa-2 text-center officer-card"
    :class="[officer.grandOfficer ? 'grand-officer' : 'prov-officer', officer.rank]"
    :color="officer.grandOfficer ? 'blue-darken-3' : 'blue-darken-1'"
  >
    <div class="d-flex justify-center align-center">
      {{ officer.name }}
      <v-icon
        v-if="officer.rank === 'AGDC' && officer.active"
        color="black"
        icon="mdi-auto-fix"
        size="small"
        class="ms-2"
      />
      <v-icon
        v-if="['GDC', 'DEPGDC'].includes(officer.rank ?? '') && officer.active"
        color="black"
        icon="mdi-magic-staff"
        size="small"
        class="ms-2"
      />
      <v-icon
        v-if="['SGW', 'JGW'].includes(officer.rank ?? '') && officer.active"
        color="black"
        icon="mdi-star"
        size="small"
        class="ms-2"
      />
      <v-icon
        v-if="['APGM', 'DPGM'].includes(officer.rank ?? '') && officer.active"
        color="black"
        icon="mdi-star"
        size="small"
        class="ms-2"
      />
      <v-icon
        v-if="officer.position.indexOf('row_') !== -1"
        color="black"
        icon="mdi-pin"
        size="small"
        class="ms-2"
      />
    </div>
    <div class="text-caption">{{ rankCaption(officer) }}</div>
  </v-card>
</template>

<script setup lang="ts">
import type { Officer } from '@prisma/client';

defineProps<{
  officer: Officer;
}>();

const rankPrefix = (officer: Officer) => {
  if (['PGM', 'DPGM', 'APGM'].includes(officer.rank ?? '')) {
    if (officer.active) {
      return '';
    } else {
      return 'P';
    }
  }
  if (officer.active) {
    return 'Prov';
  } else {
    return 'PP';
  }
};

const grandRankPrefix = (officer: Officer) => {
  if (!officer.grandRank) {
    return '';
  }
  if (officer.grandActive) {
    return '';
  } else {
    return 'P';
  }
};

const rankCaption = (officer: Officer) => {
  let caption = '';

  if (officer.grandOfficer && officer.grandRank) {
    caption += `${grandRankPrefix(officer)}${officer.grandRank}`;
    if (officer.grandOfficerYear) {
      caption += ` (${officer.grandOfficerYear})`;
    }
  }

  if (officer.rank) {
    if (caption.length) {
      caption += ' - ';
    }
    caption += `${rankPrefix(officer)}${officer.rank}`;
  }
  return caption;
};
</script>

<style lang="scss" scoped>
.v-card-text {
  display: flex;
  flex-direction: column;
}

.grand-officer {
  border: 6px solid #fbc02d;
}

.prov-officer {
  border: 4px solid #fbc02d;
}

.GSTWD {
  border-color: #a0171d;
}

.vip,
.APGM,
.DPGM {
  border: 8px solid #fbc02d;
}

@media print {
  .vip,
  .prov-officer,
  .grand-officer {
    background-color: transparent !important;
    color: black !important;
    border-color: black;
  }

  .officer-card {
    color: black !important;
    margin-bottom: 50px;
    page-break-inside: avoid; /* Prevent splitting across pages */
    break-inside: avoid;
  }
}
</style>
