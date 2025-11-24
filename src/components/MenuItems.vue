<template>
  <q-item
    v-if="!children && !disabled"
    clickable
    tag="a"
    target="_blank"
    @click="actionMenu(name, path, action, id)"
    :class="isActiveMenu === name ? 'active-menu-item' : ''"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <div class="row justify-between">
        <div class="content-center">
          {{ name }}
        </div>
        <!-- <div v-if="!hide_buttons">
          <q-btn
            v-if="deleted && (admin || manager)"
            flat
            round
            color="red"
            icon="delete"
            @click="deleteCategory(parent_id)"
          />
          <q-btn
            v-if="deleted && manager"
            flat
            round
            color="primary"
            icon="edit"
            @click="categoryModal(parent_id)"
          />
        </div> -->
      </div>
    </q-item-section>
  </q-item>
  <template v-if="children">
    <q-list>
      <q-expansion-item :icon="icon" :label="name">
        <div class="q-pl-md">
          <MenuItems v-for="child in children" :key="child.name" :deleted="true" v-bind="child" />
        </div>
      </q-expansion-item>
    </q-list>
  </template>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from 'src/stores/productsStore';
import { isActiveMenu } from 'src/use/useUtils';

export interface IMenuItems {
  id?: number;
  name: string;
  path?: string;
  icon?: string;
  children?: IMenuItems[];
  action?: string;
  disabled?: boolean;
  deleted?: boolean;
  parent_id?: number;
  pathName?: string;
  hide_buttons?: boolean;
  description?: string
}

withDefaults(defineProps<IMenuItems>(), {
  deleted: false,
  path: '#',
  icon: '',
});
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const productsStore = useProductsStore();
const showCategoryModal = ref(false);

function actionMenu(name: string, path?: string, action?: string, id?: number) {
  route.meta.sorting = id
  isActiveMenu.value = name
  fetchProducts(id);
  if (action) showCategoryModal.value = !showCategoryModal.value;
  if (path) router.push(path);
}

async function fetchProducts(id?: number) {
  try {
    $q.loading.show();
    if (id) {
      productsStore.pagination.category_ids = id
      productsStore.pagination.offset = 0
    } else {
      delete productsStore.pagination.category_ids
      productsStore.pagination.offset = 0
    }
    const params = {
      offset: productsStore.pagination.offset,
      limit: productsStore.pagination.limit,
      category_ids: productsStore.pagination.category_ids
    }
    const res = await productsStore.fetchProducts(params);
    if (res) productsStore.products = res.items;
  } catch (e: any) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

</script>

<style scoped lang="scss">
.active-menu-item {
  background-color: #8080802b;
}
</style>
