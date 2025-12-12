import { defineStore } from 'pinia';
import { client } from 'src/api/client';

export const usePaymentsStore = defineStore('Payments', () => {
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

  return { createPayments };
});
