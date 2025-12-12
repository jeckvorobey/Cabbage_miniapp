<template>
  <q-infinite-scroll @load="onLoad" :offset="250">
    <q-btn
      v-if="isManager"
      @click="router.push({ name: 'products-create' })"
      class="full-width q-mb-sm"
      color="green"
      label="Добавить товар"
    ></q-btn>
    <div class="product-card">
      <q-list v-for="(item, index) in productsStore.products" :key="index">
        <q-item>
          <q-item-section top avatar @click="openProductPage(item)">
            <q-img
              class="cursor-pointer radius-8"
              :src="item[0]?.primary_image ? item[0].primary_image : getImage('/card-shop.jpg')"
              height="80px"
              width="80px"
              fit="cover"
            />
          </q-item-section>
          <q-item-section class="column justify-between" @click="openProductPage(item)">
            <q-item-label caption class="text-size-16">{{ item.name }}</q-item-label>
            <q-item-label>
              <div class="text-grey old-price" v-if="item?.old_price">{{ item.old_price }} ₽</div>
              <div :class="item?.old_price ? 'text-red' : ''">
                {{ item.price }} ₽
              </div>
            </q-item-label>
          </q-item-section>

          <q-item-section side top class="column justify-between">
            <div></div>
            <div class="row items-end">
              <q-item-label class="q-mr-xs" caption
                >{{ item.price }} ₽</q-item-label
              >
              <q-btn dense round color="green" icon="shopping_cart" @click="addOrder(item)" />
            </div>
          </q-item-section>
        </q-item>
        <q-separator spaced inset />
      </q-list>
    </div>

    <!-- <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="40px" />
        <div class="q-ml-sm text-primary">Загрузка новых данных...</div>
      </div>
    </template>

    <div v-if="!allDataLoaded" class="text-center q-py-lg text-grey-6">
      Все данные загружены.
    </div> -->
    <AddProductModal
      v-if="showProductModal"
      v-model="showProductModal"
      :productData="product"
      @refresh-data="refreshData()"
      @add-product="addOrder"
    />
  </q-infinite-scroll>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useProductsStore } from 'stores/productsStore.js';
import { useOrderStore } from 'src/stores/orderStore';
import { useQuasar } from 'quasar';
import AddProductModal from '@/components/AddProductModal.vue';
import { useUnitsStore } from 'src/stores/unitsStore';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import type { IProduct } from 'src/types/product.interface';
import { getImage } from 'src/use/useUtils';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const unitsStore = useUnitsStore();
const productsStore = useProductsStore();
const orderStore = useOrderStore();
const { isManager } = usePermissionVisibility();
const allDataLoaded = ref(false);
const showProductModal = ref(false);
const product = ref<IProduct>();

onMounted(async () => {
  try {
    await unitsStore.fetchUnits();
    $q.loading.show();
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
});

function refreshData() {
  productsStore.pagination.offset = 0;
  fetchProducts();
}

async function fetchProducts() {
  try {
    $q.loading.show();
    const params = {
      offset: productsStore.pagination.offset,
      limit: productsStore.pagination.limit,
    };
    const res = await productsStore.fetchProducts(params);
    if (res) {
      productsStore.pagination.total = res.total;
      productsStore.pagination.has_more = res.has_more;
      if (productsStore?.products?.length) {
        productsStore.products.push(res.items);
      } else {
        productsStore.products = res.items;
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

function addOrder(order: any) {
  try {
    // Нормализуем price и quantity перед добавлением в корзину
    const normalizedOrder = {
      ...structuredClone(toRaw(order)),
      quantity: 1,
      product_id: order.id,
      price: typeof order.price === 'string' ? parseFloat(order.price) : Number(order.price) || 0,
    };

    $q.loading.show();
    if (!orderStore.basketData.length) {
      orderStore.basketData.push(normalizedOrder);
    } else {
      const foundItem = orderStore.basketData.find((it: any) => it.id === order.id);
      if (foundItem) {
        const currentQuantity =
          typeof foundItem.quantity === 'string'
            ? parseInt(foundItem.quantity, 10)
            : Number(foundItem.quantity) || 0;
        foundItem.quantity = currentQuantity + 1;
      } else {
        orderStore.basketData.push(normalizedOrder);
      }
    }
    window.localStorage.setItem('basket', JSON.stringify(orderStore.basketData));
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

const onLoad = async (index: number, done: (stop?: boolean) => void) => {
  if (!productsStore.pagination.has_more) {
    allDataLoaded.value = true;
    done(true);
    return;
  }
  await fetchProducts();
  productsStore.pagination.offset += productsStore.pagination.limit;
  done();
};

// удалить
// function productModal(it?: IProduct) {
//   product.value = it
//   showProductModal.value = !showProductModal.value
// }

function openProductPage(it?: IProduct) {
  router.push({ name: 'products-edit', params: { id: it!.id } });
}
</script>

<style scoped lang="scss">
.product-card {
  .old-price {
    text-decoration: line-through;
  }
}
</style>
