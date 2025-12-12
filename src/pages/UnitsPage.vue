<template>
  <div>
    <q-btn
      class="full-width q-mb-sm"
      color="secondary"
      label="Добавление единицы измерения"
      @click="openCreateUnitModal"
    ></q-btn>
    <div v-if="unitsStore.units">
      <h6 class="text-center q-mt-md q-mb-md">Единицы измерения</h6>
      <q-card class="my-card q-ma-sm" flat bordered>
        <q-list v-for="(unit, index) in unitsStore.units" :key="index">
          <q-item>
            <q-item-section>
              <q-item-label>{{ unit.name }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ unit.symbol }}</q-item-label>
            </q-item-section>
            <q-item-action>
              <q-btn
                v-if="isManager"
                flat
                round
                color="red"
                icon="delete"
                @click="RemovaUnit(unit.id!)"
              />
              <q-btn flat round color="primary" icon="mode_edit" @click="updateUnit(unit.id!)" />
            </q-item-action>
          </q-item>
          <q-separator />
        </q-list>
      </q-card>
    </div>
    <AddUnitModal v-model="showUnitModal" :unit-data="unitData" @update="fetchUnits()" />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useUnitsStore } from 'src/stores/unitsStore';
import { onMounted, ref } from 'vue';
import AddUnitModal from 'components/AddUnitModal.vue';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import type { IUnit } from 'src/types/unit.interface';

const $q = useQuasar();
const unitsStore = useUnitsStore();
const { isManager } = usePermissionVisibility();
const showUnitModal = ref(false);
const unitData = ref<IUnit>();

onMounted(() => {
  fetchUnits();
});

async function fetchUnits() {
  try {
    await unitsStore.fetchUnits();
    $q.loading.show();
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

function RemovaUnit(id: number) {
  $q.dialog({
    cancel: true,
    message: 'Вы уверенны что хотите удалить единицу измерения?',
    persistent: true,
    title: 'Удаление единицы измерения',
  }).onOk(() => {
    deleteUnit(id);
  });
}

async function deleteUnit(id: number) {
  try {
    await unitsStore.deleteUnit(id);
  } catch (e) {
    console.error(e);
  } finally {
    await fetchUnits();
  }
}

function openCreateUnitModal() {
  unitData.value = undefined;
  showUnitModal.value = true;
}

function updateUnit(id: number) {
  const selectedUnit = unitsStore.units.find((unit) => unit.id === id);
  if (!selectedUnit) return;
  unitData.value = { ...selectedUnit };
  showUnitModal.value = true;
}
</script>
