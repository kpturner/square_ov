<template>
  <v-app>
    <v-app-bar flat class="mb-4 no-print">
      <v-btn color="grey" variant="text" small @click="logOff"> Log Off </v-btn>
      <v-spacer />
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="toggleTheme"
        variant="text"
      />
    </v-app-bar>
    <v-main>
      <v-container fluid class="pa-4">
        <client-only>
          <v-overlay v-model="loading" absolute class="d-flex align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary" />
          </v-overlay>
        </client-only>
        <v-card class="no-print">
          <v-card-title class="d-flex flex-column align-start w-100">
            <v-btn
              color="primary"
              prepend-icon="mdi-home"
              @click="$router.back()"
              class="mb-2 w-100 w-sm-auto"
              small
            >
              Back
            </v-btn>

            <div
              class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between w-100"
            >
              <div v-if="OV" class="text-subtitle-1 text-lg-h6 mb-2 mb-sm-0">
                Seat reservations for OV to {{ OV?.name || '...' }}
              </div>

              <v-btn
                color="primary"
                prepend-icon="mdi-printer"
                class="w-100 w-sm-auto"
                @click="printReservations"
              >
                Print
              </v-btn>
            </div>
          </v-card-title>

          <v-text-field
            v-model="spares"
            type="number"
            label="Spares"
            class="w-auto"
            style="max-width: 100px"
          />

          <SeatReservations
            :officers
            :spares
            @load-officers="loadOfficers"
            @delete-officer="deleteOfficer"
            @save-changes="saveAll"
          />
        </v-card>

        <v-card v-if="!loading" class="no-print">
          <v-card-title
            class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between w-100"
          >
            <v-btn
              color="primary"
              prepend-icon="mdi-home"
              @click="$router.back()"
              class="mb-2 w-100 w-sm-auto no-print"
              small
            >
              Back
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-printer"
              class="w-100 w-sm-auto no-print"
              @click="printReservations"
            >
              Print
            </v-btn>
          </v-card-title>
        </v-card>
      </v-container>
    </v-main>
    <SeatReservations
      class="only-print"
      :officers
      printMode
      :spares
      @load-officers="loadOfficers"
      @delete-officer="deleteOfficer"
      @save-changes="saveAll"
    />
  </v-app>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { OV } from '@prisma/client'
import type { GridOfficer } from '~/types/officers'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { theme, toggleTheme } = useSetTheme()

const showDeleteConfirm = ref(false)
const officerToDelete = ref<GridOfficer>(null)
const route = useRoute()
const officers = ref<GridOfficer[]>([])
const OV = ref<OV | null>(null)
const spares = ref(2)

const loading = ref(true)

onMounted(async () => {
  await loadOfficers()
})

function logOff() {
  authStore.user = null
  navigateTo('/')
}

async function loadOfficers() {
  const ovId = Number(route.params.id)
  const res = await $fetch(`/api/officers?ovId=${ovId}`)
  officers.value = res.officers
  OV.value = res.ov
    ? {
        ...res.ov,
        createdAt: new Date(res.ov.createdAt),
        ovDate: new Date(res.ov.ovDate),
      }
    : null
  loading.value = false
}

async function addOfficer() {
  await saveAll()
  officers.value.push({
    id: 0,
    name: '',
    rank: null,
    provOfficerYear: null,
    grandOfficer: false,
    grandOfficerYear: null,
    grandActive: false,
    grandRank: null,
    active: true,
    position: 'automatic',
    ovId: Number(route.params.id),
    isNew: true,
  })
}

async function deleteOfficer(officer: GridOfficer) {
  if (!officer.id) {
    officers.value = officers.value.filter((o) => o !== officer)
    return
  }

  officerToDelete.value = officer
  showDeleteConfirm.value = true
}

async function confirmedDeletion() {
  await $fetch(`/api/officers/${officerToDelete.value.id}`, { method: 'DELETE' })
  await loadOfficers()
}

async function saveAll() {
  const ovId = Number(route.params.id)
  await $fetch(`/api/officers?ovId=${ovId}`, {
    method: 'PUT',
    body: officers.value.map((o) => ({
      ...o,
      provOfficerYear: o.provOfficerYear ? Number(o.provOfficerYear) : null,
      grandOfficerYear: o.grandOfficerYear ? Number(o.grandOfficerYear) : null,
    })),
  })
  await loadOfficers()
}

function printReservations() {
  window.print()
}
</script>

<style lang="scss" scoped></style>
