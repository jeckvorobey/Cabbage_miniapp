<template>
  <q-item
    v-if="!children && !disabled"
    clickable
    tag="a"
    target="_blank"
    @click="actionMenu(path, action, parent_id)"
    :class="pathName === route.name ? 'active-menu-item' : ''"
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

export interface IMenuItems {
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
const pagination = ref({
  offset: 0,
  limit: 2,
  totla: 0
})


function actionMenu(path?: string, action?: string, category_id?: number) {
  if (action) showCategoryModal.value = !showCategoryModal.value;
  if (category_id) fetchProducts(category_id);
  if (path) router.push(path);
}

async function fetchProducts(id: number) {
  try {
    $q.loading.show();
    console.log(id);
    await productsStore.fetchProducts(pagination.value);
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
