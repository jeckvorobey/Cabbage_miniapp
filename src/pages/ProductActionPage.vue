<template>
  <div class="q-pa-md product">
    <div v-if="isManager">
      <ProductForm
        ref="productFormRef"
        :product="product"
        @submit="handleFormSubmit"
        @refresh-data="fetchProduct"
      />
    </div>
    <div v-else>
      <ProductImgCarusel v-if="product?.images?.length" :images="product.images" />
      <div class="q-mb-sm">
        <h6 class="q-my-md" v-if="product?.name">{{ product.name }}</h6>
        <div class="text-grey old-price" v-if="product?.old_price">{{ product.old_price }} ₽</div>
        <div class="text-bold text-18 q-mb-md" :class="product?.old_price ? 'text-red' : ''">
          {{ product.price }} ₽
        </div>
        <div v-if="product.description" class="q-pa-md bg-light-gray radius-16">
          {{ product.description }}
        </div>
      </div>
      <div class="row justify-end">
        <q-btn
          v-if="!productsInBasket?.id"
          color="green"
          label="Добавить в корзину"
          @click="addOrder(product)"
        />
        <div v-else class="row">
          <div class="bg-green q-pa-xs radius-100">
            <q-icon
              name="remove"
              color="white"
              size="30px"
              @click="changeQuantity(productsInBasket, false)"
            />
          </div>
          <span class="q-mx-sm self-center">{{ productsInBasket.quantity }}</span>
          <div class="bg-green q-pa-xs radius-100">
            <q-icon
              name="add"
              color="white"
              size="30px"
              @click="changeQuantity(productsInBasket, true)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useProductsStore } from 'src/stores/productsStore';
import type { IProduct } from 'src/types/product.interface';
import { onMounted, ref, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductImgCarusel from '@/components/ProductImgCarusel.vue';
import ProductForm from '@/components/ProductForm.vue';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import { useOrderStore } from 'src/stores/orderStore';

const $q = useQuasar();
const emit = defineEmits(['refresh-data', 'add-product']);
const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const orderStore = useOrderStore();
const productFormRef = ref();
const { isManager } = usePermissionVisibility();
const product = ref<IProduct>({
  id: null,
  name: '',
  price: null,
  category_id: null,
  description: '',
  images: '',
  origin_country: '',
});
const productsInBasket = ref<any>([]);

onMounted(() => {
  fetchProduct();
});

/**
 * Изменение количества товара в корзине
 */
function changeQuantity(order: any, flag: boolean) {
  const currentQuantity =
    typeof order.quantity === 'string' ? parseInt(order.quantity, 10) : Number(order.quantity) || 1;

  if (flag) {
    order.quantity = currentQuantity + 1;
    window.localStorage.setItem('basket', JSON.stringify(orderStore.basketData));
  } else {
    if (currentQuantity === 1) {
      const foundItemIndex = orderStore.basketData.findIndex((it: any) => it.id === order.id);
      if (foundItemIndex !== -1) {
        orderStore.basketData.splice(foundItemIndex, 1);
      }
      productsInBasket.value = [];
      window.localStorage.setItem('basket', JSON.stringify(orderStore.basketData));
      return;
    }
    order.quantity = currentQuantity - 1;
    window.localStorage.setItem('basket', JSON.stringify(orderStore.basketData));
  }
}

/**
 * Добавление товара в корзину
 */
function addOrder(order: any) {
  try {
    $q.loading.show();
    const normalizedOrder = {
      ...structuredClone(toRaw(order)),
      quantity: 1,
      product_id: order.id,
      price: typeof order.price === 'string' ? parseFloat(order.price) : Number(order.price) || 0,
    };

    if (!orderStore.basketData.length) {
      orderStore.basketData.push(normalizedOrder);
      productsInBasket.value = orderStore.basketData.find((it: any) => it.id === order.id);
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

/**
 * Обработчик отправки формы продукта
 */
async function handleFormSubmit(submittedProduct: IProduct, formData: FormData) {
  try {
    let res = null;
    if (!submittedProduct?.id) {
      if (productFormRef.value) {
        productFormRef.value.generateFormData();
      }
      res = await productsStore.createProduct(formData);
    } else {
      res = await productsStore.updateProduct(submittedProduct);
    }
    if (res) {
      product.value.id = res.id;
      $q.notify({
        message: `Успешно сохранено`,
        color: 'primary',
      });
      emit('refresh-data');
      router.back();
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Загрузка данных продукта
 */
async function fetchProduct() {
  if (route?.params?.id) {
    try {
      $q.loading.show();
      const res = await productsStore.fetchProductsById(+route.params.id);
      if (res) {
        product.value = res;
        if (product.value.id) {
          productsInBasket.value = orderStore.basketData.find(
            (it: any) => it.id === product.value.id,
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }
}
</script>

<style scoped lang="scss">
.product {
  .old-price {
    text-decoration: line-through;
  }
}
</style>

