import { ref } from 'vue';
export enum EPermissionTypes {
  ADMIN = '1',
  MANAGER = '2',
  USER = '9',
}

const admin = ref<boolean>(false);
const manager = ref<boolean>(false);
const user = ref<boolean>(false);

function accessLevel(data: any) {
  switch (data.role) {
    case EPermissionTypes.ADMIN:
      admin.value = true;
      break;
    case EPermissionTypes.MANAGER:
      manager.value = true;
      break;
      case EPermissionTypes.USER:
        user.value = true;
        break;
    default:
      break;
  }
}

export { admin, manager, accessLevel };
