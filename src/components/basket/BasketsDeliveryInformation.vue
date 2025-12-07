<template>
  <q-list>
    <div class="border-bot q-mb-md">
      <div class="text-bold">Адресс доставки: </div>
      <div v-for="(addre, aI) in addresses" :key="aI" >
        <q-radio v-model="address" :val="addre.area_id" :label="addre.address_line" color="green"/>
      </div>
    </div>
    <div class="border-bot q-mb-md">
      <div class="text-bold">Способ оплаты: </div>
      <div v-for="(item, index) in paymentMethods" :key="index" >
        <q-radio v-model="paymentMethod" :val="item.value" :label="item.label" color="green"/>
      </div>
    </div>
  </q-list>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  const address = ref(1)
  const addresses = ref([
    {
      address_line: 'Пушка 12a дом 3',
      area_id: 1,
      comment: '',
      is_default: ''
    }
  ])
  const paymentMethod = ref(1)
  const paymentMethods = ref([
    {
      label: 'Наличными курьеру',
      value: 1
    },
    {
      label: 'Переводом курьеру',
      value: 2
    },
    {
      label: 'Оплата сразу',
      value: 3
    }
  ])

  onMounted(() => {
    console.log(address, addresses)
  })

</script>

<style scoped lang="scss">
</style>
