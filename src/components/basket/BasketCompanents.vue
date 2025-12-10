<template>
  <div>
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      animated
      header-class="hidden-header"
    >
      <q-step
        :name="1"
        title="Select campaign settings"
        icon="settings"
        :done="step > 1"
      >
        <div class="stepper-container">
          <BasketItems v-if="orderStore.basketData?.length"/>
          <div v-else class="text-h6 text-center text-grey">Корзина пуста</div>
        </div>
      </q-step>

      <q-step
        :name="2"
        title="Create an ad group"
        caption="Optional"
        icon="create_new_folder"
        :done="step > 2"
      >
        <div class="stepper-container">
          <BasketsDeliveryInformation/>
          <div class="q-mb-sm">
            <q-input
            label="Коментарий к заказу"
            v-model="orderStore.orderDataByPay.comment"
            outlined
            type="textarea"
            rows="3"
          />
          </div>
          <BasketsSippingCost/>
        </div>
      </q-step>

      <q-step
        :name="3"
        title="Ad template"
        icon="assignment"
        disable
      >
        <div class="stepper-container">
          3 шаг
        </div>
      </q-step>
      <template v-slot:navigation>
        <q-stepper-navigation class="row">
          <q-btn v-if="step > 1" @click="stepper.previous()" color="red" label="Назад" class="q-mr-sm" />
          <q-btn @click="BasketEvents()" :disable="!orderStore.basketData?.length" color="green" class="col" label="Оформить заказ" />
        </q-stepper-navigation>
      </template>
    </q-stepper>

  </div>
</template>

<script setup lang="ts">
  import BasketItems from 'components/basket/BasketItems.vue';
  import BasketsSippingCost from 'components/basket/BasketsSippingCost.vue';
  import BasketsDeliveryInformation from 'components/basket/BasketsDeliveryInformation.vue';
  import { onMounted, ref } from 'vue';
  import { useAddressesStore } from 'src/stores/addressesStore';
  import { useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { useOrderStore } from 'src/stores/orderStore';

  const emit = defineEmits(['close-basket']);
  const $q = useQuasar();
  const router = useRouter();
  const addressesStore = useAddressesStore();
  const orderStore = useOrderStore();
  const step = ref(1)
  const stepper = ref()

  // Нормализация данных корзины: преобразование price и quantity в числа
  function normalizeBasketData(data: any[]): any[] {
    return data.map((item: any) => ({
      ...item,
      price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : Number(item.price) || 0,
      quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) || 1 : Number(item.quantity) || 1,
    }));
  }

  onMounted(() => {
    const data = window.localStorage.getItem('basket')
    if (data) {
      const parsedData = JSON.parse(data);
      orderStore.basketData = normalizeBasketData(parsedData);
    }
  });

  function BasketEvents() {
    if (step.value === 1) {
      stepper?.value.next()
      return
    } else if (step.value === 2) {
      if (!addressesStore.addresses?.length) {
        $q.notify({
          type: 'negative',
          message: 'Добавьте адрес доставки в личном кабинете',
          icon: 'warning'
        });
        router.push('/user');
        emit('close-basket');
        return
      }
      createOrder()
    }
  }

  async function createOrder() {
    try {
      orderStore.orderDataByPay.items = orderStore.basketData
      console.log(addressesStore?.address?.id, 'createOrder')
      if ( addressesStore?.address?.id ) orderStore.orderDataByPay.address_id = addressesStore.address.id
      $q.loading.show();
      await orderStore.createOrder(orderStore.orderDataByPay)
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }
</script>

<style  lang="scss">
.hidden-header {
  display: none;
}
.stepper-container {
  height: calc(100svh - 170px)
}
</style>
