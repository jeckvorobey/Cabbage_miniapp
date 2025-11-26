<template>
  <q-infinite-scroll @load="onLoad" :offset="250">
    <q-btn
      v-if="isManager"
      @click="productModal()"
      class="full-width q-mb-sm"
      color="secondary"
      label="Добавить товар"
    ></q-btn>
    <div class="product-card row q-col-gutter-xs">
      <div class="col-6" v-for="(item, index) in productsStore.products" :key="index">
        <q-card class="my-card radius-16 full-height"  flat bordered>
          <q-card-section class="q-pa-sm full-height">
            <div @click="productModal(item)">
              <q-img
                class="cursor-pointer radius-8"
                :src="item?.primary_image ? item.primary_image : getImage('/card-shop.jpg')"
                height="160px"
                fit="cover"
              />
            </div>
            <q-card-section class="q-pa-sm card-container">
              <div class="text-center card-title">{{ item.name }}</div>
              <div class="text-center">
                <span class="text-bold">{{ item.price }}</span> ₽
                <span v-if="item?.oldPrice" class="text-grey old-price"
                  >{{ item.old_price }} ₽</span
                >
                / {{ item.unit_symbol }}
                <div class="text-grey">{{ item.origin_country }}</div>
              </div>

              <!-- <div class="q-mt-sm q-mb-xs text-center">
                Итого:
                <span class="text-bold">{{ item.price * item.quantity }}</span> ₽
              </div> -->
            </q-card-section>
            <q-card-actions class="justify-center">
              <!-- <q-btn padding="xs" color="secondary" icon="add" @click="item.quantity += 1" />
              <div class="q-px-md">
                {{ item.quantity }}
              </div>
              <q-btn
                :disabled="item.quantity === 1"
                padding="xs"
                color="secondary"
                icon="remove"
                @click="item.quantity -= 1"
              />
              <q-space /> -->
              <q-btn
                dense
                no-caps
                class="full-width"
                color="secondary"
                icon="add_shopping_cart"
                label="В корзину"
                @click="addOrder(item)"
              />
            </q-card-actions>
          </q-card-section>
        </q-card>
      </div>
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
import { computed, onMounted, ref, toRaw } from 'vue';
import { useProductsStore } from 'stores/productsStore.js';
import { useOrderStore } from 'src/stores/orderStore';
import { useQuasar } from 'quasar';
import AddProductModal from 'components/AddProductModal.vue';
import { useUnitsStore } from 'src/stores/unitsStore';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import { useAuthStore } from 'stores/authStore';
import type { IProduct } from 'src/types/product.interface';
import { getImage } from 'src/use/useUtils';

const $q = useQuasar();
const unitsStore = useUnitsStore();
const productsStore = useProductsStore();
const orderStore = useOrderStore();
const authStore = useAuthStore();
const { isManager } = usePermissionVisibility(computed(() => authStore.user?.role));
const allDataLoaded = ref(false);
const showProductModal = ref(false);
const product = ref<IProduct>()

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
  productsStore.pagination.offset = 0
  fetchProducts();
}

async function fetchProducts() {
  try {
    $q.loading.show();
    const params = {
      offset: productsStore.pagination.offset,
      limit: productsStore.pagination.limit,
    }
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

function addOrder(it: any) {
  try {
    $q.loading.show();
    if (orderStore.basketData?.length) {
      const coincidences = orderStore.basketData.find((item: any) => item.id === it.id);
      if (coincidences) {
        recalculationGoods(coincidences, it);
      } else {
        orderStore.basketData.push(structuredClone(toRaw(it)));
      }
    } else {
      orderStore.basketData.push(structuredClone(toRaw(it)));
    }
  } catch (e) {
    console.error(e);
  } finally {
    $q.notify({
      message: `Товар ${it.name} добавлен в корзину`,
      color: 'primary',
    });
    $q.loading.hide();
  }
}

function recalculationGoods(newGoods: any, oldGoods: any) {
  if (newGoods.price) newGoods.price += oldGoods.price;
  if (newGoods.weight) newGoods.weight += oldGoods.weight;
  if (newGoods.oldPrice) newGoods.oldPrice += oldGoods.oldPrice;
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

function productModal(it?: IProduct) {
  product.value = it
  showProductModal.value = !showProductModal.value
}
</script>

<style scoped lang="scss">
.product-card {
  .card-container {
    min-height: 86px;
    .card-title {
      font-size: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .old-price {
      text-decoration: line-through;
    }
  }
}
</style>
