import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCategoriesStore } from '../categoriesStore';
import { client } from 'src/api/client';
import type { ICategorie } from 'src/types/categorie.interface';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('categoriesStore', () => {
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
    it('должен инициализироваться с пустым массивом категорий', () => {
      const store = useCategoriesStore();

      expect(store.categories).toBeUndefined();
    });
  });

  describe('createCategories', () => {
    it('должен создать категорию успешно', async () => {
      const store = useCategoriesStore();
      const mockCategory = { name: 'Test Category' };
      const mockResponse = { data: { id: 1, ...mockCategory } as ICategorie };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.createCategories(mockCategory);

      expect(clientPostMock).toHaveBeenCalledWith('/categories', mockCategory);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном создании', async () => {
      const store = useCategoriesStore();
      const mockError = new Error('Network error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.createCategories({})).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CategoriesStore] - An error occurred while createing via Categori',
        'Network error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateCategorie', () => {
    it('должен обновить категорию успешно', async () => {
      const store = useCategoriesStore();
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('name', 'Updated Category');
      const mockResponse = { data: { id: 1, name: 'Updated Category' } };

      clientPutMock.mockResolvedValueOnce(mockResponse);

      const result = await store.updateCategorie(formData);

      expect(clientPutMock).toHaveBeenCalledWith('/categories/1', formData);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном обновлении', async () => {
      const store = useCategoriesStore();
      const formData = new FormData();
      formData.append('id', '1');
      const mockError = new Error('Update failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPutMock.mockRejectedValueOnce(mockError);

      await expect(store.updateCategorie(formData)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CategoriesStore] - An error occurred while fetching via updateCategorie',
        'Update failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchCategories', () => {
    it('должен получить список категорий и сохранить в store', async () => {
      const store = useCategoriesStore();
      const mockCategories: ICategorie[] = [
        { id: 1, name: 'Category 1' } as ICategorie,
        { id: 2, name: 'Category 2' } as ICategorie,
      ];
      const mockResponse = { data: mockCategories };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchCategories();

      expect(clientGetMock).toHaveBeenCalledWith('categories');
      expect(store.categories).toEqual(mockCategories);
      expect(result).toEqual(mockCategories);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useCategoriesStore();
      const mockError = new Error('Server error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchCategories()).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CategoriesStore] - An error occurred while fetching via fetchCategorie',
        'Server error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('deleteCategorie', () => {
    it('должен удалить категорию успешно', async () => {
      const store = useCategoriesStore();
      const mockResponse = { data: { success: true } };

      clientDeleteMock.mockResolvedValueOnce(mockResponse);

      const result = await store.deleteCategorie(1);

      expect(clientDeleteMock).toHaveBeenCalledWith('categories/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном удалении', async () => {
      const store = useCategoriesStore();
      const mockError = new Error('Delete failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientDeleteMock.mockRejectedValueOnce(mockError);

      await expect(store.deleteCategorie(1)).rejects.toThrow('Delete failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CategoriesStore] - An error occurred while deleting via deleteCategorie',
        'Delete failed'
      );

      consoleSpy.mockRestore();
    });
  });
});

