<template>
  <v-data-table
    :headers="headers"
    :items="customers"
    :sort-by="[{ key: 'instance', order: 'asc' }]"
  >
    <template v-slot:[`item.subscribed`]="{ item }">
      <v-checkbox
        v-model="item.subscribed"
        :label="''"
        readonly
      />
    </template>
    <template v-slot:[`item.trial`]="{ item }">
      <v-checkbox
        v-model="item.trial"
        :label="''"
        readonly
      />
    </template>
    <template v-slot:[`item.unitType`]="{ item }">
      <span>{{ unitTypes.find((ut) => ut.value === item.unitType)?.title }}</span>
    </template>
    <template v-slot:[`item.trialEnd`]="{ item }">
      <span>{{ item.trialEnd ? moment(item.trialEnd).format('DD/MM/YYYY') : '' }}</span>
    </template>
    <template v-slot:[`item.cancelledAt`]="{ item }">
      <span>{{ item.cancelledAt ? moment(item.cancelledAt).format('DD/MM/YYYY') : '' }}</span>
    </template>
    <template v-slot:[`item.unitPrice`]="{ item }">
      <span>{{ item.unitPrice ? (item.unitPrice / 100).toFixed(2) : '' }}</span>
    </template>
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Customers</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>

        <v-btn
          icon
          @click="searchDialog = true"
        >
          <v-badge
            color="blue"
            dot
            :model-value="Object.keys(where).length > 0"
            offset-x="10"
            offset-y="10"
          >
            <v-btn
              icon
              @click="searchDialog = true"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-badge>
        </v-btn>
        <v-dialog
          v-model="dialog"
          max-width="800px"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              class="mb-2"
              color="primary"
              v-bind="props"
            >
              New Customer
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-form @keyup.enter="save">
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedItem.name"
                        label="Customer name"
                        autofocus
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedItem.stripeCustomerId"
                        label="Stripe Customer Id"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedItem.email"
                        label="Email"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedItem.instance"
                        label="Instance"
                      ></v-text-field>
                    </v-col>

                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedItem.lodge"
                        label="Lodge"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-number-input
                        control-variant="stacked"
                        v-model="editedItem.lodgeNo"
                        label="Lodge No"
                      ></v-number-input>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-select
                        v-model="editedItem.unitType"
                        :items="unitTypes"
                        label="Unit type"
                      ></v-select>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-checkbox
                        v-model="editedItem.trial"
                        label="Trial"
                      ></v-checkbox>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="formattedTrialEnd"
                        label="Trial End"
                        type="date"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="5"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedItem.lastEvent"
                        label="Last event"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-checkbox
                        v-model="editedItem.subscribed"
                        label="Subscribed"
                      ></v-checkbox>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-number-input
                        control-variant="stacked"
                        v-model="editedItem.quantity"
                        label="Quantity"
                      ></v-number-input>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-number-input
                        control-variant="stacked"
                        v-model="editedItem.unitPrice"
                        label="Unit price"
                      ></v-number-input>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="12"
                    >
                      <v-text-field
                        v-model="editedItem.cancelledReason"
                        label="Cancelled reason"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="formattedCancelledAt"
                        label="Cancelled at"
                        type="date"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-alert
                    v-if="fetchError"
                    type="error"
                    variant="outlined"
                  >
                    {{ actualError }}
                  </v-alert>
                </v-container>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="searchDialog"
          max-width="800px"
        >
          <v-card>
            <v-card-title>
              <span class="text-h5">Search</span>
            </v-card-title>
            <v-form @keyup.enter="search">
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="searchItem.name"
                        label="Customer name"
                        autofocus
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="searchItem.stripeCustomerId"
                        label="Stripe Customer Id"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="searchItem.email"
                        label="Email"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="searchItem.instance"
                        label="Instance"
                      ></v-text-field>
                    </v-col>

                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-text-field
                        v-model="searchItem.lodge"
                        label="Lodge"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-number-input
                        control-variant="stacked"
                        v-model="searchItem.lodgeNo"
                        label="Lodge No"
                      ></v-number-input>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-select
                        v-model="searchItem.unitType"
                        :items="unitTypes"
                        label="Unit type"
                      ></v-select>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-badge
                        color="blue"
                        dot
                        :model-value="searchItem.subscribed !== null"
                        offset-x="85"
                        offset-y="10"
                      >
                        <v-checkbox
                          v-model="searchItem.subscribed"
                          label="Subscribed"
                        ></v-checkbox>
                      </v-badge>
                    </v-col>
                    <v-col
                      cols="12"
                      md="4"
                      sm="6"
                    >
                      <v-badge
                        color="blue"
                        dot
                        :model-value="searchItem.trial !== null"
                        offset-x="35"
                        offset-y="10"
                      >
                        <v-checkbox
                          v-model="searchItem.trial"
                          label="Trial"
                        ></v-checkbox>
                      </v-badge>
                    </v-col>
                    <v-col
                      cols="12"
                      md="5"
                      sm="6"
                    >
                      <v-text-field
                        v-model="searchItem.lastEvent"
                        label="Last event"
                      ></v-text-field>
                    </v-col>

                    <v-col
                      cols="12"
                      sm="12"
                    >
                      <v-text-field
                        v-model="searchItem.cancelledReason"
                        label="Cancelled reason"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
            </v-form>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="searchDialog = false"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="clear"
              >
                Clear
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="search"
              >
                Search
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="dialogDelete"
          max-width="500px"
        >
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        class="me-2"
        size="small"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        size="small"
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="reset"
      >
        Reset
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
import moment from 'moment';

