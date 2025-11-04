import { defineStore } from 'pinia';
import { client } from 'src/boot/axios';
import { ref } from 'vue';

export const useProductsStore = defineStore('Products', () => {
  const products = ref();

  async function createProduct(product: any) {
    return client
      .post<any>('products', product)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while createing via product',
          err.message,
        );
        throw err;
      });
  }

  async function fetchProductsById(id: number) {
    return client
      .get(`/products/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while fetching via product',
          err.message,
        );
        throw err;
      });
  }

  async function fetchProducts(params: any) {
    return client
      .get('products', { params })
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while fetching via products',
          err.message,
        );
        throw err;
      });
  }

  async function deleteProduct(id: number) {
    return client
      .delete(`products/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while deleting via Product',
          err.message,
        );
        throw err;
      });
  }

  return { products, createProduct, fetchProducts, deleteProduct, fetchProductsById };
});
