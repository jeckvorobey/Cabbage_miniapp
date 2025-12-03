import type { Ref } from 'vue';
import { computed, unref } from 'vue';
import { EPermissionTypes } from 'src/use/useUtils';

export type PermissionLike = EPermissionTypes | number | string;

export type MaybeRef<T> = T | Ref<T>;

export type PermissionSource =
  | MaybeRef<PermissionLike | null | undefined>
  | { role?: MaybeRef<PermissionLike | null | undefined>; is_user?: MaybeRef<boolean | null | undefined> }
  | MaybeRef<{ role?: MaybeRef<PermissionLike | null | undefined>; is_user?: MaybeRef<boolean | null | undefined> } | null | undefined>;

interface ExtractedPermission {
  role: PermissionLike | null | undefined;
  isUserFlag: boolean;
}

/**
 * Извлекает роль и флаг is_user из источника данных
 */
function extractRawPermission(source: PermissionSource): ExtractedPermission {
  const s = unref(source);

  if (s && typeof s === 'object' && 'role' in s) {
    const obj = s as { 
      role?: MaybeRef<PermissionLike | null | undefined>; 
      is_user?: MaybeRef<boolean | null | undefined> 
    };
    
    const role = obj.role != null ? unref(obj.role) : null;
    const isUserFlag = obj.is_user != null ? unref(obj.is_user) === true : false;
    
    return { role, isUserFlag };
  }

  return { role: s as PermissionLike | null | undefined, isUserFlag: false };
}

/**
 * Хук для проверки прав доступа по ролям.
 *
 * Правила:
 * 1. Если is_user === true, пользователь всегда видит интерфейс как USER, независимо от роли
 * 2. ADMIN обладает всеми правами MANAGER и USER
 * 3. MANAGER обладает правами USER
 */
export function usePermissionVisibility(source: PermissionSource) {
  const extractedData = computed<ExtractedPermission>(() => extractRawPermission(source));

  const permission = computed<EPermissionTypes | undefined>(() => {
    const { role, isUserFlag } = extractedData.value;
    
    // Если is_user === true, принудительно устанавливаем роль USER
    if (isUserFlag) {
      return EPermissionTypes.USER;
    }

    if (role == null) return undefined;

    const value = Number(role) as EPermissionTypes;

    if (!Object.values(EPermissionTypes).includes(value)) return undefined;

    return value;
  });

  const isAdmin = computed(() => {
    // Если is_user === true, то НЕ админ
    if (extractedData.value.isUserFlag) return false;
    return permission.value === EPermissionTypes.ADMIN;
  });

  const isManager = computed(() => {
    // Если is_user === true, то НЕ менеджер
    if (extractedData.value.isUserFlag) return false;
    return permission.value ? permission.value <= EPermissionTypes.MANAGER : false;
  });

  const isUser = computed(() => {
    const current = permission.value;
    return (
      current === EPermissionTypes.USER ||
      current === EPermissionTypes.MANAGER ||
      current === EPermissionTypes.ADMIN
    );
  });

  /**
   * Универсальная проверка роли.
   * Учитывает флаг is_user - если он true, доступны только права USER.
   */
  const hasPermission = (target: PermissionLike) =>
    computed(() => {
      const { isUserFlag } = extractedData.value;
      const current = permission.value;
      
      if (current == null) return false;

      const targetValue = Number(target) as EPermissionTypes;

      // Если is_user === true, доступны только права USER
      if (isUserFlag) {
        return targetValue === EPermissionTypes.USER;
      }

      switch (targetValue) {
        case EPermissionTypes.ADMIN:
          return current === EPermissionTypes.ADMIN;
        case EPermissionTypes.MANAGER:
          return current === EPermissionTypes.MANAGER || current === EPermissionTypes.ADMIN;
        case EPermissionTypes.USER:
          return (
            current === EPermissionTypes.USER ||
            current === EPermissionTypes.MANAGER ||
            current === EPermissionTypes.ADMIN
          );
        default:
          return false;
      }
    });

  return {
    permission,
    isAdmin,
    isManager,
    isUser,
    hasPermission,
  } as const;
}
