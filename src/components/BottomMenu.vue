<template>
  <div class="bottom-menu">
    <q-tabs no-caps active-color="green" indicator-color="transparent" class="bg-light-gray text-light-gray flex row" v-model="tab">
      <q-tab
        v-for="(button, index) in buttonsMenu"
        :key="index"
        :name="button.name"
        :label="button.name === '' && orderStore.basketData?.length ? `${formatBasketPrice()} ₽` : button.label"
        :icon="button.icon"
        class="q-pa-none col basket-tab"
        @click="bottomMenuActions(button.path)"
      >
        <!-- Бейдж с количеством товаров для корзины -->
        <q-badge 
          v-if="button.name === '' && orderStore.basketData?.length" 
          color="negative" 
          floating
          rounded
        >
          {{ orderStore.basketData.length }}
        </q-badge>
      </q-tab>
      <q-btn flat round icon="more_vert" size="20px" class="q-px-sm">
        <q-menu auto-close>
          <q-list dense>
            <q-item
              clickable
              v-for="(rigntButton, index) in buttonsRightMenu"
              :key="index"
              @click="router.push(rigntButton.path);"
            >
              <q-item-section avatar>
                <q-icon :name="rigntButton.icon" />
              </q-item-section>
              <q-item-section>{{ rigntButton.label }}</q-item-section>
            </q-item>
            <q-separator />
          </q-list>
        </q-menu>
      </q-btn>
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
      icon: 'shopping_cart_checkout',
      path: ''
    },
    {
      name: 'delivery',
      label: 'Доставка',
      icon: 'local_shipping',
      path: '/delivery'
    },
  ]);

  const buttonsRightMenu = ref<IBottomMenu[]>([
    {
      name: 'user',
      label: 'Профиль',
      icon: 'perm_identity',
      path: '/user'
    },
    {
      name: 'reviews',
      label: 'Отзывы',
      icon: 'rate_review',
      path: '/reviews'
    },
    {
      name: 'history',
      label: 'История заказов',
      icon: 'history',
      path: '/history'
    }
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
  .basket-tab {
    position: relative;
  }
}
</style>
