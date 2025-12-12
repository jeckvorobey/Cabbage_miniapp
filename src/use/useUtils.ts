import { ref } from 'vue';

export enum EPermissionTypes {
  ADMIN = 1,
  MANAGER = 2,
  USER = 9,
}
const isActiveMenu = ref('Главная');
const admin = ref<boolean>(true);
const manager = ref<boolean>(true);
const user = ref<boolean>(false);

function accessLevel(data: any) {
  switch (data) {
    case EPermissionTypes.ADMIN:
      admin.value = true;
      return 'Администратор';
    case EPermissionTypes.MANAGER:
      manager.value = true;
      return 'Менеджер';
    case EPermissionTypes.USER:
      user.value = true;
      return 'Пользователь';
    default:
      return;
  }
}

function required(val: unknown): boolean | string {
  if (typeof val === 'string' || Array.isArray(val)) {
    return val.length > 0 || 'Обязательное поле';
  }
  return (val !== null && val !== undefined) || 'Обязательное поле';
}

const getImage = (path: string) => {
  return `/images/${path}`;
};

const fileLimitValidation = ($q: any) => {
  $q.notify({
    type: 'negative',
    message: 'Ошибка: Файл слишком большой!',
    caption: `Максимальный размер файла — 15 МБ.`,
    icon: 'warning',
  });
};

export { isActiveMenu, admin, manager, accessLevel, getImage, fileLimitValidation, required };
