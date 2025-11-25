import type { Ref } from 'vue';
import { computed, unref } from 'vue';
import { EPermissionTypes } from 'src/use/useUtils';

export type PermissionLike = EPermissionTypes | number | string;

export type MaybeRef<T> = T | Ref<T>;

export type PermissionSource =
  | MaybeRef<PermissionLike | null | undefined>
  | { role?: MaybeRef<PermissionLike | null | undefined> }
  | MaybeRef<{ role?: MaybeRef<PermissionLike | null | undefined> } | null | undefined>;

function extractRawPermission(source: PermissionSource): PermissionLike | null | undefined {
  const s = unref(source);

  if (s && typeof s === 'object' && 'role' in s) {
    const r = (s as { role?: MaybeRef<PermissionLike | null | undefined> }).role;
    return r != null ? unref(r) : null;
  }

  return s as PermissionLike | null | undefined;
}

/**
 * Хук для проверки прав доступа по ролям.
 *
 * Правило: ADMIN обладает всеми правами MANAGER и USER.
 */
export function usePermissionVisibility(source: PermissionSource) {
  const permission = computed<EPermissionTypes | undefined>(() => {
    const raw = extractRawPermission(source);
    if (raw == null) return undefined;

    const value = Number(raw) as EPermissionTypes;

    if (!Object.values(EPermissionTypes).includes(value)) return undefined;

    return value;
  });

  const isAdmin = computed(() => permission.value === EPermissionTypes.ADMIN || permission.value === EPermissionTypes.MANAGER);

  const isManager = computed(
    () =>
      permission.value === EPermissionTypes.MANAGER,
  );

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
   * Для MANAGER автоматически учитывается ADMIN,
   * для USER — и MANAGER, и ADMIN.
   */
  const hasPermission = (target: PermissionLike) =>
    computed(() => {
      const current = permission.value;
      if (current == null) return false;

      const targetValue = Number(target) as EPermissionTypes;

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
