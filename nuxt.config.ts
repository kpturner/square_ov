import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import config from 'config';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 4000,
  },
  runtimeConfig: {
    password: config.get<string>('password'),
    stripe: {
      secretKey: config.get('stripe.secretKey'),
      webhookSecret: config.get('stripe.webhookSecret'),
    },
    database: {
      user: config.get<string>('database.user'),
      pass: config.get<string>('database.password'),
      host: config.get<string>('database.host'),
      port: config.get<number>('database.port'),
      name: config.get<string>('database.name'),
    },
    brevo: {
      apiKey: config.get<string>('brevo_api_key'),
    },
    public: {
      logLevel: config.get('log_level'),
      logToFile: config.get<boolean>('log_to_file'),
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
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
