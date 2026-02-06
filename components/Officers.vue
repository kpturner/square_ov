<template>
  <v-responsive class="hidden-md-and-down">
    <v-data-table
      :headers
      :items="sortedOfficers"
      :items-per-page="officers.length"
      item-value="id"
      class="mt-2"
      density="compact"
      :row-props="getRowProps"
    >
      <template #item.name="{ item }">
        <v-text-field
          v-model="item.name"
          density="compact"
          hide-details
          placeholder="Name"
          :autofocus="item.id === justAddedId"
          @focus="justAddedId = null"
        />
      </template>

      <template #item.rank="{ item }">
        <v-select
          v-model="item.rank"
          :items="[{ value: '' }, ...ranks]"
          item-title="value"
          density="compact"
          hide-details
          placeholder="Prov rank"
        />
      </template>

      <template #item.attending="{ item }">
        <div class="checkbox-cell">
          <v-tooltip text="Attending">
            <template #activator="{ props: tooltipProps }">
              <v-checkbox
                v-bind="tooltipProps"
                v-model="item.attending"
                hide-details
                density="compact"
              />
            </template>
          </v-tooltip>
        </div>
      </template>

      <template #item.provOfficerYear="{ item }">
        <v-text-field v-model="item.provOfficerYear" type="number" density="compact" hide-details />
      </template>

      <template #item.active="{ item }">
        <div class="checkbox-cell">
          <v-checkbox v-model="item.active" hide-details density="compact" />
        </div>
      </template>

      <template #item.grandOfficer="{ item }">
        <div class="checkbox-cell">
          <v-checkbox v-model="item.grandOfficer" hide-details density="compact" />
        </div>
      </template>

      <template #item.grandOfficerYear="{ item }">
        <v-text-field
          v-model="item.grandOfficerYear"
          type="number"
          density="compact"
          hide-details
          :disabled="!item.grandOfficer"
        />
      </template>

      <template #item.grandRank="{ item }">
        <v-select
          v-model="item.grandRank"
          :items="
            [{ value: '' }, ...ranks].filter((r) => !['PGM', 'DPGM', 'APGM'].includes(r.value))
          "
          item-title="value"
          density="compact"
          hide-details
          placeholder="Grand rank"
          :disabled="!item.grandOfficer"
        />
      </template>

      <template #item.grandActive="{ item }">
        <div class="checkbox-cell">
          <v-checkbox
            v-model="item.grandActive"
            hide-details
            density="compact"
            :disabled="!item.grandOfficer"
          />
        </div>
      </template>

      <template #item.position="{ item }">
        <v-select
          v-model="item.position"
          :items="availablePositions"
          density="compact"
          hide-details
        />
      </template>

      <template #item.excludeFromProcession="{ item }">
        <div class="checkbox-cell">
          <v-tooltip text="Exclude from procession">
            <template #activator="{ props: tooltipProps }">
              <v-checkbox
                v-bind="tooltipProps"
                v-model="item.excludeFromProcession"
                hide-details
                density="compact"
              />
            </template>
          </v-tooltip>
        </div>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-card-account-details-outline"
          size="small"
          color="primary"
          title="Contact details"
          @click="emits('officer-contact-details', item)"
        />
        <v-btn
          icon="mdi-delete"
          size="small"
          color="red"
          title="Delete officer"
          @click="emits('delete-officer', item)"
        />
      </template>
    </v-data-table>
  </v-responsive>

  <!-- MOBILE / TABLET CARDS -->
  <v-responsive class="hidden-lg-and-up">
    <v-row dense>
      <v-col v-for="(item, i) in sortedOfficers" :key="item.id ?? i" cols="12">
        <v-card
          :ref="(el) => setCardRef(item.id!, el as HTMLElement)"
          class="officer-card pa-3 mb-2"
          elevation="3"
          variant="tonal"
        >
          <v-row dense>
            <v-col cols="6">
              <v-checkbox
                v-model="item.attending"
                label="Attending"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col cols="6">
              <v-checkbox
                v-model="item.original"
                label="Allocated officer"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="item.name"
                label="Name"
                density="compact"
                :autofocus="item.id === justAddedId"
                @focus="justAddedId = null"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="item.rank"
                :items="[{ value: '', title: '' }, ...ranks]"
                label="Provincial Rank"
                density="compact"
                placeholder="Prov rank"
              />
            </v-col>

            <v-col cols="6">
              <v-checkbox v-model="item.active" label="Active" hide-details density="compact" />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="item.provOfficerYear"
                type="number"
                label="Provincial Officer Year"
                density="compact"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="item.position"
                :items="availablePositions"
                label="Position"
                density="compact"
              />
            </v-col>

            <v-col cols="6">
              <v-checkbox
                v-model="item.grandOfficer"
                label="Grand Officer"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col v-if="item.grandOfficer" cols="6">
              <v-checkbox
                v-model="item.grandActive"
                label="Active"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col v-if="item.grandOfficer" cols="12">
              <v-select
                v-model="item.grandRank"
                :items="
                  [{ value: '', title: '' }, ...ranks].filter(
                    (r) => !['PGM', 'DPGM', 'APGM'].includes(r.value)
                  )
                "
                label="Grand rank"
                density="compact"
                placeholder="Grand rank"
              />
            </v-col>

            <v-col v-if="item.grandOfficer" cols="12">
              <v-text-field
                v-model="item.grandOfficerYear"
                type="number"
                label="Grand Officer Year"
                density="compact"
              />
            </v-col>

            <v-col cols="12">
              <v-checkbox
                v-model="item.excludeFromProcession"
                label="Exclude from procession"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="item.email" type="string" label="Email" density="compact" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="item.phone" type="string" label="Phone" density="compact" />
            </v-col>
          </v-row>
          <v-row dense align="center" justify="end" class="mt-2">
            <v-btn
              class="me-2"
              icon="mdi-content-save"
              color="success"
              size="small"
              title="save changes"
              @click="emits('save-changes')"
            />
            <v-btn
              icon="mdi-delete"
              color="red"
              size="small"
              title="Delete officer"
              @click="emits('delete-officer', item)"
            />
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-responsive>
</template>

