<template>
  <q-infinite-scroll :offset="250" @load="onLoad">
    <q-btn
      v-if="isManager"
      class="full-width q-mb-sm"
      color="green"
      label="Добавить товар"
      @click="router.push({ name: 'products-create' })"
    ></q-btn>
    <div class="product-card">
      <q-list v-for="(item, index) in productsStore.products" :key="index">
        <q-item>
          <q-item-section top avatar @click="openProductPage(item)">
            <q-img
              class="cursor-pointer radius-8"
              :src="item.primary_image ? item.primary_image : getImage('/card-shop.jpg')"
              height="80px"
              width="80px"
              fit="cover"
            />
          </q-item-section>
          <q-item-section class="column justify-between" @click="openProductPage(item)">
            <q-item-label caption class="text-size-16">{{ item.name }}</q-item-label>
            <q-item-label>
              <div v-if="item?.old_price" class="text-grey old-price">{{ item.old_price }} ₽</div>
              <div :class="item?.old_price ? 'text-red' : ''">{{ item.price }} ₽/шт.</div>
            </q-item-label>
          </q-item-section>

          <q-item-section side top class="column justify-between">
            <div>
              <div v-if="isAdmin" class="q-mb-sm">
                <q-btn dense round color="red" icon="delete" @click="removeProduct(item)" />
              </div>
              <div>
                <q-btn dense round color="green" icon="shopping_cart" @click="addOrder(item)" />
              </div>
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
import { onMounted, ref } from 'vue';
import { useProductsStore } from 'stores/productsStore.js';
import { useQuasar } from 'quasar';
import AddProductModal from './AddProductModal.vue';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import type { IProduct } from 'src/types/product.interface';
import { getImage } from 'src/use/useUtils';
import { useRouter } from 'vue-router';
import { useCart } from 'src/use/useCart';

const $q = useQuasar();
const router = useRouter();
const productsStore = useProductsStore();
const { addToCart } = useCart();
const { isManager, isAdmin } = usePermissionVisibility();
const allDataLoaded = ref(false);
const showProductModal = ref(false);
const product = ref<IProduct>();

onMounted(() => {
  onLoad(0, () => {});
})

function refreshData() {
  productsStore.pagination.offset = 0;
  fetchProducts();
}

async function fetchProducts() {
  try {
    $q.loading.show();
    const params = {
      limit: productsStore.pagination.limit,
      offset: productsStore.pagination.offset,
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

/**
 * Добавление товара в корзину
 */
function addOrder(order: any) {
  try {
    $q.loading.show();
    addToCart(order);
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

function removeProduct(it: IProduct) {
  $q.dialog({
    cancel: true,
    message: 'Вы уверенны что хотите удалить товар?',
    persistent: true,
    title: 'Удаление товара',
  }).onOk(() => {
    deleteProduct(it);
  });
}

async function deleteProduct(it: IProduct) {
  try {
    if (!it?.id) return;
    await productsStore.deleteProduct(it.id);
    $q.loading.show();
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

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
