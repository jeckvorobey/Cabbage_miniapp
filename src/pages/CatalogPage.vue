<template>
  <div class="q-px-sm">
    <h5 class="text-center q-ma-none q-mb-sm">Каталог</h5>
    <div class="text-18 text-bold q-mb-sm">Список каталога:</div>
    <div class="row q-col-gutter-sm">
      <div
        v-for="(category, index) in categoriesStore.categories"
        :key="index"
        class="col-6"
        @click="fetchProducts(category.id)"
      >
        <q-card class="my-card radius-16">
          <q-card-section class="row q-pa-sm">
            <div class="col-auto">
              <q-img
                class="cursor-pointer radius-8 q-mr-sm"
                :src="category?.image ? category.image : getImage('/card-shop.jpg')"
                height="60px"
                width="60px"
                fit="cover"
              />
            </div>
            <div class="self-center col text-clamp-3">
              {{ category.name }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import { useProductsStore } from 'src/stores/productsStore';
import { getImage } from 'src/use/useUtils';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const categoriesStore = useCategoriesStore();
const productsStore = useProductsStore();

onMounted(() => {
  console.log(categoriesStore.categories);
});

async function fetchProducts(id?: number) {
  try {
    $q.loading.show();
    if (id) {
      productsStore.pagination.category_ids = id;
      productsStore.pagination.offset = 0;
    } else {
      delete productsStore.pagination.category_ids;
      productsStore.pagination.offset = 0;
    }
    const params = {
      category_ids: productsStore.pagination.category_ids,
      limit: productsStore.pagination.limit,
      offset: productsStore.pagination.offset,
    };
    const res = await productsStore.fetchProducts(params);
    if (res) productsStore.products = res.items;
    router.push('/');
  } catch (e: any) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}
</script>

<style lang="scss" scoped>
 .text-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

</style>
