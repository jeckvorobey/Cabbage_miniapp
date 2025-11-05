<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="add-product">
      <q-form greedy>
        <q-card-section>
          <div class="text-h6 q-mb-md">Добавление товара</div>
          <q-input v-model="product.name" label="Наименование товара" stack-label />
          <q-input v-model="product.qty" label="Количество" stack-label />
          <q-select
            v-model="product.category_id"
            :options="categoryOptions"
            label="Тип тары"
            emit-value
            map-options
          />
          <q-select
            v-model="product.unit_id"
            :options="unitsStore.units"
            label="Вес"
            emit-value
            map-options
            option-label="name"
            option-value="symbol"
          />
          <q-input class="q-mt-sm" v-model="product.description" filled type="textarea" rows="2" label="Описание"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" label="Отмена" />
          <q-btn v-close-popup color="primary" label="Подтвердить" @click="addProduct()"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import { useQuasar } from 'quasar';
  import { useProductsStore } from 'src/stores/productsStore';
  import { useUnitsStore } from 'src/stores/unitsStore';
  import { ref } from 'vue'

  const $q = useQuasar();
  const productsStore = useProductsStore();
  const unitsStore = useUnitsStore()
  const showDialog = ref(false)
  const product = ref({
    name: "",
    category_id: '',
    unit_id: '',
    qty: null,
    description: ""
  })

  const categoryOptions = [
    {
      label: 'Овощи',
      value: 1
    },
    {
      label: 'Фрукты',
      value: 2
    },
    {
      label: 'Ягоды',
      value: 3
    },
  ]

  async function addProduct() {
    try {
      const res = await productsStore.createProduct(product.value);
      if (res) {
        $q.notify({
          message: `Товар успешно создан`,
          color: 'primary',
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

</script>

<style scoped lang="scss">
.add-product {
  min-width: 90svw;
}
</style>