const dialog = ref(false);
const searchDialog = ref(false);
const dialogDelete = ref(false);
const editedIndex = ref(-1);
const fetchError = ref(false);
const actualError = ref('');

const unitTypes = [
  { title: 'Craft', value: 'C' },
  { title: 'Royal Arch', value: 'RA' },
  { title: 'Mark', value: 'MARK' },
  { title: 'Rose Croix', value: 'RC' },
  { title: 'Royal Order of Scotland', value: 'ROS' },
];

const headers = ref([
  { title: 'Actions', key: 'actions', sortable: false },
  { title: 'Id', key: 'id' },
  { title: 'Stripe id', key: 'stripeCustomerId' },
  { title: 'Instance', key: 'instance' },
  { title: 'Subscribed', key: 'subscribed' },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Lodge', key: 'lodge' },
  { title: 'Lodge no', key: 'lodgeNo' },
  { title: 'Unit type', key: 'unitType' },
  { title: 'Trial?', key: 'trial' },
  { title: 'Trial end', key: 'trialEnd' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Unit price', key: 'unitPrice' },
  { title: 'Last event', key: 'lastEvent' },
  { title: 'Cancelled at', key: 'cancelledAt' },
  { title: 'Cancelled reason', key: 'cancelledReason' },
]);

const customers = ref([]);
const where = ref({});

// const { data, refresh } = useFetch(`/api/customers?where=${JSON.stringify(where.value)}`);
const { data, refresh } = useAsyncData('customers', async () => {
  const query = `?where=${JSON.stringify(where.value)}`;
  return $fetch(`/api/customers${query}`);
});
watch(data, (newData) => (customers.value = newData));
watch(where, () => {
  refresh(); // Trigger the refresh when `where` changes
});

const defaultItem = {
  id: null,
  stripeCustomerId: null,
  name: null,
  email: null,
  instance: null,
  lodge: null,
  lodgeNo: null,
  unitType: null,
  trial: null,
  subscribed: null,
  quantity: null,
  unitPrice: null,
  trialEnd: null,
  lastEvent: null,
};

let editedItem = reactive({ ...defaultItem });
let searchItem = reactive({ ...defaultItem });

const formTitle = computed(() => (editedIndex.value === -1 ? 'New Customer' : 'Edit Customer'));

const editItem = (item) => {
  editedIndex.value = customers.value.indexOf(item);
  Object.assign(editedItem, item);
  dialog.value = true;
};

const deleteItem = (item) => {
  editedIndex.value = customers.value.indexOf(item);
  Object.assign(editedItem, item);
  dialogDelete.value = true;
};

const deleteItemConfirm = async () => {
  await $fetch('/api/customers', { method: 'DELETE', body: editedItem });
  refresh();
  closeDelete();
};

const reset = () => {
  clear();
  search();
};

const clear = () => {
  Object.assign(searchItem, defaultItem);
};

const close = async () => {
  dialog.value = false;
  fetchError.value = false;
  await nextTick();
  Object.assign(editedItem, defaultItem);
  editedIndex.value = -1;
};

const closeDelete = async () => {
  dialogDelete.value = false;
  await nextTick();
  Object.assign(editedItem, defaultItem);
  editedIndex.value = -1;
};

const save = async () => {
  fetchError.value = false;
  try {
    if (editedIndex.value > -1) {
      await $fetch('/api/customers', { method: 'PUT', body: editedItem });
    } else {
      delete editedItem.id;
      await $fetch('/api/customers', { method: 'POST', body: editedItem });
    }
    refresh();
    close();
  } catch (error) {
    actualError.value = error.message;
    fetchError.value = true;
  }
};

const search = async () => {
  const newWhere = {};
  Object.keys(searchItem).forEach((key) => {
    if (searchItem[key] !== undefined && searchItem[key] !== null) {
      if (typeof searchItem[key] === 'string') {
        newWhere[key] = { contains: searchItem[key] };
      } else if (typeof searchItem[key] === 'boolean') {
        newWhere[key] = searchItem[key];
      } else {
        newWhere[key] = searchItem[key];
      }
    }
  });
  where.value = newWhere;
  searchDialog.value = false;
};

const formattedTrialEnd = computed({
  get() {
    return editedItem.trialEnd ? moment(editedItem.trialEnd).format('YYYY-MM-DD') : null;
  },
  set(value) {
    // When the value is updated, make sure it's in the correct format
    editedItem.trialEnd = moment(value, 'YYYY-MM-DD').toDate();
  },
});

const formattedCancelledAt = computed({
  get() {
    return editedItem.cancelledAt ? moment(editedItem.cancelledAt).format('YYYY-MM-DD') : null;
  },
  set(value) {
    // When the value is updated, make sure it's in the correct format
    editedItem.cancelledAt = moment(value, 'YYYY-MM-DD').toDate();
    console.log(editedItem.cancelledAt, 'editedItem.cancelledAt');
  },
});
</script>
