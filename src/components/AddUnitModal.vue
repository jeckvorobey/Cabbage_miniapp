<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="add-product">
      <q-form greedy>
        <q-card-section>
          <div class="text-h6 q-mb-md">Добавление единицы измерения</div>
          <q-input v-model="unit.name" label="Наименование" stack-label />
          <q-input v-model="unit.symbol" label="Количество" stack-label />
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
  import { useUnitsStore } from 'src/stores/unitsStore';
  import { ref } from 'vue';
  import type { IUnit } from 'src/types/unit.interface';

  const $q = useQuasar();
  const unitsStore = useUnitsStore()
  const showDialog = ref(false)
  const unit = ref<IUnit>({
    name: '',
    symbol: '',
  })

  async function addProduct() {
    try {
      const res = await unitsStore.createUnit(unit.value);
      if (res) {
        $q.notify({
          message: `Единица измерения успешно создана`,
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
