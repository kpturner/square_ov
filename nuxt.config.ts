import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import type { Rank } from '~/types/officers';
import config from 'config';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  app: {
    head: {
      title: 'Square OV',
      meta: [{ name: 'description', content: 'DC tool for managing OV details.' }],
    },
  },
  css: ['@/assets/css/global.scss', '@fontsource/unifrakturmaguntia/index.css'],
  devtools: { enabled: true },
  devServer: {
    port: 4000,
  },
  runtimeConfig: {
    database: {
      user: config.get<string>('database.user'),
      pass: config.get<string>('database.password'),
      host: config.get<string>('database.host'),
      port: String(config.get('database.port')),
      name: config.get<string>('database.name'),
    },
    public: {
      logLevel: config.get('log_level'),
      logToFile: config.get<boolean>('log_to_file'),
      ranks: config.get<Rank[]>('ranks'),
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
      '/admin/import': { ssr: false },
    },
  },
});
