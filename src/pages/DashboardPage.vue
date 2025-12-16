<template>
  <q-page class="q-mx-xs">
    <ProductList class="q-mb-lg" />
  </q-page>
</template>

<script setup lang="ts">
  import ProductList from 'src/components/ProductList.vue';
  import { useAddressesStore } from 'src/stores/addressesStore';
  import type { IAddresse } from 'src/types/addresse.interface';
  import { onMounted } from 'vue';

  const addressesStore = useAddressesStore();

  onMounted(() => {
    fetchAddresses();
  });

  async function fetchAddresses() {
  try {
    const res = await addressesStore.fetchAddresses();
    if (res) {
      addressesStore.addresses = res;
      const defaultAddress = res.find((item: IAddresse) => item.is_default === true);
      if (defaultAddress) {
        addressesStore.addressId = defaultAddress.id;
      }
    }
  } catch (e) {
    console.error(e);
  }
}
</script>
