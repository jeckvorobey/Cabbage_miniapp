import { defineStore } from 'pinia';
import { client } from 'src/api/client';
import { ref } from 'vue';

export const usePaymentsStore = defineStore('Payments', () => {
  const paymentsMethods = ref()
  const paymentMethod = ref('cash_to_courier')

  async function fetchPaymentsMethods() {
    return client
      .get('payments/methods')
      .then((res) => {
        paymentsMethods.value = res.data
      })
      .catch((err) => {
        console.error(
          '[PaymentsStore] - An error occurred while fetching via fetchAddresses',
          err.message,
        );
        throw err;
      });
  }

  async function createPayments() {
    return client
      .post('/payments/yookassa/callback')
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[PaymentsStore] - An error occurred while fetching via createPayments',
          err.message
        );
        throw err;
      });
  }

  return { paymentsMethods, paymentMethod, createPayments, fetchPaymentsMethods };
});
