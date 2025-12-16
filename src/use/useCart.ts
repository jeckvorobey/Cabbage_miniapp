import { toRaw } from 'vue';
import { useOrderStore } from 'src/stores/orderStore';
import type { IProduct } from 'src/types/product.interface';

/**
 * Интерфейс товара в корзине
 */
export interface ICartItem {
  id: number;
  name?: string;
  price: number;
  quantity: number;
  product_id: number;
  [key: string]: any;
}

/**
 * Composable для работы с корзиной
 * Предоставляет единую логику добавления, изменения количества и удаления товаров
 */
export function useCart() {
  const orderStore = useOrderStore();

  /**
   * Нормализует цену в число
   */
  function normalizePrice(price: string | number | null | undefined): number {
    if (typeof price === 'string') {
      return parseFloat(price) || 0;
    }
    return Number(price) || 0;
  }

  /**
   * Нормализует количество в число
   */
  function normalizeQuantity(quantity: string | number | null | undefined): number {
    if (typeof quantity === 'string') {
      return parseInt(quantity, 10) || 1;
    }
    return Number(quantity) || 1;
  }

  /**
   * Сохраняет корзину в localStorage
   */
  function saveToLocalStorage() {
    try {
      window.localStorage.setItem('basket', JSON.stringify(orderStore.basketData));
    } catch (e) {
      console.error('[useCart] Ошибка при сохранении корзины в localStorage:', e);
    }
  }

  /**
   * Получает товар из корзины по ID продукта
   */
  function getCartItem(productId: number | null | undefined): ICartItem | undefined {
    if (!productId) return undefined;
    return orderStore.basketData.find((item: any) => item.id === productId);
  }

  /**
   * Добавляет товар в корзину или увеличивает его количество, если товар уже есть
   */
  function addToCart(product: IProduct): ICartItem | null {
    try {
      if (product?.id == null) {
        console.warn('[useCart] Нельзя добавить товар без ID');
        return null;
      }

      const productId = product.id;

      // Нормализуем данные товара
      const normalizedOrder: ICartItem = {
        ...structuredClone(toRaw(product)),
        id: productId,
        quantity: 1,
        product_id: productId,
        price: normalizePrice(product.price),
      };

      // Если корзина пуста, просто добавляем товар
      if (!orderStore.basketData.length) {
        orderStore.basketData.push(normalizedOrder);
        saveToLocalStorage();
        return normalizedOrder;
      }

      // Ищем товар в корзине
      const foundItem = orderStore.basketData.find((it: any) => it.id === product.id);

      if (foundItem) {
        // Если товар уже есть, увеличиваем количество
        const currentQuantity = normalizeQuantity(foundItem.quantity);
        foundItem.quantity = currentQuantity + 1;
        saveToLocalStorage();
        return foundItem;
      } else {
        // Если товара нет, добавляем новый
        orderStore.basketData.push(normalizedOrder);
        saveToLocalStorage();
        return normalizedOrder;
      }
    } catch (e) {
      console.error('[useCart] Ошибка при добавлении товара в корзину:', e);
      return null;
    }
  }

  /**
   * Изменяет количество товара в корзине
   * @param item - товар из корзины или ID товара
   * @param delta - изменение количества (+1 для увеличения, -1 для уменьшения)
   * @returns обновленный товар или null, если товар был удален
   */
  function updateQuantity(item: ICartItem | number, delta: number): ICartItem | null {
    try {
      let cartItem: ICartItem | undefined;

      // Если передан ID, находим товар
      if (typeof item === 'number') {
        cartItem = getCartItem(item);
      } else {
        cartItem = item;
      }

      if (!cartItem) {
        console.warn('[useCart] Товар не найден в корзине');
        return null;
      }

      const currentQuantity = normalizeQuantity(cartItem.quantity);
      const newQuantity = currentQuantity + delta;

      // Если количество становится 0 или меньше, удаляем товар
      if (newQuantity <= 0) {
        removeFromCart(cartItem.id);
        return null;
      }

      // Обновляем количество
      cartItem.quantity = newQuantity;
      saveToLocalStorage();
      return cartItem;
    } catch (e) {
      console.error('[useCart] Ошибка при изменении количества товара:', e);
      return null;
    }
  }

  /**
   * Удаляет товар из корзины по ID
   */
  function removeFromCart(productId: number): boolean {
    try {
      const foundItemIndex = orderStore.basketData.findIndex((it: any) => it.id === productId);

      if (foundItemIndex !== -1) {
        orderStore.basketData.splice(foundItemIndex, 1);
        saveToLocalStorage();
        return true;
      }

      return false;
    } catch (e) {
      console.error('[useCart] Ошибка при удалении товара из корзины:', e);
      return false;
    }
  }

  /**
   * Удаляет товар из корзины по индексу (для использования в списках)
   */
  function removeFromCartByIndex(index: number): boolean {
    try {
      if (index >= 0 && index < orderStore.basketData.length) {
        orderStore.basketData.splice(index, 1);
        saveToLocalStorage();
        return true;
      }
      return false;
    } catch (e) {
      console.error('[useCart] Ошибка при удалении товара по индексу:', e);
      return false;
    }
  }

  /**
   * Очищает корзину и localStorage
   */
    function clearBasketData() {
      orderStore.basketData = []
      saveToLocalStorage()
    }

  return {
    addToCart,
    updateQuantity,
    removeFromCart,
    removeFromCartByIndex,
    getCartItem,
    saveToLocalStorage,
    clearBasketData
  };
}
