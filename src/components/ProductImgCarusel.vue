<template>
  <q-carousel
    v-model="slide"
    v-model:fullscreen="fullscreen"
    swipeable
    animated
    arrows
    infinite
    :height="isManager ? '200px' : '250px'"
    class="q-mb-sm"
  >
    <q-carousel-slide
      v-for="(img, index) in images"
      :key="index"
      :name="index"
      :img-src="img.file_path"
      class="card-image"
    />
    <template v-slot:control>
      <q-carousel-control position="bottom-right" :offset="[18, 18]">
        <q-btn
          v-if="!isManager"
          push
          round
          dense
          color="white"
          text-color="primary"
          :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="fullscreen = !fullscreen"
        />
        <q-btn-dropdown v-if="isManager"  color="primary" label="Настройки">
          <q-list>
            <q-item v-close-popup clickable @click="deleteImage()">
              <q-item-section>
                <q-item-label class="text-res">Удалить картинку</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="mainImage()">
              <q-item-section>
                <q-item-label class="text-green">Назначить главной</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-carousel-control>
    </template>
  </q-carousel>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { usePermissionVisibility } from 'src/hooks/usePermissionVisibility.hook';
import { useProductsStore } from 'src/stores/productsStore';
import { ref } from 'vue';

const props = defineProps<{ images: any }>();
const emit = defineEmits(['refresh-data']);
const $q = useQuasar();
const productsStore = useProductsStore();
const { isManager } = usePermissionVisibility();

const slide = ref(0);
const fullscreen = ref(false);

function deleteImage() {
  $q.dialog({
    cancel: true,
    message: 'Вы уверенны что хотите удалить картинку?',
    persistent: true,
    title: 'Удаление картинки',
  }).onOk(() => {
    deleteFile();
  });
}

async function deleteFile() {
  try {
    const currentImg = props.images[slide.value];
    await productsStore.deleteFile(currentImg.id);
    emit('refresh-data');
  } catch (e) {
    console.error(e);
  }
}

function mainImage() {
  $q.dialog({
    cancel: true,
    message: 'Вы уверенны что хотите назначить эту картинку главной?',
    persistent: true,
    title: 'Главная картинка',
  }).onOk(() => {
    setMainImage();
  });
}

async function setMainImage() {
  try {
    const currentImg = props.images[slide.value];
    await productsStore.setMainImage(currentImg.id);
    emit('refresh-data');
  } catch (e) {
    console.error(e);
  }
}
</script>

<style scoped lang="scss">
// не уверен что нужны эти стили
// .card-image {
//   background-repeat: no-repeat;
//   background-size: contain;
// }
</style>
