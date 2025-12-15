<template>
  <div>
    <q-list>
      <q-item
        v-for="(order, orderIndex) in orderData"
        :key="order.id ?? orderIndex"
        class="border-bot">
        <q-item-section>
          <q-item-label caption lines="2">Дата</q-item-label>
          <q-item-label>{{ dateConverter(order.order_date) }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label caption lines="2">Имя</q-item-label>
          <q-item-label>
            <a
              v-if="order.user.telegram_id"
              :href="getTelegramUserLink(order.user.telegram_id)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary text-decoration-none">
              {{ order.user.full_name }}
            </a>
            <span v-else>{{ order.user.full_name }}</span>
          </q-item-label>
          <q-item-label v-if="getUserPhone(order.user)" caption>
            {{ getUserPhone(order.user) }}
          </q-item-label>
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
        <q-item-action v-if="!adminMode && (order.status === EOrderStatus.CREATED || order.status === EOrderStatus.ASSEMBLING)">
          <q-btn round color="deep-orange" icon="close" @click="clearOrder(order.id)"/>
        </q-item-action>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
  import { useQuasar } from 'quasar';
  import { EOrderStatus } from 'src/enums/order-status.enum';
  import { useOrderStore } from 'src/stores/orderStore';
  import type { IUser } from 'src/types/user.interface';
  import { dateConverter } from 'src/use/useUtils';

  type OrderStatusItem = {
    value: EOrderStatus;
    label: string;
  };

  type OrderHistoryItem = {
    id: number;
    order_date: string;
    user: IUser;
    status: EOrderStatus;
    total_amount: number;
  };

  defineProps<{
    orderData: OrderHistoryItem[];
    adminMode: boolean;
  }>();

  const $q = useQuasar();
  const orderStore = useOrderStore();

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

  function editStatus(id: number, status: EOrderStatus) {
    $q.dialog({
      cancel: true,
      message: 'Вы уверенны что хотите изменить статус?',
      persistent: true,
      title: 'Смена статуса',
    }).onOk(() => {
      updateOrderStatus(id, status);
    });
  }

  async function updateOrderStatus(id: number, status: EOrderStatus) {
    try {
      $q.loading.show();
      const res = await orderStore.updateOrderStatus(id, status);
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

  function orderStatus(status: EOrderStatus) {
    const statusName = OrderStatus.find((it) => it.value === status);
    return statusName?.label;
  }

  function clearOrder(id: number) {
    $q.dialog({
      cancel: true,
      message: 'Вы уверенны что хотите отменить заказ?',
      persistent: true,
      title: 'Отмена заказа',
    }).onOk(() => {
      updateOrderStatus(id, EOrderStatus.CANCELLED);
    });
  }

  /**
   * Ссылка на профиль в Telegram по `userId`.
   * В миниаппах корректнее открывать через `tg://`, чтобы попали в клиент Telegram.
   */
  function getTelegramUserLink(userId: number) {
    return `tg://user?id=${userId}`;
  }

  /**
   * Телефон может быть `null` (например, если пользователь не указал контакт).
   */
  function getUserPhone(user: IUser): string | null {
    if (!user.phone) return null;
    const trimmed = user.phone.trim();
    return trimmed.length ? trimmed : null;
  }

</script>
