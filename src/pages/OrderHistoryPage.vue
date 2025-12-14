<template>
  <div>
    <q-infinite-scroll :offset="250" @load="onLoad">
      <h6 class="text-center q-mt-md q-mb-md">История заказов</h6>
      <OrderHistoryItems :orderData="orderStore.ordersData" :adminMode="true"/>
    </q-infinite-scroll>
  </div>
</template>

<script setup lang="ts">
  import { useQuasar } from 'quasar';
  import { useOrderStore } from 'src/stores/orderStore';
  import { onMounted } from 'vue';
  import OrderHistoryItems from 'components/OrderHistoryItems.vue';


  const $q = useQuasar();
  const orderStore = useOrderStore()

  onMounted(async () => {
    orderStore.pagination.offset = 0
    await fetchOrders()
  })

  const onLoad = async (index: number, done: (stop?: boolean) => void) => {
    if (!orderStore.pagination.has_more) {
      done(true);
      return;
    }
    await fetchOrders();
    orderStore.pagination.offset += orderStore.pagination.limit;
    done();
  };

  async function fetchOrders() {
    try {
      $q.loading.show();
      const params = {
        limit: orderStore.pagination.limit,
        offset: orderStore.pagination.offset,
      };
      const res = await orderStore.fetchOrders(params);
      if (res) {
        orderStore.pagination.total = res.total;
        orderStore.pagination.has_more = res.has_more;
        if (orderStore.ordersData?.length) {
          orderStore.ordersData.push(res.items);
        } else {
          orderStore.ordersData = res.items;
        }
      }
      if (res) orderStore.ordersData = res.items
    } catch (e) {

      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }

</script>
