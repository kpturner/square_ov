// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt([
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/valid-v-slot': 'off',
      'vue/html-self-closing': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'vue/no-unused-components': 'warn',
      'vue/no-mutating-props': 'warn',
      'vue/no-v-for-template-key': 'off',
      'object-shorthand': ['error', 'always', { avoidQuotes: true }],
      eqeqeq: ['error', 'always'],
      'linebreak-style': ['error', 'unix'],
      'prefer-const': 'error',
      'dot-notation': 'error',
      'no-unsafe-optional-chaining': 'error',
    },
  },
]);
