<template>
  <div>
    <h6 class="text-center">Отзывы</h6>
  </div>
</template>

<script setup lang="ts">
  import { useQuasar } from 'quasar';
  import { useReviewsStore } from 'src/stores/reviewsStore';
  import { onMounted } from 'vue';

  const $q = useQuasar();
  const reviewsStore = useReviewsStore();

  onMounted(() => {
    fetchReviews()
  })

  async function fetchReviews() {
    try {
      $q.loading.show();
      const res = await reviewsStore.fetchReviews()
      if (res) reviewsStore.reviewsData = res.items
    } catch (e) {
      console.error(e);
    } finally {
      $q.loading.hide();
    }
  }
</script>
