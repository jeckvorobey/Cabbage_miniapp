<template>
  <q-list>
    <div class="border-bot q-mb-md">
      <div class="text-bold">Адресс доставки:</div>
      <div v-if="addressesStore?.addresses?.length">
        <div v-for="(addre, aIndex) in addressesStore.addresses" :key="aIndex">
          <q-radio v-model="addressesStore.addressId" :val="addre.id" :label="addre.address_line" color="green"/>
        </div>
      </div>
    </div>
    <!-- Способы оплаты -->
    <!-- <div class="border-bot q-mb-md">
      <div class="text-bold">Способ оплаты:</div>
      <div v-for="(payment, pIndex) in paymentsStore.paymentsMethods" :key="pIndex">
        <q-radio v-model="orderStore.orderDataByPay.payment_method" :val="payment.id" :label="payment.name" color="green"/>
      </div>
    </div> -->
  </q-list>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAddressesStore } from 'src/stores/addressesStore';
import { useOrderStore } from 'src/stores/orderStore';
import { usePaymentsStore } from 'src/stores/paymentsStore';

const $q = useQuasar();
const addressesStore = useAddressesStore();
const paymentsStore = usePaymentsStore();

onMounted(async () => {
  if (paymentsStore.paymentsMethods) return;
  try {
    $q.loading.show();
    await paymentsStore.fetchPaymentsMethods();
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
});
</script>

<style scoped lang="scss"></style>
