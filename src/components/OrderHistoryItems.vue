<template>
  <div>
    <q-list>
      <q-item
        v-for="(order, OIndex) in orderData"
        :key="OIndex"
        class="border-bot">
        <q-item-section>
          <q-item-label caption lines="2">Дата</q-item-label>
          <q-item-label>{{ dateConverter(order.order_date) }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label caption lines="2">Статус</q-item-label>
          <q-item-label>{{ orderStatus(order.status) }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label caption lines="2">Общая сумма</q-item-label>
          <q-item-label>{{ order.total_amount }}</q-item-label>
        </q-item-section>
        <q-item-action v-if="adminMode">
          <q-btn-dropdown color="green" dense >
            <q-list
              v-for="(status, SIndex) in OrderStatus"
              :key="SIndex"
              >
              <q-item v-close-popup clickable @click="editStatus(order.id, status.value)" >
                <q-item-section>
                  <q-item-label>{{ status.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item-action>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
  import { useQuasar } from 'quasar';
  import { EOrderStatus } from 'src/enums/order-status.enum';
  import { useOrderStore } from 'src/stores/orderStore';
  import { dateConverter } from 'src/use/useUtils';

  type OrderStatusItem = {
    value: EOrderStatus;
    label: string;
  };
  defineProps<{
    orderData: any;
    adminMode: boolean;
  }>();

  const $q = useQuasar();
  const orderStore = useOrderStore()

  const OrderStatus: OrderStatusItem[] = [
    {
      label: 'создан',
      value: EOrderStatus.CREATED,
    },
    {
      label: 'собирается',
      value: EOrderStatus.ASSEMBLING,
    },
    {
      label: 'в пути',
      value: EOrderStatus.DELIVERING,
    },
    {
      label: 'завершён',
      value: EOrderStatus.COMPLETED,
    },
    {
      label: 'отменён',
      value: EOrderStatus.CANCELLED,
    },
  ];

  function editStatus(id: number, status: string) {
    $q.dialog({
      cancel: true,
      message: 'Вы уверенны что хотите изменить статус?',
      persistent: true,
      title: 'Смена статуса',
    }).onOk(() => {
      updateOrderStatus(id, status);
    });
  }

  async function updateOrderStatus(id: number, status: string) {
    try {
      $q.loading.show();
      const res = await orderStore.updateOrderStatus(id, status)
      if (res) {
        $q.notify({
          color: 'primary',
          message: 'Статус успешно изменен',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }

  function orderStatus(status: string) {
    const statusName = OrderStatus.find((it: any) => it.value === status)
    return statusName?.label
  }

</script>
