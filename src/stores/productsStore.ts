import { defineStore } from 'pinia';
import { client } from 'src/api/client';
import type { IProduct } from 'src/types/product.interface';
import { ref } from 'vue';

export const useProductsStore = defineStore('Products', () => {
  const products = ref();
  const pagination = ref<any>({
    offset: 0,
    limit: 20,
    total: 0,
    has_more: true,
  });

  async function createProduct(product: any) {
    return client
      .post<any>('products', product)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while createing via product',
          err.message
        );
        throw err;
      });
  }

  async function updateProduct(product: IProduct) {
    return client
      .patch(`/products/${product.id}`, product)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while creating via updateProduct',
          err.message
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
          err.message
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
          err.message
        );
        throw err;
      });
  }

  async function fetchProductsSearch(params: any) {
    return client
      .get('products/search', { params })
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while fetching via ProductsSearch',
          err.message
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
          err.message
        );
        throw err;
      });
  }

  async function uploadFile(id: number, formData: any) {
    return client
      .post(`/products/${id}/images`, formData)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while createing via uploadFile',
          err.message
        );
        throw err;
      });
  }

  async function deleteFile(id: number) {
    return client
      .delete(`/products/images/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[ProductsStore] - An error occurred while createing via deleteFile',
          err.message
        );
        throw err;
      });
  }

  return {
    pagination,
    products,
    createProduct,
    updateProduct,
    fetchProducts,
    fetchProductsSearch,
    deleteProduct,
    fetchProductsById,
    uploadFile,
    deleteFile,
  };
});
