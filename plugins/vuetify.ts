import '@mdi/font/css/materialdesignicons.css';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
// import * as components from 'vuetify/components';
// import * as directives from 'vuetify/directives';
import { VNumberInput } from 'vuetify/labs/VNumberInput';
import { VDateInput } from 'vuetify/labs/VDateInput';

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components: {
      VNumberInput,
      VDateInput,
    },
    //directives,
  });
  app.vueApp.use(vuetify);
});
