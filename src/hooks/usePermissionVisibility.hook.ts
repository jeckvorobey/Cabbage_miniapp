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
  console.log('usePermissionVisibility');
  const authStore = useAuthStore();
  const user = authStore.user;
  console.log('user', user);
  if (!user) throw new Error('User not found');
  
  const isAdmin = computed(() => {
    console.log('isAdmin', user?.is_user === true);
    if (user?.is_user === true) return false;
    console.log('return', user?.role === +EPermissionTypes.ADMIN);
    return user?.role === +EPermissionTypes.ADMIN;
  });

  const isManager = computed(() => {
    console.log('isManager', user?.is_user === true);
    if (!user || user?.is_user === true) return false;
    console.log('return', user.role <= +EPermissionTypes.MANAGER)
    return user.role <= +EPermissionTypes.MANAGER;
 ;
  });
  
  return {
    isAdmin,
    isManager,
  } as const
}
