import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../authStore';
import { client } from 'src/api/client';
import type { IUser } from 'src/types/user.interface';
import { EPermissionTypes } from 'src/use/useUtils';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    post: vi.fn(),
  },
}));

describe('authStore', () => {
  let localStorageMock: { [key: string]: string };
  let localStorageSetItemMock: ReturnType<typeof vi.fn>;

  // Получаем мок один раз вне beforeEach
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientPostMock = vi.mocked(client.post);

  beforeEach(() => {
    // Создаем новый pinia instance перед каждым тестом
    setActivePinia(createPinia());

    // Мокаем localStorage
    localStorageMock = {};
    localStorageSetItemMock = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: localStorageSetItemMock,
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Инициализация store', () => {
    it('должен инициализироваться с пустыми значениями', () => {
      const store = useAuthStore();

      expect(store.user).toBeNull();
      expect(store.token).toBe('');
      expect(store.toWalletAddress).toBe('');
      expect(store.telegramData).toBeUndefined();
    });
  });

  describe('Метод auth - успешная авторизация', () => {
    it('должен сохранить токен, пользователя и wallet при успешном ответе', async () => {
      const store = useAuthStore();
      const mockInitData = 'test_telegram_init_data';
      const mockResponse = {
        data: {
          token: 'test_token_123',
          user: {
            id: 1,
            telegram_id: 123456,
            full_name: 'Test User',
            role: EPermissionTypes.USER,
            is_user: false,
            username: 'testuser',
            name: 'Test',
            phone: null,
            subscribe_news: false,
            language_code: 'ru',
            is_premium: false,
            main_image_url: '',
            is_bot: false,
          } as IUser,
          toWalletAddress: '0x1234567890abcdef',
        },
      };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.auth(mockInitData);

      expect(clientPostMock).toHaveBeenCalledWith(
        '/tg/webapp/auth',
        { init_data: mockInitData },
        { headers: { SkipAuth: 'true' } }
      );

      expect(store.token).toBe('test_token_123');
      expect(store.user).toEqual(mockResponse.data.user);
      expect(store.toWalletAddress).toBe('0x1234567890abcdef');
      expect(store.telegramData).toBe(mockInitData);

      // Проверяем сохранение в localStorage
      expect(localStorageSetItemMock).toHaveBeenCalledWith('token', 'test_token_123');

      // Проверяем возвращаемое значение
      expect(result).toEqual(mockResponse.data);
    });

    it('должен сохранить пользователя с флагом is_user', async () => {
      const store = useAuthStore();
      const mockResponse = {
        data: {
          token: 'admin_token',
          user: {
            id: 2,
            full_name: 'Admin User',
            phone: null,
            subscribe_news: false,
            language_code: 'ru',
            is_premium: false,
            main_image_url: '',
            is_bot: false,
            username: 'adminuser',
            name: 'Admin',
            role: EPermissionTypes.ADMIN,
            is_user: true, // Админ смотрит как пользователь
          } as IUser,
        },
      };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      await store.auth('admin_init_data');

      expect(store.user?.is_user).toBe(true);
      expect(store.user?.role).toBe(EPermissionTypes.ADMIN);
    });

    it('должен работать без toWalletAddress в ответе', async () => {
      const store = useAuthStore();
      const mockResponse = {
        data: {
          token: 'test_token',
          user: {
            id: 3,
            full_name: 'Regular User',
            role: EPermissionTypes.USER,
            phone: null,
            subscribe_news: false,
            language_code: 'ru',
            is_premium: false,
            main_image_url: '',
            is_bot: false,
            username: 'testuser',
            name: 'Test',
          } as IUser,
        },
      };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      await store.auth('init_data');

      expect(store.token).toBe('test_token');
      expect(store.user).toEqual(mockResponse.data.user);
      expect(store.toWalletAddress).toBe(''); // Не изменился
    });

    it('должен сохранить пользователя с новыми полями интерфейса IUser', async () => {
      const store = useAuthStore();
      const mockUser: IUser = {
        id: 4,
        full_name: 'Complete User',
        phone: '+1234567890',
        subscribe_news: true,
        role: EPermissionTypes.MANAGER,
        language_code: 'ru',
        is_premium: true,
        main_image_url: 'https://example.com/avatar.jpg',
        is_bot: false,
        is_user: false,
        username: 'completeuser',
        name: 'Complete',
      };

      const mockResponse = {
        data: {
          token: 'manager_token',
          user: mockUser,
        },
      };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      await store.auth('complete_init_data');

      expect(store.user).toEqual(mockUser);
      expect(store.user?.phone).toBe('+1234567890');
      expect(store.user?.subscribe_news).toBe(true);
      expect(store.user?.language_code).toBe('ru');
      expect(store.user?.is_premium).toBe(true);
    });
  });

  describe('Метод auth - обработка ошибок', () => {
    it('должен выбросить ошибку при неудачной авторизации', async () => {
      const store = useAuthStore();
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.auth('invalid_data')).rejects.toEqual(mockError);

      // Store не должен измениться при ошибке
      expect(store.token).toBe('');
      expect(store.user).toBeNull();
    });

    it('должен обработать ошибку localStorage без падения', async () => {
      const store = useAuthStore();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Мокаем setItem для выброса ошибки
      localStorageSetItemMock.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const mockResponse = {
        data: {
          token: 'test_token',
          user: {
            id: 5,
            full_name: 'Test User',
            role: EPermissionTypes.USER,
            phone: null,
            subscribe_news: false,
            language_code: 'ru',
            is_premium: false,
            main_image_url: '',
            is_bot: false,
            username: 'testuser',
            name: 'Test',
          } as IUser,
        },
      };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.auth('test_data');

      // Авторизация должна пройти успешно, несмотря на ошибку localStorage
      expect(store.token).toBe('test_token');
      expect(store.user).toEqual(mockResponse.data.user);
      expect(result).toEqual(mockResponse.data);

      // Должно быть логирование предупреждения
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AuthStore] - Cannot access localStorage to save token',
        'localStorage not available'
      );

      consoleSpy.mockRestore();
    });

    it('должен сохранить telegramData даже при ошибке запроса', async () => {
      const store = useAuthStore();
      const testInitData = 'error_init_data';

      clientPostMock.mockRejectedValueOnce(new Error('Network error'));

      try {
        await store.auth(testInitData);
      } catch {
        // Ожидаем ошибку
      }

      // telegramData должен сохраниться перед запросом
      expect(store.telegramData).toBe(testInitData);
    });
  });

  describe('Интеграция с usePermissionVisibility', () => {
    it('должен предоставлять корректные данные для хука проверки прав', async () => {
      const store = useAuthStore();
      const mockResponse = {
        data: {
          token: 'test_token',
          user: {
            id: 6,
            role: EPermissionTypes.MANAGER,
            is_user: false,
          } as IUser,
        },
      };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      await store.auth('test');

      // Проверяем, что объект user содержит оба необходимых поля
      expect(store.user).toHaveProperty('role');
      expect(store.user).toHaveProperty('is_user');
      expect(store.user?.role).toBe(EPermissionTypes.MANAGER);
      expect(store.user?.is_user).toBe(false);
    });

    it('должен корректно обновлять флаг is_user при повторной авторизации', async () => {
      const store = useAuthStore();

      // Первая авторизация - обычный менеджер
      const mockResponse1 = {
        data: {
          token: 'token1',
          user: {
            id: 7,
            role: EPermissionTypes.MANAGER,
            is_user: false,
          } as IUser,
        },
      };

      clientPostMock.mockResolvedValueOnce(mockResponse1);
      await store.auth('data1');

      expect(store.user?.is_user).toBe(false);

      // Вторая авторизация - тот же пользователь, но смотрит как USER
      const mockResponse2 = {
        data: {
          token: 'token2',
          user: {
            id: 7,
            role: EPermissionTypes.MANAGER,
            is_user: true, // Включен режим просмотра как USER
          } as IUser,
        },
      };

      clientPostMock.mockResolvedValueOnce(mockResponse2);
      await store.auth('data2');

      expect(store.user?.is_user).toBe(true);
    });
  });
});

