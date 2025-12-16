import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUsersStore } from '../usersStore';
import { client } from 'src/api/client';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('usersStore', () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientGetMock = vi.mocked(client.get);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientPatchMock = vi.mocked(client.patch);

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Инициализация store', () => {
    it('должен инициализироваться с пустым значением users', () => {
      const store = useUsersStore();

      expect(store.users).toBeUndefined();
    });
  });

  describe('fetchUsers', () => {
    it('должен получить список пользователей с параметрами', async () => {
      const store = useUsersStore();
      const params = { limit: 10, offset: 0 };
      const mockResponse = { data: [{ id: 1 }, { id: 2 }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchUsers(params);

      expect(clientGetMock).toHaveBeenCalledWith('users', { params });
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useUsersStore();
      const mockError = new Error('Server error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchUsers({})).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[UsersStore] - An error occurred while fetching via Users',
        'Server error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateUserRole', () => {
    it('должен обновить роль пользователя успешно', async () => {
      const store = useUsersStore();
      const mockResponse = { data: { id: 1, role: 2 } };

      clientPatchMock.mockResolvedValueOnce(mockResponse);

      const result = await store.updateUserRole(1, 2);

      expect(clientPatchMock).toHaveBeenCalledWith('/users/1/toggle-role', { role: 2 });
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном обновлении', async () => {
      const store = useUsersStore();
      const mockError = new Error('Update failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPatchMock.mockRejectedValueOnce(mockError);

      await expect(store.updateUserRole(1, 2)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[UsersStore] - An error occurred while creating via updateUserRole',
        'Update failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateMyPhone', () => {
    it('должен обновить телефон текущего пользователя успешно', async () => {
      const store = useUsersStore();
      const phone = 1234567890;
      const mockResponse = { data: { id: 1, phone } };

      clientPatchMock.mockResolvedValueOnce(mockResponse);

      const result = await store.updateMyPhone(phone);

      expect(clientPatchMock).toHaveBeenCalledWith('/users/me/phone', { phone });
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном обновлении', async () => {
      const store = useUsersStore();
      const mockError = new Error('Update failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPatchMock.mockRejectedValueOnce(mockError);

      await expect(store.updateMyPhone(1234567890)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[UsersStore] - An error occurred while creating via updateMyPhone',
        'Update failed'
      );

      consoleSpy.mockRestore();
    });
  });
});
