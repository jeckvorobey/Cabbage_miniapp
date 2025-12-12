import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import AddAddressModal from '../AddAddressModal.vue';
import { useAddressesStore } from 'src/stores/addressesStore';
import type { IAddresse } from 'src/types/addresse.interface';

// Мокаем Quasar
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: vi.fn(),
    loading: {
      show: vi.fn(),
      hide: vi.fn(),
    },
  }),
  QDialog: {
    name: 'QDialog',
    template: '<div><slot /></div>',
    props: ['modelValue', 'persistent'],
  },
  QCard: {
    name: 'QCard',
    template: '<div><slot /></div>',
  },
  QForm: {
    name: 'QForm',
    template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
  },
  QCardSection: {
    name: 'QCardSection',
    template: '<div><slot /></div>',
    props: ['v-if'],
  },
  QSelect: {
    name: 'QSelect',
    template: '<select />',
    props: [
      'modelValue',
      'options',
      'rules',
      'label',
      'outlined',
      'clearable',
      'use-input',
      'input-debounce',
      'option-label',
      'option-value',
      'loading',
    ],
  },
  QInput: {
    name: 'QInput',
    template: '<input />',
    props: ['modelValue', 'label', 'outlined', 'type', 'rows'],
  },
  QToggle: {
    name: 'QToggle',
    template: '<input type="checkbox" />',
    props: ['modelValue', 'label'],
  },
  QCardActions: {
    name: 'QCardActions',
    template: '<div><slot /></div>',
    props: ['align'],
  },
  QBtn: {
    name: 'QBtn',
    template: '<button><slot /></button>',
    props: ['color', 'flat', 'label', 'type'],
    directives: {
      'close-popup': {},
    },
  },
  ClosePopup: {},
}));

// Мокаем stores
vi.mock('src/stores/addressesStore', () => ({
  useAddressesStore: vi.fn(),
}));

// Мокаем useUtils
vi.mock('src/use/useUtils', () => ({
  required: (val: unknown) => {
    if (typeof val === 'string' || Array.isArray(val)) {
      return val.length > 0 || 'Обязательное поле';
    }
    return (val !== null && val !== undefined) || 'Обязательное поле';
  },
}));

