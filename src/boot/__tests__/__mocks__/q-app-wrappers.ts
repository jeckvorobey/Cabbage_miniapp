/**
 * Мок для #q-app/wrappers для тестирования boot файлов
 */
export function defineBoot(callback: (params: { app: { use: (plugin: any) => void } }) => void) {
  return callback;
}

