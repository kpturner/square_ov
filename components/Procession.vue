<template>
  <v-card class="pa-0 pa-lg-4">
    <v-card-title class="d-flex justify-space-between align-center mb-2">
      <div class="d-flex align-center procession-header">
        <span class="text-subtitle-1 text-lg-h6 mr-4"
          >Procession for OV to {{ officialVisit?.name || '...' }}</span
        >
      </div>

      <v-btn color="primary" prepend-icon="mdi-printer" class="no-print" @click="printProcession">
        Print
      </v-btn>
    </v-card-title>

    <div class="d-flex align-center">
      <v-checkbox
        v-model="alignActiveWardens"
        class="no-print"
        label="Align active wardens?"
        dense
        hide-details
      />
      <v-checkbox
        v-model="activeDCsFront"
        class="ms-3 no-print"
        label="Active DCs at front?"
        dense
        hide-details
      />
      <v-checkbox
        v-if="activeDCsFront"
        v-model="includeGrandOfficers"
        class="ms-3 no-print"
        label="Including Grand Officers?"
        dense
        hide-details
      />
    </div>

    <v-card-text>
      <div v-if="vip" class="d-flex justify-center mb-4">
        <v-card v-if="vip" class="pa-3 text-center officer-card" color="yellow">
          <div class="d-flex justify-center align-center">
            <strong>{{ vip.name }}</strong>
            <v-icon color="black" icon="mdi-star" size="large" class="ms-2" />
          </div>
          <div class="text-caption">{{ rankCaption(vip) }}</div>
        </v-card>
      </div>

      <div v-if="swordBearer || standardBearer" class="d-flex justify-center mb-4">
        <v-card
          v-if="swordBearer"
          class="pa-3 text-center mr-1 officer-card sword-bearer"
          color="#FFF59D"
        >
          <div class="d-flex justify-center align-center">
            <strong>{{ swordBearer.name }}</strong>
            <v-icon color="black" icon="mdi-sword" size="small" class="ms-2" />
          </div>
          <div class="text-caption">Sword Bearer</div>
        </v-card>

        <v-card
          v-if="standardBearer"
          class="pa-3 text-center ml-1 officer-card standard-bearer"
          color="#FFF59D"
        >
          <div class="d-flex justify-center align-center">
            <strong>{{ standardBearer.name }}</strong>
            <v-icon color="black" icon="mdi-flag" size="small" class="ms-2" />
          </div>
          <div class="text-caption">Standard Bearer</div>
        </v-card>
      </div>

      <div class="d-flex justify-center flex-wrap mb-2">
        <div class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
          <strong>SOUTH</strong>
        </div>
        <div class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
          <strong>NORTH</strong>
        </div>
      </div>
      <div v-for="(row, idx) in rows" :key="idx" class="d-flex justify-center flex-wrap mb-2">
        <!-- South column -->
        <div
          v-if="row.south"
          class="pa-1"
          style="flex: 1 1 45%; max-width: 300px; min-width: 150px"
        >
          <v-card
            class="pa-2 text-center officer-card"
            :class="row.south.grandOfficer ? 'grand-officer' : 'prov-officer'"
            :color="row.south.grandOfficer ? 'blue-darken-3' : 'blue-darken-1'"
          >
            <div class="d-flex justify-center align-center">
              {{ row.south.name }}
              <v-icon
                v-if="row.south.rank === 'AGDC' && row.south.active"
                color="white"
                icon="mdi-auto-fix"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['GDC', 'DGDC'].includes(row.south.rank ?? '') && row.south.active"
                color="white"
                icon="mdi-magic-staff"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['SGW', 'JGW'].includes(row.south.rank ?? '') && row.south.active"
                color="white"
                icon="mdi-star"
                size="small"
                class="ms-2"
              />
            </div>
            <div class="text-caption">{{ rankCaption(row.south) }}</div>
          </v-card>
        </div>

        <!-- North column -->
        <div
          v-if="row.north"
          class="pa-1"
          style="flex: 1 1 45%; max-width: 300px; min-width: 150px"
        >
          <v-card
            class="pa-2 text-center officer-card"
            :class="row.north.grandOfficer ? 'grand-officer' : 'prov-officer'"
            :color="row.north.grandOfficer ? 'blue-darken-3' : 'blue-darken-1'"
          >
            <div class="d-flex justify-center align-center">
              {{ row.north.name }}
              <v-icon
                v-if="row.north.rank === 'AGDC' && row.north.active"
                color="white"
                icon="mdi-auto-fix"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['GDC', 'DGDC'].includes(row.north.rank ?? '') && row.north.active"
                color="white"
                icon="mdi-magic-staff"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['SGW', 'JGW'].includes(row.north.rank ?? '') && row.north.active"
                color="white"
                icon="mdi-star"
                size="small"
                class="ms-2"
              />
            </div>
            <div class="text-caption">{{ rankCaption(row.north) }}</div>
          </v-card>
        </div>
        <div v-else class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
          <!-- Nobody here! -->
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Officer, OV } from '@prisma/client';
import type { Rank } from '~/types';