describe('AddAddressModal', () => {
  let mockAddressesStore: ReturnType<typeof useAddressesStore>;

  beforeEach(() => {
    setActivePinia(createPinia());

    // Мокаем window.ymaps
    (global as any).window = {
      ...global.window,
      ymaps: undefined,
    };

    mockAddressesStore = {
      fetchDeliveryZones: vi.fn().mockResolvedValue([
        { id: 1, title: 'Зона 1' },
        { id: 2, title: 'Зона 2' },
      ]),
      createAddress: vi.fn().mockResolvedValue({ id: 1 }),
      updateAddress: vi.fn().mockResolvedValue({ id: 1 }),
      deliveryZones: [],
    } as any;

    vi.mocked(useAddressesStore).mockReturnValue(mockAddressesStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Рендеринг', () => {
    it('должен отображать модальное окно для создания адреса', () => {
      const wrapper = mount(AddAddressModal, {
        props: { newAddress: null },
      });

      expect(wrapper.text()).toContain('Создание нового адреса доставки');
    });

    it('должен инициализировать адрес из пропсов', async () => {
      const newAddress: IAddresse = {
        id: 1,
        address_line: 'Тестовый адрес',
        area_id: 1,
        comment: 'Комментарий',
        is_default: true,
      };

      const wrapper = mount(AddAddressModal, {
        props: { newAddress },
      });

      await wrapper.vm.$nextTick();
      const component = wrapper.vm as any;
      expect(component.address.address_line).toBe('Тестовый адрес');
    });
  });

  describe('Функция searchAddress', () => {
    it('должна очищать suggestions при пустом запросе', async () => {
      const wrapper = mount(AddAddressModal, {
        props: { newAddress: null },
      });

      const component = wrapper.vm as any;
      const updateFn = vi.fn((cb: () => void) => cb());

      await component.searchAddress('', updateFn);

      expect(component.searchLabel).toBe('Начните вводить адрес...');
      expect(updateFn).toHaveBeenCalled();
    });

    it('должна показывать уведомление, если ymaps недоступен', async () => {
      const wrapper = mount(AddAddressModal, {
        props: { newAddress: null },
      });

      const component = wrapper.vm as any;
      const updateFn = vi.fn();

      await component.searchAddress('Москва', updateFn);

      expect(component.$q.notify).toHaveBeenCalledWith({
        message: 'Сервис карт недоступен.',
        type: 'negative',
      });
    });

    it('должна корректно обрабатывать результаты геокодирования', async () => {
      // Мокаем ymaps
      const mockGeoObject = {
        geometry: {
          getCoordinates: vi.fn().mockReturnValue([37.617644, 55.755819]),
        },
        properties: {
          get: vi.fn().mockReturnValue('Москва, ул. Тестовая, 1'),
        },
      };

      const mockResponse = {
        geoObjects: {
          toArray: vi.fn().mockReturnValue([mockGeoObject]),
        },
      };

      (global as any).window.ymaps = {
        geocode: vi.fn().mockResolvedValue(mockResponse),
      };

      const wrapper = mount(AddAddressModal, {
        props: { newAddress: null },
      });

      const component = wrapper.vm as any;
      const updateFn = vi.fn((cb: () => void) => cb());

      await component.searchAddress('Москва', updateFn);

      expect(component.isLoading).toBe(false);
      expect(updateFn).toHaveBeenCalled();
      expect(component.suggestions).toHaveLength(1);
      expect(component.suggestions[0]).toEqual({
        coords: [37.617644, 55.755819],
        displayName: 'Москва, ул. Тестовая, 1',
      });
    });

    it('должна обрабатывать ошибки геокодирования', async () => {
      (global as any).window.ymaps = {
        geocode: vi.fn().mockRejectedValue(new Error('Ошибка геокодирования')),
      };

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = mount(AddAddressModal, {
        props: { newAddress: null },
      });

      const component = wrapper.vm as any;
      const updateFn = vi.fn();

      await component.searchAddress('Москва', updateFn);

      expect(component.isLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка геокодирования:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('должна устанавливать правильный searchLabel при отсутствии результатов', async () => {
      const mockResponse = {
        geoObjects: {
          toArray: vi.fn().mockReturnValue([]),
        },
      };

      (global as any).window.ymaps = {
        geocode: vi.fn().mockResolvedValue(mockResponse),
      };

      const wrapper = mount(AddAddressModal, {
        props: { newAddress: null },
      });

      const component = wrapper.vm as any;
      const updateFn = vi.fn((cb: () => void) => cb());

      await component.searchAddress('Несуществующий адрес', updateFn);

      expect(component.searchLabel).toBe('Адрес не найден');
    });
  });

  describe('Функция addAddres', () => {
    it('должна вызывать createAddress для нового адреса', async () => {
      const wrapper = mount(AddAddressModal, {
        props: { newAddress: null },
      });

      const component = wrapper.vm as any;
      component.address = {
        address_line: 'Новый адрес',
        area_id: 1,
        comment: '',
        is_default: false,
      };
      component.dialogRef = {
        hide: vi.fn(),
      };

      await component.addAddres();

      expect(mockAddressesStore.createAddress).toHaveBeenCalledWith({
        address_line: 'Новый адрес',
        area_id: 1,
        comment: '',
        is_default: false,
      });
    });

    it('должна вызывать updateAddress для существующего адреса', async () => {
      const existingAddress: IAddresse = {
        id: 1,
        address_line: 'Существующий адрес',
        area_id: 1,
        comment: '',
        is_default: false,
      };

      const wrapper = mount(AddAddressModal, {
        props: { newAddress: existingAddress },
      });

      const component = wrapper.vm as any;
      component.dialogRef = {
        hide: vi.fn(),
      };

      await component.addAddres();

      expect(mockAddressesStore.updateAddress).toHaveBeenCalled();
    });

    it('не должна выполнять действия, если address.value отсутствует', async () => {
      const wrapper = mount(AddAddressModal, {
        props: { newAddress: null },
      });

      const component = wrapper.vm as any;
      component.address = null;
      component.dialogRef = {
        hide: vi.fn(),
      };

      await component.addAddres();

      expect(mockAddressesStore.createAddress).not.toHaveBeenCalled();
      expect(mockAddressesStore.updateAddress).not.toHaveBeenCalled();
    });
  });
});

