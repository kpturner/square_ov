<template>
  <div
    v-if="carpetSplitMode && isRowsExceedingCarpetCapacity"
    class="d-flex flex-column justify-center align-center mt-6 mb-4"
  >
    <strong>SPLIT COLUMNS ON CARPET</strong>

    <v-btn
      class="no-print"
      color="primary"
      prepend-icon="mdi-printer"
      @click="printSplitProcession"
    >
      Print
    </v-btn>
  </div>

  <template v-if="(carpetSplitMode && isRowsExceedingCarpetCapacity) || !carpetSplitMode">
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
  </template>

  <template v-if="!props.carpetSplitMode">
    <div class="d-flex justify-center text-center flex-wrap mb-2">
      <div class="row-number no-print"></div>
      <div class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
        <strong>SOUTH</strong>
      </div>
      <v-divider vertical class="mx-2" />
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
      <div v-if="row.south" class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
        <OfficerCard :ov-type="officialVisit?.ovType ?? null" :officer="row.south" />
      </div>
      <div v-else class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
        <!-- Nobody here! -->
      </div>
      <v-divider vertical class="mx-2" />
      <!-- North column -->
      <div v-if="row.north" class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
        <OfficerCard :ov-type="officialVisit?.ovType ?? null" :officer="row.north" />
      </div>
      <div v-else class="pa-1" style="flex: 1 1 45%; max-width: 300px; min-width: 150px">
        <!-- Nobody here! -->
      </div>
    </div>
  </template>

  <template v-else>
    <div v-if="isRowsExceedingCarpetCapacity">
      <v-checkbox
        v-model="splitByRow"
        class="d-flex justify-center no-print ms-md-3"
        label="Senior to rear?"
        dense
        hide-details
      />
      <div class="d-flex justify-center flex-wrap mb-2 text-center">
        <div class="row-number no-print"></div>

        <!-- SOUTH spans 2 columns -->
        <div class="pa-1 group-header" style="flex: 1 1 40%; max-width: 600px">
          <strong>SOUTH</strong>
        </div>
        <v-divider vertical class="mx-2" />
        <!-- NORTH spans 2 columns -->
        <div class="pa-1 group-header" style="flex: 1 1 40%; max-width: 600px">
          <strong>NORTH</strong>
        </div>
      </div>

      <div class="d-flex justify-center flex-wrap mb-2 text-center sub-header">
        <div class="row-number no-print"></div>

        <!-- SOUTH subcolumns -->
        <div class="pa-1" style="flex: 1 1 20%; max-width: 300px">
          <small>OUTER</small>
        </div>
        <div class="pa-1" style="flex: 1 1 20%; max-width: 300px">
          <small>INNER</small>
        </div>
        <v-divider vertical class="mx-2" />
        <!-- NORTH subcolumns -->
        <div class="pa-1" style="flex: 1 1 20%; max-width: 300px">
          <small>INNER</small>
        </div>
        <div class="pa-1" style="flex: 1 1 20%; max-width: 300px">
          <small>OUTER</small>
        </div>
      </div>

      <div
        v-for="(row, idx) in splitRows"
        :key="idx"
        class="d-flex align-center justify-center flex-wrap mb-2"
      >
        <div class="row-number no-print">{{ idx + 1 }}</div>
        <!-- South column 1-->
        <div
          v-if="row.south"
          class="pa-1"
          style="flex: 1 1 20%; max-width: 300px; min-width: 150px"
        >
          <OfficerCard :ov-type="officialVisit?.ovType ?? null" :officer="row.south" />
        </div>
        <div v-else class="pa-1" style="flex: 1 1 20%; max-width: 300px; min-width: 150px">
          <!-- Nobody here! -->
        </div>
        <!-- South column 2-->
        <div
          v-if="row.south2"
          class="pa-1"
          style="flex: 1 1 20%; max-width: 300px; min-width: 150px"
        >
          <OfficerCard :ov-type="officialVisit?.ovType ?? null" :officer="row.south2" />
        </div>
        <div v-else class="pa-1" style="flex: 1 1 20%; max-width: 300px; min-width: 150px">
          <!-- Nobody here! -->
        </div>
        <v-divider vertical class="mx-2" />
        <!-- North column -->
        <div
          v-if="row.north"
          class="pa-1"
          style="flex: 1 1 20%; max-width: 300px; min-width: 150px"
        >
          <OfficerCard :ov-type="officialVisit?.ovType ?? null" :officer="row.north" />
        </div>
        <div v-else class="pa-1" style="flex: 1 1 20%; max-width: 300px; min-width: 150px">
          <!-- Nobody here! -->
        </div>
        <div
          v-if="row.north2"
          class="pa-1"
          style="flex: 1 1 20%; max-width: 300px; min-width: 150px"
        >
          <OfficerCard :ov-type="officialVisit?.ovType ?? null" :officer="row.north2" />
        </div>
        <div v-else class="pa-1" style="flex: 1 1 20%; max-width: 300px; min-width: 150px">
          <!-- Nobody here! -->
        </div>
      </div>
      <div
        v-if="headSouth || headNorth"
        class="d-flex align-center justify-center flex-wrap mt-4 mb-2 head-row"
      >
        <div class="row-number no-print">H</div>

        <!-- SOUTH side (centred across OUTER + INNER) -->
        <div
          class="pa-1"
          style="flex: 1 1 40%; max-width: 600px; display: flex; justify-content: center"
        >
          <OfficerCard
            v-if="headSouth"
            :ov-type="officialVisit?.ovType ?? null"
            :officer="headSouth"
          />
        </div>
        <v-divider vertical class="mx-2" />
        <!-- NORTH side -->
        <div
          class="pa-1"
          style="flex: 1 1 40%; max-width: 600px; display: flex; justify-content: center"
        >
          <OfficerCard
            v-if="headNorth"
            :ov-type="officialVisit?.ovType ?? null"
            :officer="headNorth"
          />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { Officer, OV } from '@prisma/client';
