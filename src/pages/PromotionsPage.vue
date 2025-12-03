<template>
  <div class="q-pa-md">
    <h5 class="text-center q-ma-none q-mb-md">Акции</h5>
    
    <div v-if="promotions.length === 0" class="text-center text-grey-6 q-py-xl">
      <q-icon name="local_offer" size="64px" color="grey-4" />
      <div class="text-h6 q-mt-md">Пока нет активных акций</div>
      <div class="text-body2 q-mt-sm">Следите за обновлениями</div>
    </div>
    
    <div v-else class="row q-col-gutter-md">
      <div
        class="col-12"
        v-for="(promotion, index) in promotions"
        :key="index"
      >
        <q-card class="promotion-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-sm">
              <q-icon name="local_offer" size="24px" color="positive" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold">{{ promotion.title }}</div>
            </div>
            <div class="text-body2 text-grey-8">{{ promotion.description }}</div>
            <div class="text-caption text-grey-6 q-mt-sm">
              Действует до {{ promotion.endDate }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  // Временные данные для акций
  // В будущем можно будет загружать с сервера
  const promotions = ref<Array<{ title: string; description: string; endDate: string }>>([
    // Пример данных:
    // {
    //   title: 'Скидка 10% на первый заказ',
    //   description: 'Оформите первый заказ и получите скидку 10% на всю корзину',
    //   endDate: '31.12.2025'
    // }
  ]);
</script>

<style lang="scss" scoped>
.promotion-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.3s ease;
  }
}
</style>

