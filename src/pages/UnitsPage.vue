<template>
  <div>
    <q-btn
      @click="showUnitModal = !showUnitModal"
      class="full-width q-mb-sm"
      color="secondary"
      label="Добавление единицы измерения"
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
    <AddUnitModal v-model="showUnitModal" label="test" :unit-data=unitData @update="fetchUnits()"/>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useUnitsStore } from 'src/stores/unitsStore';
import { computed, onMounted, ref } from 'vue';
import AddUnitModal from 'components/AddUnitModal.vue';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import { useAuthStore } from 'src/stores/authStore';
import type { IUnit } from 'src/types/unit.interface';

const $q = useQuasar();
const authStore = useAuthStore();
const unitsStore = useUnitsStore();
const { isManager } = usePermissionVisibility(computed(() => authStore.user?.role));
const showUnitModal = ref(false);
const unitData = ref<IUnit|null>(null);

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
    title: 'Удаление единицы измерения',
    message: 'Вы уверенны что хотите удалить единицу измерения?',
    cancel: true,
    persistent: true,
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

function updateUnit(id: number) {
  unitData.value = unitsStore.units.find(unit => unit.id === id) || null
  showUnitModal.value = !showUnitModal.value
}
</script>