const { ranks } = useRuntimeConfig().public;

const props = defineProps<{ officers: Officer[]; officialVisit: OV | null }>();

// Special roles
const vip = computed(() => props.officers.find((o) => o.position === 'vip'));
const swordBearer = computed(() => props.officers.find((o) => o.position === 'sword_bearer'));
const standardBearer = computed(() => props.officers.find((o) => o.position === 'standard_bearer'));

const headSouth = computed(() => props.officers.find((o) => o.position === 'head_of_south'));
const headNorth = computed(() => props.officers.find((o) => o.position === 'head_of_north'));
const seniorWarden = computed(() =>
  props.officers.find((o) => o.position === 'automatic' && o.rank === 'SGW' && o.active)
);
const juniorWarden = computed(() =>
  props.officers.find((o) => o.position === 'automatic' && o.rank === 'JGW' && o.active)
);

const activeDCsFront = ref(false);
const includeGrandOfficers = ref(false);
const alignActiveWardens = ref(false);

onMounted(() => {
  if (props.officialVisit) {
    activeDCsFront.value = props.officialVisit.activeDCsFront;
    includeGrandOfficers.value = props.officialVisit.includeGrandOfficers;
    alignActiveWardens.value = props.officialVisit.alignWardens;
  }
});

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
  if (officer.grandActive) {
    return '';
  } else {
    return 'P';
  }
};

const rankCaption = (officer: Officer) => {
  let caption = '';
  if (officer.rank) {
    caption += `${rankPrefix(officer)}${officer.rank}`;
  }
  if (officer.grandOfficer) {
    if (caption.length) {
      caption += ' - ';
    }
    caption += `${grandRankPrefix(officer)}${officer.grandRank}`;
    if (officer.grandOfficerYear) {
      caption += ` (${officer.grandOfficerYear})`;
    }
  }
  return caption;
};

const rankToConsider = (officer: Officer) => {
  return officer.grandOfficer ? officer.grandRank || officer.rank : officer.rank;
};

// Automatic officers sorted by seniority
const automatic = computed(() =>
  props.officers
    .filter((o) => o.position === 'automatic')
    .sort((a, b) => {
      // Grand officer first
      if (a.grandOfficer && !b.grandOfficer) return -1;
      if (!a.grandOfficer && b.grandOfficer) return 1;

      // Grand year for equal rank and active status
      if (
        a.grandOfficer &&
        b.grandOfficer &&
        a.grandActive === b.grandActive &&
        a.grandOfficerYear &&
        b.grandOfficerYear &&
        rankToConsider(a) === rankToConsider(b)
      ) {
        if (a.grandOfficerYear !== b.grandOfficerYear)
          return a.grandOfficerYear - b.grandOfficerYear;
      }

      // Prov year for equal rank and active status
      if (
        a.active === b.active &&
        a.provOfficerYear &&
        b.provOfficerYear &&
        rankToConsider(a) === rankToConsider(b)
      ) {
        if (a.provOfficerYear !== b.provOfficerYear) return a.provOfficerYear - b.provOfficerYear;
      }

      // Rank seniority
      const aRankIndex = ranks.findIndex((r: Rank) => r.value === rankToConsider(a));
      const bRankIndex = ranks.findIndex((r: Rank) => r.value === rankToConsider(b));
      if (aRankIndex !== bRankIndex)
        return (
          (aRankIndex !== -1 ? aRankIndex : ranks.length) -
          (bRankIndex !== -1 ? bRankIndex : ranks.length)
        );

      // Grand Officers: active grand rank outranks non-active
      if (a.grandOfficer && b.grandOfficer && rankToConsider(a) === rankToConsider(b)) {
        if (a.grandActive && !b.grandActive) return -1;
        if (!a.grandActive && b.grandActive) return 1;
      }

      // Prov Officers: active prov rank outranks non-active
      if (rankToConsider(a) === rankToConsider(b)) {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
      }

      return 0;
    })
);

