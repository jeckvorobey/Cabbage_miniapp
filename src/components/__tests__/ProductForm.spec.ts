import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import ProductForm from '../ProductForm.vue';
import { useProductsStore } from 'src/stores/productsStore';
import { useCategoriesStore } from 'src/stores/categoriesStore';
import type { IProduct } from 'src/types/product.interface';

// Мокаем Quasar
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: vi.fn(),
  }),
  QForm: {
    name: 'QForm',
    template: '<form><slot /></form>',
  },
  QInput: {
    name: 'QInput',
    template: '<input />',
    props: ['modelValue', 'rules', 'label', 'outlined', 'type', 'rows'],
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
      'emit-value',
      'map-options',
      'option-label',
      'option-value',
    ],
  },
  QUploader: {
    name: 'QUploader',
    template: '<div><slot name="header" /><slot name="list" /></div>',
    props: ['max-file-size', 'color', 'flat'],
  },
  QUploaderAddTrigger: {
    name: 'QUploaderAddTrigger',
    template: '<button>Upload</button>',
  },
  QBtn: {
    name: 'QBtn',
    template: '<button><slot /></button>',
    props: ['color', 'label', 'type'],
    directives: {
      'close-popup': {},
    },
  },
  QIcon: {
    name: 'QIcon',
    template: '<i />',
    props: ['name', 'size', 'class'],
  },
  ClosePopup: {},
}));

// Мокаем ProductImgCarusel
vi.mock('../ProductImgCarusel.vue', () => ({
  default: {
    name: 'ProductImgCarusel',
    template: '<div>ProductImgCarusel</div>',
  },
}));

// Мокаем stores
vi.mock('src/stores/productsStore', () => ({
  useProductsStore: vi.fn(),
}));

vi.mock('src/stores/categoriesStore', () => ({
  useCategoriesStore: vi.fn(),
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

describe('ProductForm', () => {
  let router: ReturnType<typeof createRouter>;
  let mockProductsStore: ReturnType<typeof useProductsStore>;
  let mockCategoriesStore: ReturnType<typeof useCategoriesStore>;

  beforeEach(() => {
    setActivePinia(createPinia());

    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div></div>' } }],
    });

    mockProductsStore = {
      uploadFile: vi.fn().mockResolvedValue({ id: 1 }),
    } as any;

    mockCategoriesStore = {
      categories: [
        { id: 1, name: 'Категория 1' },
        { id: 2, name: 'Категория 2' },
      ],
    } as any;

    vi.mocked(useProductsStore).mockReturnValue(mockProductsStore);
    vi.mocked(useCategoriesStore).mockReturnValue(mockCategoriesStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createProduct = (overrides?: Partial<IProduct>): IProduct => ({
    id: null,
    name: '',
    price: null,
    category_id: null,
    description: '',
    images: '',
    origin_country: '',
    ...overrides,
  });

  describe('Рендеринг', () => {
    it('должен отображать форму для нового товара', () => {
      const product = createProduct();
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      expect(wrapper.text()).toContain('Добавление товара');
      expect(wrapper.findComponent({ name: 'QInput' }).exists()).toBe(true);
    });

    it('должен отображать форму для редактирования товара', () => {
      const product = createProduct({ id: 1, name: 'Тестовый товар' });
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      expect(wrapper.text()).toContain('Редактирование товара');
    });

    it('должен отображать карусель изображений, если есть изображения', () => {
      const product = createProduct({
        images: [{ id: 1, file_path: 'test.jpg' }],
      });
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      expect(wrapper.text()).toContain('ProductImgCarusel');
    });

    it('не должен отображать карусель, если нет изображений', () => {
      const product = createProduct({ images: [] });
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      const carousel = wrapper.findComponent({ name: 'ProductImgCarusel' });
      expect(carousel.exists()).toBe(false);
    });
  });

  describe('Валидация формы', () => {
    it('должен иметь обязательные поля', () => {
      const product = createProduct();
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      const inputs = wrapper.findAllComponents({ name: 'QInput' });
      const categorySelect = wrapper.findComponent({ name: 'QSelect' });

      expect(inputs.length).toBeGreaterThan(0);
      expect(categorySelect.exists()).toBe(true);
    });
  });

  describe('События', () => {
    it('должен эмитить submit при отправке формы', async () => {
      const product = createProduct({ name: 'Тест', price: 100 });
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      const form = wrapper.find('form');
      await form.trigger('submit');

      expect(wrapper.emitted('submit')).toBeTruthy();
      expect(wrapper.emitted('submit')?.[0]).toBeDefined();
    });

    it('должен эмитить refresh-data при вызове handleRefreshData', () => {
      const product = createProduct();
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      const component = wrapper.vm as any;
      component.handleRefreshData();

      expect(wrapper.emitted('refresh-data')).toBeTruthy();
    });
  });

  describe('Реактивность', () => {
    it('должен обновлять локальную копию при изменении пропса', async () => {
      const product = createProduct({ name: 'Исходное имя' });
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      await wrapper.setProps({
        product: createProduct({ name: 'Новое имя' }),
      });

      const component = wrapper.vm as any;
      expect(component.localProduct.name).toBe('Новое имя');
    });
  });

  describe('Категории', () => {
    it('должен отображать список категорий', () => {
      const product = createProduct();
      const wrapper = mount(ProductForm, {
        props: { product },
        global: {
          plugins: [router],
        },
      });

      const component = wrapper.vm as any;
      expect(component.categories).toEqual([
        { id: 1, name: 'Категория 1' },
        { id: 2, name: 'Категория 2' },
      ]);
    });
  });
});
