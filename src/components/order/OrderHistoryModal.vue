<template>
  <q-dialog ref="dialogRef" v-model="showDialog" persistent>
    <q-card class="order-history-modal">
      <q-card-section class="row items-center q-pb-xs q-pr-xs q-pt-xs">
        <div class="text-h6 q-mt-xs">
          <q-item-label >Детали Заказа</q-item-label>
          <q-item-label caption>{{ dateConverter(orderHistoryData.order_date) }}г</q-item-label>
        </div>
        <q-space />
        <q-item-label v-if="orderHistoryData?.status" class="q-mr-sm">
          <q-badge class="q-pa-xs" :color="getOrderStatus(orderHistoryData.status).color">
            {{ getOrderStatus(orderHistoryData.status).label }}
          </q-badge>
        </q-item-label>
        <q-btn v-close-popup icon="close" flat round dense  />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pt-none">
        <div class="q-mb-sm">
          <q-list>
            <q-item dense class="q-pa-none">
              <q-item-section>
                <q-item-label caption lines="1">Товар</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label caption lines="1">Кол.</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label caption lines="1">Цена</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              v-for="(order, orderIndex) in orderHistoryData.items"
              :key="orderIndex"
              dense
              class="q-pa-none"
            >
              <q-item-section>
                <q-item-label>{{ order?.name || '-' }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ order?.quantity }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ order?.price }} ₽</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-separator />
        </div>
        <div class="row">
          <div>
            <div v-if="orderHistoryData.comment" class="text-italic text-grey">Комментарий: {{ orderHistoryData.comment }}</div>
            <div v-else class="text-italic text-grey">Комментарий отсутствует.</div>
          </div>
          <div class="col-12 col-md-4 text-right">
            <div class="text-subtitle1 text-weight-medium">Итого:</div>
            <div class="text-h5 text-weight-bold text-green">{{ orderHistoryData.total_amount }} ₽</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { dateConverter } from 'src/use/useUtils';
  import { EOrderStatus } from 'src/enums/order-status.enum';
  import type { IOrderHistoryItem } from 'src/types/orderHistoryItem.interface';
  import type { IOrderStatus } from 'src/types/orderStatus.interface';

  const props = defineProps<{
    orderHistoryData: IOrderHistoryItem;
    orderStatus: IOrderStatus[]
  }>();
  const showDialog = ref(false);

  function getOrderStatus(status: EOrderStatus) {
    const statusName = props.orderStatus.find((it: any) => it.value === status);
    const statusData = {
      color: statusName?.value === EOrderStatus.CANCELLED ? 'negative' : 'positive',
      label: statusName?.label || '-'
    }
    return statusData;
  }

</script>
<style scoped lang="scss">
  .order-history-modal {
    width: 90svw;
  }
  </style>
