<template>
  <v-dialog v-model="localValue" max-width="600" @update:model-value="updateValue">
    <v-card>
      <v-card-title>Square OV Help Chat</v-card-title>
      <v-card-text class="d-flex flex-column" style="height: 400px">
        <!-- Chat messages container -->
        <div
          ref="scrollContainer"
          class="flex-grow-1 overflow-auto mb-2"
          style="padding: 0.5rem; border: 1px solid var(--v-border-color); border-radius: 6px"
        >
          <div
            v-for="(entry, i) in history"
            :key="i"
            class="mb-4"
            style="border-bottom: 1px dashed var(--v-border-color); padding-bottom: 0.5rem"
          >
            <!-- User question -->
            <div class="mb-1">
              <strong>You asked:</strong>
              <div class="pl-2" style="white-space: pre-wrap; line-height: 1.4">
                {{ entry.question }}
              </div>
            </div>

            <!-- Assistant answer / typing indicator -->
            <div v-if="entry.answer || entry.typing">
              <strong>Square OV Assistant:</strong>
              <div class="pl-2" style="white-space: pre-wrap; line-height: 1.4">
                <span v-if="entry.typing">…typing</span>
                <span v-else>{{ entry.answer }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed-height textarea -->
        <v-textarea
          v-model="input"
          label="Ask a question..."
          :disabled="disabled || typing"
          outlined
          dense
          hide-details
          rows="3"
          class="help-chat-textarea"
          @keydown.enter="onEnter"
        />

        <v-alert v-if="disabled" type="warning" dense class="mt-2">
          Chat is temporarily unavailable — no OpenAI credits.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn text @click="close">Close</v-btn>
        <v-btn text color="secondary" @click="support">Support</v-btn>
        <v-btn
          color="primary"
          text
          :disabled="disabled || !input.trim() || typing"
          @click="sendMessage"
        >
          Send
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Entry {
  question: string;
  answer?: string;
  typing?: boolean;
}

const logger = useLogger('help-chat');

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'support'): void;
}>();

const localValue = ref(props.modelValue);
const input = ref('');
const history = ref<Entry[]>([]);
const disabled = ref(false);
const typing = ref(false);
const scrollContainer = ref<HTMLDivElement>();

// Sync prop -> local
watch(
  () => props.modelValue,
  async (val) => {
    localValue.value = val;
    await nextTick();
    scrollToBottom();
  }
);

function updateValue(val: boolean) {
  localValue.value = val;
  emit('update:modelValue', val);
}

function close() {
  updateValue(false);
}

async function support() {
  emit('support');
  close();
}

function scrollToBottom() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ top: scrollContainer.value.scrollHeight });
  }
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
  const question = input.value.trim();
  if (!question || disabled.value || typing.value) return;

  // Add a new entry with typing indicator
  const entry: Entry = { question, typing: true };
  history.value.push(entry);
  input.value = '';
  typing.value = true;
  await nextTick();
  scrollToBottom();

  try {
    const res = await $fetch<{
      success: boolean;
      noCredits?: boolean;
      answer?: string;
      error?: string;
    }>('/api/openai/help-chat', {
      method: 'POST',
      body: { question },
    });

    if (res.noCredits) {
      disabled.value = true;
      entry.answer = 'Chat is temporarily unavailable — no OpenAI credits.';
    } else if (res.answer) {
      entry.answer = res.answer;
    } else if (res.error) {
      logger.error('Help chat API returned error:', res.error);
      entry.answer = `Error: ${res.error}`;
    } else {
      entry.answer = "Sorry, I couldn't get an answer.";
    }
  } catch (err) {
    const e = err as Error;
    logger.error('Help chat API exception:', e.message);
    entry.answer = `Error: ${e.message}`;
  } finally {
    entry.typing = false;
    typing.value = false;
    await nextTick();
    scrollToBottom();
  }
}
</script>

<style scoped lang="scss">
.help-chat-textarea {
  height: 4.5rem; /* exactly 3 rows high */
  min-height: 4.5rem;
  max-height: 4.5rem;
  resize: none;
}
</style>
