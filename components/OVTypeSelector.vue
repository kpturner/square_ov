<template>
  <v-radio-group
    :model-value="modelValue"
    inline
    hide-details
    class="ma-0"
    @update:model-value="update"
  >
    <v-radio label="Craft" value="craft" />
    <v-radio label="Royal Arch" value="ra" />
  </v-radio-group>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'craft' | 'ra';
}>();

const emit = defineEmits<{
  'update:modelValue': [value: 'craft' | 'ra'];
}>();

function update(value: 'craft' | 'ra' | null) {
  if (value !== null) {
    emit('update:modelValue', value);
  }
}
</script>
