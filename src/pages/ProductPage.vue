<template>
  <div class="q-pa-md product">
    <div v-if="isManager">
      <q-form greedy @submit="addProduct()">
        <div class="text-h6 q-mb-md">
          {{ product.id ? 'Редактирование товара' : 'Добавление товара' }}
        </div>
        <q-uploader
          ref="uploaderRef"
          color="primary"
          flat
          :max-file-size="15728640"
          @added="addFile"
        >
          <template #header />
          <template #list>
            <q-uploader-add-trigger />
            <div class="text-center upload-title">
              <q-icon class="q-mr-sm" name="note_add" size="24px" />
              <span>Загрузить картинку</span>
            </div>
          </template>
        </q-uploader>
        <div>
          <ProductImgCarusel
            @refresh-data="fetchProduct()"
            v-if="product?.images?.length"
            :images="product.images"
          />
        </div>
        <q-input
          :rules="[required]"
          v-model="product.name"
          class="q-mb-xs"
          outlined
          label="Наименование товара *"
        />
        <q-input
          :rules="[required]"
          v-model="product.price"
          class="q-mb-xs"
          outlined
          label="Стоимость товара *"
        />
        <q-input
          :rules="[required]"
          v-model="product.qty"
          class="q-mb-xs"
          outlined
          label="Количество*"
        />
        <q-input
          v-model="product.origin_country"
          class="q-mb-xs"
          outlined
          label="Страна происхождения"
        />
        <q-select
          :rules="[required]"
          v-model="product.category_id"
          :options="categoriesStore.categories"
          class="q-mb-xs"
          outlined
          label="Категория *"
          emit-value
          map-options
          option-label="name"
          option-value="id"
        />
        <q-input
          class="q-mt-sm q-mb-sm"
          v-model="product.description"
          outlined
          type="textarea"
          rows="2"
          label="Описание"
        />
        <div class="row justify-end">
          <q-btn v-close-popup color="green" label="Подтвердить" type="submit" />
        </div>
      </q-form>
    </div>
    <div v-else>
      <ProductImgCarusel v-if="product?.images?.length" :images="product.images" />
      <div class="q-mb-sm">
        <h6 class="q-my-md" v-if="product?.name">{{ product.name }}</h6>
        <div class="text-grey old-price" v-if="product?.old_price">{{ product.old_price }} ₽</div>
        <div class="text-bold text-18 q-mb-md" :class="product?.old_price ? 'text-red' : ''">
          {{ product.price }} ₽/шт.
        </div>
      </div>
      <div class="row justify-end">
        <q-btn
          v-if="!productsInBasket?.id"
          v-close-popup
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
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import { useOrderStore } from 'src/stores/orderStore';
import { required } from 'src/use/useUtils';

const $q = useQuasar();
const emit = defineEmits(['refresh-data', 'add-product']);
const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();
const orderStore = useOrderStore();
const uploaderRef = ref();
const { isManager } = usePermissionVisibility();
const product = ref<IProduct>({
  id: null,
  name: '',
  price: null,
  category_id: null,
  unit_id: null,
  description: '',
  images: '',
  origin_country: '',
  unit: null,
});
const productsInBasket = ref<any>([]);
const productFormData = new FormData();

onMounted(() => {
  fetchProduct();
});

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

function addOrder(order: any) {
  try {
    $q.loading.show();
    // Нормализуем price и quantity перед добавлением в корзину
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

async function addProduct() {
  try {
    let res = null;
    if (!product.value?.id) {
      generateFormDate();
      res = await productsStore.createProduct(productFormData);
    } else {
      res = productsStore.updateProduct(product.value);
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

function generateFormDate() {
  if (product?.value?.id) productFormData.append('id', product.value.id.toString());
  if (product.value?.name) productFormData.append('name', product.value.name);
  if (product.value?.price) productFormData.append('price', product.value.price.toString());
  if (product.value?.category_id)
    productFormData.append('category_id', product.value.category_id.toString());
  if (product.value?.unit_id) productFormData.append('unit_id', product.value.unit_id.toString());
  if (product.value?.qty) productFormData.append('qty', product.value.qty.toString());
  if (product.value?.description) productFormData.append('description', product.value.description);
  if (product.value?.origin_country)
    productFormData.append('origin_country', product.value.origin_country);
}

function addFile(files: any) {
  const reader = new FileReader();
  reader.readAsDataURL(files[0]);
  reader.onload = () => {};
  productFormData.append('images', files[0]);
  if (product.value?.id) uploadFile(files[0]);
}

async function uploadFile(files: any) {
  const data = new FormData();
  data.append('file', files);
  data.append('is_primary', 'true');
  try {
    const res = await productsStore.uploadFile(product.value.id!, data);
    if (res) {
      fetchProduct();
      $q.notify({
        message: `Картинка успешно добавлена`,
        color: 'primary',
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    if (uploaderRef.value) uploaderRef.value.reset();
  }
}

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
  // .description {
  //   background-color: var();
  // }
}
</style>
