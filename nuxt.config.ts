import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import config from 'config';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: ['@/assets/css/global.scss'],
  devtools: { enabled: true },
  devServer: {
    port: 4000,
  },
  runtimeConfig: {
    database: {
      user: config.get<string>('database.user'),
      pass: config.get<string>('database.password'),
      host: config.get<string>('database.host'),
      port: config.get<string>('database.port'),
      name: config.get<string>('database.name'),
    },
    public: {
      logLevel: config.get('log_level'),
      logToFile: config.get<boolean>('log_to_file'),
      ranks: config.get<{ value: string; text: string }[]>('ranks'),
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error for some reason I do not care about
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],
  vite: {
    server: {
      allowedHosts: true,
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  nitro: {
    routeRules: {
      '/api/webhook/stripe': { cache: false },
    },
  },
});
