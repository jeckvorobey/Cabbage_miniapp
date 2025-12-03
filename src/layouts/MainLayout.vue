<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-light-gray">
      <q-toolbar >
        <q-btn v-if="isManager || isAdmin" text-color="grey" flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <div>
          <q-btn v-if="route.name !== 'dashboard'" @click="routerBack()" text-color="grey" flat dense round icon="arrow_back_ios" aria-label="Home" />
          <q-btn v-else text-color="grey" flat dense round icon="home" aria-label="Home" />
        </div>
        <q-toolbar-title>
          <q-input
            v-if="route.name === 'dashboard'"
            v-model="textSearch"
            debounce="500"
            dense
            borderless
            rounded
            outlined
            @update:model-value="fetchProductsSearch()">
            <template v-slot:append>
              <q-icon name="search" @click="fetchProductsSearch()" />
            </template>
          </q-input>
        </q-toolbar-title>
        <q-btn
          text-color="grey"
          flat
          dense
          round
          icon="shopping_cart_checkout"
          aria-label="cart"
          @click="drawerRight = !drawerRight"
        >
         <q-badge v-if="orderStore.basketData?.length" color="red" floating>{{ orderStore.basketData?.length }}</q-badge>
        </q-btn>
        <div></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          <div class="row justify-between">
            <div class="text-h6">Меню</div>
            <div>
              <q-btn-toggle
                v-model="themeData"
                size="sm"
                no-caps
                unelevated
                dense
                toggle-color="grey-9"
                color="white"
                text-color="grey-9"
                :options="[
                  { value: 'dark', slot: 'dark', title: 'Dark mode' },
                  { value: 'light', slot: 'light', title: 'Light mode' },
                ]"
                @click="themeToggle()"
              >
                <template v-slot:dark>
                  <div class="items-center">
                    <q-icon name="nightlight" />
                  </div>
                </template>

                <template v-slot:light>
                  <div class="items-center">
                    <q-icon name="light_mode" />
                  </div>
                </template>
              </q-btn-toggle>
            </div>
          </div>
        </q-item-label>
        <MenuItems v-for="link in menuList" :key="link.name" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-drawer :width="screenWidth" side="right" v-model="drawerRight" bordered class="basket-drawer">
      <!-- Заголовок корзины -->
      <q-toolbar class="bg-white text-dark">
        <q-toolbar-title class="text-h5 text-weight-bold">
          Корзина
        </q-toolbar-title>
        <q-btn 
          flat 
          dense 
          round 
          icon="search" 
          @click="showBasketSearch = !showBasketSearch"
        />
        <q-btn 
          flat 
          dense 
          round 
          icon="delete_outline"
          @click="clearBasket"
        />
      </q-toolbar>
      
      <!-- Поисковая строка (опционально) -->
      <q-slide-transition>
        <div v-show="showBasketSearch" class="q-pa-md bg-grey-2">
          <q-input
            v-model="basketSearch"
            dense
            outlined
            placeholder="Поиск по корзине..."
            bg-color="white"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-slide-transition>
      
      <BasketCompanents />
    </q-drawer>
    <pre>{{ tmpInfo || '' }}</pre>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer elevated>
      <BottomMenu
        @open-basket="drawerRight = !drawerRight"
        />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowReactive } from 'vue';
import MenuItems, { type IMenuItems } from 'components/MenuItems.vue';
import BottomMenu from 'components/BottomMenu.vue';
import BasketCompanents from 'components/basket/BasketCompanents.vue';
import { Dark, useQuasar } from 'quasar';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import { useAuthStore } from 'stores/authStore';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from 'src/stores/productsStore';
import { useOrderStore } from 'src/stores/orderStore';

Dark.set(false);
const $q = useQuasar();
const router = useRouter()
const route = useRoute()
const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();
const orderStore = useOrderStore();
const authStore = useAuthStore();
const { isManager, isAdmin } = usePermissionVisibility(computed(() => authStore.user));
const screenWidth = computed(() => $q.platform.is.mobile ? window.screen.width : 370,);
type Theme = 'dark' | 'light';
const themeData = ref('dark');
const textSearch = ref('');
const leftDrawerOpen = ref(false);
const drawerRight = ref(false);
const themeState = shallowReactive<Record<Theme, Theme>>({
  dark: 'dark',
  light: 'light',
});

const isDark = computed(() => Dark.isActive);
const themeStatus = computed(() => (isDark.value ? themeState.dark : themeState.light));
const themeToggle = () => {
  Dark.toggle();
  window.localStorage.setItem('theme', themeStatus.value);
};
const tmpInfo = ref();
const showBasketSearch = ref(false);
const basketSearch = ref('');

// Очистка корзины
function clearBasket() {
  $q.dialog({
    title: 'Очистить корзину',
    message: 'Вы уверены, что хотите удалить все товары из корзины?',
    cancel: {
      label: 'Отмена',
      flat: true,
      color: 'grey'
    },
    ok: {
      label: 'Очистить',
      color: 'negative'
    }
  }).onOk(() => {
    orderStore.basketData = [];
    window.localStorage.removeItem('basket');
    $q.notify({
      message: 'Корзина очищена',
      color: 'positive',
      icon: 'check_circle'
    });
  });
}

const menuList = ref<IMenuItems[]>([
  {
    name: 'Главная',
    icon: 'home',
    pathName: '/',
    path: '/',
  },
  {
    name: 'Категории',
    icon: 'reorder',
    hide_buttons: true,
    pathName: 'categories',
    path: 'categories',
  },
  {
    name: 'Пользователи',
    icon: 'people',
    hide_buttons: true,
    pathName: 'users',
    path: 'users',
    disabled: isAdmin.value || isManager.value,
  },
]);

onMounted(async () => {
  try {
    const res = await categoriesStore.fetchCategories();
    if (res) {
      const category = res;
      category.forEach((el: any) => {
        el.path = '/';
      });
      menuList.value[1]!.children = category as any;
    }
    $q.loading.show();
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
  // tgUser.value = window?.Telegram?.WebApp?.initData
  // getUser();
});

// async function getUser() {
//   try {
//     $q.loading.show();
//     const data = await authStore.auth(tgUser.value);

//     tmpInfo.value = data
//     console.log('user', data);
//     accessLevel(data);
//   } catch (e: any) {
//     console.error(e);
//   } finally {
//     $q.loading.hide();
//   }
// }

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function routerBack() {
  router.back()
}

async function fetchProductsSearch() {
  try {
    $q.loading.show();
    let params = {}
    let res = []
    if (textSearch.value) {
      params = {
        offset: 0,
        limit: 20,
        query: textSearch.value ? textSearch.value : '',
      }
      res = await productsStore.fetchProductsSearch(params)
    } else {
      productsStore.pagination.offset = 0
      productsStore.pagination.total = 0
      productsStore.pagination.has_more = true
      res = await productsStore.fetchProducts(productsStore.pagination);
    }
    if (res) productsStore.products = res.items
  } catch (e: any) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}
</script>
