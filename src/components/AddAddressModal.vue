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
            class="q-mb-sm"
            clearable
            outlined
            label="Адрес *"
            :rules="[required]"
          />
            use-input
            v-model="address.address_line"
            :options="suggestions"
            option-label="displayName"
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
import { useQuasar } from 'quasar';
import { useAddressesStore } from 'src/stores/addressesStore';
import type { IAddresse } from 'src/types/addresse.interface';
import { onMounted, ref } from 'vue';
import { required } from 'src/use/useUtils';

const props = defineProps<{ newAddress: any }>();
const $q = useQuasar();
const addressesStore = useAddressesStore();
const showDialog = ref(true);
const dialogRef = ref();
const address = ref<IAddresse>();
  import { useQuasar } from 'quasar';
  import { useAddressesStore } from 'src/stores/addressesStore';
  import type { IAddresse } from 'src/types/addresse.interface';
  import { onMounted, ref } from 'vue';

  interface AddressSuggestion {
    displayName: string;
    coords: [number, number];
  }

  const ZELENOGRAD_BOUNDS: [number, number][] = [
    [55.97, 37.12], // Юго-Запад
    [56.02, 37.33]  // Северо-Восток
  ];
  const suggestions = ref<AddressSuggestion[]>([]);
  const isLoading = ref<boolean>(false);
  const searchLabel = ref('Начните вводить адрес...')
  const props = defineProps<{ newAddress: any; }>();
  const $q = useQuasar();
  const addressesStore = useAddressesStore();
  const showDialog = ref(true);
  const dialogRef = ref()
  const address = ref<IAddresse>()

onMounted(async () => {
  try {
    const item = {
      address_line: '',
      area_id: null,
      comment: '',
      is_default: false,
    };
    if (props.newAddress) {
      address.value = props.newAddress;
    } else {
      address.value = item;
    }
    $q.loading.show();
    const res = await addressesStore.fetchDeliveryZones();
    if (res) addressesStore.deliveryZones = res;
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
});

async function addAddres() {
  try {
    const addressMethod = address?.value?.id
      ? addressesStore.updateAddress
      : addressesStore.createAddress;
    await addressMethod(address.value!);
  } catch (e) {
    console.error(e);
  } finally {
    dialogRef.value.hide();
  }
}
      : addressesStore.createAddress
      await addressMethod(address.value!)
    } catch (e) {
      console.error(e);
    } finally {
      dialogRef.value.hide()
    }
  }

  async function searchAddress(query: string, update: any): Promise<void> {
    if (!query) {
      searchLabel.value = 'Начните вводить адрес...'
      update(() => {
        suggestions.value = []
      })
      return
    }
    const ymaps = (window as any).ymaps;
    if (!ymaps) {;
      $q.notify({ type: 'negative', message: 'Сервис карт недоступен.' });
      return;
    }
    isLoading.value = true;
    try {
      const response = await ymaps.geocode(query, {
        results: 5,
        boundedBy: ZELENOGRAD_BOUNDS,
        strictBounds: true
      });
      const data = response.geoObjects.toArray().map((obj: any): AddressSuggestion => ({
          displayName: obj.properties.get('text'),
          coords: obj.geometry.getCoordinates()
        }));
      update(() => {
        if (!data?.length) {
          suggestions.value = []
          searchLabel.value = 'Адрес не найден'
          return
        }
        suggestions.value = data
      })
    } catch (error) {
      console.error('Ошибка геокодирования:', error);
    } finally {
      isLoading.value = false;
    }
  };

</script>

<style lang="scss" scoped></style>
