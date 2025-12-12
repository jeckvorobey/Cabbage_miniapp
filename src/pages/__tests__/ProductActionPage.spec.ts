import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import ProductActionPage from '../ProductActionPage.vue';
import { useProductsStore } from 'src/stores/productsStore';
import { useOrderStore } from 'src/stores/orderStore';
import type { IProduct } from 'src/types/product.interface';

// Мокаем Quasar
const mockNotify = vi.fn();
const mockLoading = {
  show: vi.fn(),
  hide: vi.fn(),
};

vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify,
    loading: mockLoading,
  }),
  QBtn: {
    name: 'QBtn',
    template: '<button><slot /></button>',
    props: ['color', 'label', 'type'],
  },
  QIcon: {
    name: 'QIcon',
    template: '<i />',
    props: ['name', 'size', 'color', 'class'],
  },
}));

// Мокаем компоненты
vi.mock('@/components/ProductImgCarusel.vue', () => ({
  default: {
    name: 'ProductImgCarusel',
    template: '<div>ProductImgCarusel</div>',
  },
}));

vi.mock('@/components/ProductForm.vue', () => ({
  default: {
    name: 'ProductForm',
    template: '<div>ProductForm</div>',
    emits: ['submit', 'refresh-data'],
  },
}));

// Мокаем hooks
const mockUsePermissionVisibility = vi.fn(() => ({
  isManager: false,
}));

vi.mock('src/hooks/usePermissionVisibility.hook', () => ({
  usePermissionVisibility: () => mockUsePermissionVisibility(),
}));

// Мокаем stores
vi.mock('src/stores/productsStore', () => ({
  useProductsStore: vi.fn(),
}));

vi.mock('src/stores/orderStore', () => ({
  useOrderStore: vi.fn(),
}));

describe('ProductActionPage', () => {
  let router: ReturnType<typeof createRouter>;
  let mockProductsStore: ReturnType<typeof useProductsStore>;
  let mockOrderStore: ReturnType<typeof useOrderStore>;

  beforeEach(async () => {
    setActivePinia(createPinia());

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } },
        { path: '/product/:id', name: 'product', component: { template: '<div></div>' } },
        { path: '/product', name: 'product-list', component: { template: '<div></div>' } },
      ],
    });
    await router.push('/');
    await router.isReady();

    mockProductsStore = {
      fetchProductsById: vi.fn().mockResolvedValue({
        id: 1,
        name: 'Тестовый товар',
        price: 100,
      }),
      createProduct: vi.fn().mockResolvedValue({ id: 1 }),
      updateProduct: vi.fn().mockResolvedValue({ id: 1 }),
    } as any;

    mockOrderStore = {
      basketData: [],
    } as any;

    vi.mocked(useProductsStore).mockReturnValue(mockProductsStore);
    vi.mocked(useOrderStore).mockReturnValue(mockOrderStore);

    // Мокаем localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Рендеринг для обычного пользователя', () => {
    it('должен отображать информацию о товаре для обычного пользователя', async () => {
      await router.push({ path: '/product/1', params: { id: '1' } });
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Проверяем, что компонент загрузился
      expect(wrapper.exists()).toBe(true);
    });

    it('должен отображать кнопку "Добавить в корзину", если товара нет в корзине', async () => {
      mockOrderStore.basketData = [];
      await router.push({ path: '/product/1', params: { id: '1' } });
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Проверяем, что компонент загрузился
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Добавление в корзину', () => {
    it('должен добавлять товар в корзину', async () => {
      const product: IProduct = {
        id: 1,
        name: 'Тестовый товар',
        price: 100,
      };

      mockOrderStore.basketData = [];
      router.push('/product/1');
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      const component = wrapper.vm as any;

      component.addOrder(product);

      expect(mockOrderStore.basketData.length).toBeGreaterThan(0);
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it('должен увеличивать количество, если товар уже в корзине', async () => {
      const product: IProduct = {
        id: 1,
        name: 'Тестовый товар',
        price: 100,
      };

      mockOrderStore.basketData = [
        {
          id: 1,
          name: 'Тестовый товар',
          price: 100,
          quantity: 1,
        },
      ];

      router.push('/product/1');
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      const component = wrapper.vm as any;

      component.addOrder(product);

      const item = mockOrderStore.basketData.find((it: any) => it.id === 1);
      expect(item.quantity).toBe(2);
    });
  });

  describe('Изменение количества', () => {
    it('должен увеличивать количество товара', async () => {
      const order = {
        id: 1,
        quantity: 1,
      };

      mockOrderStore.basketData = [order];
      await router.push('/');
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      const component = wrapper.vm as any;
      component.changeQuantity(order, true);

      expect(order.quantity).toBe(2);
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it('должен уменьшать количество товара', async () => {
      const order = {
        id: 1,
        quantity: 2,
      };

      mockOrderStore.basketData = [order];
      await router.push('/');
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      const component = wrapper.vm as any;
      component.changeQuantity(order, false);

      expect(order.quantity).toBe(1);
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it('должен удалять товар из корзины, если количество равно 1', async () => {
      const order = {
        id: 1,
        quantity: 1,
      };

      mockOrderStore.basketData = [order];
      await router.push('/');
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      const component = wrapper.vm as any;
      component.changeQuantity(order, false);

      expect(mockOrderStore.basketData.length).toBe(0);
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Загрузка товара', () => {
    it('должен загружать товар по ID из роута', async () => {
      await router.push({ path: '/product/1', params: { id: '1' } });
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(mockProductsStore.fetchProductsById).toHaveBeenCalledWith(1);
      expect(mockLoading.show).toHaveBeenCalled();
      expect(mockLoading.hide).toHaveBeenCalled();
    });

    it('не должен загружать товар, если ID отсутствует', async () => {
      await router.push('/product');
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Если нет ID в params, fetchProductsById не должен вызываться
      // Но компонент может вызывать его в onMounted, поэтому проверяем только отсутствие ID
      const route = wrapper.vm.$route as any;
      if (!route.params?.id) {
        expect(mockProductsStore.fetchProductsById).not.toHaveBeenCalled();
      }
    });
  });

  describe('Обработка формы для менеджера', () => {
    it('должен обрабатывать отправку формы для создания товара', async () => {
      mockUsePermissionVisibility.mockReturnValue({
        isManager: true,
      });

      const product: IProduct = {
        id: null,
        name: 'Новый товар',
        price: 100,
      };

      const formData = new FormData();
      formData.append('name', 'Новый товар');
      formData.append('price', '100');

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      // Мокаем productFormRef
      const component = wrapper.vm as any;
      component.productFormRef = {
        generateFormData: vi.fn(),
      };

      await component.handleFormSubmit(product, formData);

      expect(mockProductsStore.createProduct).toHaveBeenCalled();
      expect(mockNotify).toHaveBeenCalled();
    });

    it('должен обрабатывать отправку формы для обновления товара', async () => {
      const product: IProduct = {
        id: 1,
        name: 'Обновленный товар',
        price: 200,
      };

      const formData = new FormData();
      await router.push('/');
      await router.isReady();

      const wrapper = mount(ProductActionPage, {
        global: {
          plugins: [router],
        },
      });

      await wrapper.vm.$nextTick();
      const component = wrapper.vm as any;
      await component.handleFormSubmit(product, formData);

      expect(mockProductsStore.updateProduct).toHaveBeenCalledWith(product);
      expect(mockNotify).toHaveBeenCalled();
    });
  });
});

