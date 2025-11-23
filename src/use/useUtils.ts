import { ref } from 'vue';
export enum EPermissionTypes {
  ADMIN = 1,
  MANAGER = 2,
  USER = 9
}
const isActiveMenu = ref('Главная')
const admin = ref<boolean>(true);
const manager = ref<boolean>(true);
const user = ref<boolean>(false);

function accessLevel(data: any) {
  switch (data) {
    case EPermissionTypes.ADMIN:
      admin.value = true;
      return 'Администратор'
    case EPermissionTypes.MANAGER:
      manager.value = true;
      return 'Менеджер'
    case EPermissionTypes.USER:
      user.value = true;
      return 'Пользователь'
    default:
      return
  }
}

const getImage = (path: string) => {
  return `/images/${path}`;
};

export { isActiveMenu, admin, manager, accessLevel, getImage };
