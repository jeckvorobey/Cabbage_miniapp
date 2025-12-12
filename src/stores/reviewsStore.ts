import { defineStore } from 'pinia';
import { client } from 'src/api/client';
import type { IReviews } from 'src/types/reviews.interface';
import { ref } from 'vue';

export const useReviewsStore = defineStore('Reviews', () => {
  const reviewsData = ref<IReviews[]>();

  async function fetchReviews() {
    return client
      .get('reviews')
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ReviewsStore] - An error occurred while fetching via fetchReviews',
          err.message
        );
        throw err;
      });
  }

  async function fetchMyReviews() {
    return client
      .get('reviews/my')
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ReviewsStore] - An error occurred while fetching via fetchMyReviews',
          err.message
        );
        throw err;
      });
  }

  async function createReviews(reviews: IReviews) {
    return client
      .post<any>('addresses', reviews)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ReviewsStore] - An error occurred while createing via createReviews',
          err.message
        );
        throw err;
      });
  }

  async function updateReviews(reviews: IReviews) {
    return client
      .patch(`/reviews/${reviews.id}`, reviews)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ReviewsStore] - An error occurred while creating via updateReviews',
          err.message
        );
        throw err;
      });
  }

  async function deleteReview(id: number) {
    return client
      .delete(`reviews/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ReviewsStore] - An error occurred while deleting via deleteReview',
          err.message
        );
        throw err;
      });
  }

  return { reviewsData, fetchReviews, fetchMyReviews, createReviews, updateReviews, deleteReview };
});
