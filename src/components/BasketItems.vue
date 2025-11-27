<template>
  <div v-if="orderStore.basketData?.length" class="basket">
      <div class="containet">
        <q-card class="my-card q-ma-sm" flat bordered>
          <q-list v-for="(item, index) in basketData" :key="index">
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
                            @click="changeQuantity(false)" />
                        </div>
                        <span class="q-mx-sm self-center">{{ item.length }}</span>
                        <div class="bg-light-gray q-pa-xs radius-16">
                          <q-icon
                            name="add"
                            size="20px"
                            @click="changeQuantity(true)" />
                        </div>
                      </div>
                    </q-item-label>
                  </div>
                </div>
              </q-item-section>
              <q-item-action class="column justify-between items-end">
                <q-icon
                  color="red"
                  name="close"
                  size="22px"
                  @click="removeItem(item)" />
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
        </q-card>
        <div class="q-px-sm">
          <q-btn color="secondary" class="full-width" label="Оформить заказ" />
        </div>
      </div>
  </div>
  <div v-else class="text-h6 text-center text-grey">Корзина пуста</div>
</template>

<script setup lang="ts">
import { useOrderStore } from 'src/stores/orderStore';
import { getImage } from 'src/use/useUtils';
import { onMounted, ref, watch } from 'vue';

// const $q = useQuasar();
const orderStore = useOrderStore();
const basketData = ref();
const totalCost = ref()
watch(orderStore.basketData, () => {
  basketData.value = groupIdenticalProducts(orderStore.basketData);
  totalCost.value = orderStore.basketData.reduce((accumulator: any, product: any) => {
  // accumulator - текущая сумма
  // product.price - цена текущего элемента
  return accumulator + product.price;
}, 0)
});

onMounted(() => {
  // basketData.value = $q.localStorage.getItem('basket');
});

function removeItem(it: any) {
  const order = orderStore.basketData.filter((item: { id: number }) => item.id !== it.id);
  // const order = basketData.value.filter((item: { id: number }) => item.id !== it.id);
  orderStore.basketData = order;
  // $q.localStorage.set('basket', basketData.value);
}

function changeQuantity(it: boolean) {
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
