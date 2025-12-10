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
              :src="userData?.main_image_url ? userData.main_image_url : getImage('/card-shop.jpg')" />
          </div>
          <div class="text-h5 justify-between q-mb-sm row">
            <div>
              {{ userData.full_name }}
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
          <div v-if="!editPhone && userData?.phone" class="row items-center q-mb-sm text-h6">
            <div style="height: 40px;" class="col-10 content-center">{{ userData.phone }}</div>
            <q-icon @click="editPhone = !editPhone" name="edit" size="30px" color="green" class="col-2" />
          </div>
          <div v-else class="row items-center q-mb-sm">
            <q-icon @click="editPhone = !editPhone" name="close" size="30px" color="red" class="col-1" />
            <q-input
              class="col-9"
              dense
              outlined
              v-model="userData.phone"
              label="Телефон"
              mask="+# (###) ###-##-##"
              type="tel"
            />
            <q-icon @click="editPhoneNumber()" name="save" size="30px" color="green" class="col-2" />
          </div>

          <div class="row items-center q-mb-sm">
            <q-select
              v-model="addressesStore.address"
              :options="addressesStore.addresses"
              class="col-10"
              dense
              outlined
              label="Адрес"
              emit-value
              map-options
              option-label="address_line"
              option-value="id"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps" class="justify-between flex">
                  <q-item-section @click="mainAddress(scope.opt)">
                    <q-item-label>{{ scope.opt.address_line }}</q-item-label>
                  </q-item-section>
                  <q-item-action>
                    <q-icon
                      class="q-mr-sm"
                      color="red"
                      name="delete"
                      size="26px"
                      @click="deleteAddress(scope.opt)" />
                    <q-icon
                      color="green"
                      name="edit"
                      size="26px"
                      @click="editAddress(scope.opt)" />
                  </q-item-action>
                </q-item>
              </template>
            </q-select>
            <q-icon @click="openAddressModal()" name="add" size="34px" color="green" class="col-2" />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <AddAddressModal
      v-if="showAddressModal"
      v-model="showAddressModal"
      :newAddress="address"
    />
    <!-- отображение карты для тестов, позже удаить  -->
    <yandex-map
      v-model="map"
      :settings="{
        location: {
          center: [37.617644, 55.755819],
          zoom: 9,
        },
      }"
      width="100%"
      height="500px"
      >
      <yandex-map-default-scheme-layer/>
      <yandex-map-default-features-layer/>
      <yandex-map-default-marker :settings="{ coordinates: [37.617644, 55.755819] }"/>
    </yandex-map>
  </div>
</template>

<script setup lang="ts">
  import { Dark, useQuasar } from 'quasar';
  import { useAddressesStore } from 'src/stores/addressesStore';
  import { computed, onMounted, ref, shallowReactive } from 'vue';
  import AddAddressModal from 'components/AddAddressModal.vue';
  import { getImage } from 'src/use/useUtils';
  import { useUsersStore } from 'src/stores/usersStore';
  import { useAuthStore } from 'src/stores/authStore';
  import type { IAddresse } from 'src/types/addresse.interface';
  import { shallowRef } from 'vue';
  import type { YMap } from '@yandex/ymaps3-types';
  import {
    YandexMap,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultFeaturesLayer,
    YandexMapDefaultMarker,
  } from 'vue-yandex-maps';

  const map = shallowRef<null | YMap>(null);
  const $q = useQuasar();
  const addressesStore = useAddressesStore();
  const usersStore = useUsersStore();
  const authStore = useAuthStore();
  const isDark = computed(() => Dark.isActive);
  type Theme = 'dark' | 'light';
  const themeState = shallowReactive<Record<Theme, Theme>>({
    dark: 'dark',
    light: 'light',
  });
  const editPhone = ref(false)
  const themeStatus = computed(() => (isDark.value ? themeState.dark : themeState.light));
  const showAddressModal = ref(false);
  const themeData = ref('dark');
  const userData = ref<any>({
    full_name: '',
    mail: '',
    phone: '',
    addres: null,
  });
  const address = ref()


  onMounted(() => {
    userData.value = authStore.user
    fetchAddresses()
  })

  function mainAddress(addres: IAddresse) {
    userData.value.addres = addres
    console.log(userData.value.addres)
    updateAddress(addres)
  }

  function openAddressModal() {
    address.value = null
    showAddressModal.value = !showAddressModal.value
  }

  async function deleteAddress(addres: IAddresse) {
    try {
      $q.loading.show();
      await addressesStore.deleteAddress(addres.id!)
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }

  function editAddress(addres: IAddresse) {
    address.value = addres
    showAddressModal.value = !showAddressModal.value
  }

  async function updateAddress(addres: IAddresse) {
    try {
      $q.loading.show();
      await addressesStore.updateAddress(addres)
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }

  const themeToggle = () => {
    Dark.toggle();
    window.localStorage.setItem('theme', themeStatus.value);
  };

  function editPhoneNumber() {
    $q.dialog({
      title: 'Смена номера телефона',
      message: 'Вы уверенны что хотите изменить номер?',
      cancel: true,
      persistent: true
    }).onOk(() => {
      updateMyPhone()
    })
  }

  async function updateMyPhone() {
    try {
      $q.loading.show();
      await usersStore.updateMyPhone(userData.value.phone)
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }

  async function fetchAddresses() {
    try {
      $q.loading.show();
      const res = await addressesStore.fetchAddresses()
      if (res) {
        addressesStore.addresses = res
        addressesStore.address = res.find((item: IAddresse) => item.is_default === true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }

</script>
