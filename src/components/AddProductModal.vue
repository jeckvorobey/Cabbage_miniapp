<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="add-product">
      <q-form v-if="isManager" greedy>
        <q-card-section>
          <div class="text-h6 q-mb-md">Добавление товара</div>
          <q-uploader
            class="q-mt-sm"
            ref="uploaderRef"
            color="primary"
            flat
            @added="addFile">
            <template #header=""/>
            <template #list="">
              <q-uploader-add-trigger />
              <div class="text-center upload-title">
                <q-icon
                  class="q-mr-sm"
                  name="note_add"
                  size="24px" />
                <span>Загрузить картинку</span>
              </div>
            </template>
          </q-uploader>
          <q-img
            v-if="image"
            class="q-mt-sm"
            :src="image" />
          <q-input v-model="product.name" class="q-mb-xs" outlined label="Наименование товара" />
          <q-input v-model="product.price" class="q-mb-xs" outlined label="Стоимость товара"/>
          <q-input v-model="product.qty" class="q-mb-xs" outlined label="Количество"/>
          <q-select
            v-model="product.category_id"
            :options="categoriesStore.categories"
            class="q-mb-xs"
            outlined
            label="Тип тары"
            emit-value
            map-options
            option-label="name"
            option-value="id"
          />
          <q-select
            v-model="product.unit_id"
            :options="unitsStore.units"
            outlined
            label="Вес"
            emit-value
            map-options
            option-label="name"
            option-value="id"
          />
          <q-input class="q-mt-sm" v-model="product.description" filled type="textarea" rows="2" label="Описание"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" label="Отмена" />
          <q-btn v-close-popup color="primary" label="Подтвердить" @click="addProduct()"/>
        </q-card-actions>
      </q-form>
      <q-form v-else>
        <q-card-section>
          <div>
            <q-carousel
              v-if="product?.images?.length"
              swipeable
              animated
              arrows
              v-model="slide"
              v-model:fullscreen="fullscreen"
              infinite
              height="250px"
            >
              <q-carousel-slide
                v-for="(image, index) in product.images"
                :key="index"
                :name="index"
                :img-src="image.file_path"
                class="card-image"
              />
              <template v-slot:control>
                <q-carousel-control
                  position="bottom-right"
                  :offset="[18, 18]"
                >
                  <q-btn
                    push round dense color="white" text-color="primary"
                    :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    @click="fullscreen = !fullscreen"
                  />
                </q-carousel-control>
              </template>
            </q-carousel>
            <div v-else>
              <q-img
                class="q-mt-sm"
                :src="getImage('/card-shop.jpg')" />
            </div>
          </div>

            <div class="text-h6 text-center q-mt-sm">{{ product.name }}</div>
            <div>Стоимость товара: {{ product.price }}</div>
            <div>Количество: {{ product.qty }}</div>
            <div>Вес: 11 </div>
            <div>Описание: {{ product.description }} </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" label="Отмена" />
          <q-btn v-close-popup color="primary" label="Добавить в карзину" @click="addOrder()"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import { useDialogPluginComponent, useQuasar } from 'quasar';
  import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
  import { useAuthStore } from 'src/stores/authStore';
  import { useCategoriesStore } from 'src/stores/categoriesStore';
  import { useProductsStore } from 'src/stores/productsStore';
  import { useUnitsStore } from 'src/stores/unitsStore';
  import type { IProduct } from 'src/types/product.interface';
  import { getImage } from 'src/use/useUtils';
  import { computed, onMounted, ref } from 'vue'

  const props = defineProps<{ productData: any; }>();
  const emit = defineEmits(['refresh-data', 'add-product']);
  const $q = useQuasar();
  const slide = ref(1)
  const fullscreen = ref(false)
  const productsStore = useProductsStore();
  const categoriesStore = useCategoriesStore();
  const { dialogRef } = useDialogPluginComponent()
  const authStore = useAuthStore();
  const { isManager } = usePermissionVisibility(computed(() => authStore.user?.role));
  const unitsStore = useUnitsStore()
  const showDialog = ref(false)
  const image = ref()
  const product = ref<IProduct>({
    id: null,
    name: "",
    price: null,
    category_id: null,
    unit_id: null,
    qty: null,
    description: "",
    images: ''
  })

  onMounted(() => {
    if (props.productData) product.value = props.productData
  })

  async function addProduct() {
    try {
      const res = await productsStore.createProduct(product.value);
      if (res) {
        product.value.id = res.id
        $q.notify({
          message: `Товар успешно создан, теперь вам необходимо добавить картинку`,
          color: 'primary',
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

  function addFile(files: any) {
    const reader = new FileReader()
    reader.readAsDataURL(files[0])
    reader.onload = () => {
      // eslint-disable-next-line
      if(reader?.result) image.value = String(reader.result)
    }
    const data = new FormData()
    data.append('file', files[0])
    product.value.images = data
  }

  // async function uploadFile(files: any) {
  //   const data = new FormData()
  //   data.append('file', files)
  //   try {
  //     const res = await productsStore.uploadFile(product.value.id!, data);
  //     if (res) {
  //       $q.notify({
  //         message: `Картинка успешно добавлена`,
  //         color: 'primary',
  //       });
  //       dialogRef.value?.hide()
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     emit('refresh-data');
  //   }
  // }

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
