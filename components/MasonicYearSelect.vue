<template>
  <v-select
    :model-value="modelValue"
    :items="years"
    class="mb-4"
    prepend-inner-icon="mdi-calendar"
    label="Masonic year"
    hide-details
    :loading="loading"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const { masonicYear } = useMasonicYear();

const years = ref<string[]>([]);
const loading = ref(false);

const fetchYears = async () => {
  loading.value = true;

  try {
    years.value = await $fetch<string[]>('/api/masonic-years');

    // Include the current/default year even if it has no records yet.
    if (!years.value.includes(props.modelValue || masonicYear)) {
      years.value.push(props.modelValue || masonicYear);
    }

    years.value.sort((a, b) => b.localeCompare(a));
  } finally {
    loading.value = false;
  }
};

onMounted(fetchYears);
</script>
