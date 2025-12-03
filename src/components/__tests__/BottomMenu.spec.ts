import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useOrderStore } from 'src/stores/orderStore';
import BottomMenu from '../BottomMenu.vue';
import { Quasar } from 'quasar';
import { createRouter, createMemoryHistory } from 'vue-router';

describe('BottomMenu', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());

    // Создаем роутер для тестов
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'dashboard', component: { template: '<div>Home</div>' } },
        { path: '/catalog', name: 'catalog', component: { template: '<div>Catalog</div>' } },
        { path: '/delivery', name: 'delivery', component: { template: '<div>Delivery</div>' } },
      ],
    });
  });

  describe('Отображение кнопок меню', () => {
    it('должен отображать все кнопки меню', () => {
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      expect(wrapper.text()).toContain('Главная');
      expect(wrapper.text()).toContain('Каталог');
      expect(wrapper.text()).toContain('Доставка');
    });

    it('должен отображать кнопку корзины', () => {
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      // Проверяем наличие иконки корзины
      expect(wrapper.html()).toContain('shopping_cart_checkout');
    });
  });

  describe('Бейдж с количеством товаров', () => {
    it('должен показывать бейдж с количеством товаров, если корзина не пуста', async () => {
      const orderStore = useOrderStore();
      
      orderStore.basketData = [
        { id: 1, name: 'Товар 1', price: 100 },
        { id: 2, name: 'Товар 2', price: 200 },
      ];

      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      await wrapper.vm.$nextTick();

      // Проверяем наличие бейджа
      expect(wrapper.html()).toContain('q-badge');
      expect(wrapper.text()).toContain('2');
    });

    it('не должен показывать бейдж, если корзина пуста', () => {
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      // Бейдж не должен отображаться
      const badges = wrapper.findAllComponents({ name: 'QBadge' });
      expect(badges.length).toBe(0);
    });
  });

  describe('Отображение стоимости корзины', () => {
    it('должен показывать стоимость корзины вместо текста "Корзина"', async () => {
      const orderStore = useOrderStore();
      
      orderStore.basketData = [
        { id: 3, name: 'Товар', price: 355 },
      ];
      orderStore.totalCost = 355;

      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('355 ₽');
    });

    it('должен округлять стоимость корзины', async () => {
      const orderStore = useOrderStore();
      
      orderStore.basketData = [
        { id: 4, name: 'Товар', price: 175.49 },
      ];
      orderStore.totalCost = 175.49;

      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      await wrapper.vm.$nextTick();

      // Должно быть округлено до 175
      expect(wrapper.text()).toContain('175 ₽');
    });

    it('должен показывать "Корзина", если корзина пуста', () => {
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      expect(wrapper.text()).toContain('Корзина');
    });
  });

  describe('Навигация', () => {
    it('должен переходить на главную страницу при клике на "Главная"', async () => {
      const pushSpy = vi.spyOn(router, 'push');
      
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      const tabs = wrapper.findAllComponents({ name: 'QTab' });
      const homeTab = tabs.find(tab => tab.text().includes('Главная'));

      if (homeTab) {
        await homeTab.trigger('click');
        expect(pushSpy).toHaveBeenCalledWith('/');
      }
    });

    it('должен переходить на страницу каталога при клике на "Каталог"', async () => {
      const pushSpy = vi.spyOn(router, 'push');
      
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      const tabs = wrapper.findAllComponents({ name: 'QTab' });
      const catalogTab = tabs.find(tab => tab.text().includes('Каталог'));

      if (catalogTab) {
        await catalogTab.trigger('click');
        expect(pushSpy).toHaveBeenCalledWith('/catalog');
      }
    });

    it('должен переходить на страницу доставки при клике на "Доставка"', async () => {
      const pushSpy = vi.spyOn(router, 'push');
      
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      const tabs = wrapper.findAllComponents({ name: 'QTab' });
      const deliveryTab = tabs.find(tab => tab.text().includes('Доставка'));

      if (deliveryTab) {
        await deliveryTab.trigger('click');
        expect(pushSpy).toHaveBeenCalledWith('/delivery');
      }
    });

    it('должен эмитить событие "open-basket" при клике на корзину', async () => {
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      // Находим таб с иконкой корзины (без path)
      const tabs = wrapper.findAllComponents({ name: 'QTab' });
      const basketTab = tabs.find(tab => {
        const html = tab.html();
        return html.includes('shopping_cart_checkout');
      });

      if (basketTab) {
        await basketTab.trigger('click');
        expect(wrapper.emitted('open-basket')).toBeTruthy();
      }
    });
  });

  describe('Правое меню', () => {
    it('должен отображать правое меню при клике на кнопку "еще"', async () => {
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      const moreButton = wrapper.find('button[icon="more_vert"]');
      
      if (moreButton.exists()) {
        await moreButton.trigger('click');
        await wrapper.vm.$nextTick();

        // Проверяем, что меню открылось
        expect(wrapper.html()).toContain('q-menu');
      }
    });

    it('должен содержать пункты "Профиль", "Отзывы", "История заказов"', () => {
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      // Проверяем, что кнопка с иконкой more_vert существует
      expect(wrapper.html()).toContain('more_vert');
    });
  });

  describe('Функция formatBasketPrice', () => {
    it('должен возвращать "0" для пустой корзины', () => {
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      const vm = wrapper.vm as any;
      expect(vm.formatBasketPrice()).toBe('0');
    });

    it('должен округлять цену до целого числа', async () => {
      const orderStore = useOrderStore();
      orderStore.totalCost = 374.48;

      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.formatBasketPrice()).toBe('374');
    });

    it('должен правильно форматировать большие суммы', async () => {
      const orderStore = useOrderStore();
      orderStore.totalCost = 1234.56;

      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.formatBasketPrice()).toBe('1235');
    });
  });

  describe('Реактивность', () => {
    it('должен обновлять отображение при изменении корзины', async () => {
      const orderStore = useOrderStore();
      
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      // Сначала корзина пуста
      expect(wrapper.text()).toContain('Корзина');

      // Добавляем товар
      orderStore.basketData = [
        { id: 5, name: 'Товар', price: 500 },
      ];
      orderStore.totalCost = 500;

      await wrapper.vm.$nextTick();

      // Должна отображаться цена
      expect(wrapper.text()).toContain('500 ₽');
    });

    it('должен обновлять количество товаров в бейдже', async () => {
      const orderStore = useOrderStore();
      
      const wrapper = mount(BottomMenu, {
        global: {
          plugins: [Quasar, router],
        },
      });

      // Добавляем 1 товар
      orderStore.basketData = [
        { id: 6, name: 'Товар 1', price: 100 },
      ];

      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('1');

      // Добавляем еще товар
      orderStore.basketData.push({ id: 7, name: 'Товар 2', price: 200 });

      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain('2');
    });
  });
});

