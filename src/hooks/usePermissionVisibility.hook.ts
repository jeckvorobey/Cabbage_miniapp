import { computed } from 'vue';
import { EPermissionTypes } from 'src/use/useUtils';
import { useAuthStore } from 'src/stores/authStore';

/**
 * Хук для проверки прав доступа по ролям.
 *
 * Правила:
 * 1. Если is_user === true, пользователь всегда видит интерфейс как USER, независимо от роли
 * 2. ADMIN обладает всеми правами MANAGER и USER
 * 3. MANAGER обладает правами USER
 */
export function usePermissionVisibility() {
  const authStore = useAuthStore();
  if (!authStore.user) throw new Error('User not found');
  
  const isAdmin = computed(() => {
    const user = authStore.user;
    if (user?.is_user === true) return false;
    return user?.role === +EPermissionTypes.ADMIN;
  });

  const isManager = computed(() => {
    const user = authStore.user;
    if (user?.is_user === true) return false;
    return !!user && user.role <= +EPermissionTypes.MANAGER;
  });
  
  return {
    isAdmin,
    isManager,
  } as const
}
