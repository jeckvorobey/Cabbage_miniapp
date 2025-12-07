<template>
  <q-list>
    <!-- <div class="flex justify-between">
      <span>Итого: </span>
      <span>{{orderStore.totalCost}}₽</span>
    </div>
    <div v-if="addres" class="flex justify-between border-bot q-mb-sm">
      <span>Стоимость доставки: </span>
      <span>{{ deliveryCost }}</span>
    </div>
    <div class="flex justify-between">
      <span>Общая: </span>
      <span>{{ orderStore.totalCost }}₽</span>
    </div> -->
    <div class="flex justify-between border-top q-mt-lg">
      <span>Стоимость: </span>
      <span>{{ producTotalPrice }}₽</span>
    </div>
  </q-list>
</template>

<script setup lang="ts">
import { useOrderStore } from 'src/stores/orderStore';
import { computed } from 'vue';

const orderStore = useOrderStore();
const producTotalPrice = computed(() => (
  orderStore.basketData.reduce((accumulator: any, item: any) => {
    const itemCost = item.price * item.quantity;
    return accumulator + itemCost;
  }, 0)
));

</script>

<style scoped lang="scss">
</style>
