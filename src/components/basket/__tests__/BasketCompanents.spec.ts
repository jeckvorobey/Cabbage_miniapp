import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useOrderStore } from 'src/stores/orderStore';
import BasketCompanents from '../BasketCompanents.vue';
import { Quasar } from 'quasar';

// Мокаем useUtils
vi.mock('src/use/useUtils', () => ({
  getImage: (path: string) => `https://example.com${path}`,
}));

describe('BasketCompanents', () => {
  let orderStore: ReturnType<typeof useOrderStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    orderStore = useOrderStore();
    
    // Мокаем localStorage
    const localStorageMock: { [key: string]: string } = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => Object.keys(localStorageMock).forEach(key => delete localStorageMock[key])),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  const createWrapper = () => {
    return mount(BasketCompanents, {
      global: {
        plugins: [Quasar],
      },
    });
  };

  describe('Отображение пустой корзины', () => {
    it('должен показывать сообщение о пустой корзине', () => {
      orderStore.basketData = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Корзина пуста');
    });

    it('не должен показывать кнопку оформления заказа', () => {
      orderStore.basketData = [];
      const wrapper = createWrapper();

      expect(wrapper.find('.q-btn').exists()).toBe(false);
    });
  });

  describe('Баннер о минимальной сумме заказа', () => {
    it('должен показывать баннер, если сумма меньше минимальной', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар 1', price: 500, unit_name: 'кг' },
      ];
      orderStore.totalCost = 500;
      
      const wrapper = createWrapper();

      expect(wrapper.find('.bg-warning').exists()).toBe(true);
      expect(wrapper.text()).toContain('Минимальная сумма заказа 700 ₽');
    });

    it('не должен показывать баннер, если сумма больше или равна минимальной', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар 1', price: 800, unit_name: 'кг' },
      ];
      orderStore.totalCost = 800;
      
      const wrapper = createWrapper();

      expect(wrapper.find('.bg-warning').exists()).toBe(false);
    });
  });

  describe('Отображение товаров', () => {
    it('должен корректно отображать список товаров', () => {
      const mockProducts = [
        { id: 1, name: 'Яблоки Гала', price: 175.49, unit_name: 'кг', primary_image: 'test.jpg' },
        { id: 2, name: 'Апельсины', price: 179.99, old_price: 199.99, unit_name: 'кг' },
      ];
      
      orderStore.basketData = mockProducts;
      orderStore.previewBasketData = [
        [mockProducts[0]],
        [mockProducts[1]]
      ];
      orderStore.totalCost = 355.48;
      
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Яблоки Гала');
      expect(wrapper.text()).toContain('Апельсины');
    });

    it('должен показывать бейдж со скидкой, если есть old_price', () => {
      const mockProduct = {
        id: 1,
        name: 'Товар со скидкой',
        price: 180,
        old_price: 200,
        unit_name: 'кг',
      };
      
      orderStore.basketData = [mockProduct];
      orderStore.previewBasketData = [[mockProduct]];
      orderStore.totalCost = 180;
      
      const wrapper = createWrapper();

      // Проверяем наличие бейджа со скидкой (используем обычный div с классом)
      const badges = wrapper.findAll('.discount-badge');
      expect(badges.length).toBeGreaterThan(0);
      // Проверяем, что в тексте есть скидка
      expect(wrapper.html()).toContain('-10%');
    });

    it('должен показывать placeholder изображение, если нет primary_image', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар без фото', price: 100, unit_name: 'кг' },
      ];
      orderStore.previewBasketData = [[{ id: 1, name: 'Товар без фото', price: 100, unit_name: 'кг' }]];
      
      const wrapper = createWrapper();
      const img = wrapper.find('.q-img');
      
      expect(img.exists()).toBe(true);
    });
  });

  describe('Управление количеством товаров', () => {
    it('должен увеличивать количество товара при нажатии на "+"', async () => {
      const mockProduct = { id: 1, name: 'Товар', price: 100, unit_name: 'кг' };
      orderStore.basketData = [mockProduct];
      orderStore.previewBasketData = [[mockProduct]];
      orderStore.totalCost = 100;
      
      const wrapper = createWrapper();
      const addBtn = wrapper.find('[data-testid="increase-btn"]');
      
      await addBtn?.trigger('click');
      
      expect(orderStore.basketData.length).toBe(2);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('должен уменьшать количество товара при нажатии на "-"', async () => {
      const mockProduct = { id: 1, name: 'Товар', price: 100, unit_name: 'кг' };
      orderStore.basketData = [mockProduct, mockProduct];
      orderStore.previewBasketData = [[mockProduct, mockProduct]];
      orderStore.totalCost = 200;
      
      const wrapper = createWrapper();
      const removeBtn = wrapper.find('[data-testid="decrease-btn"]');
      
      await removeBtn?.trigger('click');
      
      expect(orderStore.basketData.length).toBe(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('должен блокировать кнопку "-", если количество = 1', () => {
      const mockProduct = { id: 1, name: 'Товар', price: 100, unit_name: 'кг' };
      orderStore.basketData = [mockProduct];
      orderStore.previewBasketData = [[mockProduct]];
      
      const wrapper = createWrapper();
      const removeBtn = wrapper.find('[data-testid="decrease-btn"]');
      
      expect(removeBtn?.attributes('disabled')).toBeDefined();
    });
  });

  describe('Блок "В вашем заказе"', () => {
    it('должен показывать правильное количество товаров', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар 1', price: 100, unit_name: 'кг' },
        { id: 1, name: 'Товар 1', price: 100, unit_name: 'кг' },
      ];
      orderStore.totalCost = 200;
      
      const wrapper = createWrapper();
      
      expect(wrapper.text()).toContain('2 товара');
    });

    it('должен правильно склонять слово "товар"', () => {
      const testCases = [
        { count: 1, expected: 'товар' },
        { count: 2, expected: 'товара' },
        { count: 5, expected: 'товаров' },
        { count: 21, expected: 'товар' },
        { count: 22, expected: 'товара' },
        { count: 25, expected: 'товаров' },
      ];

      testCases.forEach(({ count, expected }) => {
        orderStore.basketData = Array(count).fill({ id: 1, price: 100 });
        orderStore.totalCost = count * 100;
        
        const wrapper = createWrapper();
        
        expect(wrapper.text()).toContain(expected);
        wrapper.unmount();
      });
    });

    it('должен рассчитывать скидку 5%', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар', price: 1000, unit_name: 'кг' },
      ];
      orderStore.totalCost = 1000;
      
      const wrapper = createWrapper();
      
      expect(wrapper.text()).toContain('Скидка 5%');
      expect(wrapper.text()).toContain('-50'); // 5% от 1000
    });

    it('должен показывать стоимость сборки и упаковки 19 ₽', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар', price: 1000, unit_name: 'кг' },
      ];
      orderStore.totalCost = 1000;
      
      const wrapper = createWrapper();
      
      expect(wrapper.text()).toContain('Сборка и упаковка');
      expect(wrapper.text()).toContain('19');
    });

    it('должен правильно рассчитывать итоговую сумму', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар', price: 1000, unit_name: 'кг' },
      ];
      orderStore.totalCost = 1000;
      
      const wrapper = createWrapper();
      
      // Итого = 1000 - 50 (скидка 5%) + 19 (упаковка) = 969
      expect(wrapper.text()).toContain('969');
    });
  });

  describe('Форматирование', () => {
    it('должен форматировать цены с запятой', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар', price: 175.49, unit_name: 'кг' },
      ];
      orderStore.previewBasketData = [[{ id: 1, name: 'Товар', price: 175.49, unit_name: 'кг' }]];
      orderStore.totalCost = 175.49;
      
      const wrapper = createWrapper();
      
      expect(wrapper.text()).toContain('175,49');
    });

    it('должен форматировать количество в кг с двумя десятичными', () => {
      const mockProduct = { id: 1, name: 'Товар', price: 100, unit_name: 'кг' };
      orderStore.basketData = [mockProduct];
      orderStore.previewBasketData = [[mockProduct]];
      
      const wrapper = createWrapper();
      
      // Количество и единица измерения в разных div
      expect(wrapper.text()).toContain('1,00');
      expect(wrapper.text()).toContain('кг');
    });

    it('должен форматировать количество штук без десятичных', () => {
      const mockProduct = { id: 1, name: 'Товар', price: 100, unit_name: 'шт' };
      orderStore.basketData = [mockProduct, mockProduct, mockProduct];
      orderStore.previewBasketData = [[mockProduct, mockProduct, mockProduct]];
      
      const wrapper = createWrapper();
      
      // Количество и единица измерения в разных div
      expect(wrapper.text()).toContain('3');
      expect(wrapper.text()).toContain('шт');
    });
  });

  describe('Группировка товаров', () => {
    it('должен группировать одинаковые товары', () => {
      const product1 = { id: 1, name: 'Яблоки', price: 100, unit_name: 'кг' };
      const product2 = { id: 2, name: 'Апельсины', price: 200, unit_name: 'кг' };
      
      orderStore.basketData = [product1, product1, product2];
      orderStore.previewBasketData = [
        [product1, product1],
        [product2]
      ];
      orderStore.totalCost = 400;
      
      const wrapper = createWrapper();
      
      // Должно быть 2 группы товаров (Яблоки и Апельсины)
      expect(wrapper.text()).toContain('Яблоки');
      expect(wrapper.text()).toContain('Апельсины');
    });
  });

  describe('Кнопка оформления', () => {
    it('должна показывать кнопку "Войти для оформления"', () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар', price: 1000, unit_name: 'кг' },
      ];
      orderStore.previewBasketData = [[{ id: 1, name: 'Товар', price: 1000, unit_name: 'кг' }]];
      
      const wrapper = createWrapper();
      
      expect(wrapper.text()).toContain('Войти для оформления');
    });

    it('должна вызывать proceedToCheckout при клике', async () => {
      orderStore.basketData = [
        { id: 1, name: 'Товар', price: 1000, unit_name: 'кг' },
      ];
      orderStore.previewBasketData = [[{ id: 1, name: 'Товар', price: 1000, unit_name: 'кг' }]];
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const wrapper = createWrapper();
      
      const btn = wrapper.findAll('.q-btn').find(b => b.text().includes('Войти'));
      await btn?.trigger('click');
      
      expect(consoleSpy).toHaveBeenCalledWith('Переход к оформлению заказа');
      consoleSpy.mockRestore();
    });
  });

  describe('Расчет скидки', () => {
    it('должен правильно вычислять процент скидки', () => {
      const mockProduct = {
        id: 1,
        name: 'Товар',
        price: 180,
        old_price: 200,
        unit_name: 'кг',
      };
      
      orderStore.basketData = [mockProduct];
      orderStore.previewBasketData = [[mockProduct]];
      orderStore.totalCost = 180;
      
      const wrapper = createWrapper();
      
      // Скидка = (200 - 180) / 200 * 100 = 10%
      expect(wrapper.html()).toContain('-10%');
    });

    it('должен корректно обрабатывать дробные проценты скидки', () => {
      const mockProduct = {
        id: 1,
        name: 'Товар',
        price: 175,
        old_price: 200,
        unit_name: 'кг',
      };
      
      orderStore.basketData = [mockProduct];
      orderStore.previewBasketData = [[mockProduct]];
      orderStore.totalCost = 175;
      
      const wrapper = createWrapper();
      
      // Скидка = (200 - 175) / 200 * 100 = 12.5%, округлено до 13%
      expect(wrapper.html()).toContain('-13%');
    });
  });

  describe('Интеграция с localStorage', () => {
    it('должен загружать данные из localStorage при монтировании', () => {
      const mockData = [
        { id: 1, name: 'Товар', price: 100, unit_name: 'кг' },
      ];
      
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockData));
      
      createWrapper();
      
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(localStorage.getItem).toHaveBeenCalledWith('basket');
    });

    it('должен сохранять изменения в localStorage при изменении количества', async () => {
      const mockProduct = { id: 1, name: 'Товар', price: 100, unit_name: 'кг' };
      orderStore.basketData = [mockProduct];
      orderStore.previewBasketData = [[mockProduct]];
      
      const wrapper = createWrapper();
      const addBtn = wrapper.find('[data-testid="increase-btn"]');
      
      await addBtn?.trigger('click');
      
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'basket',
        expect.any(String)
      );
    });
  });
});
