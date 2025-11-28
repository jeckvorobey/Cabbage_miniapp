<template>
  <div class="bottom-menu">
    <q-tabs no-caps active-color="green" indicator-color="transparent" class="bg-light-gray text-light-gray flex row"  v-model="tab">
      <q-tab
        v-for="(button, index) in buttonsMenu"
        :key="index"
        :name="button.name"
        :label="button.label"
        :icon="button.icon"
        class="q-pa-none col"
        @click="bottomMenuActions(button.path)"
      />
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
  const tab = ref('images')
  const buttonsMenu = ref<IBottomMenu[]>([
    {
      name: 'dashboard',
      label: 'Главная',
      icon: 'home',
      path: '/'
    },
    {
      name: 'categories',
      label: 'Каталог',
      icon: 'reorder',
      path: '/categories'
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
    {
      name: 'user',
      label: 'Профиль',
      icon: 'perm_identity',
      path: '/user'
    }
  ])

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
