<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="add-product">
      <q-form greedy>
        <q-card-section>
          <div class="text-h6 q-mb-md">Добавление товара</div>
          <q-input v-model="product.name" class="q-mb-xs" outlined label="Наименование товара" />
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
          <q-uploader
            v-if="!image && product.id"
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
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" label="Отмена" />
          <q-btn color="primary" label="Подтвердить" @click="addProduct()"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import { useDialogPluginComponent, useQuasar } from 'quasar';
  import { useCategoriesStore } from 'src/stores/categoriesStore';
  import { useProductsStore } from 'src/stores/productsStore';
  import { useUnitsStore } from 'src/stores/unitsStore';
  import { ref } from 'vue'

  const emit = defineEmits(['refresh-data']);
  const $q = useQuasar();
  const productsStore = useProductsStore();
  const categoriesStore = useCategoriesStore();
  const { dialogRef } = useDialogPluginComponent()
  const unitsStore = useUnitsStore()
  const showDialog = ref(false)
  const image = ref()
  const product = ref({
    id: null,
    name: "",
    category_id: '',
    unit_id: '',
    qty: null,
    description: ""
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
      }
    } catch (e) {
      console.error(e);
    }
  }

  function addFile(files: any) {
    const reader = new FileReader()
    reader.readAsDataURL(files[0])
    reader.onload = () => {
      // eslint-disable-next-line
      if(reader?.result) image.value = String(reader.result)
    }
    uploadFile(files[0])
  }

  async function uploadFile(files: any) {
    const data = new FormData()
    data.append('file', files)
    try {
      const res = await productsStore.uploadFile(product.value.id!, data);
      if (res) {
        $q.notify({
          message: `Картинка успешно добавлена`,
          color: 'primary',
        });
        dialogRef.value?.hide()
      }
    } catch (e) {
      console.error(e);
    } finally {
      emit('refresh-data');
    }
  }

</script>

<style scoped lang="scss">
.add-product {
  min-width: 90svw;
}
</style>
