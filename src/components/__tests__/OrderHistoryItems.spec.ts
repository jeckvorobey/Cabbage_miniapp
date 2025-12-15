import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import OrderHistoryItems from '../OrderHistoryItems.vue';
import { useOrderStore } from 'src/stores/orderStore';
import { EOrderStatus } from 'src/enums/order-status.enum';

// Мокаем Quasar
const mockNotify = vi.fn();
const mockLoading = {
  show: vi.fn(),
  hide: vi.fn(),
};
const mockDialog = vi.fn(() => ({
  onOk: vi.fn((callback: () => void) => callback()),
  onCancel: vi.fn(),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify,
    loading: mockLoading,
    dialog: mockDialog,
  }),
  QList: {
    name: 'QList',
    template: '<div class="q-list"><slot /></div>',
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
    props: ['caption', 'lines'],
  },
  QItemAction: {
    name: 'QItemAction',
    template: '<div class="q-item-action"><slot /></div>',
    props: ['v-if'],
  },
  QBtn: {
    name: 'QBtn',
    template: '<button class="q-btn" :data-icon="icon" @click="$emit(\'click\')"><slot /></button>',
    props: ['round', 'color', 'icon', 'dense'],
    emits: ['click'],
  },
  QBtnDropdown: {
    name: 'QBtnDropdown',
    template: '<div class="q-btn-dropdown"><slot /></div>',
    props: ['color', 'dense'],
  },
  ClosePopup: {},
}));

// Мокаем stores
vi.mock('src/stores/orderStore', () => ({
  useOrderStore: vi.fn(),
}));

// Мокаем useUtils
vi.mock('src/use/useUtils', () => ({
  dateConverter: vi.fn((date: string) => `converted-${date}`),
}));

