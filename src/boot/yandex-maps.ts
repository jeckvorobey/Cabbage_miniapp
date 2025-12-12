import { defineBoot } from '#q-app/wrappers';
import { createYmaps } from 'vue-yandex-maps';

export default defineBoot(({ app }) => {
  app.use(createYmaps({
    apikey: 'd0c80e2a-b8bd-436f-bfe0-efcd05feed2a',
    lang: 'ru_RU',
    version: '2.1'
  }));
});
