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

    <v-card-text>
      <div v-if="vip" class="d-flex justify-center mb-4">
        <v-card v-if="vip" class="pa-3 text-center officer-card vip" color="yellow">
          <div class="d-flex justify-center align-center">
            <v-icon color="black" icon="mdi-star" size="large" class="ms-2" />
            <strong>{{ vip.name }}</strong>
            <v-icon color="black" icon="mdi-star" size="large" />
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
        <div class="row-number no-print"></div>
        <div class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
          <strong>SOUTH</strong>
        </div>
        <div class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
          <strong>NORTH</strong>
        </div>
      </div>
      <div
        v-for="(row, idx) in rows"
        :key="idx"
        class="d-flex align-center justify-center flex-wrap mb-2"
      >
        <div class="row-number no-print">{{ idx + 1 }}</div>
        <!-- South column -->
        <div
          v-if="row.south"
          class="pa-1"
          style="flex: 1 1 45%; max-width: 300px; min-width: 150px"
        >
          <v-card
            class="pa-2 text-center officer-card"
            :class="[row.south.grandOfficer ? 'grand-officer' : 'prov-officer', row.south.rank]"
            :color="row.south.grandOfficer ? 'blue-darken-3' : 'blue-darken-1'"
          >
            <div class="d-flex justify-center align-center">
              {{ row.south.name }}
              <v-icon
                v-if="row.south.rank === 'AGDC' && row.south.active"
                color="black"
                icon="mdi-auto-fix"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['GDC', 'DEPGDC'].includes(row.south.rank ?? '') && row.south.active"
                color="black"
                icon="mdi-magic-staff"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['SGW', 'JGW'].includes(row.south.rank ?? '') && row.south.active"
                color="black"
                icon="mdi-star"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['APGM', 'DPGM'].includes(row.south.rank ?? '') && row.south.active"
                color="black"
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
            :class="[row.north.grandOfficer ? 'grand-officer' : 'prov-officer', row.north.rank]"
            :color="row.north.grandOfficer ? 'blue-darken-3' : 'blue-darken-1'"
          >
            <div class="d-flex justify-center align-center">
              {{ row.north.name }}
              <v-icon
                v-if="row.north.rank === 'AGDC' && row.north.active"
                color="black"
                icon="mdi-auto-fix"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['GDC', 'DEPGDC'].includes(row.north.rank ?? '') && row.north.active"
                color="black"
                icon="mdi-magic-staff"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['SGW', 'JGW'].includes(row.north.rank ?? '') && row.north.active"
                color="black"
                icon="mdi-star"
                size="small"
                class="ms-2"
              />
              <v-icon
                v-if="['APGM', 'DPGM'].includes(row.north.rank ?? '') && row.north.active"
                color="black"
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
import type { Rank } from '~/types/officers';

const ranks: Rank[] = useRuntimeConfig().public.ranks as Rank[];

type ProcessionRow = { south?: Officer; north?: Officer };

const props = defineProps<{
  officers: Officer[];
  officialVisit: OV | null;
}>();

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

