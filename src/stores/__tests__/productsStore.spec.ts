import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProductsStore } from '../productsStore';
import { client } from 'src/api/client';
import type { IProduct } from 'src/types/product.interface';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('productsStore', () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientPostMock = vi.mocked(client.post);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientGetMock = vi.mocked(client.get);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientPatchMock = vi.mocked(client.patch);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientDeleteMock = vi.mocked(client.delete);

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Инициализация store', () => {
    it('должен инициализироваться с пустыми значениями', () => {
      const store = useProductsStore();

      expect(store.products).toBeUndefined();
      expect(store.pagination).toEqual({
        offset: 0,
        limit: 20,
        total: 0,
        has_more: false,
      });
    });
  });

  describe('createProduct', () => {
    it('должен создать продукт успешно', async () => {
      const store = useProductsStore();
      const mockProduct = { name: 'Test Product', price: 100 };
      const mockResponse = { data: { id: 1, ...mockProduct } };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.createProduct(mockProduct);

      expect(clientPostMock).toHaveBeenCalledWith('products', mockProduct);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном создании', async () => {
      const store = useProductsStore();
      const mockError = new Error('Network error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.createProduct({})).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductsStore] - An error occurred while createing via product',
        'Network error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateProduct', () => {
    it('должен обновить продукт успешно', async () => {
      const store = useProductsStore();
      const mockProduct: IProduct = {
        id: 1,
        name: 'Updated Product',
        price: 200,
      } as IProduct;
      const mockResponse = { data: mockProduct };

      clientPatchMock.mockResolvedValueOnce(mockResponse);

      const result = await store.updateProduct(mockProduct);

      expect(clientPatchMock).toHaveBeenCalledWith(`/products/${mockProduct.id}`, mockProduct);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном обновлении', async () => {
      const store = useProductsStore();
      const mockProduct = { id: 1 } as IProduct;
      const mockError = new Error('Update failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPatchMock.mockRejectedValueOnce(mockError);

      await expect(store.updateProduct(mockProduct)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductsStore] - An error occurred while creating via updateProduct',
        'Update failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchProductsById', () => {
    it('должен получить продукт по ID', async () => {
      const store = useProductsStore();
      const mockProduct = { id: 1, name: 'Test Product' };
      const mockResponse = { data: mockProduct };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchProductsById(1);

      expect(clientGetMock).toHaveBeenCalledWith('/products/1');
      expect(result).toEqual(mockProduct);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useProductsStore();
      const mockError = new Error('Not found');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchProductsById(1)).rejects.toThrow('Not found');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductsStore] - An error occurred while fetching via product',
        'Not found'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchProducts', () => {
    it('должен получить список продуктов с параметрами', async () => {
      const store = useProductsStore();
      const params = { limit: 10, offset: 0 };
      const mockResponse = { data: [{ id: 1 }, { id: 2 }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchProducts(params);

      expect(clientGetMock).toHaveBeenCalledWith('products', { params });
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении списка', async () => {
      const store = useProductsStore();
      const mockError = new Error('Server error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchProducts({})).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductsStore] - An error occurred while fetching via products',
        'Server error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchProductsSearch', () => {
    it('должен выполнить поиск продуктов', async () => {
      const store = useProductsStore();
      const params = { query: 'test' };
      const mockResponse = { data: [{ id: 1, name: 'test product' }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchProductsSearch(params);

      expect(clientGetMock).toHaveBeenCalledWith('products/search', { params });
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном поиске', async () => {
      const store = useProductsStore();
      const mockError = new Error('Search failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchProductsSearch({})).rejects.toThrow('Search failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductsStore] - An error occurred while fetching via ProductsSearch',
        'Search failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('deleteProduct', () => {
    it('должен удалить продукт успешно', async () => {
      const store = useProductsStore();
      const mockResponse = { data: { success: true } };

      clientDeleteMock.mockResolvedValueOnce(mockResponse);

      const result = await store.deleteProduct(1);

      expect(clientDeleteMock).toHaveBeenCalledWith('products/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном удалении', async () => {
      const store = useProductsStore();
      const mockError = new Error('Delete failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientDeleteMock.mockRejectedValueOnce(mockError);

      await expect(store.deleteProduct(1)).rejects.toThrow('Delete failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductsStore] - An error occurred while deleting via Product',
        'Delete failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('uploadFile', () => {
    it('должен загрузить файл успешно', async () => {
      const store = useProductsStore();
      const formData = new FormData();
      const mockResponse = { data: { id: 1, url: 'http://example.com/image.jpg' } };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.uploadFile(1, formData);

      expect(clientPostMock).toHaveBeenCalledWith('/products/1/images', formData);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачной загрузке', async () => {
      const store = useProductsStore();
      const mockError = new Error('Upload failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.uploadFile(1, new FormData())).rejects.toThrow('Upload failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductsStore] - An error occurred while createing via uploadFile',
        'Upload failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('deleteFile', () => {
    it('должен удалить файл успешно', async () => {
      const store = useProductsStore();
      const mockResponse = { data: { success: true } };

      clientDeleteMock.mockResolvedValueOnce(mockResponse);

      const result = await store.deleteFile(1);

      expect(clientDeleteMock).toHaveBeenCalledWith('/products/images/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном удалении файла', async () => {
      const store = useProductsStore();
      const mockError = new Error('Delete file failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientDeleteMock.mockRejectedValueOnce(mockError);

      await expect(store.deleteFile(1)).rejects.toThrow('Delete file failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductsStore] - An error occurred while createing via deleteFile',
        'Delete file failed'
      );

      consoleSpy.mockRestore();
    });
  });
});
