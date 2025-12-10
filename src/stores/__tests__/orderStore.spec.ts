import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOrderStore } from '../orderStore';
import { client } from 'src/api/client';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('orderStore', () => {
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
      const store = useOrderStore();

      expect(store.basketData).toEqual([]);
      expect(store.totalCost).toBeUndefined();
    });
  });

  describe('createOrder', () => {
    it('должен создать заказ успешно', async () => {
      const store = useOrderStore();
      const mockOrder = { productId: 1, quantity: 2 };
      const mockResponse = { data: { id: 1, ...mockOrder } };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.createOrder(mockOrder);

      expect(clientPostMock).toHaveBeenCalledWith('order', mockOrder);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном создании', async () => {
      const store = useOrderStore();
      const mockError = new Error('Network error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.createOrder({})).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OrderStore] - An error occurred while createing via createOrder',
        'Network error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchOrder', () => {
    it('должен получить список заказов', async () => {
      const store = useOrderStore();
      const mockResponse = { data: [{ id: 1 }, { id: 2 }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchOrder();

      expect(clientGetMock).toHaveBeenCalledWith('orders');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useOrderStore();
      const mockError = new Error('Server error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchOrder()).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OrderStore] - An error occurred while fetching via fetchOrders',
        'Server error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchMyOrder', () => {
    it('должен получить мои заказы', async () => {
      const store = useOrderStore();
      const mockResponse = { data: [{ id: 1, userId: 1 }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchMyOrder();

      expect(clientGetMock).toHaveBeenCalledWith('orders/my');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useOrderStore();
      const mockError = new Error('Not found');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchMyOrder()).rejects.toThrow('Not found');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OrderStore] - An error occurred while fetching via fetchMyOrder',
        'Not found'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchOrderById', () => {
    it('должен получить заказ по ID', async () => {
      const store = useOrderStore();
      const mockResponse = { data: { id: 1, status: 'pending' } };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchOrderById(1);

      expect(clientGetMock).toHaveBeenCalledWith('orders/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useOrderStore();
      const mockError = new Error('Not found');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchOrderById(1)).rejects.toThrow('Not found');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OrderStore] - An error occurred while fetching via fetchOrderById',
        'Not found'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateOrder', () => {
    it('должен обновить заказ успешно', async () => {
      const store = useOrderStore();
      const mockOrder = { id: 1, status: 'completed' };
      const mockResponse = { data: mockOrder };

      clientPatchMock.mockResolvedValueOnce(mockResponse);

      const result = await store.updateOrder(mockOrder);

      expect(clientPatchMock).toHaveBeenCalledWith('/addresses/1', mockOrder);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном обновлении', async () => {
      const store = useOrderStore();
      const mockOrder = { id: 1 };
      const mockError = new Error('Update failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPatchMock.mockRejectedValueOnce(mockError);

      await expect(store.updateOrder(mockOrder)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OrderStore] - An error occurred while creating via updateOrder',
        'Update failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('deleteOrder', () => {
    it('должен удалить заказ успешно', async () => {
      const store = useOrderStore();
      const mockResponse = { data: { success: true } };

      clientDeleteMock.mockResolvedValueOnce(mockResponse);

      const result = await store.deleteOrder(1);

      expect(clientDeleteMock).toHaveBeenCalledWith('orders/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном удалении', async () => {
      const store = useOrderStore();
      const mockError = new Error('Delete failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientDeleteMock.mockRejectedValueOnce(mockError);

      await expect(store.deleteOrder(1)).rejects.toThrow('Delete failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OrderStore] - An error occurred while deleting via deleteOrder',
        'Delete failed'
      );

      consoleSpy.mockRestore();
    });
  });
});

