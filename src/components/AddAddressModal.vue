<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="">
      <q-form greedy>
        <q-card-section>
          <div class="text-h6">Создание нового адреса доставки</div>
          <q-select
            v-model="address.area_id"
            :options="addressesStore.deliveryZones"
            class="q-mb-xs"
            outlined
            label="Зона доставки"
            emit-value
            map-options
            option-label="title"
            option-value="id"
          />
          <q-input class="q-mb-sm" outlined v-model="address.address_line" label="Адрес" />
          <q-input
            label="Комментарий"
            v-model="address.comment"
            outlined
            type="textarea"
            rows="3"
          />
          <q-toggle
            v-model="address.is_default"
            label="Активный аддрес"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup color="red" flat label="Отмена" />
          <q-btn v-close-popup color="primary" flat label="Сохранить" @click="addAddres()"/>
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

  const $q = useQuasar();
  const addressesStore = useAddressesStore();
  const showDialog = ref(true);
  const address = ref<IAddresse>({
    area_id: null,
    address_line: "",
    comment: "",
    is_default: false
  })

  onMounted(async () => {
    try {
      $q.loading.show();
      const res = await addressesStore.fetchDeliveryZones()
      if (res) addressesStore.deliveryZones = res
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  })

  async function addAddres() {
    try {;
      await addressesStore.createAddress(address.value)
    } catch (e) {
      console.error(e);
    }
  }

</script>

<style lang="scss" scoped>
</style>
