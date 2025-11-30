<template>
  <div class="basket q-px-sm">
      <div class="containet">
        <q-list v-for="(item, index) in orderStore.previewBasketData" :key="index">
          <q-item class="q-px-xs">
            <q-item-section>
              <div class="row">
                <q-img
                  class="cursor-pointer radius-8 q-mr-md"
                  :src="item[0]?.primary_image ? item[0].primary_image : getImage('/card-shop.jpg')"
                  height="80px"
                  width="80px"
                  fit="cover"
                />
                <div class="column justify-between">
                  <q-item-label>
                    <div class="text-bold">{{ item[0].name }}</div>
                  </q-item-label>
                  <q-item-label >
                    <div class="q-mb-md">
                      <span class="text-bold text-basic-green">{{ item[0].price }}</span> ₽
                      <span v-if="item[0]?.oldPrice" class="old-price">{{ item[0].oldPrice }} ₽</span>
                      <span>/{{ item[0].qty }}кг</span>
                    </div>

                    <div class="flex">
                      <div class="bg-light-gray q-pa-xs radius-16">
                        <q-icon
                          name="remove"
                          size="20px"
                          @click="changeQuantity(item, false)" />
                      </div>
                      <span class="q-mx-sm self-center">{{ item.length }}</span>
                      <div class="bg-light-gray q-pa-xs radius-16">
                        <q-icon
                          name="add"
                          size="20px"
                          @click="changeQuantity(item, true)" />
                      </div>
                    </div>
                  </q-item-label>
                </div>
              </div>
            </q-item-section>
            <q-item-action class="column justify-between items-end">
              <q-btn
                text-color="red"
                flat
                dense
                round
                icon="delete"
                @click="removeItem(item, index)"
              />
              <div>{{ producTotalPrice(item) }}</div>
            </q-item-action>
          </q-item>
          <q-separator />
        </q-list>
        <q-list class="q-px-md q-py-xs">
          <div class="flex justify-between">
            <span>Итого: </span>
            <span>{{totalCost}}₽</span>
          </div>
          <div class="flex justify-between border-bot q-mb-sm">
            <span>Стоимость доставки: </span>
            <span>10₽</span>
          </div>
          <div class="flex justify-between">
            <span>Общая: </span>
            <span>{{ totalCost }}₽</span>
          </div>
        </q-list>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderStore } from 'src/stores/orderStore';
import { getImage } from 'src/use/useUtils';
import { onMounted, ref, watch } from 'vue';

const orderStore = useOrderStore();
const totalCost = ref()
watch(orderStore.basketData, () => {
  orderStore.previewBasketData = groupIdenticalProducts(orderStore.basketData);
  totalCost.value = orderStore.basketData.reduce((accumulator: any, product: any) => {
  return accumulator + product.price;
}, 0)
});

onMounted(() => {
  // basketData.value = $q.localStorage.getItem('basket');
});

function removeItem(it: any, index: number) {
  orderStore.previewBasketData.splice(index, 1);
  const idsRemove = new Set(it.map((item: any) => item.id));
  const order = orderStore.basketData.filter((item: any) => !idsRemove.has(item.id));
  orderStore.basketData = order;
}

function changeQuantity(it: any, flag: boolean) {
  console.log(orderStore.previewBasketData, 'orderStore.previewBasketData')
  console.log(it, 'changeQuantity')
  if (flag) {
    it.push(it[0]);
    orderStore.basketData.push(it[0])
  } else {
    const indexToRemove = orderStore.basketData.findLastIndex((item: any) => item.id === it[0].id);
    orderStore.basketData.splice(indexToRemove, 1);
    it.pop();
  }
  console.log(it)
}

function groupIdenticalProducts(array: any[]): any[][] {
  const basketGroups = new Map<string, any[]>();
  for (const item of array) {
    const key = item.id;

    if (!basketGroups.has(key)) {
      basketGroups.set(key, []);
    }
    basketGroups.get(key)!.push(item);
  }
  return Array.from(basketGroups.values());
}

function producTotalPrice(it: any) {
  return it.reduce((acc: any, item: any) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    return acc + price;
  }, 0);
}

</script>

<style scoped lang="scss">
.basket {
  .containet {
    height: 86svh;
    .old-price {
      text-decoration: line-through;
    }
  }
}
</style>
