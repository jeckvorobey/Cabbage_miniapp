<template>
  <div class="q-mx-sm">

    <q-infinite-scroll :offset="250" @load="onLoad">
      <h6 class="text-center">Отзывы</h6>
      <q-card
        v-for="(review, RIndex) in reviewsStore.reviewsData"
        :key="RIndex"
        flat
        bordered
      >
        <q-card-section class="q-pb-xs">
          <q-item class="q-pa-none">
            <q-item-section avatar>
              <q-avatar color="grey-3" text-color="grey-6" icon="person" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">User</q-item-label>
              <q-item-label caption class="text-grey-7">
                {{ dateConverter(review.created_at) }}
              </q-item-label>
            </q-item-section>

            <!-- тут сожно добавить рейтинг -->
            <!-- <q-item-section side>
              <q-rating
                :model-value="4.5"
                max="5"
                size="24px"
                color="orange"
                icon="star_border"
                icon-selected="star"
                readonly
              />
            </q-item-section> -->
          </q-item>

          <div class="q-mt-sm text-green-7 text-caption flex items-center">
            <q-icon name="check_circle" size="16px" class="q-mr-xs" />
            <span class="text-weight-medium">Отзыв</span>
          </div>

          <div class="q-mt-sm">
            {{ review.text }}
          </div>
          <div v-if="showImage">
            <div
              v-for="(image, IIndex) in review.images"
              :key="IIndex"
            >
              <q-img
                class="cursor-pointer radius-8"
                :src="image.file_path"
                height="70px"
                width="70px"
                fit="cover"
              />
            </div>
          </div>
          <div class="flex justify-end">
            <q-icon size="30px" :name="showImage ? 'expand_less' : 'expand_more'" @click="showImage = !showImage" />
          </div>
        </q-card-section>
      </q-card>
    </q-infinite-scroll>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useReviewsStore } from 'src/stores/reviewsStore';
import { onMounted, ref } from 'vue';
import { dateConverter } from 'src/use/useUtils';

const $q = useQuasar();
const reviewsStore = useReviewsStore();
const showImage = ref(false)

onMounted(() => {
  fetchReviews();
});

const onLoad = async (index: number, done: (stop?: boolean) => void) => {
  if (!reviewsStore.pagination.has_more) {
    done(true);
    return;
  }
  await fetchReviews()
  reviewsStore.pagination.offset += reviewsStore.pagination.limit;
  done();
};

async function fetchReviews() {
  try {
    $q.loading.show();
    const params = {
      limit: reviewsStore.pagination.limit,
      offset: reviewsStore.pagination.offset,
    };
    const res = await reviewsStore.fetchReviews(params);
      if (res) {
        reviewsStore.pagination.total = res.total;
        reviewsStore.pagination.has_more = res.has_more;
        if (reviewsStore.reviewsData?.length) {
          reviewsStore.reviewsData.push(res.items);
        } else {
          reviewsStore.reviewsData = res.items;
        }
      }
    if (res) reviewsStore.reviewsData = res.items;
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}
</script>
