<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="">
      <q-form greedy @submit="addAddres()">
        <q-card-section v-if="address">
          <div class="text-h6">Создание нового адреса доставки</div>
          <!-- <q-select
            v-model="address.area_id"
            :options="addressesStore.deliveryZones"
            class="q-mb-xs"
            outlined
            label="Зона доставки *"
            emit-value
            map-options
            option-label="title"
            option-value="id"
            :rules="[required]"
          />
          <q-input
            v-model="address.address_line"
          /> -->
          <q-select
            v-model="address.address_line"
            class="q-mb-sm"
            clearable
            outlined
            behavior="menu"
            use-input
            emit-value
            map-options
            :options="suggestions"
            option-label="displayName"
            option-value="displayName"
            label="Адрес доставки"
            @filter="searchAddress"
          >
            <template #no-option>
              <div class="row q-pl-sm flex-center justify-between">
                <div class="text-grey-6">{{ searchLabel }}</div>
              </div>
            </template>
          </q-select>
          <q-input
            v-model="address.comment"
            label="Комментарий"
            outlined
            type="textarea"
            rows="3"
          />
          <q-toggle v-model="address.is_default" label="Активный аддрес" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" flat label="Отмена" />
          <q-btn color="primary" flat label="Сохранить" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAddressesStore } from 'src/stores/addressesStore';
import type { IAddresse } from 'src/types/addresse.interface';

interface AddressSuggestion {
  displayName: string;
  coords: [number, number];
}

const ZELENOGRAD_BOUNDS: [number, number][] = [
  [55.97, 37.12],
  [56.02, 37.33],
];

const props = defineProps<{ newAddress?: IAddresse | null }>();
const emit = defineEmits(['refresh']);
const $q = useQuasar();
const addressesStore = useAddressesStore();
const showDialog = ref(true);
const dialogRef = ref();
const address = ref<IAddresse>({
  address_line: '',
  area_id: null,
  comment: '',
  is_default: false,
});
const suggestions = ref<AddressSuggestion[]>([]);
const isLoading = ref<boolean>(false);
const searchLabel = ref('Начните вводить адрес...');

onMounted(async () => {
  try {
    address.value = props.newAddress ?? {
      address_line: '',
      area_id: null,
      comment: '',
      is_default: false,
    };

    $q.loading.show();
    const res = await addressesStore.fetchDeliveryZones();
    if (res) addressesStore.deliveryZones = res;
  } catch (e) {
    console.error(e);
  } finally {
    emit('refresh');
    $q.loading.hide();
  }
});

// Функция добавления/обновления адреса
async function addAddres() {
  if (!address.value) {
    return;
  }
  try {
    const addressMethod = address.value?.id
      ? addressesStore.updateAddress
      : addressesStore.createAddress;

    await addressMethod(address.value);
    dialogRef.value?.hide();
  } catch (e) {
    console.error(e);
  }
}

async function searchAddress(query: string, update: (cb: () => void) => void) {
  if (!query) {
    searchLabel.value = 'Начните вводить адрес...';
    update(() => {
      suggestions.value = [];
    });
    return;
  }

  const ymaps = (window as any).ymaps;
  if (!ymaps) {
    $q.notify({ message: 'Сервис карт недоступен.', type: 'negative' });
    return;
  }

  isLoading.value = true;
  try {
    const response = await ymaps.geocode(query, {
      boundedBy: ZELENOGRAD_BOUNDS,
      results: 5,
      strictBounds: true,
    });

    const data = response.geoObjects.toArray().map((obj: any): AddressSuggestion => {
      return {
        coords: obj.geometry.getCoordinates(),
        displayName: obj.properties.get('text'),
      };
    });

    update(() => {
      suggestions.value = data;
      searchLabel.value = data.length ? 'Выберите адрес из списка' : 'Адрес не найден';
    });
  } catch (error) {
    console.error('Ошибка геокодирования:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped></style>
