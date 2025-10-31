// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt([
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      'no-console': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/valid-v-slot': 'off',
    },
  },
]);
