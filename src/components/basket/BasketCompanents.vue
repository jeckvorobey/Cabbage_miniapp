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
          <q-btn @click="BasketEvents()" color="green" class="col" label="Оформить заказ" />
        </q-stepper-navigation>
      </template>
    </q-stepper>

  </div>
</template>

<script setup lang="ts">
  import BasketItems from 'components/basket/BasketItems.vue';
  import BasketsSippingCost from 'components/basket/BasketsSippingCost.vue';
  import BasketsDeliveryInformation from 'components/basket/BasketsDeliveryInformation.vue';
  import { useOrderStore } from 'src/stores/orderStore';
  import { onMounted, ref } from 'vue';

  const orderStore = useOrderStore();
  const step = ref(1)
  const stepper = ref()

  onMounted(() => {
    const data = window.localStorage.getItem('basket')
    if (data) orderStore.basketData = JSON.parse(data);
  });

  function BasketEvents() {
    if (step.value === 1) {
      stepper?.value.next()
      return
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
