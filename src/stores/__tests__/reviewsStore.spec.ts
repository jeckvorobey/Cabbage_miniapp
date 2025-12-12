import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useReviewsStore } from '../reviewsStore';
import { client } from 'src/api/client';
import type { IReviews } from 'src/types/reviews.interface';

// Мокаем axios client
vi.mock('src/api/client', () => ({
  client: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('reviewsStore', () => {
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
    it('должен инициализироваться с пустым значением reviewsData', () => {
      const store = useReviewsStore();

      expect(store.reviewsData).toBeUndefined();
    });
  });

  describe('fetchReviews', () => {
    it('должен получить список отзывов', async () => {
      const store = useReviewsStore();
      const mockResponse = { data: [{ id: 1 }, { id: 2 }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchReviews();

      expect(clientGetMock).toHaveBeenCalledWith('reviews');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useReviewsStore();
      const mockError = new Error('Server error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchReviews()).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ReviewsStore] - An error occurred while fetching via fetchReviews',
        'Server error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('fetchMyReviews', () => {
    it('должен получить мои отзывы', async () => {
      const store = useReviewsStore();
      const mockResponse = { data: [{ id: 1, userId: 1 }] };

      clientGetMock.mockResolvedValueOnce(mockResponse);

      const result = await store.fetchMyReviews();

      expect(clientGetMock).toHaveBeenCalledWith('reviews/my');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном получении', async () => {
      const store = useReviewsStore();
      const mockError = new Error('Not found');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientGetMock.mockRejectedValueOnce(mockError);

      await expect(store.fetchMyReviews()).rejects.toThrow('Not found');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ReviewsStore] - An error occurred while fetching via fetchMyReviews',
        'Not found'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('createReviews', () => {
    it('должен создать отзыв успешно', async () => {
      const store = useReviewsStore();
      const mockReview: IReviews = { id: 1, text: 'Great product' } as IReviews;
      const mockResponse = { data: mockReview };

      clientPostMock.mockResolvedValueOnce(mockResponse);

      const result = await store.createReviews(mockReview);

      expect(clientPostMock).toHaveBeenCalledWith('addresses', mockReview);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном создании', async () => {
      const store = useReviewsStore();
      const mockReview = { text: 'Test' } as IReviews;
      const mockError = new Error('Network error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPostMock.mockRejectedValueOnce(mockError);

      await expect(store.createReviews(mockReview)).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ReviewsStore] - An error occurred while createing via createReviews',
        'Network error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateReviews', () => {
    it('должен обновить отзыв успешно', async () => {
      const store = useReviewsStore();
      const mockReview: IReviews = { id: 1, text: 'Updated review' } as IReviews;
      const mockResponse = { data: mockReview };

      clientPatchMock.mockResolvedValueOnce(mockResponse);

      const result = await store.updateReviews(mockReview);

      expect(clientPatchMock).toHaveBeenCalledWith('/reviews/1', mockReview);
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном обновлении', async () => {
      const store = useReviewsStore();
      const mockReview = { id: 1 } as IReviews;
      const mockError = new Error('Update failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientPatchMock.mockRejectedValueOnce(mockError);

      await expect(store.updateReviews(mockReview)).rejects.toThrow('Update failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ReviewsStore] - An error occurred while creating via updateReviews',
        'Update failed'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('deleteReview', () => {
    it('должен удалить отзыв успешно', async () => {
      const store = useReviewsStore();
      const mockResponse = { data: { success: true } };

      clientDeleteMock.mockResolvedValueOnce(mockResponse);

      const result = await store.deleteReview(1);

      expect(clientDeleteMock).toHaveBeenCalledWith('reviews/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('должен выбросить ошибку при неудачном удалении', async () => {
      const store = useReviewsStore();
      const mockError = new Error('Delete failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      clientDeleteMock.mockRejectedValueOnce(mockError);

      await expect(store.deleteReview(1)).rejects.toThrow('Delete failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ReviewsStore] - An error occurred while deleting via deleteReview',
        'Delete failed'
      );

      consoleSpy.mockRestore();
    });
  });
});
