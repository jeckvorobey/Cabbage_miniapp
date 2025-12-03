<template>
  <div class="basket-container">
    <!-- Предупреждение о минимальной сумме заказа -->
    <q-banner v-if="orderStore.totalCost < minOrderAmount" class="bg-warning text-dark q-mb-md" rounded dense>
      <template v-slot:avatar>
        <q-icon name="sentiment_satisfied" size="24px" />
      </template>
      Минимальная сумма заказа {{ minOrderAmount }} ₽
    </q-banner>

    <!-- Пустая корзина -->
    <div v-if="!orderStore.basketData?.length" class="text-h6 text-center text-grey q-pa-xl">
      Корзина пуста
    </div>

    <!-- Список товаров -->
    <q-scroll-area v-else :style="scrollAreaStyle" class="q-mb-md">
      <q-list separator>
        <q-item 
          v-for="(item, index) in orderStore.previewBasketData" 
          :key="index"
          class="q-pa-md"
        >
          <q-item-section avatar>
            <div class="relative-position">
              <q-avatar size="80px" square rounded>
                <q-img 
                  :src="item[0]?.primary_image ? item[0].primary_image : getImage('/card-shop.jpg')"
                  fit="cover"
                />
              </q-avatar>
              <!-- Бейдж со скидкой -->
              <q-badge 
                v-if="item[0]?.old_price && item[0]?.price" 
                color="warning" 
                text-color="dark"
                floating
                class="discount-badge"
                :label="`-${calculateDiscount(item[0].old_price, item[0].price)}%`"
              />
            </div>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium q-mb-xs">
              {{ item[0].name }}
            </q-item-label>
            <q-item-label>
              <div class="q-mb-sm">
                <!-- Старая цена (зачеркнутая) -->
                <span v-if="item[0]?.old_price" class="text-grey text-strike q-mr-xs">
                  {{ formatPrice(item[0].old_price) }} ₽
                </span>
                <!-- Актуальная цена -->
                <span class="text-weight-bold" :class="item[0]?.old_price ? 'text-negative' : ''">
                  {{ formatPrice(item[0].price) }} ₽
                </span>
              </div>

              <!-- Кнопки управления количеством -->
              <div class="row items-center no-wrap">
                <q-btn
                  round
                  dense
                  color="positive"
                  icon="remove"
                  size="sm"
                  @click="changeQuantity(item, false)"
                  :disable="item.length <= 1"
                />
                <div class="q-px-md text-weight-medium">
                  {{ formatQuantity(item) }}
                </div>
                <q-btn
                  round
                  dense
                  color="positive"
                  icon="add"
                  size="sm"
                  @click="changeQuantity(item, true)"
                />
              </div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>

    <!-- Блок "В вашем заказе" -->
    <div v-if="orderStore.basketData?.length" class="order-summary q-pa-md bg-grey-2 rounded-borders">
      <div class="text-h6 text-weight-bold q-mb-md">В вашем заказе</div>
      
      <div class="row justify-between q-mb-xs">
        <span class="text-grey-7">{{ orderStore.basketData.length }} {{ getProductWord(orderStore.basketData.length) }}</span>
        <span class="text-weight-medium">{{ formatPrice(orderStore.totalCost) }} ₽</span>
      </div>

      <div v-if="discountAmount > 0" class="row justify-between q-mb-xs">
        <span class="text-grey-7">Скидка {{ discountPercent }}%</span>
        <span class="text-negative text-weight-medium">-{{ formatPrice(discountAmount) }} ₽</span>
      </div>

      <div class="row justify-between q-mb-xs">
        <span class="text-grey-7">Сборка и упаковка</span>
        <span class="text-weight-medium">{{ formatPrice(packagingCost) }} ₽</span>
      </div>

      <q-separator class="q-my-md" />

      <div class="row justify-between">
        <span class="text-h6 text-weight-bold">Итого</span>
        <span class="text-h6 text-weight-bold">{{ formatPrice(totalWithDiscount) }} ₽</span>
      </div>
    </div>

    <!-- Кнопка оформления заказа -->
    <div v-if="orderStore.basketData?.length" class="q-pa-md">
      <q-btn
        unelevated
        no-caps
        color="positive"
        class="full-width text-weight-medium"
        size="lg"
        label="Войти для оформления"
        @click="proceedToCheckout"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useOrderStore } from 'src/stores/orderStore';
  import { getImage } from 'src/use/useUtils';
  import { computed, onMounted, watch } from 'vue';

  const orderStore = useOrderStore();
  const minOrderAmount = 700; // Минимальная сумма заказа
  const packagingCost = 19; // Стоимость сборки и упаковки
  const discountPercent = 5; // Процент скидки

  const scrollAreaStyle = computed(() => {
    return {
      height: 'calc(100vh - 450px)',
      maxHeight: '500px'
    };
  });

  // Сумма скидки
  const discountAmount = computed(() => {
    return Math.round((orderStore.totalCost * discountPercent) / 100);
  });

  // Итого с учетом скидки и упаковки
  const totalWithDiscount = computed(() => {
    return orderStore.totalCost - discountAmount.value + packagingCost;
  });

  onMounted(() => {
    const data = window.localStorage.getItem('basket');
    if (data) orderStore.basketData = JSON.parse(data);
    paymentsBasket();
  });

  watch(() => orderStore.basketData, () => {
    paymentsBasket();
  }, { deep: true });

  function paymentsBasket() {
    orderStore.previewBasketData = groupIdenticalProducts(orderStore.basketData);
    orderStore.totalCost = orderStore.basketData.reduce((accumulator: any, product: any) => {
      return accumulator + product.price;
    }, 0);
  }

  function changeQuantity(item: any, increase: boolean) {
    if (increase) {
      item.push(item[0]);
      orderStore.basketData.push(item[0]);
    } else {
      if (item.length > 1) {
        const indexToRemove = orderStore.basketData.findLastIndex((basketItem: any) => basketItem.id === item[0].id);
        orderStore.basketData.splice(indexToRemove, 1);
        item.pop();
      }
    }
    window.localStorage.setItem('basket', JSON.stringify(orderStore.basketData));
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

  function calculateDiscount(oldPrice: number, newPrice: number): number {
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  }

  function formatPrice(price: number): string {
    if (price === undefined || price === null) return '0,00';
    return price.toFixed(2).replace('.', ',');
  }

  function formatQuantity(item: any): string {
    const quantity = item.length;
    const unit = item[0]?.unit_name || 'кг';
    
    // Если единица измерения - кг, показываем с десятичными
    if (unit.toLowerCase() === 'кг') {
      return `${quantity.toFixed(2).replace('.', ',')} ${unit}`;
    }
    // Иначе показываем целое число
    return `${quantity} ${unit}`;
  }

  function getProductWord(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'товаров';
    }
    if (lastDigit === 1) {
      return 'товар';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'товара';
    }
    return 'товаров';
  }

  function proceedToCheckout() {
    // TODO: Реализовать переход к оформлению заказа
    console.log('Переход к оформлению заказа');
  }
</script>

<style lang="scss" scoped>
.basket-container {
  height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
  
  .order-summary {
    margin-top: auto;
  }
  
  .discount-badge {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 1;
  }
}
</style>
