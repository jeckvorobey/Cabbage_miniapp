<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="add-product">
      <q-form greedy>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            {{ unit.id ? 'Редактирование' : 'Добавление' }} единицы измерения
          </div>
          <q-input
            v-model="unit.name"
            class="q-mb-xs"
            label="Наименование (пример: кг, гр, шт)"
            outlined
          />
          <q-input
            v-model="unit.symbol"
            class="q-mb-xs"
            label="Символ (пример: kg, gr, sh)"
            outlined
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" flat label="Отмена" />
          <q-btn v-close-popup color="primary" flat label="Сохранить" @click="addProduct()" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { useUnitsStore } from 'src/stores/unitsStore';
import { ref, watch } from 'vue';
import type { IUnit } from 'src/types/unit.interface';

interface Props {
  modelValue: boolean;
  unitData: IUnit | undefined;
}
interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update'): void;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  unitData: () => ({
    name: '',
    symbol: '',
  }),
});
const emit = defineEmits<Emits>();
const $q = useQuasar();
const unitsStore = useUnitsStore();
const showDialog = ref(props.modelValue);
const unit = ref<IUnit>({ ...props.unitData });

watch(
  () => props.unitData,
  (value) => {
    unit.value = { ...(value ?? { name: '', symbol: '' }) };
  },
  { immediate: true, deep: true },
);

watch(
  () => props.modelValue,
  (value) => {
    showDialog.value = value;
  },
  { immediate: true },
);

watch(showDialog, (value) => {
  emit('update:modelValue', value);
});

async function addProduct() {
  try {
    if (!unit.value?.id) {
      const res = await unitsStore.createUnit(unit.value);
      if (res) {
        $q.notify({
          message: `Единица измерения успешно создана`,
          color: 'primary',
        });
      }
    } else {
      const res = await unitsStore.updateUnit(unit.value.id, unit.value);
      if (res) {
        $q.notify({
          message: `Единица измерения успешно обновлена`,
          color: 'primary',
        });
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    showDialog.value = false;
    emit('update');
  }
}
</script>

<style lang="scss" scoped>
.add-product {
  min-width: 90svw;
}
</style>