import type { Rank, ProcessionRow } from '~/types';

const props = defineProps<{
  officers: Officer[];
  officialVisit: OV | null;
  carpetSplitMode?: boolean;
}>();

const cfg = useRuntimeConfig().public;
const ranks = computed(
  () =>
    (props.officialVisit
      ? props.officialVisit.ovType === 'craft'
        ? cfg.ranks
        : cfg.raRanks
      : []) as Rank[]
);

const emits = defineEmits(['split-by-row-change', 'print-split-procession']);

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

const splitByRow = ref(props.officialVisit?.splitByRow ?? false);

const ranksInProcessionOrder = computed(() => {
  // In the procession we want Grand Steward to be at the front (barring other overrides)
  const gStwd = ranks.value.find((r) => r.value === 'GSTWD')!;
  return [...ranks.value.filter((r) => r.value !== 'GSTWD'), gStwd];
});

const isRowsExceedingCarpetCapacity = computed(() => {
  return rows.value.length > (props.officialVisit?.carpetCapacity ?? 15);
});

const rankPrefix = (officer: Officer) => {
  if (VIP_RANKS.includes(officer.rank ?? '')) {
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

const provRankToConsider = (officer: Officer) => {
  return officer.rankOverride ?? officer.rank;
};

const rankToConsider = (officer: Officer) => {
  return officer.grandOfficer
    ? (officer.grandRank ?? provRankToConsider(officer))
    : provRankToConsider(officer);
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
    !!a.active === !!b.active && // Treat null and false as equal
    a.provOfficerYear &&
    b.provOfficerYear &&
    a.rank === b.rank
  ) {
    if (a.provOfficerYear !== b.provOfficerYear) return a.provOfficerYear - b.provOfficerYear;
  }
  return null;
};

const grandYearCompare = (a: Officer, b: Officer): number | null => {
  if (
    !!a.grandActive === !!b.grandActive && // Treat null and false as equal
    a.grandOfficerYear &&
    b.grandOfficerYear &&
    a.grandRank === b.grandRank
  ) {
    if (a.grandOfficerYear !== b.grandOfficerYear) return a.grandOfficerYear - b.grandOfficerYear;
  }
  return null;
};

const rankCompare = (a: string | null, b: string | null): number | null => {
  const aRankIndex = ranksInProcessionOrder.value.findIndex((r) => r.value === a);
  const bRankIndex = ranksInProcessionOrder.value.findIndex((r) => r.value === b);

  if (aRankIndex !== bRankIndex) {
    return (
      (aRankIndex !== -1 ? aRankIndex : ranks.value.length) -
      (bRankIndex !== -1 ? bRankIndex : ranks.value.length)
    );
  }
  return null;
};

const activeOfficerNumberCompare = (a: Officer, b: Officer): number | null => {
  const ranka = a.rank;
  const rankb = b.rank;
  if (!['JGW', 'SGW'].includes(ranka ?? '') && ranka === rankb && a.active === b.active) {
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

const isVIP = (o: Officer) => {
  return VIP_RANKS.includes(o.rank ?? '');
};

const isActiveVIP = (o: Officer) => {
  return VIP_RANKS.includes(o.rank ?? '') && o.active;
};

const isPastVIP = (o: Officer) => {
  return VIP_RANKS.includes(o.rank ?? '') && !o.active;
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

      // Past and present VIPs outrank non-VIPs
      if (isVIP(a) && !isVIP(b)) return -1;
      if (!isVIP(a) && isVIP(b)) return 1;

      // Active VIPs outrank non-active VIPs of the same rank
      if (isVIP(a) && isVIP(b) && a.rank === b.rank) {
        if (isActiveVIP(a) && isPastVIP(b)) return -1;
        if (isPastVIP(a) && isActiveVIP(b)) return 1;
      }

      // Grand officer comparisons
      if (a.grandOfficer && !b.grandOfficer) return -1;
      if (!a.grandOfficer && b.grandOfficer) return 1;

      // Grand year for equal rank and active status
      const gyRes = grandYearCompare(a, b);
      if (gyRes !== null) {
        return gyRes;
      }

      // Equal grand rank, both active or both inactive, both with the same year - defer to provincial rank and year
      if (
        a.grandOfficer &&
        b.grandOfficer &&
        a.grandRank === b.grandRank &&
        !!a.grandActive === !!b.grandActive &&
        a.grandOfficerYear === b.grandOfficerYear
      ) {
        const rRes = rankCompare(a.rank, b.rank);
        if (rRes !== null) {
          return rRes;
        }
        const pyRes = provYearCompare(a, b);
        if (pyRes !== null) {
          return pyRes;
        }
      }

      // If aligning the Prov SGW and the Prov JGW, ensure that the Prov JGW outranks all provincial officers
      // except the Prov SGW
      if (
        props.officialVisit?.alignWardens &&
        juniorWarden.value &&
        seniorWarden.value &&
        !a.grandOfficer &&
        !b.grandOfficer
      ) {
        if (a.id === juniorWarden.value.id && b.id !== seniorWarden.value.id) return -1;
        if (b.id === juniorWarden.value.id && a.id !== seniorWarden.value.id) return 1;
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
      if (a.grandOfficer && b.grandOfficer && a.grandRank === b.grandRank) {
        if (a.grandActive && !b.grandActive) return -1;
        if (!a.grandActive && b.grandActive) return 1;
      }

      // Prov Officers: active prov rank outranks non-active
      if (!a.grandOfficer && !b.grandOfficer && a.rank === b.rank) {
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
    .filter((o) => (props.officialVisit?.activeDepsFront ? true : o.rank !== 'DEPGDC'))
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
    });
  // .reverse();  We will want Deps between the Stewards and the ADCs, so do not reverse the order
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

  // Pre-seed fixed rows
  for (const [idxStr, row] of Object.entries(fixedPositionMap.value)) {
    result[Number(idxStr)] = { ...row };
  }

  const automaticOfficers = props.officialVisit?.activeDCsFront
    ? automatic.value.filter((ao) => !activeDCs.value.includes(ao))
    : automatic.value;

  const isOfficerAlreadyPlaced = (officer: Officer) => {
    return result.some((r) => r?.south?.id === officer.id || r?.north?.id === officer.id);
  };

  //
  // Sequential row cursor
  //
  let currentRowIndex = 0;

  const getOrCreateRow = (idx: number): ProcessionRow => {
    if (!result[idx]) {
      result[idx] = {};
    }

    return result[idx]!;
  };

  const addOfficer = (officer: Officer) => {
    if (isOfficerAlreadyPlaced(officer)) {
      return;
    }

    while (true) {
      const row = getOrCreateRow(currentRowIndex);

      //
      // Completely full -> move on
      //
      if (row.south && row.north) {
        currentRowIndex++;
        continue;
      }

      //
      // Fill south first
      //
      if (!row.south) {
        row.south = officer;

        //
        // If north already occupied, row is complete
        //
        if (row.north) {
          currentRowIndex++;
        }

        return;
      }

      //
      // Fill north second
      //
      if (!row.north) {
        row.north = officer;

        //
        // Row now complete
        //
        currentRowIndex++;

        return;
      }
    }
  };

  //
  // Add automatic officers
  //
  for (const officer of automaticOfficers) {
    addOfficer(officer);
  }

  //
  // Add active DCs at front
  //
  if (props.officialVisit?.activeDCsFront) {
    for (const officer of activeDCs.value) {
      addOfficer(officer);
    }
  }

  //
  // Heads of rows always appended at end
  //
  if (headSouth.value || headNorth.value) {
    result.push({
      south: headSouth.value,
      north: headNorth.value,
    });
  }

  //
  // Remove sparse empty rows
  //
  const compacted = result.filter((r) => r && (r.south || r.north));

  //
  // Warden alignment logic
  //
  if (seniorWarden.value && juniorWarden.value && props.officialVisit?.alignWardens) {
    let sgwRowIndex = -1;
    let jgwRowIndex = -1;

    compacted.forEach((row, idx) => {
      if (row.south?.id === seniorWarden.value?.id || row.north?.id === seniorWarden.value?.id) {
        sgwRowIndex = idx;
      }

      if (row.south?.id === juniorWarden.value?.id || row.north?.id === juniorWarden.value?.id) {
        jgwRowIndex = idx;
      }
    });

    if (sgwRowIndex !== -1 && jgwRowIndex !== -1 && sgwRowIndex !== jgwRowIndex) {
      const swRow = compacted[sgwRowIndex];
      const jwRow = compacted[jgwRowIndex];

      if (swRow && jwRow) {
        // Is the SGW in the north or the south?
        if (compacted[sgwRowIndex]?.south?.id === seniorWarden.value.id) {
          // In the right place already, so swap the JGW into the north of that row
          if (swRow && jwRow) {
            const officerToMove = { ...swRow.north };
            swRow.north = juniorWarden.value;
            if (jwRow.north?.id === juniorWarden.value.id) {
              jwRow.north = officerToMove as Officer;
            } else {
              jwRow.south = officerToMove as Officer;
            }
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
  }

  return compacted.filter((r) => r.south || r.north);
});

const splitRows = computed<ProcessionRow[]>(() => {
  const capacity = props.officialVisit?.carpetCapacity ?? 15;

  const processionRows = rows.value.filter(
    (row) => row.south?.position !== 'head_of_south' && row.north?.position !== 'head_of_north'
  );

  const overflowRows = processionRows.slice(capacity);
  const overflowOffset = capacity - overflowRows.length;

  const baseRows = processionRows.slice(0, capacity);

  if (splitByRow.value) {
    const result: ProcessionRow[] = [];

    const rows = processionRows; // no clone needed

    const overflowStart = overflowOffset;

    let i = 0;

    // Phase 1: inner-only rows
    while (i < overflowStart) {
      const row = rows[i];

      result.push({
        south: undefined,
        south2: row?.south,
        north: row?.north,
        north2: undefined,
      });

      i++;
    }

    // Phase 2: paired rows
    while (i < rows.length) {
      const current = rows[i];
      const next = rows[i + 1];

      result.push({
        south: next?.south,
        south2: current?.south,
        north: current?.north,
        north2: next?.north,
      });

      i += 2;
    }

    return result.filter((r) => r.south || r.south2 || r.north || r.north2);
  }

  return Array.from({ length: capacity }, (_, idx) => {
    const base = baseRows[idx];
    const overflow = idx >= overflowOffset ? overflowRows[idx - overflowOffset] : undefined;

    return {
      // South overflow becomes primary
      south: overflow?.south,
      south2: base?.south,

      // North base remains primary
      north: base?.north,
      north2: overflow?.north,
    };
  }).filter((r) => r.south || r.south2 || r.north || r.north2);
});

watch([splitByRow], () => {
  emits('split-by-row-change', splitByRow.value);
});

async function printSplitProcession() {
  emits('print-split-procession');
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
.standard-bearer {
  border: 6px solid #fbc02d;
}

.vip {
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
  .standard-bearer {
    background-color: transparent !important;
    color: black !important;
    border-color: black;
  }

  .procession-header {
    color: black !important;
  }
}
</style>
