import { defineBoot } from '#q-app/wrappers';
import { createYmaps } from 'vue-yandex-maps';


export default defineBoot(({ app }) => {
    // Получаем API ключ из переменных окружения
  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('[YandexMaps] - VITE_YANDEX_MAPS_API_KEY не установлен в переменных окружения');
    // Не инициализируем плагин, если ключ отсутствует
    return;
  }

  app.use(createYmaps({
    apikey: apiKey,
  }));

});
