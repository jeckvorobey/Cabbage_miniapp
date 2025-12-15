import { beforeEach, describe, expect, it } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePermissionVisibility } from '../usePermissionVisibility.hook';
import { useAuthStore } from 'src/stores/authStore';
import { EPermissionTypes } from 'src/use/useUtils';
import type { IUser } from 'src/types/user.interface';

const createUser = (role: EPermissionTypes, isUser = false): IUser => ({
  id: 1,
  full_name: 'Test User',
  phone: null,
  subscribe_news: false,
  role,
  language_code: 'ru',
  is_premium: false,
  main_image_url: '',
  is_bot: false,
  is_user: isUser,
  username: 'test',
  name: 'Test',
  telegram_id: 123,
});

describe('usePermissionVisibility', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('безопасно обрабатывает случай, когда пользователь не аутентифицирован', () => {
    const authStore = useAuthStore();
    authStore.user = null;

    const { isAdmin, isManager } = usePermissionVisibility();

    // Хук должен возвращать false для всех прав, если пользователь не аутентифицирован
    expect(isAdmin.value).toBe(false);
    expect(isManager.value).toBe(false);
  });

  it('ADMIN имеет права admin и manager', () => {
    const authStore = useAuthStore();
    authStore.user = createUser(EPermissionTypes.ADMIN);

    const { isAdmin, isManager } = usePermissionVisibility();

    expect(isAdmin.value).toBe(true);
    expect(isManager.value).toBe(true);
  });

  it('MANAGER имеет права manager, но не admin', () => {
    const authStore = useAuthStore();
    authStore.user = createUser(EPermissionTypes.MANAGER);

    const { isAdmin, isManager } = usePermissionVisibility();

    expect(isAdmin.value).toBe(false);
    expect(isManager.value).toBe(true);
  });

  it('USER не имеет прав admin или manager', () => {
    const authStore = useAuthStore();
    authStore.user = createUser(EPermissionTypes.USER);

    const { isAdmin, isManager } = usePermissionVisibility();

    expect(isAdmin.value).toBe(false);
    expect(isManager.value).toBe(false);
  });

  it('флаг is_user отключает права admin и manager независимо от роли', () => {
    const authStore = useAuthStore();
    authStore.user = createUser(EPermissionTypes.ADMIN, true);

    const { isAdmin, isManager } = usePermissionVisibility();

    expect(isAdmin.value).toBe(false);
    expect(isManager.value).toBe(false);
  });

  it('реактивно обновляет вычисления при смене роли и флага is_user', () => {
    const authStore = useAuthStore();
    authStore.user = createUser(EPermissionTypes.MANAGER);

    const { isAdmin, isManager } = usePermissionVisibility();

    expect(isAdmin.value).toBe(false);
    expect(isManager.value).toBe(true);

    authStore.user = createUser(EPermissionTypes.ADMIN, true);

    expect(isAdmin.value).toBe(false);
    expect(isManager.value).toBe(false);

    authStore.user = createUser(EPermissionTypes.ADMIN, false);

    expect(isAdmin.value).toBe(true);
    expect(isManager.value).toBe(true);
  });
});
