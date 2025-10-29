<template>
  <v-dialog
    :model-value="localValue"
    @update:model-value="updateValue"
    max-width="400"
  >
    <v-card>
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="cancel"
          >Cancel</v-btn
        >
        <v-btn
          :color="color"
          text
          @click="confirm"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Confirm' },
  message: { type: String, required: true },
  color: { type: String, default: 'primary' },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// Local ref to control v-dialog
const localValue = ref(props.modelValue);

// Sync prop -> local
watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val;
  }
);

function updateValue(val: boolean) {
  localValue.value = val;
  emit('update:modelValue', val);
}

function confirm() {
  emit('confirm');
  updateValue(false);
}

function cancel() {
  emit('cancel');
  updateValue(false);
}
</script>
