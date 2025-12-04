<template>
  <div>
    <h6 class="text-center q-mb-md">Личный кабинет</h6>
    <div class="q-pa-sm">
      <q-card class="my-card full-height" flat bordered>
        <q-card-section>
          <div class="justify-center row q-mb-md">
            <q-img
              class="radius-100"
              height="120px"
              width="120px"
              :src="getImage('/card-shop.jpg')" />
          </div>
          <div class="text-h5 justify-between q-mb-sm row">
            <div>
              {{ user.full_name }}
            </div>
            <div>
              <q-btn-toggle
                v-model="themeData"
                size="sm"
                no-caps
                unelevated
                dense
                toggle-color="grey-9"
                color="white"
                text-color="grey-9"
                :options="[
                  { value: 'dark', slot: 'dark', title: 'Dark mode' },
                  { value: 'light', slot: 'light', title: 'Light mode' },
                ]"
                @click="themeToggle()"
              >
                <template v-slot:dark>
                  <div class="items-center">
                    <q-icon name="nightlight" />
                  </div>
                </template>

                <template v-slot:light>
                  <div class="items-center">
                    <q-icon name="light_mode" />
                  </div>
                </template>
              </q-btn-toggle>
            </div>

          </div>
          <q-input
            class="q-mb-sm"
            outlined
            v-model="userData.phone"
            label="Телефон"
            mask="+# (###) ###-##-##"
            type="tel"
            />
          <div class="row items-center q-mb-sm">
            <q-select
              v-model="userData.addres"
              :options="addressesStore.addresses"
              class="col-10"
              outlined
              label="Адрес"
              emit-value
              map-options
              option-label="address_line"
              option-value="id"
            />
            <q-icon @click="showAddressModal = !showAddressModal" name="add" size="34px" color="green" class="col-2" />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <AddAddressModal
      v-if="showAddressModal"
      v-model="showAddressModal"
    />
  </div>
</template>

<script setup lang="ts">
  import { Dark, useQuasar } from 'quasar';
  import { useAddressesStore } from 'src/stores/addressesStore';
  import { computed, onMounted, ref, shallowReactive } from 'vue';
  import AddAddressModal from 'components/AddAddressModal.vue';
  import { getImage } from 'src/use/useUtils';

  const $q = useQuasar();
  const addressesStore = useAddressesStore();
  const isDark = computed(() => Dark.isActive);
  type Theme = 'dark' | 'light';
  const themeState = shallowReactive<Record<Theme, Theme>>({
    dark: 'dark',
    light: 'light',
  });

  const themeStatus = computed(() => (isDark.value ? themeState.dark : themeState.light));
  const showAddressModal = ref(false);
  const themeData = ref('dark');
  const userData = ref<any>({
    full_name: '',
    mail: '',
    phone: '',
    addres: '',
  });

  const user = {
    "id": 4,
    "full_name": "Denis Ivanov",
    "phone": null,
    "subscribe_news": true,
    "role": 1,
    "is_user": false,
    "language_code": "ru",
    "is_premium": false,
    "main_image_url": "https://api.telegram.org/file/bot7772150741:AAFpK9oECUvBzrE8Kdh-fc1Io18ucALDvgI/photos/file_11.jpg",
    "is_bot": false
}

  onMounted(() => {
    fetchAddresses()
  })

  const themeToggle = () => {
    Dark.toggle();
    window.localStorage.setItem('theme', themeStatus.value);
  };

  async function fetchAddresses() {
    try {
      $q.loading.show();
      const res = await addressesStore.fetchAddresses()
      if (res) addressesStore.addresses = res.items
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }

</script>