<script setup lang="ts">
import type { Rank } from '~/types/officers';
import type { Officer, Position } from '@prisma/client';

const props = defineProps<{ officers: Officer[] }>();

const justAddedId = ref<string | number | null>(null);

const getRowProps = ({ item }: { item: Officer }) => {
  return item.id === justAddedId.value ? { 'data-new-row': 'true' } : {};
};

const cardRefs = ref<Record<string | number, HTMLElement>>({});

const setCardRef = (id: string | number, el: HTMLElement | null) => {
  if (!el) return;

  // If el is a component instance (Vuetify)
  if ('$el' in el) {
    cardRefs.value[id] = el.$el as HTMLElement;
  } else {
    // raw HTMLElement
    cardRefs.value[id] = el as HTMLElement;
  }
};

const emits = defineEmits(['delete-officer', 'save-changes', 'officer-contact-details']);

const ranks = useRuntimeConfig().public.ranks as Rank[];

// Do not use useApi() here
const _positionsRes = await $fetch<Position>('/api/ov/positions');
const positions = _positionsRes ?? [];

const sortedOfficers = computed(() => {
  const priority = {
    vip: 1,
    sword_bearer: 2,
    standard_bearer: 3,
    head_of_south: 4,
    head_of_north: 5,
  };

  return [...props.officers].sort((a, b) => {
    const aPriority = priority[a.position as keyof typeof priority] || 999;
    const bPriority = priority[b.position as keyof typeof priority] || 999;
    return aPriority - bPriority;
  });
});

const availableOfficers = computed(() => {
  return props.officers.filter(
    (o) =>
      !['vip', 'sword_bearer', 'standard_bearer'].includes(o.position ?? '') &&
      !o.excludeFromProcession
  );
});

const processionRows = computed(() => {
  return Math.ceil(availableOfficers.value.length / 2);
});

