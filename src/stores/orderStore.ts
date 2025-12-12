import { defineStore } from 'pinia';
import { client } from 'src/api/client';
import type { IOrderBy } from 'src/types/orderBy.interface';
import { ref } from 'vue';

export const useOrderStore = defineStore('Order', () => {
  const basketData = ref<any>([]);
  const totalCost = ref();
  const totalCost = ref()
  const orderDataByPay = ref<IOrderBy>({
    items: [],
    comment: '',
    payment_method: 'cash_to_courier',
    address_id: null
  })

  async function createOrder(order: any) {
    return client
      .post<any>('order', order)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[OrderStore] - An error occurred while createing via createOrder',
          err.message
        );
        throw err;
      });
  }

  async function fetchOrder() {
    return client
      .get('orders')
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[OrderStore] - An error occurred while fetching via fetchOrders',
          err.message
        );
        throw err;
      });
  }

  async function fetchMyOrder() {
    return client
      .get('orders/my')
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[OrderStore] - An error occurred while fetching via fetchMyOrder',
          err.message
        );
        throw err;
      });
  }

  async function fetchOrderById(id: number) {
    return client
      .get(`orders/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[OrderStore] - An error occurred while fetching via fetchOrderById',
          err.message
        );
        throw err;
      });
  }

  async function updateOrder(order: any) {
    return client
      .patch(`/addresses/${order.id}`, order)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[OrderStore] - An error occurred while creating via updateOrder',
          err.message
        );
        throw err;
      });
  }

  async function deleteOrder(id: number) {
    return client
      .delete(`orders/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[OrderStore] - An error occurred while deleting via deleteOrder',
          err.message
        );
        throw err;
      });
  }

  return {
    basketData,
    totalCost,
    createOrder,
    fetchOrder,
    fetchMyOrder,
    fetchOrderById,
    updateOrder,
    deleteOrder,
  };
  return { basketData, totalCost, orderDataByPay, createOrder, fetchOrder, fetchMyOrder, fetchOrderById, updateOrder, deleteOrder };
});
