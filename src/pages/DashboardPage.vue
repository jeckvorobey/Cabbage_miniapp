<template>
  <q-page class="q-mx-xs">
    <ProductList class="q-mb-lg"></ProductList>
  </q-page>
</template>

<script setup lang="ts">
  import { useQuasar } from 'quasar';
  import ProductList from 'src/components/ProductList.vue';
  import { useAddressesStore } from 'src/stores/addressesStore';
  import type { IAddresse } from 'src/types/addresse.interface';
  import { onMounted } from 'vue';

  const $q = useQuasar();
  const addressesStore = useAddressesStore();

  onMounted(() => {
    fetchAddresses()
  })

  async function fetchAddresses() {
    try {
      $q.loading.show();
      const res = await addressesStore.fetchAddresses()
      if (res) {
        addressesStore.addresses = res
        const address = res.find((item: IAddresse) => item.is_default === true);
        addressesStore.addressId = address.id
      }
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }
</script>