const ranksInProcessionOrder = computed(() => {
  // In the procession we want Grand Steward to be at the front (barring other overrides)
  const gStwd = ranks.find((r) => r.value === 'GSTWD')!;
  return [...ranks.filter((r) => r.value !== 'GSTWD'), gStwd];
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

const rankToConsider = (officer: Officer) => {
  return officer.grandOfficer ? officer.grandRank || officer.rank : officer.rank;
};

const activeNumberToConsider = (officer: Officer): number | null => {
  const match = officer.name.match(/\((\d{1,4})\)/);
  if (!match) return null;

  const num = parseInt(match[1]!, 10);
  if (num >= 1 && num <= 9999) {
    return num;
  }

  return null;
};

const provYearCompare = (a: Officer, b: Officer): number | null => {
  if (
    a.active === b.active &&
    a.provOfficerYear &&
    b.provOfficerYear &&
    rankToConsider(a) === rankToConsider(b)
  ) {
    if (a.provOfficerYear !== b.provOfficerYear) return a.provOfficerYear - b.provOfficerYear;
  }
  return null;
};

const rankCompare = (a: string | null, b: string | null): number | null => {
  const aRankIndex = ranksInProcessionOrder.value.findIndex((r) => r.value === a);
  const bRankIndex = ranksInProcessionOrder.value.findIndex((r) => r.value === b);

  if (aRankIndex !== bRankIndex) {
    return (
      (aRankIndex !== -1 ? aRankIndex : ranks.length) -
      (bRankIndex !== -1 ? bRankIndex : ranks.length)
    );
  }
  return null;
};

const activeOfficerNumberCompare = (a: Officer, b: Officer): number | null => {
  const ranka = rankToConsider(a);
  const rankb = rankToConsider(b);
  if (
    !['JGW', 'SGW'].includes(rankToConsider(a) ?? '') &&
    ranka === rankb &&
    a.active === b.active
  ) {
    const anum = activeNumberToConsider(a);
    const bnum = activeNumberToConsider(b);
    if (anum !== null && bnum !== null) {
      if (anum > bnum) {
        return ranka === 'GSTWD' && props.officialVisit?.reverseStewardOrder ? -1 : 1;
      }
      return ranka === 'GSTWD' && props.officialVisit?.reverseStewardOrder ? 1 : -1;
    }
  }
  return null;
};

const isActiveVIP = (o: Officer) => {
  return ['PGM', 'DPGM', 'APGM'].includes(o.rank ?? '') && o.active;
};

// Automatic officers sorted by seniority
const automatic = computed(() =>
  props.officers
    .filter((o) => o.position === 'automatic')
    .sort((a, b) => {
      // Deal with active VIPs classed as automatic
      if (isActiveVIP(a) && isActiveVIP(b)) {
        // VIP Rank seniority
        const rankRes = rankCompare(a.rank, b.rank);
        if (rankRes !== null) {
          return rankRes;
        } else {
          // Prov year for equal active VIPs
          const pyRes = provYearCompare(a, b);
          if (pyRes !== null) {
            return pyRes;
          }
        }
      }

      // Active VIPs outrank non-active VIPs
      if (isActiveVIP(a) && !isActiveVIP(b)) return -1;
      if (!isActiveVIP(a) && isActiveVIP(b)) return 1;

      // Grand officer comparisons
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
      const pyRes = provYearCompare(a, b);
      if (pyRes !== null) {
        return pyRes;
      }

      // Rank seniority
      const rankRes = rankCompare(rankToConsider(a), rankToConsider(b));
      if (rankRes !== null) {
        return rankRes;
      }

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

      // Finally active office number
      const aonRes = activeOfficerNumberCompare(a, b);
      if (aonRes !== null) {
        return aonRes;
      }

      return 0;
    })
);

const activeDCs = computed(() => {
  return automatic.value
    .filter((o) => o.active && (o.rank === 'GDC' || o.rank === 'DEPGDC' || o.rank === 'AGDC'))
    .filter((o) => (props.officialVisit?.includeGrandOfficers ? true : !o.grandOfficer))
    .sort((a, b) => {
      // Provincial year compare
      const pyRes = provYearCompare(a, b);
      if (pyRes !== null) {
        return pyRes;
      }
      // Active officer number
      const aonRes = activeOfficerNumberCompare(a, b);
      if (aonRes !== null) {
        return aonRes;
      }

      return 0;
    })
    .reverse();
});

function parseFixedPosition(position?: string) {
  if (!position) return null;

  const match = position.match(/^row_(\d+)_(south|north)$/);
  if (!match) return null;

  const [, rowNumStr, side] = match;
  return { rowIndex: Number(rowNumStr) - 1, side: side as 'south' | 'north' };
}

const fixedPositionMap = computed(() => {
  const fixedPositionMap: Record<number, ProcessionRow> = {};
  for (const officer of props.officers) {
    const parsed = parseFixedPosition(officer.position);

    if (parsed) {
      if (!fixedPositionMap[parsed.rowIndex]) {
        fixedPositionMap[parsed.rowIndex] = {};
      }
      const row = fixedPositionMap[parsed.rowIndex]!;
      row[parsed.side] = officer;
    }
  }
  return fixedPositionMap;
});

// Build rows (top = rear, bottom = front)
const rows = computed(() => {
  const result: ProcessionRow[] = [];

  let nextRow: ProcessionRow = {};

  const addRow = (row: ProcessionRow) => {
    result.push(row);
    nextRow = {};
  };

  // Traverse the automatic officers and add rows
  const automaticOfficers = (
    props.officialVisit?.activeDCsFront
      ? automatic.value.filter((ao) => !activeDCs.value.includes(ao))
      : automatic.value
  ).filter((o) => !parseFixedPosition(o.position));

  const addOfficer = (officer: Officer) => {
    // If the next row is empty, see if it has a pre-populated value in thr fixedPositionMap
    if (!nextRow.south && !nextRow.north) {
      const prefilled = fixedPositionMap.value[result.length];
      if (prefilled?.north || prefilled?.south) {
        nextRow = { ...prefilled };
      }
    }
    if (nextRow.south && nextRow.north) {
      addRow(nextRow);
    } else {
      if (!nextRow.south) {
        nextRow.south = officer;
        // North might be prepopulated
        if (nextRow.north) {
          addRow(nextRow);
        }
      } else if (!nextRow.north) {
        nextRow.north = officer;
        addRow(nextRow);
      }
    }
  };

  for (const officer of automaticOfficers) {
    addOfficer(officer);
  }

  if (props.officialVisit?.activeDCsFront) {
    for (const officer of activeDCs.value) {
      addOfficer(officer);
    }
  }

  // Look through the fixed positions and if we do not yet have it in the results, add it now
  for (const fp in fixedPositionMap.value) {
    const fpi = parseInt(fp);
    if (fpi >= result.length) {
      result.push(fixedPositionMap.value[fp]!);
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
      addRow(nextRow);
    } else {
      const hs = headSouth.value;
      let hn = headNorth.value;
      if (hs && hn) {
        nextRow.north = hn;
        hn = undefined;
        addRow(nextRow);
      }
      if (hs) {
        if (nextRow.south) {
          // Swap
          nextRow.north = nextRow.south;
          nextRow.south = hs;
          addRow(nextRow);
        } else {
          nextRow.south = hs;
        }
      }
      if (hn) {
        nextRow.north = hn;
        addRow(nextRow);
      }
      if (Object.keys(nextRow).length > 0) {
        addRow(nextRow);
      }
    }
  }

  // If we get here and we still have a populated row, add it
  if (nextRow.south) {
    addRow(nextRow);
  }

  // Now if we have both the ProvSGW and the ProvJGW, ensure they are in the same row
  if (seniorWarden.value && juniorWarden.value && props.officialVisit?.alignWardens) {
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
            officerInNorthOfJWRow.id === juniorWarden.value.id
              ? officerInSouthOfJWRow
              : officerInNorthOfJWRow;
          jwRow.south = seniorWarden.value;
          jwRow.north = juniorWarden.value;
          swRow.north = officerToMove as Officer;
        }
      }
    }
  }

  return result;
});

async function printProcession() {
  window.print();
}
</script>

<style lang="scss" scoped>
.row-number {
  min-width: 20px;
}

.v-card-text {
  display: flex;
  flex-direction: column;
}

.sword-bearer,
.standard-bearer,
.grand-officer {
  border: 6px solid #fbc02d;
}

.prov-officer {
  border: 4px solid #fbc02d;
}

.vip,
.APGM,
.DPGM {
  border: 8px solid #fbc02d;
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

  .vip,
  .sword-bearer,
  .standard-bearer,
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

  .procession-header {
    color: black !important;
  }
}
</style>
