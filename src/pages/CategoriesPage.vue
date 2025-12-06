<template>
  <div>
    <div class="q-mx-md">
      <q-btn v-if="isManager || isAdmin" @click="categoryModal()" class="full-width q-mb-sm" color="green" label="Добавление категории"></q-btn>
    </div>
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
              v-if="isAdmin"
              flat
              round
              color="red"
              icon="delete"
              @click="RemovaCategory(categorie.id)"
            />
            <q-btn
              v-if="isManager || isAdmin"
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
    <q-dialog ref="dialogRef" v-model="showCategoryModal">
      <q-card style="min-width: 90svw;" >
        <q-form greedy @submit="addCategory()">
          <q-card-section>
            <div class="text-h6">{{ category.id ? 'Редактировать категорию' : 'Добавить категорию' }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-uploader
              ref="uploaderRef"
              color="primary"
              flat
              max-file-size="15728640"
              @added="addFile"
              @rejected="fileLimitValidation($q)">
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
            <div v-if="category.image" class="flex justify-center q-mb-md">
              <q-img
                class="cursor-pointer radius-8"
                :src="category.image"
                height="120px"
                width="120px"
                fit="cover"
              />
            </div>

            <q-input :rules="[required]" v-model="category.name" class="q-mb-xs" outlined label="Наиминование категории *" />
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
            <q-btn flat label="Подтвердить" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { fileLimitValidation, required } from 'src/use/useUtils';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import { ref } from 'vue';
import type { ICategorie } from 'src/types/categorie.interface';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';

const $q = useQuasar();
const categoriesStore = useCategoriesStore();
const { isManager, isAdmin } = usePermissionVisibility();
const dialogRef = ref()
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
    description: '',
    image: ''
  }
);

const categoryFormData = new FormData()

function generateFormDate() {
  if (category?.value?.id) categoryFormData.append('id', category.value.id.toString())
  if (category.value?.name) categoryFormData.append('name', category.value.name)
  if (category.value?.parent_id) categoryFormData.append('price', category.value.parent_id.toString())
  if (category.value?.description) categoryFormData.append('category_id', category.value.description.toString())
}

function categoryModal(cat?: ICategorie) {
  if (cat?.id) {
    category.value = cat
  } else {
    category.value = emptyCategory.value
  }
  showCategoryModal.value = !showCategoryModal.value
}

function addFile(files: any) {
  const reader = new FileReader()
  reader.readAsDataURL(files[0])
  reader.onload = () => {
    category.value.image = reader.result;
  }
  categoryFormData.delete('image');
  categoryFormData.append('image', files[0])
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
    $q.loading.show();
    await categoriesStore.deleteCategorie(id)
  } catch (e) {
    console.error(e);
  } finally {
    await categoriesStore.fetchCategories();
    $q.loading.hide();
  }
}

async function addCategory() {
  try {
    generateFormDate()
    $q.loading.show();
    if (!category.value) return
    const productMethod = category.value.id
      ? categoriesStore.updateCategorie
      : categoriesStore.createCategories
    const res = await productMethod(categoryFormData)
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
    dialogRef.value.hide()
    $q.loading.hide();
  }
}


</script>
