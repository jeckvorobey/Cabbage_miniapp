<template>
  <div class="q-px-md">
    <h5 class="text-center q-ma-none q-mb-sm">Каталог</h5>
    <div class="text-18 text-bold q-mb-sm">
        Список каталога:
      </div>
    <div class="row q-col-gutter-sm">
      <div
        class="col-6"
        v-for="(category, index) in categoriesStore.categories"
        :key="index"
        @click="fetchProducts(category.id)"
      >
        <q-card class="my-card radius-16">
          <q-card-section class="row q-pa-sm">
            <div class="q-mr-sm">
              <q-img
                class="cursor-pointer radius-8"
                :src="category?.image ? category.image : getImage('/card-shop.jpg')"
                height="60px"
                width="60px"
                fit="cover"
              />
            </div>
            <div class="self-center text-18">
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
    console.log(categoriesStore.categories)
  })

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
    router.push('/');
  } catch (e: any) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}
</script>
