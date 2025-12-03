<template>
  <div class="bottom-menu">
    <q-tabs 
      no-caps 
      active-color="green" 
      indicator-color="transparent" 
      class="bg-white text-grey-7 flex row bottom-menu-tabs" 
      v-model="tab"
    >
      <q-tab
        v-for="(button, index) in buttonsMenu"
        :key="index"
        :name="button.name"
        :icon="button.icon"
        class="q-pa-sm col menu-tab"
        @click="bottomMenuActions(button.path)"
      >
        <!-- Для корзины показываем цену внизу и бейдж сверху -->
        <template v-if="button.name === ''">
          <div class="basket-tab-content">
            <div class="basket-icon-wrapper">
              <q-icon :name="button.icon" size="24px" />
              <q-badge 
                v-if="orderStore.basketData?.length" 
                color="negative" 
                floating
                rounded
                class="basket-badge"
              >
                {{ orderStore.basketData.length }}
              </q-badge>
            </div>
            <div class="basket-price" v-if="orderStore.basketData?.length">
              {{ formatBasketPrice() }} ₽
            </div>
            <div v-else class="tab-label">{{ button.label }}</div>
          </div>
        </template>
        
        <!-- Для остальных кнопок - стандартный label -->
        <template v-else>
          <div class="tab-label">{{ button.label }}</div>
        </template>
      </q-tab>
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useOrderStore } from 'src/stores/orderStore';

  interface IBottomMenu {
    name: string;
    label: string;
    icon: string;
    path: string;
  }
  
  const emit = defineEmits(['open-basket']);
  const router = useRouter();
  const orderStore = useOrderStore();
  const tab = ref('images');
  
  const buttonsMenu = ref<IBottomMenu[]>([
    {
      name: 'dashboard',
      label: 'Главная',
      icon: 'home',
      path: '/'
    },
    {
      name: 'catalog',
      label: 'Каталог',
      icon: 'reorder',
      path: '/catalog'
    },
    {
      name: '',
      label: 'Корзина',
      icon: 'shopping_cart',
      path: ''
    },
    {
      name: 'promotions',
      label: 'Акции',
      icon: 'local_offer',
      path: '/promotions'
    },
    {
      name: 'user',
      label: 'Профиль',
      icon: 'person_outline',
      path: '/user'
    },
  ]);

  // Форматирование цены корзины
  function formatBasketPrice(): string {
    if (!orderStore.totalCost) return '0';
    return Math.round(orderStore.totalCost).toString();
  }

  function bottomMenuActions(it: string) {
    if (it) {
      router.push(it);
    } else {
      emit('open-basket');
    }
  }
</script>

<style scoped lang="scss">
.bottom-menu {
  border-top: 1px solid #E0E0E0;
  
  .bottom-menu-tabs {
    background: white;
  }
  
  .menu-tab {
    min-height: 56px;
    padding: 4px 8px;
    
    .basket-tab-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      
      .basket-icon-wrapper {
        position: relative;
        
        .basket-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          min-width: 18px;
          height: 18px;
          font-size: 11px;
          padding: 2px 4px;
        }
      }
      
      .basket-price {
        font-size: 13px;
        font-weight: 600;
        color: #4CAF50;
        margin-top: 2px;
      }
    }
    
    .tab-label {
      font-size: 12px;
      margin-top: 2px;
    }
  }
}
</style>
