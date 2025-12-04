<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="">
      <q-form greedy @submit="addAddres()">
        <q-card-section>
          <div class="text-h6">Создание нового адреса доставки</div>
          <q-select
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
            class="q-mb-sm"
            outlined
            v-model="address.address_line"
            label="Адрес *"
            :rules="[required]"
          />
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
          <q-btn color="primary" flat label="Сохранить" type="submit"/>
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

  const $q = useQuasar();
  const addressesStore = useAddressesStore();
  const showDialog = ref(true);
  const dialogRef = ref()
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
    } finally {
      dialogRef.value.hide()
    }
  }

</script>

<style lang="scss" scoped>
</style>