// Build marching rows (top = rear, bottom = front)
const rows = computed(() => {
  const result: { south?: Officer; north?: Officer; centre?: Officer[] }[] = [];

  // VIP + sword/standard first (rear)
  const centreRow: Officer[] = [];
  if (swordBearer.value) centreRow.push(swordBearer.value);
  if (vip.value) centreRow.push(vip.value);
  if (standardBearer.value) centreRow.push(standardBearer.value);
  if (centreRow.length > 0) result.push({ centre: centreRow });

  let nextRow: { south?: Officer; north?: Officer } = {};

  // Traverse the automatic officers and add rows
  const activeDCs = automatic.value
    .filter((o) => o.active && (o.rank === 'GDC' || o.rank === 'DGDC' || o.rank === 'AGDC'))
    .filter((o) => (includeGrandOfficers.value ? true : !o.grandOfficer))
    .reverse();
  const automaticOfficers = activeDCsFront.value
    ? automatic.value.filter((ao) => !activeDCs.includes(ao))
    : automatic.value;

  for (const officer of automaticOfficers) {
    if (!nextRow.south) {
      nextRow.south = officer;
    } else if (!nextRow.north) {
      nextRow.north = officer;
      result.push(nextRow);
      nextRow = {};
    }
  }

  if (activeDCsFront.value) {
    for (const officer of activeDCs) {
      if (!nextRow.south) {
        nextRow.south = officer;
      } else if (!nextRow.north) {
        nextRow.north = officer;
        result.push(nextRow);
        nextRow = {};
      }
    }
  }

  // Cater for heads of rows
  if (headSouth.value || headNorth.value) {
    if (Object.keys(nextRow).length === 0) {
      if (headSouth.value) {
        nextRow.south = headSouth.value;
      }
      if (headNorth.value) {
        nextRow.north = headNorth.value;
      }
      result.push(nextRow);
      nextRow = {};
    } else {
      const hs = headSouth.value;
      let hn = headNorth.value;
      if (hs && hn) {
        nextRow.north = hn;
        hn = undefined;
        result.push(nextRow);
        nextRow = {};
      }
      if (hs) {
        if (nextRow.south) {
          // Swap
          nextRow.north = nextRow.south;
          nextRow.south = hs;
          result.push(nextRow);
          nextRow = {};
        } else {
          nextRow.south = hs;
        }
      }
      if (hn) {
        nextRow.north = hn;
        result.push(nextRow);
        nextRow = {};
      }
      if (Object.keys(nextRow).length > 0) {
        result.push(nextRow);
        nextRow = {};
      }
    }
  }

  // Now if we have both the ProvSGW and the ProvJGW, ensure they are in the same row
  if (seniorWarden.value && juniorWarden.value && alignActiveWardens.value) {
    let sgwRowIndex = -1;
    let jgwRowIndex = -1;
    result.forEach((row, idx) => {
      if (row.south?.id === seniorWarden.value?.id || row.north?.id === seniorWarden.value?.id) {
        sgwRowIndex = idx;
      }
      if (row.south?.id === juniorWarden.value?.id || row.north?.id === juniorWarden.value?.id) {
        jgwRowIndex = idx;
      }
    });
    if (sgwRowIndex !== -1 && jgwRowIndex !== -1 && sgwRowIndex !== jgwRowIndex) {
      const swRow = result[sgwRowIndex];
      const jwRow = result[jgwRowIndex];
      // Is the SGW in the north or the south?
      if (result[sgwRowIndex]?.south?.id === seniorWarden.value.id) {
        // In the right place already, so swap the JGW into the north of that row
        if (swRow && jwRow) {
          const officerToMove = { ...swRow.north };
          swRow.north = juniorWarden.value;
          jwRow.north = officerToMove as Officer;
        }
      } else {
        // SW is in a the north
        if (swRow && jwRow) {
          const officerInNorthOfJWRow = { ...jwRow.north };
          const officerInSouthOfJWRow = { ...jwRow.south };
          const officerToMove =
            officerInNorthOfJWRow.rank === 'JGW' ? officerInSouthOfJWRow : officerInNorthOfJWRow;
          jwRow.south = seniorWarden.value;
          jwRow.north = juniorWarden.value;
          swRow.north = officerToMove as Officer;
        }
      }
    }
  }

  return result;
});

function printProcession() {
  window.print();
}

let timeout: ReturnType<typeof setTimeout>;
const saveBooleans = () => {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    try {
      const body = {
        ...props.officialVisit,
        alignWardens: alignActiveWardens.value,
        activeDCsFront: activeDCsFront.value,
        includeGrandOfficers: includeGrandOfficers.value,
      };
      await $fetch(`/api/ov/${props.officialVisit?.id}.put`, {
        method: 'PUT',
        body,
      });
    } catch (err) {
      console.error('Failed to update booleans:', err);
    }
  }, 400);
};

watch([alignActiveWardens, activeDCsFront, includeGrandOfficers], saveBooleans);
</script>

<style lang="scss" scoped>
.v-card-text {
  display: flex;
  flex-direction: column;
}

.grand-officer {
  border: 8px solid yellow;
}

.prov-officer {
  border: 4px solid yellow;
}

@media print {
  .procession-print,
  .procession-print * {
    visibility: visible;
  }

  .procession-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .sword-bearer {
    color: black !important;
  }

  .grand-officer {
    color: black !important;
    border: none;
  }

  .prov-officer {
    color: black !important;
    border: none;
  }

  .officer-card {
    color: black !important;
    margin-bottom: 50px;
    page-break-inside: avoid; /* Prevent splitting across pages */
    break-inside: avoid;
  }

  .procession-header {
    color: black !important;
  }
}
</style>
