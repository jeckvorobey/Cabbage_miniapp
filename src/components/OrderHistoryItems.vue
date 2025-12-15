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
          <q-item-label caption lines="2">Имя</q-item-label>
          <q-item-label>
            <a
              v-if="telegramUserLink(order)"
              :href="telegramUserLink(order) || ''"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary text-decoration-none">
              {{ order.user.full_name }}
            </a>
            <span v-else>{{ order?.user?.full_name }}</span>
          </q-item-label>
          <q-item-label v-if="userPhone(order)" caption>
            {{ userPhone(order) }}
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
  function getTelegramUserLink(userId: number | string) {
    return `tg://user?id=${userId}`;
  }

  /**
   * В разных ответах API telegram id может лежать как `telegram_id` (часто),
   * либо как `id` (реже). Возвращаем ссылку или `null`.
   */
  function telegramUserLink(order: any): string | null {
    const telegramIdCandidate =
      order?.user?.telegram_id ??
      order?.user?.telegramId ??
      order?.user?.tg_id ??
      order?.user?.tgId ??
      order?.user?.chat_id ??
      order?.user?.chatId ??
      order?.user?.id;

    if (telegramIdCandidate === null || telegramIdCandidate === undefined) return null;
    if (typeof telegramIdCandidate === 'number') return getTelegramUserLink(telegramIdCandidate);
    if (typeof telegramIdCandidate === 'string' && telegramIdCandidate.trim().length) {
      return getTelegramUserLink(telegramIdCandidate.trim());
    }

    return null;
  }

  /**
   * Телефон пользователя может приходить в разных полях (в зависимости от API/DTO).
   * Возвращаем первое валидное значение или `null`.
   */
  function userPhone(order: any): string | null {
    const phoneCandidate =
      order?.user?.phone ??
      order?.user?.phone_number ??
      order?.user?.phoneNumber ??
      order?.user?.contact_phone ??
      order?.user?.contactPhone ??
      order?.user?.contacts?.phone ??
      order?.user?.contacts?.phone_number ??
      order?.user?.contacts?.phoneNumber ??
      order?.user_phone ??
      order?.userPhone ??
      order?.phone;

    if (typeof phoneCandidate === 'number') return String(phoneCandidate);
    if (typeof phoneCandidate !== 'string') return null;

    const trimmed = phoneCandidate.trim();
    return trimmed.length ? trimmed : null;
  }

</script>
