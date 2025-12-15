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
      <ProductImgCarusel v-if="product?.images?.length" :class="!product?.qty ? 'image-grayscale-100' : ''"  :images="product.images"  />
      <div class="q-mb-sm">
        <h6 v-if="product?.name" class="q-my-md text-center">{{ product.name }}</h6>
        <div v-if="product?.origin_country" class="text-grey">Страна производитель: {{ product.origin_country }} </div>
        <div class="text-grey">Остаток: {{ product?.qty ? `${product.qty} шт.` : 'Нет в наличии' }}</div>
        <div v-if="product?.old_price" class="text-grey old-price">Старая цена: {{ product.old_price }} ₽</div>
        <div class="text-bold text-18 q-mb-md" :class="product?.old_price ? 'text-red' : ''">
          Цена: {{ product.price }} ₽
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
          @click="handleAddToCart"
        />
        <div v-else class="row">
          <div class="bg-green q-pa-xs radius-100">
            <q-icon name="remove" color="white" size="30px" @click="handleDecreaseQuantity" />
          </div>
          <span class="q-mx-sm self-center">{{ productsInBasket.quantity }}</span>
          <div class="bg-green q-pa-xs radius-100">
            <q-icon name="add" color="white" size="30px" @click="handleIncreaseQuantity" />
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
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductImgCarusel from 'components/ProductImgCarusel.vue';
import ProductForm from 'components/ProductForm.vue';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import { useCart } from 'src/use/useCart';

const $q = useQuasar();
const emit = defineEmits(['refresh-data', 'add-product']);
const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const productFormRef = ref();
const { isManager } = usePermissionVisibility();
const { addToCart, updateQuantity, getCartItem } = useCart();
const product = ref<IProduct>({
  category_id: null,
  description: '',
  id: null,
  images: '',
  name: '',
  origin_country: '',
  price: null,
});
const productsInBasket = ref<any>([]);

onMounted(() => {
  fetchProduct();
});

/**
 * Добавление товара в корзину
 */
function handleAddToCart() {
  try {
    $q.loading.show();
    const cartItem = addToCart(product.value);
    if (cartItem && product.value.id) {
      productsInBasket.value = getCartItem(product.value.id);
    }
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

/**
 * Увеличение количества товара в корзине
 */
function handleIncreaseQuantity() {
  if (productsInBasket.value) {
    const updatedItem = updateQuantity(productsInBasket.value, 1);
    if (updatedItem) {
      productsInBasket.value = updatedItem;
    } else {
      productsInBasket.value = undefined;
    }
  }
}

/**
 * Уменьшение количества товара в корзине
 */
function handleDecreaseQuantity() {
  if (productsInBasket.value) {
    const updatedItem = updateQuantity(productsInBasket.value, -1);
    if (updatedItem) {
      productsInBasket.value = updatedItem;
    } else {
      productsInBasket.value = undefined;
    }
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
        color: 'primary',
        message: `Успешно сохранено`,
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
          productsInBasket.value = getCartItem(product.value.id);
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
