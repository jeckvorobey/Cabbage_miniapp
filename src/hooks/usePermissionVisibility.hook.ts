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
 *
 * Обрабатывает случай, когда пользователь еще не аутентифицирован (возвращает false для всех прав)
 * Не выбрасывает ошибки, если пользователь еще не загружен или не аутентифицирован
 */
export function usePermissionVisibility() {
  const authStore = useAuthStore();

  const isAdmin = computed(() => {
    // Безопасная проверка: если пользователь не загружен или не аутентифицирован, возвращаем false
    const user = authStore.user;
    if (!user) return false;
    // Если пользователь помечен как обычный пользователь, не показываем админские права
    if (user.is_user === true) {
      return false;
    }
    // Проверяем роль администратора
    return user.role === +EPermissionTypes.ADMIN;
  });

  const isManager = computed(() => {
    // Безопасная проверка: если пользователь не загружен или не аутентифицирован, возвращаем false
    const user = authStore.user;
    if (!user) return false;
    // Если пользователь помечен как обычный пользователь, не показываем менеджерские права
    if (user.is_user === true) {
      return false;
    }
    // Проверяем роль менеджера или администратора
    return user.role <= +EPermissionTypes.MANAGER;
  });

  return {
    isAdmin,
    isManager,
  } as const;
}
