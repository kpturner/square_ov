<template>
  <v-dialog v-model="localValue" max-width="600" @update:model-value="updateValue">
    <v-card>
      <v-card-title>Support Request</v-card-title>
      <v-card-text>
        <v-text-field v-model="subject" autofocus label="Subject" />

        <v-textarea
          v-model="question"
          label="Ask a question..."
          outlined
          dense
          hide-details
          rows="10"
          class="help-chat-textarea"
          @keydown.enter="onEnter"
        />

        <v-alert v-if="problem" type="warning" dense class="mt-2">
          All fields must be completed
        </v-alert>

        <v-alert type="warning" dense class="mt-2">
          Make sure you check your SPAM for replies.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Close</v-btn>
        <v-btn color="primary" text @click="sendMessage"> Send </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const logger = useLogger('support');
const makeToast = useToast();
const authStore = useAuthStore();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const localValue = ref(props.modelValue);
const question = ref('');
const subject = ref('');
const problem = ref(false);

watch(
  () => props.modelValue,
  async (val) => {
    localValue.value = val;
    if (val) {
      subject.value = '';
      question.value = '';
      problem.value = false;
    }
  }
);

function updateValue(val: boolean) {
  localValue.value = val;
  emit('update:modelValue', val);
}

function close() {
  updateValue(false);
}

const onEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) {
    // allow newline
    return;
  }

  e.preventDefault();
  sendMessage();
};

async function sendMessage() {
  if (!subject.value || !question.value) {
    problem.value = true;
    return;
  }
  try {
    problem.value = false;
    await useApi()('/api/admin/support', {
      method: 'POST',
      body: { email: authStore.user?.email, subject: subject.value, question: question.value },
    });
    makeToast('Support message sent successfully');
    close();
  } catch (err) {
    const e = err as Error;
    logger.error('Help chat API exception:', e.message);
    makeToast('Support message send failed!', 'error');
  }
}
</script>

<style scoped lang="scss"></style>
