import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePaymentsStore } from '../paymentsStore';
import { client } from 'src/api/client';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    post: vi.fn(),
  },
}));

describe('paymentsStore', () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const clientPostMock = vi.mocked(client.post);

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createPayments', () => {
    it('должен создать платеж успешно', async () => {
      const store = usePaymentsStore();
      const mockResponse = { data: { id: 1, status: 'pending' } };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.createPayments();

      expect(clientPostMock).toHaveBeenCalledWith('/payments/yookassa/callback');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном создании', async () => {
      const store = usePaymentsStore();
      const mockError = new Error('Payment failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.createPayments()).rejects.toThrow('Payment failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[PaymentsStore] - An error occurred while fetching via createPayments',
        'Payment failed'
      );

      consoleSpy.mockRestore();
    });
  });
});