describe('OrderHistoryItems', () => {
  let mockOrderStore: ReturnType<typeof useOrderStore>;

  const mockOrderData = [
    {
      id: 1,
      order_date: '2024-01-01',
      user: {
        // Имитируем реальный кейс: telegram id приходит отдельным полем
        telegram_id: 123456,
        full_name: 'Иван Иванов',
        // Имитируем ситуацию, когда API отдает телефон в другом поле
        phone_number: '+7 (999) 123-45-67',
      },
      status: EOrderStatus.CREATED,
      total_amount: 1000,
    },
    {
      id: 2,
      order_date: '2024-01-02',
      user: {
        id: 234567,
        full_name: 'Петр Петров',
        phone: '+7 (999) 234-56-78',
      },
      status: EOrderStatus.ASSEMBLING,
      total_amount: 2000,
    },
    {
      id: 3,
      order_date: '2024-01-03',
      user: {
        id: 345678,
        full_name: 'Сидор Сидоров',
        phone: null,
      },
      status: EOrderStatus.DELIVERING,
      total_amount: 3000,
    },
    {
      id: 4,
      order_date: '2024-01-04',
      user: {
        id: 456789,
        full_name: 'Алексей Алексеев',
        phone: '+7 (999) 456-78-90',
      },
      status: EOrderStatus.COMPLETED,
      total_amount: 4000,
    },
    {
      id: 5,
      order_date: '2024-01-05',
      user: {
        id: 567890,
        full_name: 'Дмитрий Дмитриев',
        phone: '+7 (999) 567-89-01',
      },
      status: EOrderStatus.CANCELLED,
      total_amount: 5000,
    },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());

    mockOrderStore = {
      updateOrderStatus: vi.fn().mockResolvedValue(true),
      deleteOrder: vi.fn().mockResolvedValue(true),
    } as unknown as ReturnType<typeof useOrderStore>;

    vi.mocked(useOrderStore).mockReturnValue(mockOrderStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Рендеринг', () => {
    it('должен отображать список заказов', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: mockOrderData,
          adminMode: false,
        },
      });

      expect(wrapper.findAll('.q-item')).toHaveLength(5);
      expect(wrapper.text()).toContain('Иван Иванов');
      expect(wrapper.text()).toContain('Петр Петров');
    });

    it('должен отображать дату заказа', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]],
          adminMode: false,
        },
      });

      expect(wrapper.text()).toContain('converted-2024-01-01');
    });

    it('должен отображать статус заказа', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]],
          adminMode: false,
        },
      });

      expect(wrapper.text()).toContain('создан');
    });

    it('должен отображать имя пользователя как ссылку на Telegram', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]],
          adminMode: false,
        },
      });

      const link = wrapper.find('a[href="tg://user?id=123456"]');
      expect(link.exists()).toBe(true);
      expect(link.text()).toBe('Иван Иванов');
    });

    it('должен отображать телефон пользователя под именем', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]],
          adminMode: false,
        },
      });

      expect(wrapper.text()).toContain('+7 (999) 123-45-67');
    });

    it('не должен отображать телефон, если он отсутствует', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[2]], // phone: null
          adminMode: false,
        },
      });

      // Проверяем, что телефон не отображается
      const phoneLabels = wrapper.findAll('.q-item-label[caption]').filter(
        (label) => label.text().includes('+7')
      );
      expect(phoneLabels.length).toBe(0);
    });
  });

  describe('Режим администратора', () => {
    it('должен показывать выпадающий список статусов для админа', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]],
          adminMode: true,
        },
      });

      const dropdown = wrapper.findComponent({ name: 'QBtnDropdown' });
      expect(dropdown.exists()).toBe(true);
    });

    it('не должен показывать кнопку отмены для админа', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]],
          adminMode: true,
        },
      });

      const cancelButtons = wrapper.findAll('.q-btn[icon="close"]');
      expect(cancelButtons.length).toBe(0);
    });

    it('должен вызывать updateOrderStatus при изменении статуса админом', async () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]],
          adminMode: true,
        },
      });

      const component = wrapper.vm as any;
      await component.editStatus(1, EOrderStatus.ASSEMBLING);

      expect(mockDialog).toHaveBeenCalled();
      expect(mockOrderStore.updateOrderStatus).toHaveBeenCalledWith(1, EOrderStatus.ASSEMBLING);
    });
  });

  describe('Режим пользователя - отображение кнопки отмены', () => {
    it('должен показывать кнопку отмены для заказа со статусом CREATED', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]], // CREATED
          adminMode: false,
        },
      });

      // Проверяем через findComponent, так как v-if может не работать в моках
      const cancelButtons = wrapper.findAllComponents({ name: 'QBtn' }).filter(
        (btn) => btn.props('icon') === 'close'
      );
      expect(cancelButtons.length).toBe(1);
    });

    it('должен показывать кнопку отмены для заказа со статусом ASSEMBLING', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[1]], // ASSEMBLING
          adminMode: false,
        },
      });

      const cancelButtons = wrapper.findAllComponents({ name: 'QBtn' }).filter(
        (btn) => btn.props('icon') === 'close'
      );
      expect(cancelButtons.length).toBe(1);
    });

    it('не должен показывать кнопку отмены для заказа со статусом DELIVERING', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[2]], // DELIVERING
          adminMode: false,
        },
      });

      const cancelButtons = wrapper.findAllComponents({ name: 'QBtn' }).filter(
        (btn) => btn.props('icon') === 'close'
      );
      expect(cancelButtons.length).toBe(0);
    });

    it('не должен показывать кнопку отмены для заказа со статусом COMPLETED', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[3]], // COMPLETED
          adminMode: false,
        },
      });

      const cancelButtons = wrapper.findAllComponents({ name: 'QBtn' }).filter(
        (btn) => btn.props('icon') === 'close'
      );
      expect(cancelButtons.length).toBe(0);
    });

    it('не должен показывать кнопку отмены для заказа со статусом CANCELLED', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[4]], // CANCELLED
          adminMode: false,
        },
      });

      const cancelButtons = wrapper.findAllComponents({ name: 'QBtn' }).filter(
        (btn) => btn.props('icon') === 'close'
      );
      expect(cancelButtons.length).toBe(0);
    });

    it('должен показывать кнопки отмены только для заказов со статусами CREATED и ASSEMBLING', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: mockOrderData, // Все статусы
          adminMode: false,
        },
      });

      // Должно быть 2 кнопки: для CREATED и ASSEMBLING
      const cancelButtons = wrapper.findAllComponents({ name: 'QBtn' }).filter(
        (btn) => btn.props('icon') === 'close'
      );
      expect(cancelButtons.length).toBe(2);
    });
  });

  describe('Отмена заказа пользователем', () => {
    it('должен показывать диалог подтверждения при клике на кнопку отмены', async () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]], // CREATED
          adminMode: false,
        },
      });

      // Вызываем функцию напрямую, так как поиск кнопки через моки проблематичен
      const component = wrapper.vm as any;
      await component.clearOrder(1);

      expect(mockDialog).toHaveBeenCalledWith({
        cancel: true,
        message: 'Вы уверенны что хотите отменить заказ?',
        persistent: true,
        title: 'Отмена заказа',
      });
    });

    it('должен вызывать updateOrderStatus со статусом CANCELLED при подтверждении', async () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]], // CREATED
          adminMode: false,
        },
      });

      const component = wrapper.vm as any;
      await component.clearOrder(1);

      expect(mockOrderStore.updateOrderStatus).toHaveBeenCalledWith(1, EOrderStatus.CANCELLED);
    });

    it('должен показывать уведомление об успешной отмене заказа', async () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]], // CREATED
          adminMode: false,
        },
      });

      const component = wrapper.vm as any;
      await component.updateOrderStatus(1, EOrderStatus.CANCELLED);

      expect(mockLoading.show).toHaveBeenCalled();
      expect(mockLoading.hide).toHaveBeenCalled();
      expect(mockNotify).toHaveBeenCalledWith({
        color: 'primary',
        message: 'Статус успешно изменен',
      });
    });

    it('должен обрабатывать ошибки при отмене заказа', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOrderStore.updateOrderStatus = vi.fn().mockRejectedValue(new Error('Ошибка'));

      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[0]], // CREATED
          adminMode: false,
        },
      });

      const component = wrapper.vm as any;
      await component.updateOrderStatus(1, EOrderStatus.CANCELLED);

      expect(mockLoading.show).toHaveBeenCalled();
      expect(mockLoading.hide).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('должен отменять заказ со статусом ASSEMBLING', async () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [mockOrderData[1]], // ASSEMBLING
          adminMode: false,
        },
      });

      const component = wrapper.vm as any;
      await component.clearOrder(2);

      expect(mockOrderStore.updateOrderStatus).toHaveBeenCalledWith(2, EOrderStatus.CANCELLED);
    });
  });

  describe('Функция orderStatus', () => {
    it('должна возвращать правильный текст статуса', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [],
          adminMode: false,
        },
      });

      const component = wrapper.vm as any;
      expect(component.orderStatus(EOrderStatus.CREATED)).toBe('создан');
      expect(component.orderStatus(EOrderStatus.ASSEMBLING)).toBe('собирается');
      expect(component.orderStatus(EOrderStatus.DELIVERING)).toBe('в пути');
      expect(component.orderStatus(EOrderStatus.COMPLETED)).toBe('завершён');
      expect(component.orderStatus(EOrderStatus.CANCELLED)).toBe('отменён');
    });

    it('должна возвращать undefined для неизвестного статуса', () => {
      const wrapper = mount(OrderHistoryItems, {
        props: {
          orderData: [],
          adminMode: false,
        },
      });

      const component = wrapper.vm as any;
      expect(component.orderStatus('unknown')).toBeUndefined();
    });
  });
});

