import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Мокаем vue-yandex-maps
const mockCreateYmaps = vi.fn(() => ({
  install: vi.fn(),
}));

vi.mock('vue-yandex-maps', () => ({
  createYmaps: mockCreateYmaps,
}));

describe('yandex-maps boot file', () => {
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    // Очищаем переменные окружения перед каждым тестом
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    consoleWarnSpy.mockClear();
    vi.unstubAllEnvs();
  });

  it('инициализирует Yandex Maps плагин, когда API ключ установлен', async () => {
    // Устанавливаем API ключ через vi.stubEnv
    vi.stubEnv('VITE_YANDEX_MAPS_API_KEY', 'test-api-key-123');

    const mockApp = {
      use: vi.fn(),
    } as any;

    // Импортируем и вызываем boot функцию
    const bootModule = await import('../yandex-maps');
    const bootFunction = bootModule.default;
    (bootFunction as any)({ app: mockApp });

    // Проверяем, что createYmaps был вызван с правильными параметрами
    expect(mockCreateYmaps).toHaveBeenCalledWith({
      apikey: 'test-api-key-123',
      lang: 'ru_RU',
      version: '2.1',
    });

    // Проверяем, что app.use был вызван
    expect(mockApp.use).toHaveBeenCalled();
  });

  it('не инициализирует плагин и выводит предупреждение, когда API ключ отсутствует', async () => {
    // Убираем API ключ
    vi.stubEnv('VITE_YANDEX_MAPS_API_KEY', undefined);

    const mockApp = {
      use: vi.fn(),
    } as any;

    // Импортируем и вызываем boot функцию
    const bootModule = await import('../yandex-maps');
    const bootFunction = bootModule.default;
    (bootFunction as any)({ app: mockApp });

    // Проверяем, что createYmaps не был вызван
    expect(mockCreateYmaps).not.toHaveBeenCalled();

    // Проверяем, что app.use не был вызван
    expect(mockApp.use).not.toHaveBeenCalled();

    // Проверяем, что было выведено предупреждение
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[YandexMaps] - VITE_YANDEX_MAPS_API_KEY не установлен в переменных окружения'
    );
  });

  it('не инициализирует плагин, когда API ключ пустая строка', async () => {
    // Устанавливаем пустой API ключ
    vi.stubEnv('VITE_YANDEX_MAPS_API_KEY', '');

    const mockApp = {
      use: vi.fn(),
    } as any;

    // Импортируем и вызываем boot функцию
    const bootModule = await import('../yandex-maps');
    const bootFunction = bootModule.default;
    (bootFunction as any)({ app: mockApp });

    // Проверяем, что createYmaps не был вызван
    expect(mockCreateYmaps).not.toHaveBeenCalled();

    // Проверяем, что app.use не был вызван
    expect(mockApp.use).not.toHaveBeenCalled();

    // Проверяем, что было выведено предупреждение
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[YandexMaps] - VITE_YANDEX_MAPS_API_KEY не установлен в переменных окружения'
    );
  });
});

