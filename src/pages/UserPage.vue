<template>
  <div>
    <h6 class="text-center q-mb-md">Личный кабинет</h6>
    <div class="q-pa-sm">
      <q-card class="my-card full-height" flat bordered>
        <q-card-section>
          <div class="text-h6">Ваши данные:</div>
          <q-input class="q-mb-sm" outlined v-model="userData.name" label="Имя" />
          <q-input class="q-mb-sm" outlined v-model="userData.phone" label="Телефон" />
          <q-input class="q-mb-sm" outlined v-model="userData.mail" label="Mail" />
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
  import { useQuasar } from 'quasar';
  import { useAddressesStore } from 'src/stores/addressesStore';
  import { onMounted, ref } from 'vue';
  import AddAddressModal from 'components/AddAddressModal.vue';

  const $q = useQuasar();
  const addressesStore = useAddressesStore();
  const showAddressModal = ref(false);
  const userData = ref<any>({
    name: '',
    mail: '',
    phone: '',
    addres: '',
  });

  onMounted(() => {
    fetchAddresses()
  })

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
