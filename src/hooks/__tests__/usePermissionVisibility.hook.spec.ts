import { describe, it, expect } from 'vitest';
import { ref, computed } from 'vue';
import { usePermissionVisibility } from '../usePermissionVisibility.hook';
import { EPermissionTypes } from 'src/use/useUtils';

describe('usePermissionVisibility', () => {
  describe('Работа с различными типами источников данных', () => {
    it('должен обрабатывать прямую передачу роли', () => {
      const { permission, isAdmin, isManager, isUser } = usePermissionVisibility(
        EPermissionTypes.ADMIN
      );

      expect(permission.value).toBe(EPermissionTypes.ADMIN);
      expect(isAdmin.value).toBe(true);
      expect(isManager.value).toBe(true);
      expect(isUser.value).toBe(true);
    });

    it('должен обрабатывать объект с полем role', () => {
      const { permission, isManager } = usePermissionVisibility({
        role: EPermissionTypes.MANAGER,
      });

      expect(permission.value).toBe(EPermissionTypes.MANAGER);
      expect(isManager.value).toBe(true);
    });

    it('должен обрабатывать ref с ролью', () => {
      const roleRef = ref(EPermissionTypes.USER);
      const { permission, isUser } = usePermissionVisibility(roleRef);

      expect(permission.value).toBe(EPermissionTypes.USER);
      expect(isUser.value).toBe(true);

      roleRef.value = EPermissionTypes.ADMIN;
      expect(permission.value).toBe(EPermissionTypes.ADMIN);
    });

    it('должен обрабатывать computed с объектом пользователя', () => {
      const user = ref({ role: EPermissionTypes.MANAGER, is_user: false });
      const { permission, isManager } = usePermissionVisibility(computed(() => user.value));

      expect(permission.value).toBe(EPermissionTypes.MANAGER);
      expect(isManager.value).toBe(true);
    });

    it('должен возвращать undefined для null и undefined', () => {
      const { permission } = usePermissionVisibility(null);
      expect(permission.value).toBeUndefined();

      const { permission: permission2 } = usePermissionVisibility(undefined);
      expect(permission2.value).toBeUndefined();
    });

    it('должен возвращать undefined для невалидных значений роли', () => {
      const { permission } = usePermissionVisibility(999 as EPermissionTypes);
      expect(permission.value).toBeUndefined();
    });
  });

  describe('Работа с флагом is_user', () => {
    it('должен устанавливать роль USER, если is_user === true, независимо от роли', () => {
      const user = { role: EPermissionTypes.ADMIN, is_user: true };
      const { permission, isAdmin, isManager, isUser } = usePermissionVisibility(user);

      expect(permission.value).toBe(EPermissionTypes.USER);
      expect(isAdmin.value).toBe(false);
      expect(isManager.value).toBe(false);
      expect(isUser.value).toBe(true);
    });

    it('должен работать как ADMIN, если is_user === false', () => {
      const user = { role: EPermissionTypes.ADMIN, is_user: false };
      const { permission, isAdmin, isManager, isUser } = usePermissionVisibility(user);

      expect(permission.value).toBe(EPermissionTypes.ADMIN);
      expect(isAdmin.value).toBe(true);
      expect(isManager.value).toBe(true);
      expect(isUser.value).toBe(true);
    });

    it('должен работать как MANAGER, если is_user === false', () => {
      const user = { role: EPermissionTypes.MANAGER, is_user: false };
      const { permission, isAdmin, isManager, isUser } = usePermissionVisibility(user);

      expect(permission.value).toBe(EPermissionTypes.MANAGER);
      expect(isAdmin.value).toBe(false);
      expect(isManager.value).toBe(true);
      expect(isUser.value).toBe(true);
    });

    it('должен принудительно устанавливать USER, если is_user === true для MANAGER', () => {
      const user = { role: EPermissionTypes.MANAGER, is_user: true };
      const { permission, isAdmin, isManager, isUser } = usePermissionVisibility(user);

      expect(permission.value).toBe(EPermissionTypes.USER);
      expect(isAdmin.value).toBe(false);
      expect(isManager.value).toBe(false);
      expect(isUser.value).toBe(true);
    });

    it('должен работать с реактивным is_user флагом', () => {
      const user = ref({ role: EPermissionTypes.ADMIN, is_user: false });
      const { permission, isAdmin, isManager, isUser } = usePermissionVisibility(
        computed(() => user.value)
      );

      expect(permission.value).toBe(EPermissionTypes.ADMIN);
      expect(isAdmin.value).toBe(true);
      expect(isManager.value).toBe(true);

      // Переключаем is_user в true
      user.value = { ...user.value, is_user: true };

      expect(permission.value).toBe(EPermissionTypes.USER);
      expect(isAdmin.value).toBe(false);
      expect(isManager.value).toBe(false);
      expect(isUser.value).toBe(true);
    });

    it('должен обрабатывать отсутствие is_user как false', () => {
      const user = { role: EPermissionTypes.ADMIN };
      const { permission, isAdmin } = usePermissionVisibility(user);

      expect(permission.value).toBe(EPermissionTypes.ADMIN);
      expect(isAdmin.value).toBe(true);
    });

    it('должен обрабатывать null в is_user как false', () => {
      const user = { role: EPermissionTypes.ADMIN, is_user: null };
      const { permission, isAdmin } = usePermissionVisibility(user);

      expect(permission.value).toBe(EPermissionTypes.ADMIN);
      expect(isAdmin.value).toBe(true);
    });
  });

  describe('Проверки иерархии ролей', () => {
    it('ADMIN должен иметь все права', () => {
      const { isAdmin, isManager, isUser } = usePermissionVisibility(EPermissionTypes.ADMIN);

      expect(isAdmin.value).toBe(true);
      expect(isManager.value).toBe(true);
      expect(isUser.value).toBe(true);
    });

    it('MANAGER должен иметь права MANAGER и USER, но не ADMIN', () => {
      const { isAdmin, isManager, isUser } = usePermissionVisibility(EPermissionTypes.MANAGER);

      expect(isAdmin.value).toBe(false);
      expect(isManager.value).toBe(true);
      expect(isUser.value).toBe(true);
    });

    it('USER должен иметь только права USER', () => {
      const { isAdmin, isManager, isUser } = usePermissionVisibility(EPermissionTypes.USER);

      expect(isAdmin.value).toBe(false);
      expect(isManager.value).toBe(false);
      expect(isUser.value).toBe(true);
    });
  });

  describe('Функция hasPermission', () => {
    it('должен возвращать true для точного совпадения роли', () => {
      const { hasPermission } = usePermissionVisibility(EPermissionTypes.MANAGER);

      expect(hasPermission(EPermissionTypes.MANAGER).value).toBe(true);
      expect(hasPermission(EPermissionTypes.USER).value).toBe(true);
      expect(hasPermission(EPermissionTypes.ADMIN).value).toBe(false);
    });

    it('ADMIN должен проходить все проверки', () => {
      const { hasPermission } = usePermissionVisibility(EPermissionTypes.ADMIN);

      expect(hasPermission(EPermissionTypes.ADMIN).value).toBe(true);
      expect(hasPermission(EPermissionTypes.MANAGER).value).toBe(true);
      expect(hasPermission(EPermissionTypes.USER).value).toBe(true);
    });

    it('должен учитывать флаг is_user в hasPermission', () => {
      const user = { role: EPermissionTypes.ADMIN, is_user: true };
      const { hasPermission } = usePermissionVisibility(user);

      // С is_user === true доступны только права USER
      expect(hasPermission(EPermissionTypes.USER).value).toBe(true);
      expect(hasPermission(EPermissionTypes.MANAGER).value).toBe(false);
      expect(hasPermission(EPermissionTypes.ADMIN).value).toBe(false);
    });

    it('должен возвращать false для undefined permission', () => {
      const { hasPermission } = usePermissionVisibility(null);

      expect(hasPermission(EPermissionTypes.USER).value).toBe(false);
    });
  });

  describe('Граничные случаи', () => {
    it('должен обрабатывать изменение источника с null на валидную роль', () => {
      const user = ref<{ role: number; is_user?: boolean } | null>(null);
      const { permission, isManager } = usePermissionVisibility(computed(() => user.value));

      expect(permission.value).toBeUndefined();
      expect(isManager.value).toBe(false);

      user.value = { role: EPermissionTypes.MANAGER };

      expect(permission.value).toBe(EPermissionTypes.MANAGER);
      expect(isManager.value).toBe(true);
    });

    it('должен обрабатывать изменение роли с сохранением is_user', () => {
      const user = ref({ role: EPermissionTypes.USER, is_user: true });
      const { permission, isUser } = usePermissionVisibility(computed(() => user.value));

      expect(permission.value).toBe(EPermissionTypes.USER);
      expect(isUser.value).toBe(true);

      // Меняем роль на ADMIN, но is_user остается true
      user.value = { role: EPermissionTypes.ADMIN, is_user: true };

      // Все равно должны быть права USER
      expect(permission.value).toBe(EPermissionTypes.USER);
      expect(isUser.value).toBe(true);
    });

    it('должен обрабатывать сложные вложенные ref структуры', () => {
      const innerRole = ref(EPermissionTypes.MANAGER);
      const innerIsUser = ref(false);
      const user = ref({
        role: innerRole,
        is_user: innerIsUser,
      });

      const { permission, isManager } = usePermissionVisibility(computed(() => user.value));

      expect(permission.value).toBe(EPermissionTypes.MANAGER);
      expect(isManager.value).toBe(true);

      // Меняем is_user через вложенный ref
      innerIsUser.value = true;

      expect(permission.value).toBe(EPermissionTypes.USER);
      expect(isManager.value).toBe(false);
    });
  });
});

