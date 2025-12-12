import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAddressesStore } from '../addressesStore';
import { client } from 'src/api/client';
import type { IAddresse } from 'src/types/addresse.interface';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('addressesStore', () => {
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
      const store = useAddressesStore();

      expect(store.addresses).toBeUndefined();
      expect(store.deliveryZones).toBeUndefined();
    });
  });

  describe('fetchAddresses', () => {
    it('должен получить список адресов', async () => {
      const store = useAddressesStore();
      const mockResponse = { data: [{ id: 1 }, { id: 2 }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchAddresses();

      expect(clientGetMock).toHaveBeenCalledWith('addresses');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useAddressesStore();
      const mockError = new Error('Server error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchAddresses()).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AddressesStore] - An error occurred while fetching via fetchAddresses',
        'Server error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('createAddress', () => {
    it('должен создать адрес успешно', async () => {
      const store = useAddressesStore();
      const mockAddress: IAddresse = { id: 1, street: 'Test Street' } as IAddresse;
      const mockResponse = { data: mockAddress };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.createAddress(mockAddress);

      expect(clientPostMock).toHaveBeenCalledWith('addresses', mockAddress);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном создании', async () => {
      const store = useAddressesStore();
      const mockAddress = { street: 'Test' } as IAddresse;
      const mockError = new Error('Network error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.createAddress(mockAddress)).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AddressesStore] - An error occurred while createing via createAddress',
        'Network error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateAddress', () => {
    it('должен обновить адрес успешно', async () => {
      const store = useAddressesStore();
      const mockAddress: IAddresse = { id: 1, street: 'Updated Street' } as IAddresse;
      const mockResponse = { data: mockAddress };

      clientPatchMock.mockResolvedValueOnce(mockResponse);

      const result = await store.updateAddress(mockAddress);

      expect(clientPatchMock).toHaveBeenCalledWith('/addresses/1', mockAddress);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном обновлении', async () => {
      const store = useAddressesStore();
      const mockAddress = { id: 1 } as IAddresse;
      const mockError = new Error('Update failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPatchMock.mockRejectedValueOnce(mockError);

      await expect(store.updateAddress(mockAddress)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AddressesStore] - An error occurred while creating via updateAddress',
        'Update failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('deleteAddress', () => {
    it('должен удалить адрес успешно', async () => {
      const store = useAddressesStore();
      const mockResponse = { data: { success: true } };

      clientDeleteMock.mockResolvedValueOnce(mockResponse);

      const result = await store.deleteAddress(1);

      expect(clientDeleteMock).toHaveBeenCalledWith('addresses/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном удалении', async () => {
      const store = useAddressesStore();
      const mockError = new Error('Delete failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientDeleteMock.mockRejectedValueOnce(mockError);

      await expect(store.deleteAddress(1)).rejects.toThrow('Delete failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AddressesStore] - An error occurred while deleting via deleteAddress',
        'Delete failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchDeliveryZones', () => {
    it('должен получить зоны доставки', async () => {
      const store = useAddressesStore();
      const mockResponse = { data: [{ id: 1, name: 'Zone 1' }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchDeliveryZones();

      expect(clientGetMock).toHaveBeenCalledWith('delivery-zones');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useAddressesStore();
      const mockError = new Error('Server error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchDeliveryZones()).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AddressesStore] - An error occurred while fetching via fetchAddresses',
        'Server error'
      );

      consoleSpy.mockRestore();
    });
  });
});
