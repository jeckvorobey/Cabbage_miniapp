import { defineBoot } from '@quasar/app-vite/wrappers';
import { useAuthStore } from 'src/stores/authStore';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: unknown;
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

export default defineBoot(async () => {
  // Если не внутри Telegram WebApp — тихо выходим
  const initData = window?.Telegram?.WebApp?.initData;
  if (!initData || initData.length === 0) {
    return;
  }

  try {
    // Telegram WebApp рекомендации — вызвать ready/expand
    try {
      window.Telegram?.WebApp?.ready?.();
      window.Telegram?.WebApp?.expand?.();
    } catch (e: any) {
      console.error(`ready/expand false: ${e}`);
    }

    const authStore = useAuthStore();
    await authStore.auth(initData);
  } catch (e) {
    console.error('[boot/telegram] auth failed', e);
  }
});