const dynamicRowPositions = computed(() => {
  const rows = [];

  for (let n = 1; n <= processionRows.value; n++) {
    if (n === processionRows.value) {
      // Last row
      if (availableOfficers.value.length % 2 === 0) {
        // Even number
        rows.push(`row_${n}_south`);
        rows.push(`row_${n}_north`);
      } else {
        // Odd number
        rows.push(`row_${n}_south`);
      }
    } else {
      rows.push(`row_${n}_south`);
      rows.push(`row_${n}_north`);
    }
  }
  return rows;
});

const allPositions = computed(() => {
  return [...positions, ...dynamicRowPositions.value];
});

const lastRowSouth = computed(() => `row_${processionRows.value}_south`);
const lastRowNorth = computed(() => `row_${processionRows.value}_north`);

const availablePositions = computed(() => {
  return allPositions.value.filter((pos: string) => {
    // 'automatic' always allowed
    if (pos === 'automatic') return true;

    // head_of_xxxx being selected means that the row_n_xxxx cannot be an option
    if (
      pos === lastRowSouth.value &&
      props.officers.some((officer) => officer.position === 'head_of_south')
    ) {
      return false;
    }
    if (
      pos === lastRowNorth.value &&
      props.officers.some((officer) => officer.position === 'head_of_north')
    ) {
      return false;
    }

    // ...and of course, vice versa
    if (
      pos === 'head_of_south' &&
      props.officers.some((officer) => officer.position === lastRowSouth.value)
    ) {
      return false;
    }
    if (
      pos === 'head_of_north' &&
      props.officers.some((officer) => officer.position === lastRowNorth.value)
    ) {
      return false;
    }

    // Check if any officer is using that position
    return !props.officers.some((officer) => officer.position === pos);
  });
});

const headers = [
  { title: 'Att', key: 'attending', align: 'center' as const },
  { title: 'Name', key: 'name', minWidth: '230px' },
  { title: 'Provincial Rank', key: 'rank', width: '200px' },
  { title: 'Active', key: 'active', align: 'center' as const },
  { title: 'Prov year', key: 'provOfficerYear', width: '115px' },
  { title: 'Position in procession', key: 'position', width: '210px' },
  { title: 'GO', key: 'grandOfficer', align: 'center' as const },
  { title: 'Grand Rank', key: 'grandRank', width: '200px' },
  { title: 'Active', key: 'grandActive', align: 'center' as const },
  { title: 'GR year', key: 'grandOfficerYear', width: '115px' },
  { title: 'Excl', key: 'excludeFromProcession', align: 'center' as const },
  { title: '', key: 'actions', sortable: false, align: 'center' as const, width: '120px' },
];

watch(
  () => props.officers.length,
  async (newLen, oldLen) => {
    if (newLen <= oldLen) return;
    if (oldLen === 0) return; // Don't do this on the initial load

    const isVisible = (el: HTMLElement | null) => {
      if (!el) return true;
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    };

    const newOfficer = props.officers[newLen - 1];
    justAddedId.value = newOfficer?.id ?? null;

    if (justAddedId.value === null) return;

    await nextTick();

    const row = document.querySelector('tr[data-new-row="true"]');

    if (row && !isVisible(row as HTMLElement)) {
      row?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    if (newOfficer === undefined) return;
    const cardEl = cardRefs.value[newOfficer.id] ?? null;
    if (cardEl && !isVisible(cardEl)) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
);
</script>

<style lang="scss" scoped>
.checkbox-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}
.checkbox-cell .v-checkbox {
  margin: 0 !important; /* remove Vuetify checkbox margin */
}
::v-deep(.v-data-table th),
::v-deep(.v-data-table td) {
  padding-left: 4px !important;
  padding-right: 4px !important;
}
::v-deep(.officer-card) {
  border: 1px solid rgba(255, 255, 255, 0.12); /* visible in dark mode */
  border-radius: 8px;
}

.theme--light .officer-card {
  border-color: rgba(0, 0, 0, 0.12);
}
</style>
