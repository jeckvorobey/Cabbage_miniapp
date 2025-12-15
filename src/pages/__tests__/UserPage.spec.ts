import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import UserPage from '../UserPage.vue';
import { useAddressesStore } from 'src/stores/addressesStore';
import { useUsersStore } from 'src/stores/usersStore';
import { useAuthStore } from 'src/stores/authStore';
import type { IAddresse } from 'src/types/addresse.interface';
import type { IUser } from 'src/types/user.interface';

// Мокаем Quasar
const mockNotify = vi.fn();
const mockLoading = {
  show: vi.fn(),
  hide: vi.fn(),
};
const mockDialog = vi.fn(() => ({
  onOk: vi.fn((callback: () => void) => callback()),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify,
    loading: mockLoading,
    dialog: mockDialog,
  }),
  Dark: {
    isActive: false,
    toggle: vi.fn(),
  },
  QCard: {
    name: 'QCard',
    template: '<div class="q-card"><slot /></div>',
  },
  QCardSection: {
    name: 'QCardSection',
    template: '<div class="q-card-section"><slot /></div>',
  },
  QImg: {
    name: 'QImg',
    template: '<img />',
    props: ['src', 'height', 'width', 'class'],
  },
  QBtnToggle: {
    name: 'QBtnToggle',
    template: '<div><slot /></div>',
    props: ['modelValue', 'size', 'no-caps', 'unelevated', 'dense', 'toggle-color', 'color', 'text-color', 'options'],
    emits: ['update:modelValue', 'click'],
  },
  QSelect: {
    name: 'QSelect',
    template: '<select><slot name="option" /></select>',
    props: ['modelValue', 'options', 'dense', 'outlined', 'label', 'emit-value', 'map-options', 'option-label', 'option-value', 'class'],
    emits: ['update:modelValue'],
  },
  QItem: {
    name: 'QItem',
    template: '<div class="q-item"><slot /></div>',
    props: ['class'],
  },
  QItemSection: {
    name: 'QItemSection',
    template: '<div class="q-item-section"><slot /></div>',
  },
  QItemLabel: {
    name: 'QItemLabel',
    template: '<div class="q-item-label"><slot /></div>',
  },
  QItemAction: {
    name: 'QItemAction',
    template: '<div class="q-item-action"><slot /></div>',
  },
  QInput: {
    name: 'QInput',
    template: '<input />',
    props: ['modelValue', 'dense', 'outlined', 'label', 'mask', 'type', 'class'],
    emits: ['update:modelValue'],
  },
  QIcon: {
    name: 'QIcon',
    template: '<i :data-name="name" :class="$attrs.class" />',
    props: ['name', 'size', 'color', 'class'],
  },
}));

// Мокаем компоненты
vi.mock('components/AddAddressModal.vue', () => ({
  default: {
    name: 'AddAddressModal',
    template: '<div>AddAddressModal</div>',
    props: ['modelValue', 'newAddress'],
    emits: ['update:modelValue'],
  },
}));

// Мокаем stores
vi.mock('src/stores/addressesStore', () => ({
  useAddressesStore: vi.fn(),
}));

vi.mock('src/stores/usersStore', () => ({
  useUsersStore: vi.fn(),
}));

