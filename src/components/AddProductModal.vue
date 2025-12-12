<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="add-product">
      <q-form v-if="isManager" greedy>
        <q-card-section>
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
            @rejected="fileLimitValidation($q)"
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
              @refresh-data="fetchProduct()"
            />
          </div>
          <q-input v-model="product.name" class="q-mb-md" outlined label="Наименование товара" />
          <q-input v-model="product.price" class="q-mb-md" outlined label="Стоимость товара" />
          <q-input v-model="product.qty" class="q-mb-md" outlined label="Количество" type="number" />
          <q-input
            v-model="product.origin_country"
            class="q-mb-md"
            outlined
            label="Страна происхождения"
          />
          <q-select
            v-model="product.category_id"
            :options="categoriesStore.categories"
            class="q-mb-md"
            outlined
            label="Категория"
            emit-value
            map-options
            option-label="name"
            option-value="id"
          />
          <q-input
            v-model="product.description"
            class="q-mb-md"
            outlined
            type="textarea"
            rows="2"
            label="Описание"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" label="Отмена" />
          <q-btn v-close-popup color="primary" label="Подтвердить" @click="addProduct()" />
        </q-card-actions>
      </q-form>
      <q-form v-else>
        <q-card-section>
          <div>
            <ProductImgCarusel v-if="product?.images?.length" :images="product.images" />
            <div v-else>
              <q-img class="q-mt-sm" :src="getImage('/card-shop.jpg')" />
            </div>
          </div>
          <div class="text-h6 text-center q-mt-sm">{{ product.name }}</div>
          <div class="text-bold">Стоимость товара: {{ product.price }}</div>
          <div>Страна происхождения: {{ product.origin_country }}</div>
          <div>Описание: {{ product.description }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" label="Отмена" />
          <q-btn v-close-popup color="primary" label="Добавить в корзину" @click="addOrder()" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import ProductImgCarusel from 'components/ProductImgCarusel.vue';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import { useProductsStore } from 'src/stores/productsStore';
import type { IProduct } from 'src/types/product.interface';
import { ref } from 'vue';
import { fileLimitValidation, getImage } from 'src/use/useUtils';

const props = defineProps<{ productData: any }>();
const emit = defineEmits(['refresh-data', 'add-product']);
const $q = useQuasar();
const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();
const { dialogRef } = useDialogPluginComponent();
const { isManager } = usePermissionVisibility();
const showDialog = ref(false);
const uploaderRef = ref();
const product = ref<IProduct>({
  category_id: null,
  description: '',
  id: null,
  images: '',
  name: '',
  origin_country: '',
  price: null,
});
const productFormData = new FormData();

if (props.productData) product.value = props.productData;

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
        color: 'primary',
        message: `Успешно сохранено`,
      });
      emit('refresh-data');
    }
  } catch (e) {
    console.error(e);
  }
}

function addOrder() {
  emit('add-product', product.value);
}

function generateFormDate() {
  if (product?.value?.id) productFormData.append('id', product.value.id.toString());
  if (product.value?.name) productFormData.append('name', product.value.name);
  if (product.value?.price) productFormData.append('price', product.value.price.toString());
  if (product.value?.category_id)
    productFormData.append('category_id', product.value.category_id.toString());
  if (product.value?.qty) productFormData.append('qty', product.value.qty.toString());
  if (product.value?.description) productFormData.append('description', product.value.description);
  if (product.value?.origin_country)
    productFormData.append('origin_country', product.value.origin_country);
}

function addFile(files: any) {
  const reader = new FileReader();
  reader.readAsDataURL(files[0]);
  reader.onload = () => {};
  productFormData.delete('images');
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
        color: 'primary',
        message: `Картинка успешно добавлена`,
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    if (uploaderRef.value) uploaderRef.value.reset();
  }
}

async function fetchProduct() {
  try {
    const data = await productsStore.fetchProductsById(product.value.id!);
    product.value = data;
  } catch (e) {
    console.error(e);
  }
}
</script>

<style scoped lang="scss">
.add-product {
  min-width: 90svw;
}

.card-image {
  background-repeat: no-repeat;
  background-size: contain;
}
</style>
