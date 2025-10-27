import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
// import * as components from 'vuetify/components';
// import * as directives from 'vuetify/directives';

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    //directives,
    theme: {
      defaultTheme: 'dark', // can be 'light' if you prefer
      themes: {
        light: {
          dark: false,
          colors: {
            background: '#FFFFFF',
            surface: '#FFFFFF',
            primary: '#1976D2',
            secondary: '#424242',
          },
        },
        dark: {
          dark: true,
          colors: {
            background: '#121212',
            surface: '#1E1E1E',
            primary: '#90CAF9',
            secondary: '#B0BEC5',
          },
        },
      },
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
  });
  app.vueApp.use(vuetify);
});
