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

// Безопасное вычисление общей стоимости корзины
const producTotalPrice = computed(() => {
  return orderStore.basketData.reduce((accumulator: number, item: any) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0;
    const quantity =
      typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : Number(item.quantity) || 0;
    const itemCost = price * quantity;
    return accumulator + (isNaN(itemCost) ? 0 : itemCost);
  }, 0);
});
</script>

<style scoped lang="scss"></style>