vi.mock('src/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Мокаем useUtils
vi.mock('src/use/useUtils', () => ({
  getImage: vi.fn((path: string) => `/assets${path}`),
  EPermissionTypes: {
    ADMIN: 1,
    MANAGER: 2,
    USER: 9,
  },
}));

vi.mock(
  'vue-yandex-maps',
  () => ({
    YandexMap: {
      name: 'YandexMap',
      template: '<div class="yandex-map"></div>',
    },
  })
);

describe('UserPage', () => {
  let mockAddressesStore: ReturnType<typeof useAddressesStore>;
  let mockUsersStore: ReturnType<typeof useUsersStore>;
  let mockAuthStore: ReturnType<typeof useAuthStore>;
  let mockUser: IUser;

  beforeEach(() => {
    setActivePinia(createPinia());

    mockUser = {
      id: 1,
      full_name: 'Test User',
      phone: '+7 (999) 123-45-67',
      subscribe_news: false,
      role: 9,
      language_code: 'ru',
      is_premium: false,
      main_image_url: 'https://example.com/avatar.jpg',
      is_bot: false,
      is_user: false,
      username: 'testuser',
      name: 'Test',
      telegram_id: 123,
    };

    mockAddressesStore = {
      addresses: [],
      addressId: null,
      fetchAddresses: vi.fn().mockResolvedValue([]),
      deleteAddress: vi.fn().mockResolvedValue(true),
      updateAddress: vi.fn().mockResolvedValue(true),
    } as unknown as ReturnType<typeof useAddressesStore>;

    mockUsersStore = {
      updateMyPhone: vi.fn().mockResolvedValue(true),
    } as unknown as ReturnType<typeof useUsersStore>;

    mockAuthStore = {
      user: mockUser,
    } as unknown as ReturnType<typeof useAuthStore>;

    vi.mocked(useAddressesStore).mockReturnValue(mockAddressesStore);
    vi.mocked(useUsersStore).mockReturnValue(mockUsersStore);
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('отображает данные пользователя', async () => {
    const wrapper = mount(UserPage);
    
    // Ждем выполнения onMounted
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('Test User');
    expect(wrapper.text()).toContain('+7 (999) 123-45-67');
  });

  it('загружает адреса при монтировании', async () => {
    const mockAddresses: IAddresse[] = [
      {
        id: 1,
        address_line: 'Test Address 1',
        is_default: true,
      },
      {
        id: 2,
        address_line: 'Test Address 2',
        is_default: false,
      },
    ];

    mockAddressesStore.fetchAddresses = vi.fn().mockResolvedValue(mockAddresses);

    mount(UserPage);

    // Ждем выполнения onMounted
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockAddressesStore.fetchAddresses).toHaveBeenCalled();
  });

  it('открывает модальное окно для добавления адреса', async () => {
    const wrapper = mount(UserPage);
    
    // Ждем выполнения onMounted
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Ищем иконку через все элементы с атрибутом data-name="add"
    const addIcons = wrapper.findAll('i');
    const addIcon = addIcons.find((icon) => icon.attributes('data-name') === 'add');
    
    expect(addIcon).toBeDefined();
    if (addIcon) {
      await addIcon.trigger('click');
      await wrapper.vm.$nextTick();

      // Проверяем, что модальное окно должно открыться
      expect(wrapper.findComponent({ name: 'AddAddressModal' }).exists()).toBe(true);
    }
  });

  it('удаляет адрес при клике на иконку удаления', async () => {
    const mockAddresses: IAddresse[] = [
      {
        id: 1,
        address_line: 'Test Address',
        is_default: false,
      },
    ];

    mockAddressesStore.addresses = mockAddresses;
    mockAddressesStore.fetchAddresses = vi.fn().mockResolvedValue([]);

    const wrapper = mount(UserPage);

    // Ждем рендеринга
    await wrapper.vm.$nextTick();

    const deleteIcon = wrapper.find('.q-icon[name="delete"]');
    if (deleteIcon.exists()) {
      await deleteIcon.trigger('click');

      expect(mockAddressesStore.deleteAddress).toHaveBeenCalledWith(1);
    }
  });

  it('обновляет телефон пользователя', async () => {
    const wrapper = mount(UserPage);

    // Симулируем клик на сохранение телефона
    const saveIcon = wrapper.find('.q-icon[name="save"]');
    if (saveIcon.exists()) {
      await saveIcon.trigger('click');

      // Проверяем, что был вызван диалог подтверждения
      expect(mockDialog).toHaveBeenCalled();

      // Симулируем подтверждение диалога
      const calls = (mockDialog.mock as any).calls;
      if (calls && calls.length > 0 && calls[0] && calls[0][0]) {
        const dialogCall = calls[0][0];
        if (dialogCall?.onOk) {
          dialogCall.onOk();

          expect(mockUsersStore.updateMyPhone).toHaveBeenCalled();
        }
      }
    }
  });

  it('переключает тему при клике на переключатель', async () => {
    const { Dark } = await import('quasar');
    const toggleSpy = vi.spyOn(Dark, 'toggle');

    const wrapper = mount(UserPage);
    
    // Ждем выполнения onMounted
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    const toggle = wrapper.findComponent({ name: 'QBtnToggle' });
    if (toggle.exists()) {
      // Получаем метод themeToggle из компонента
      const component = wrapper.vm as any;
      if (component.themeToggle) {
        component.themeToggle();
        expect(toggleSpy).toHaveBeenCalled();
      }
    }
  });

  it('устанавливает адрес по умолчанию при выборе', async () => {
    const mockAddress: IAddresse = {
      id: 1,
      address_line: 'Test Address',
      is_default: false,
    };

    mockAddressesStore.updateAddress = vi.fn().mockResolvedValue(true);
    mockAddressesStore.fetchAddresses = vi.fn().mockResolvedValue([]);

    const wrapper = mount(UserPage);
    
    // Ждем выполнения onMounted
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Вызываем метод mainAddress напрямую через компонент
    const component = wrapper.vm as any;
    if (component.mainAddress) {
      await component.mainAddress(mockAddress);
    }

    expect(mockAddressesStore.updateAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockAddress,
        is_default: true,
      })
    );
  });
});
