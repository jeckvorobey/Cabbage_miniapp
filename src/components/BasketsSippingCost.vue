<template>
  <q-list class="q-pa-md">
    <div class="flex justify-between">
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
    </div>
  </q-list>
</template>

<script setup lang="ts">
import { useOrderStore } from 'src/stores/orderStore';
import { computed, ref } from 'vue';

const addres = ref(true)
const orderStore = useOrderStore();
const deliveryCost = computed(() => {
  const cost = orderStore.totalCost >= 1500 ? 0 : 500
  return cost
});

</script>

<style scoped lang="scss">
</style>
