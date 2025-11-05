<template>
  <div>
    <q-btn @click="showUnitModal = !showUnitModal" class="full-width q-mb-sm" color="secondary" label="Добавление единицы измерения"></q-btn>
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
              <q-btn flat round color="primary" icon="mode_edit" />
            </q-item-action>
          </q-item>
          <q-separator />
        </q-list>
      </q-card>
    </div>
    <AddUnitModal
      v-model="showUnitModal"
      label="test" />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useUnitsStore } from 'src/stores/unitsStore';
import { onMounted, ref } from 'vue';
import AddUnitModal from 'components/AddUnitModal.vue'

const unitsStore = useUnitsStore()
const $q = useQuasar();
const showUnitModal = ref(false)

onMounted(() => {
  fetchUnits()
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

// function deletedUnit(unit: any) {
//   try {
//     $q.loading.show();
//   } catch (e) {
//     console.error(e);
//   } finally {
//     $q.notify({
//       message: `${unit.name} удален`,
//       color: 'primary',
//     });
//     $q.loading.hide();
//   }
// }
</script>
