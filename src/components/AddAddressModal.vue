<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="">
      <q-form greedy>
        <q-card-section>
          <div class="text-h6">Создание нового адреса доставки</div>
          <div class="text-subtitle2">Введите адрес доставки</div>
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
  import { useAddressesStore } from 'src/stores/addressesStore';
  import { ref } from 'vue';

  const addressesStore = useAddressesStore();
  const showDialog = ref(true);
  const address = ref({
    address_line: "",
    comment: "",
    is_default: false
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
