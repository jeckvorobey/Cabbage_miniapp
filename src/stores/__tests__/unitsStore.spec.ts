import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUnitsStore } from '../unitsStore';
import { client } from 'src/api/client';
import type { IUnit } from 'src/types/unit.interface';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('unitsStore', () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientPostMock = vi.mocked(client.post);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientGetMock = vi.mocked(client.get);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientPutMock = vi.mocked(client.put);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientDeleteMock = vi.mocked(client.delete);

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Инициализация store', () => {
    it('должен инициализироваться с пустым массивом единиц', () => {
      const store = useUnitsStore();

      expect(store.units).toEqual([]);
    });
  });

  describe('createUnit', () => {
    it('должен создать единицу измерения успешно', async () => {
      const store = useUnitsStore();
      const mockUnit: IUnit = { id: 1, name: 'кг' } as IUnit;
      const mockResponse = { data: mockUnit };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.createUnit(mockUnit);

      expect(clientPostMock).toHaveBeenCalledWith('units', mockUnit);
      expect(result).toEqual(mockUnit);
    });

    it('должен выбросить ошибку при неудачном создании', async () => {
      const store = useUnitsStore();
      const mockUnit = { name: 'кг' } as IUnit;
      const mockError = new Error('Network error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.createUnit(mockUnit)).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[UnitsStore] - An error occurred while createing via createUnit',
        'Network error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchUnitsById', () => {
    it('должен получить единицу измерения по ID', async () => {
      const store = useUnitsStore();
      const mockUnit: IUnit = { id: 1, name: 'кг' } as IUnit;
      const mockResponse = { data: mockUnit };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchUnitsById(1);

      expect(clientGetMock).toHaveBeenCalledWith('/units/1');
      expect(result).toEqual(mockUnit);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useUnitsStore();
      const mockError = new Error('Not found');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchUnitsById(1)).rejects.toThrow('Not found');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[UnitsStore] - An error occurred while fetching via fetchUnitsById',
        'Not found'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchUnits', () => {
    it('должен получить список единиц измерения и сохранить в store', async () => {
      const store = useUnitsStore();
      const mockUnits: IUnit[] = [{ id: 1, name: 'кг' } as IUnit, { id: 2, name: 'шт' } as IUnit];
      const mockResponse = { data: mockUnits };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      await store.fetchUnits();

      expect(clientGetMock).toHaveBeenCalledWith('units');
      expect(store.units).toEqual(mockUnits);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useUnitsStore();
      const mockError = new Error('Server error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchUnits()).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[UnitsStore] - An error occurred while fetching via fetchUnits',
        'Server error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateUnit', () => {
    it('должен обновить единицу измерения успешно', async () => {
      const store = useUnitsStore();
      const mockUnit: IUnit = { id: 1, name: 'обновленный кг' } as IUnit;
      const mockResponse = { data: mockUnit };

      clientPutMock.mockResolvedValueOnce(mockResponse);

      const result = await store.updateUnit(1, mockUnit);

      expect(clientPutMock).toHaveBeenCalledWith('/units/1', mockUnit);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном обновлении', async () => {
      const store = useUnitsStore();
      const mockUnit = { name: 'кг' } as IUnit;
      const mockError = new Error('Update failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPutMock.mockRejectedValueOnce(mockError);

      await expect(store.updateUnit(1, mockUnit)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[UnitsStore] - An error occurred while fetching via updateUnit',
        'Update failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('deleteUnit', () => {
    it('должен удалить единицу измерения успешно', async () => {
      const store = useUnitsStore();
      const mockResponse = { data: { success: true } };

      clientDeleteMock.mockResolvedValueOnce(mockResponse);

      const result = await store.deleteUnit(1);

      expect(clientDeleteMock).toHaveBeenCalledWith('units/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном удалении', async () => {
      const store = useUnitsStore();
      const mockError = new Error('Delete failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientDeleteMock.mockRejectedValueOnce(mockError);

      await expect(store.deleteUnit(1)).rejects.toThrow('Delete failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[UnitsStore] - An error occurred while deleting via deleteUnit',
        'Delete failed'
      );

      consoleSpy.mockRestore();
    });
  });
});
