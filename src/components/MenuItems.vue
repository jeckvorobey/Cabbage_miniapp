<template>
  <q-item
    v-if="!children && !disabled"
    clickable
    tag="a"
    target="_blank"
    @click="actionMenu(path, action, parent_id)"
    :class="name === route.name ? 'active-menu-item' : ''"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <div class="row justify-between">
        <div class="content-center">
          {{ title }}
        </div>
        <div v-if="!hide_buttons">
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
        </div>
      </div>
    </q-item-section>
  </q-item>
  <template v-if="children">
    <q-list>
      <q-expansion-item :icon="icon" :label="title">
        <div class="q-pl-md">
          <MenuItems v-for="child in children" :key="child.title" :deleted="true" v-bind="child" />
        </div>
      </q-expansion-item>
    </q-list>
  </template>
  <q-dialog v-model="showCategoryModal">
    <q-card style="min-width: 90svw;">
      <q-card-section>
        <div class="text-h6">Добавить категорию</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="category.name" label="Наиминование категории" />
        <q-select
          v-model="category.parent_id"
          :options="['1','2']"
          label="Тип тары"
          emit-value
          map-options
        />
        <q-input class="q-mt-sm" v-model="category.description" filled type="textarea" rows="2" label="Описание"/>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="negative" v-close-popup />
        <q-btn flat label="Добавить" color="primary" v-close-popup @click="addCategory()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { admin, manager } from 'src/use/useUtils';
import { useProductsStore } from 'src/stores/productsStore';

export interface IMenuItems {
  title?: string;
  path?: string;
  icon?: string;
  children?: IMenuItems[];
  action?: string;
  disabled?: boolean;
  deleted?: boolean;
  parent_id?: number;
  name?: string;
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
const categoriesStore = useCategoriesStore();
const productsStore = useProductsStore();
const showCategoryModal = ref(false);
const categoryId = ref()
const category = ref(
  {
    name: '',
    parent_id: null,
    description: ''
  }
);
const pagination = ref({
  offset: 0,
  limit: 2,
  totla: 0
})

function categoryModal(id?: number) {
  if(id) categoryId.value = id
  showCategoryModal.value = !showCategoryModal.value
}

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

async function addCategory() {
  if (categoryId.value) {
    editCategory(categoryId.value)
    return
  }
  try {
    $q.loading.show();
    if (!category.value) return
     const res = await categoriesStore.createCategories(category.value);
    if (res) {
      $q.notify({
        message: `Категория успешно добавлена`,
        color: 'primary',
      });
    }
  } catch (e: any) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

async function editCategory(id: number) {
  try {
    $q.loading.show();
     const res = await categoriesStore.updateCategorie(id, category.value);
    if (res) {
      $q.notify({
        message: `Категория успешно  обнавлена`,
        color: 'primary',
      });
    }
  } catch (e: any) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

function deleteCategory(id?: number) {
  console.log(id);
}
</script>

<style scoped lang="scss">
.active-menu-item {
  background-color: #8080802b;
}
</style>
