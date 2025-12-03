<template>
  <div class="basket-container">
    <!-- Предупреждение о минимальной сумме заказа -->
    <q-banner 
      v-if="orderStore.totalCost < minOrderAmount" 
      class="bg-warning text-dark q-ma-md banner-min-order" 
      rounded 
      dense
    >
      <template v-slot:avatar>
        <span class="emoji-icon">😉</span>
      </template>
      Минимальная сумма заказа {{ minOrderAmount }} ₽
    </q-banner>

    <!-- Пустая корзина -->
    <div v-if="!orderStore.basketData?.length" class="text-h6 text-center text-grey q-pa-xl">
      Корзина пуста
    </div>

    <!-- Список товаров -->
    <q-scroll-area v-else :style="scrollAreaStyle" class="q-mb-md">
      <div class="q-px-md">
        <div 
          v-for="(item, index) in orderStore.previewBasketData" 
          :key="index"
          class="basket-item q-py-md"
        >
          <div class="row q-gutter-md">
            <!-- Изображение товара с бейджем скидки -->
            <div class="relative-position">
              <q-img 
                :src="item[0]?.primary_image ? item[0].primary_image : getImage('/card-shop.jpg')"
                class="product-image"
                fit="cover"
              />
              <!-- Бейдж со скидкой -->
              <div 
                v-if="item[0]?.old_price && item[0]?.price" 
                class="discount-badge"
              >
                -{{ calculateDiscount(item[0].old_price, item[0].price) }}%
              </div>
            </div>

            <!-- Информация о товаре -->
            <div class="column justify-between flex-1">
              <div class="product-name text-weight-medium">
                {{ item[0].name }}
              </div>
              
              <!-- Цена -->
              <div class="price-section">
                <!-- Старая цена (зачеркнутая) -->
                <span v-if="item[0]?.old_price" class="old-price q-mr-xs">
                  {{ formatPrice(item[0].old_price) }} ₽
                </span>
                <!-- Актуальная цена -->
                <span class="current-price text-weight-bold">
                  {{ formatPrice(item[0].price) }} ₽
                </span>
              </div>

              <!-- Кнопки управления количеством -->
              <div class="quantity-controls">
                <q-btn
                  round
                  unelevated
                  color="positive"
                  icon="remove"
                  size="md"
                  class="quantity-btn"
                  @click="changeQuantity(item, false)"
                  :disable="item.length <= 1"
                />
                <div class="quantity-display">
                  <div class="quantity-value">{{ formatQuantity(item) }}</div>
                  <div class="quantity-unit">{{ item[0]?.unit_name || 'кг' }}</div>
                </div>
                <q-btn
                  round
                  unelevated
                  color="positive"
                  icon="add"
                  size="md"
                  class="quantity-btn"
                  @click="changeQuantity(item, true)"
                />
              </div>
            </div>
          </div>
          
          <!-- Разделитель между товарами -->
          <q-separator v-if="index < orderStore.previewBasketData.length - 1" class="q-mt-md" />
        </div>
      </div>
    </q-scroll-area>

    <!-- Блок "В вашем заказе" -->
    <div v-if="orderStore.basketData?.length" class="order-summary q-pa-md">
      <div class="summary-title q-mb-md">В вашем заказе</div>
      
      <div class="summary-row q-mb-xs">
        <span class="summary-label">{{ orderStore.basketData.length }} {{ getProductWord(orderStore.basketData.length) }}</span>
        <span class="summary-value">{{ formatPrice(orderStore.totalCost) }} ₽</span>
      </div>

      <div v-if="discountAmount > 0" class="summary-row q-mb-xs">
        <span class="summary-label">Скидка {{ discountPercent }}%</span>
        <span class="summary-value discount-value">-{{ formatPrice(discountAmount) }} ₽</span>
      </div>

      <div class="summary-row q-mb-md">
        <span class="summary-label">Сборка и упаковка</span>
        <span class="summary-value">{{ formatPrice(packagingCost) }} ₽</span>
      </div>

      <div class="summary-total">
        <span class="total-label">Итого</span>
        <span class="total-value">{{ formatPrice(totalWithDiscount) }} ₽</span>
      </div>
    </div>

    <!-- Кнопка оформления заказа -->
    <div v-if="orderStore.basketData?.length" class="q-pa-md">
      <q-btn
        unelevated
        no-caps
        color="positive"
        class="full-width checkout-btn"
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
      return quantity.toFixed(2).replace('.', ',');
    }
    // Иначе показываем целое число
    return quantity.toString();
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
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  background: white;
  
  // Баннер минимальной суммы
  .banner-min-order {
    background-color: #FFF3CD !important;
    border-radius: 8px;
    
    .emoji-icon {
      font-size: 24px;
    }
  }
  
  // Карточка товара
  .basket-item {
    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
    }
    
    .product-name {
      font-size: 16px;
      line-height: 1.3;
      color: #000;
    }
    
    // Бейдж скидки
    .discount-badge {
      position: absolute;
      top: 4px;
      left: 4px;
      background: #FFD700;
      color: #000;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      z-index: 1;
    }
    
    // Секция с ценой
    .price-section {
      .old-price {
        color: #999;
        text-decoration: line-through;
        font-size: 14px;
      }
      
      .current-price {
        color: #E63946;
        font-size: 18px;
      }
    }
    
    // Кнопки количества
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0;
      
      .quantity-btn {
        width: 36px;
        height: 36px;
        background: #4CAF50;
        
        &:hover {
          background: #45a049;
        }
      }
      
      .quantity-display {
        display: flex;
        align-items: center;
        padding: 0 12px;
        min-width: 60px;
        justify-content: center;
        
        .quantity-value {
          font-size: 16px;
          font-weight: 600;
          margin-right: 4px;
        }
        
        .quantity-unit {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
  
  // Блок итоговой информации
  .order-summary {
    margin-top: auto;
    background: #F5F5F5;
    border-radius: 0;
    
    .summary-title {
      font-size: 20px;
      font-weight: 700;
      color: #000;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      
      .summary-label {
        color: #666;
        font-size: 15px;
      }
      
      .summary-value {
        font-weight: 500;
        font-size: 15px;
        color: #000;
        
        &.discount-value {
          color: #E63946;
        }
      }
    }
    
    .summary-total {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid #E0E0E0;
      
      .total-label {
        font-size: 20px;
        font-weight: 700;
        color: #000;
      }
      
      .total-value {
        font-size: 20px;
        font-weight: 700;
        color: #000;
      }
    }
  }
  
  // Кнопка оформления
  .checkout-btn {
    height: 56px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
}

// Flex утилиты
.flex-1 {
  flex: 1;
}
</style>
