<template>
  <div class="bottom-menu">
    <q-tabs
      v-model="tab"
      no-caps
      active-color="green"
      indicator-color="transparent"
      class="bg-light-gray text-light-gray flex row"
    >
      <q-tab
        v-for="(button, index) in buttonsMenu"
        :key="index"
        :name="button.name"
        :label="button.label"
        :icon="button.icon"
        class="q-pa-none col"
        @click="bottomMenuActions(button.path)"
      />
      <q-btn flat round icon="more_vert" size="20px" class="q-px-sm">
        <q-menu auto-close>
          <q-list dense>
            <q-item
              v-for="(rigntButton, index) in buttonsRightMenu"
              :key="index"
              clickable
              @click="router.push(rigntButton.path)"
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

interface IBottomMenu {
  name: string;
  label: string;
  icon: string;
  path: string;
}
const emit = defineEmits(['open-basket']);
const router = useRouter();
const tab = ref('images');
const buttonsMenu = ref<IBottomMenu[]>([
  {
    icon: 'home',
    label: 'Главная',
    name: 'dashboard',
    path: '/',
  },
  {
    icon: 'reorder',
    label: 'Каталог',
    name: 'catalog',
    path: '/catalog',
  },
  {
    icon: 'shopping_cart_checkout',
    label: 'Корзина',
    name: '',
    path: '',
  },
  {
    icon: 'history',
    label: 'История',
    name: 'my-history',
    path: '/my-history',
  },
  // {
  //   icon: 'local_shipping',
  //   label: 'Доставка',
  //   name: 'delivery',
  //   path: '/delivery',
  // },
]);

const buttonsRightMenu = ref<IBottomMenu[]>([
  {
    icon: 'perm_identity',
    label: 'Профиль',
    name: 'user',
    path: '/user',
  },
  {
    icon: 'rate_review',
    label: 'Отзывы',
    name: 'reviews',
    path: '/reviews',
  },
]);

function bottomMenuActions(it: string) {
  if (it) {
    router.push(it);
  } else {
    emit('open-basket');
  }
}
</script>

<style scoped lang="scss">
// .bottom-menu {

// }
</style>
