<template>
  <div class="basket q-px-sm">
      <div class="containet">
        <q-list v-for="(item, index) in orderStore.basketData" :key="index">
          <q-item class="q-px-xs">
            <q-item-section>
              <div class="row">
                <q-img
                  class="cursor-pointer radius-8 q-mr-md"
                  :src="item?.primary_image ? item.primary_image : getImage('/card-shop.jpg')"
                  height="80px"
                  width="80px"
                  fit="cover"
                />
                <div class="column justify-between">
                  <q-item-label>
                    <div class="text-bold">{{ item.name }}</div>
                  </q-item-label>
                  <q-item-label >
                    <div class="q-mb-md">
                      <span class="text-bold text-basic-green">{{ item.price }}</span> ₽
                      <span v-if="item?.oldPrice" class="old-price">{{ item.oldPrice }} ₽</span>
                      <span>/{{ item.qty }}кг</span>
                    </div>

                    <div class="flex quantity-goods">
                      <div class="bg-green q-pa-xs radius-100 remove-icon">
                        <q-icon
                          name="remove"
                          color="white"
                          size="20px"
                          @click="changeQuantity(item, false, index)" />
                      </div>
                      <span class="q-px-md q-py-xs self-center bg-light-gray quantity">{{ item.quantity }}</span>
                      <div class="bg-green q-pa-xs radius-100 add-icon">
                        <q-icon
                          name="add"
                          color="white"
                          size="20px"
                          @click="changeQuantity(item, true, index)" />
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
                @click="removeItem(index)"
              />
              <div>{{ getItemTotal(item) }}</div>
            </q-item-action>
          </q-item>
          <q-separator />
        </q-list>
        <BasketsSippingCost/>
      </div>
  </div>
</template>

<script setup lang="ts">
import BasketsSippingCost from 'components/basket/BasketsSippingCost.vue';
import { useOrderStore } from 'src/stores/orderStore';
import { getImage } from 'src/use/useUtils';

const orderStore = useOrderStore();

function removeItem(index: number) {
  orderStore.basketData.splice(index, 1);
  window.localStorage.setItem('basket', JSON.stringify(orderStore.basketData));
}

// Безопасное вычисление общей стоимости товара
function getItemTotal(item: any): number {
  const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0;
  const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : Number(item.quantity) || 0;
  return price * quantity;
}

function changeQuantity(it: any, flag: boolean, index: number) {
  // Нормализуем quantity перед операциями
  const currentQuantity = typeof it.quantity === 'string' ? parseInt(it.quantity, 10) : Number(it.quantity) || 1;
  
  if (flag) {
    it.quantity = currentQuantity + 1;
  } else {
    if (currentQuantity === 1) {
      removeItem(index);
      return;
    }
    it.quantity = currentQuantity - 1;
  }
  window.localStorage.setItem('basket', JSON.stringify(orderStore.basketData));
}

</script>

<style scoped lang="scss">
.basket {
  .containet {
    height: 86svh;
    .old-price {
      text-decoration: line-through;
    }
    .quantity-goods {
      .remove-icon {
        margin-right: -10px;
        z-index: 1;
      }
      .quantity {
        height: 28px;
      }
      .add-icon {
        margin-left: -10px;
      }
    }
  }
}
</style>
