<template>
  <div>
    <q-btn @click="categoryModal()" class="full-width q-mb-sm" color="secondary" label="Добавление категории"></q-btn>
    <h6 class="text-center q-mt-md q-mb-md">Категории</h6>
    <q-card class="my-card q-ma-sm" flat bordered>
      <q-list v-for="(categorie, index) in categoriesStore.categories" :key="index">
        <q-item>
          <q-item-section>
            <q-item-label>{{ categorie.name }}</q-item-label>
            <q-item-label caption>{{ categorie.description }}</q-item-label>
          </q-item-section>
          <q-item-action>
            <q-btn
              v-if="admin"
              flat
              round
              color="red"
              icon="delete"
              @click="RemovaCategory(categorie.id)"
            />
            <q-btn
              v-if="admin"
              flat
              round
              color="secondary"
              icon="mode_edit"
              @click="categoryModal(categorie)"
            />
          </q-item-action>
        </q-item>
        <q-separator />
      </q-list>
    </q-card>
    <q-dialog v-model="showCategoryModal">
      <q-card style="min-width: 90svw;">
        <q-card-section>
          <div class="text-h6">{{ category.id ? 'Редактировать категорию' : 'Добавить категорию' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="category.name" class="q-mb-xs" outlined label="Наиминование категории" />
          <!-- <q-select
            v-model="category.parent_id"
            :options="['1','2']"
            outlined
            label="Родителькая категория"
            emit-value
            map-options
          /> -->
          <q-input class="q-mt-sm" v-model="category.description" filled type="textarea" rows="2" label="Описание"/>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="negative" v-close-popup />
          <q-btn flat label="Подтвердить" color="primary" v-close-popup @click="addCategory()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { admin } from 'src/use/useUtils';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import { ref } from 'vue';
import type { ICategorie } from 'src/types/categorie.interface';

const $q = useQuasar();
const categoriesStore = useCategoriesStore();
const showCategoryModal = ref(false);
const emptyCategory = ref<ICategorie>(
  {
    name: '',
    parent_id: null,
    description: ''
  }
)
const category = ref<ICategorie>(
  {
    id: null,
    name: '',
    parent_id: null,
    description: ''
  }
);

function categoryModal(cat?: ICategorie) {
  if (cat?.id) {
    category.value = cat
  } else {
    category.value = emptyCategory.value
  }
  showCategoryModal.value = !showCategoryModal.value
}

function RemovaCategory(id: number) {
  $q.dialog({
      title: 'Удаление категорию',
      message: 'Вы уверенны что хотите удалить категорию?',
      cancel: true,
      persistent: true
    }).onOk(() => {
      deleteCategory(id)
    })
}

async function deleteCategory(id: number) {
  try {
      await categoriesStore.deleteCategorie(id)
    } catch (e) {
      console.error(e);
    } finally {
      await categoriesStore.fetchCategories();
    }
}

async function addCategory() {
  try {
    $q.loading.show();
    if (!category.value) return
    const productMethod = category.value.id
      ? categoriesStore.updateCategorie
      : categoriesStore.createCategories
    const res = await productMethod(category.value)
    if (res) {
      await categoriesStore.fetchCategories();
      $q.notify({
        message: `Категория успешно добавлена`,
        color: 'primary',
      });
    }
  } catch (e: any) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}


</script>
