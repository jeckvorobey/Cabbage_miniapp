<template>
  <q-form greedy @submit="handleSubmit">
    <div class="text-h6 q-mb-md">
      {{ product.id ? 'Редактирование товара' : 'Добавление товара' }}
    </div>
    <q-uploader
      ref="uploaderRef"
      class="q-mb-md"
      color="primary"
      flat
      max-file-size="15728640"
      @added="addFile"
    >
      <template #header="" />
      <template #list="">
        <q-uploader-add-trigger />
        <div class="text-center upload-title">
          <q-icon class="q-mr-sm" name="note_add" size="24px" />
          <span>Загрузить картинку</span>
        </div>
      </template>
    </q-uploader>
    <div class="q-mb-md">
      <ProductImgCarusel
        v-if="product?.images?.length"
        :images="product.images"
        @refresh-data="handleRefreshData"
      />
    </div>
    <q-input
      v-model="localProduct.name"
      :rules="[required]"
      class="q-mb-md"
      outlined
      label="Наименование товара *"
    />
    <q-input
      v-model="localProduct.price"
      :rules="[required]"
      class="q-mb-md"
      outlined
      label="Стоимость товара *"
    />
    <q-input
      v-model="localProduct.qty"
      class="q-mb-md"
      outlined
      label="Количество"
      type="number"
    />
    <q-input
      v-model="localProduct.origin_country"
      class="q-mb-md"
      outlined
      label="Страна происхождения"
    />
    <q-select
      v-model="localProduct.category_id"
      :rules="[required]"
      :options="categories"
      class="q-mb-md"
      outlined
      label="Категория *"
      emit-value
      map-options
      option-label="name"
      option-value="id"
    />
    <q-input
      v-model="localProduct.description"
      class="q-mb-md"
      outlined
      type="textarea"
      rows="2"
      label="Описание"
    />
    <div class="row justify-end">
      <q-btn color="green" label="Подтвердить" type="submit" />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import ProductImgCarusel from './ProductImgCarusel.vue';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import { useProductsStore } from 'src/stores/productsStore';
import type { IProduct } from 'src/types/product.interface';
import { required } from 'src/use/useUtils';

const props = defineProps<{
  product: IProduct;
}>();

const emit = defineEmits<{
  (e: 'submit', product: IProduct, formData: FormData): void;
  (e: 'refresh-data'): void;
}>();

const $q = useQuasar();
const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();
const uploaderRef = ref();
const productFormData = new FormData();

// Локальная копия продукта для редактирования
const localProduct = ref<IProduct>({ ...props.product });

// Отслеживаем изменения пропса
watch(
  () => props.product,
  (newProduct) => {
    localProduct.value = { ...newProduct };
  },
  { deep: true }
);

// Вычисляемое свойство для категорий
const categories = computed(() => categoriesStore.categories || []);

/**
 * Обработчик отправки формы
 */
function handleSubmit() {
  generateFormData();
  emit('submit', localProduct.value, productFormData);
}

/**
 * Обработчик обновления данных (для карусели изображений)
 */
function handleRefreshData() {
  emit('refresh-data');
}

/**
 * Генерация FormData для отправки
 */
function generateFormData() {
  productFormData.delete('id');
  productFormData.delete('name');
  productFormData.delete('price');
  productFormData.delete('category_id');
  productFormData.delete('qty');
  productFormData.delete('description');
  productFormData.delete('origin_country');

  if (localProduct.value?.id) {
    productFormData.append('id', localProduct.value.id.toString());
  }
  if (localProduct.value?.name) {
    productFormData.append('name', localProduct.value.name);
  }
  if (localProduct.value?.price) {
    productFormData.append('price', localProduct.value.price.toString());
  }
  if (localProduct.value?.category_id) {
    productFormData.append('category_id', localProduct.value.category_id.toString());
  }
  if (localProduct.value?.qty) {
    productFormData.append('qty', localProduct.value.qty.toString());
  }
  if (localProduct.value?.description) {
    productFormData.append('description', localProduct.value.description);
  }
  if (localProduct.value?.origin_country) {
    productFormData.append('origin_country', localProduct.value.origin_country);
  }
}

/**
 * Обработчик добавления файла
 */
function addFile(files: any) {
  const reader = new FileReader();
  reader.readAsDataURL(files[0]);
  reader.onload = () => {};
  productFormData.append('images', files[0]);
  if (localProduct.value?.id) {
    uploadFile(files[0]);
  }
}

/**
 * Загрузка файла на сервер
 */
async function uploadFile(files: any) {
  const data = new FormData();
  data.append('file', files);
  data.append('is_primary', 'true');
  try {
    const res = await productsStore.uploadFile(localProduct.value.id!, data);
    if (res) {
      handleRefreshData();
      $q.notify({
        color: 'primary',
        message: `Картинка успешно добавлена`,
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    if (uploaderRef.value) {
      uploaderRef.value.reset();
    }
  }
}

// Экспортируем функцию для использования в родительском компоненте
defineExpose({
  generateFormData,
});
</script>

<style scoped lang="scss">
.upload-title {
  padding: 16px;
}
</style>
