import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { AxiosError } from 'axios';
import { client } from 'src/boot/axios';

export const useAuthStore = defineStore('auth', () => {
  const user = ref();
  const toWalletAddress = ref('');
  const token = ref()
  const telegramData = ref()

  async function auth(initData: any) {
    return client
      .post(`/tg/webapp/auth`, { init_data: initData })
      .then((res: { data: { token: string; toWalletAddress: string } }) => {
        token.value = res.data.token
        user.value = res.data;
        return res.data;
      })
      .catch((err: AxiosError<any>) => {
        console.error('[AuthStore] - An error occurred while fetching via auth', err.message);
        throw err;
      });
  }

  return {
    auth,
    user,
    toWalletAddress,
    token,
    telegramData
  };
});
