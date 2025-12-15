<template>
  <div class="order-history">
    <q-list>
      <q-item
        v-for="(order, orderIndex) in orderData"
        :key="order.id ?? orderIndex"
        class="border-bot" :class="order.is_paid ? 'light-red' : 'light-green'">
        <q-item-section @click="openHistoryModal(order)">
          <q-item-label v-if="getUserPhone(order.user)" caption class="text-10">
            {{ getUserPhone(order.user) }}
          </q-item-label>
          <q-item-label>
            <a
              v-if="getTelegramUserLink(order.user)"
              :href="getTelegramUserLink(order.user)!"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary text-decoration-none">
              {{ order.user.full_name }}
            </a>
            <span v-else>{{ order.user.full_name }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section @click="openHistoryModal(order)">
          <q-item-label caption class="text-10">{{ dateConverter(order.order_date) }}</q-item-label>
          <q-item-label>{{ orderStatus(order.status) }}</q-item-label>
        </q-item-section>
        <q-item-section @click="openHistoryModal(order)">
          <q-item-label caption class="text-10">Общая сумма</q-item-label>
          <q-item-label>{{ order.total_amount }}</q-item-label>
        </q-item-section>
        <q-item-action v-if="adminMode">
          <q-btn-dropdown size="10px" color="green" dense >
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
          <q-btn size="10px" round color="deep-orange" icon="close" @click="clearOrder(order.id)"/>
        </q-item-action>
      </q-item>
    </q-list>
    <OrderHistoryModal
      v-if="showHistoryModal && orderHistoryData"
      v-model="showHistoryModal"
      :orderHistoryData="orderHistoryData"
      :orderStatus="OrderStatus"/>
  </div>
</template>

<script setup lang="ts">
  import { useQuasar } from 'quasar';
  import { EOrderStatus } from 'src/enums/order-status.enum';
  import { useOrderStore } from 'src/stores/orderStore';
  import type { IUser } from 'src/types/user.interface';
  import { dateConverter } from 'src/use/useUtils';
  import OrderHistoryModal from './OrderHistoryModal.vue';
  import { ref } from 'vue';
  import type { IOrderHistoryItem } from 'src/types/orderHistoryItem.interface';
  import type { IOrderStatus } from 'src/types/orderStatus.interface';

  defineProps<{
    orderData: IOrderHistoryItem[];
    adminMode: boolean;
  }>();

  const $q = useQuasar();
  const orderStore = useOrderStore();
  const showHistoryModal = ref(false);
  const orderHistoryData = ref<IOrderHistoryItem>()
  const OrderStatus: IOrderStatus[] = [
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
   * Ссылка на профиль в Telegram.
   *
   * Важно: корректная `https://t.me/...` ссылка строится по `username`.
   * По числовому `telegram_id` универсальной `https://t.me/...` ссылки нет.
   */
  function getTelegramUserLink(user: Pick<IUser, 'username'>): string | null {
    const username = user.username?.trim().replace(/^@/, '');
    if (!username) return null;
    return `https://t.me/${encodeURIComponent(username)}`;
  }

  /**
   * Телефон может быть `null` (например, если пользователь не указал контакт).
   */
  function getUserPhone(user: IUser): string | null {
    if (!user.phone) return null;
    const trimmed = user.phone.trim();
    return trimmed.length ? trimmed : null;
  }

  function openHistoryModal(order: IOrderHistoryItem ) {
    orderHistoryData.value = order
    showHistoryModal.value = !showHistoryModal.value
  }

</script>

<style lang="scss" scoped>
  .order-history {
    .light-green {
      background-color: #00800029;
    }
    .light-red {
      background-color: #fd000029;
    }
  }

 </style>

