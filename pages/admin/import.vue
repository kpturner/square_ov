<template>
  <v-app>
    <v-app-bar flat class="mb-4">
      <v-spacer />
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        @click="toggleTheme"
      />
    </v-app-bar>
    <v-main>
      <v-container>
        <client-only>
          <v-overlay v-model="loading" absolute class="d-flex align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary" />
          </v-overlay>
        </client-only>
        <v-card variant="tonal" class="pa-6">
          <v-card-title class="d-flex flex-column align-start w-100">
            <v-btn
              color="primary"
              prepend-icon="mdi-home"
              class="mb-2 w-100 w-sm-auto"
              small
              @click="$router.push('/home')"
            >
              Home
            </v-btn>
            <div class="d-flex align-center">
              <span class="text-h5">Import Spreadsheet Data</span>
            </div>
          </v-card-title>
          <v-row>
            <v-col>
              <v-text-field
                v-model="year"
                label="Masonic year"
                :placeholder="String(new Date().getFullYear())"
              />
            </v-col>
          </v-row>
          <v-card class="pa-6 mb-4">
            <span class="text-h6">Import Active Officers</span>
            <v-row>
              <v-col>
                <v-text-field v-model="aoSheetName" label="Sheet name" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <input type="file" accept=".xlsx,.xls" @change="handleFile" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn color="primary" @click="importActiveOfficers">Import</v-btn>
              </v-col>
            </v-row>
          </v-card>
          <v-card class="pa-6">
            <span class="text-h6">Import Official Visits</span>
            <v-row>
              <v-col>
                <v-text-field v-model="ovSheetName" label="Sheet name" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <input type="file" accept=".xlsx,.xls" @change="handleOVFile" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn color="primary" @click="importOfficialVisits">Import</v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx';
import type { ActiveOfficer, OVMaster } from '@prisma/client';

const logger = useLogger('import');

const makeToast = useToast();
const { theme, toggleTheme } = useSetTheme();
const loading = ref(false);
const { masonicYear } = useMasonicYear();
const year = ref(masonicYear);
const aoSheetName = ref('Active Officers');
const ovSheetName = ref(`${masonicYear} Visits`);
const file = ref<File | null>(null);
const ovFile = ref<File | null>(null);

const handleFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.[0]) {
    file.value = target.files[0];
  }
};

const handleOVFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.[0]) {
    ovFile.value = target.files[0];
  }
};

const importActiveOfficers = async () => {
  if (!file.value) return alert('Select a file first.');
  loading.value = true;
  try {
    const data = (await readExcel(file.value, aoSheetName.value)) as ActiveOfficer[];
    await useActiveOfficerApi().import(data, year.value);
    makeToast(`Sheet ${aoSheetName.value} imported successfully for year ${year.value}`);
  } catch (err) {
    makeToast((err as Error).message, 'error');
  }
  loading.value = false;
};

const importOfficialVisits = async () => {
  if (!ovFile.value) return alert('Select a file first.');
  loading.value = true;
  try {
    const data = (await readExcel(ovFile.value, ovSheetName.value)) as OVMaster[];
    await useOVMasterApi().import(data, year.value);
    makeToast(`Sheet ${ovSheetName.value} imported successfully for year ${year.value}`);
  } catch (err) {
    makeToast((err as Error).message, 'error');
    logger.error((err as Error).message);
  }
  loading.value = false;
};

async function readExcel(file: File, sheetName: string) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  return XLSX.utils.sheet_to_json(sheet);
}
</script>
