import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { AxiosError } from 'axios';
import { client } from 'src/boot/axios';
import type { IUser } from 'src/types/user.interface';

interface AuthResponse {
  token: string;
  user: IUser;
  toWalletAddress?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IUser | null>(null);
  const toWalletAddress = ref('');
  const token = ref<string>('');
  const telegramData = ref();

  async function auth(initData: any) {
    telegramData.value = initData;
    return client
      .post<AuthResponse>(
        `/tg/webapp/auth`,
        { init_data: initData },
        { headers: { SkipAuth: 'true' } }
      )
      .then((res) => {
        token.value = res.data.token;
        user.value = res.data.user;
        
        if (res.data.toWalletAddress) {
          toWalletAddress.value = res.data.toWalletAddress;
        }
        
        try {
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
          }
        } catch (e: any) {
          console.warn('[AuthStore] - Cannot access localStorage to save token', e.message);
        }
        
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
