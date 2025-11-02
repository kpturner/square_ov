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
          <v-card class="pa-6 mb-4">
            <v-row>
              <v-col>
                <v-text-field
                  v-model="year"
                  label="Masonic year"
                  :placeholder="String(new Date().getFullYear())"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-file-input
                  label="Official Visit spreadsheet"
                  accept=".xlsx,.xls"
                  prepend-icon="mdi-file-excel"
                  variant="outlined"
                  @change="handleFile"
                />
              </v-col>
            </v-row>
          </v-card>
          <v-card class="pa-6 mb-4">
            <span class="text-h6">Import Active Officers</span>
            <v-row>
              <v-col>
                <v-text-field v-model="aoSheetName" label="Sheet name" />
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
            <v-row> </v-row>
            <v-row>
              <v-col>
                <v-btn color="primary" @click="importOfficialVisits">Import</v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-card>
      </v-container>
    </v-main>
    <v-dialog v-model="importErrorsExist" max-width="400">
      <v-card>
        <v-card-title>Import errors</v-card-title>
        <v-card-text v-for="(e, i) of importErrorsFound" :key="i"> * {{ e }} </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="importErrorsExist = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const importErrorsExist = ref(false);
const importErrorsFound = ref<string[]>([]);

const handleFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.[0]) {
    file.value = target.files[0];
  }
};

const importActiveOfficers = async () => {
  if (!file.value) return alert('Select a file first.');
  loading.value = true;
  try {
    const data = (await readExcel(file.value, aoSheetName.value)) as ActiveOfficer[];
    const { importErrors } = await useActiveOfficerApi().import(data, year.value);
    if (importErrors.length) {
      importErrorsFound.value = importErrors;
      importErrorsExist.value = true;
      makeToast(`Errors occurred importing sheet ${aoSheetName.value} for year ${year.value}`);
    } else {
      makeToast(`Sheet ${aoSheetName.value} imported successfully for year ${year.value}`);
    }
  } catch (err) {
    makeToast((err as Error).message, 'error');
  } finally {
    loading.value = false;
  }
};

const importOfficialVisits = async () => {
  if (!file.value) return alert('Select a file first.');
  loading.value = true;
  try {
    const data = (await readExcel(file.value, ovSheetName.value)) as OVMaster[];
    const { importErrors } = await useOVMasterApi().import(data, year.value);
    if (importErrors.length) {
      importErrorsFound.value = importErrors;
      importErrorsExist.value = true;
      makeToast(`Errors occurred importing sheet ${ovSheetName.value} for year ${year.value}`);
    } else {
      makeToast(`Sheet ${ovSheetName.value} imported successfully for year ${year.value}`);
    }
  } catch (err) {
    makeToast((err as Error).message, 'error');
    logger.error((err as Error).message);
  } finally {
    loading.value = false;
  }
};

async function readExcel(file: File, sheetName: string) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  return XLSX.utils.sheet_to_json(sheet);
}
</script>
