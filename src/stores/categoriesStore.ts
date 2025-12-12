import { defineStore } from 'pinia';
import { client } from 'src/api/client';
import type { ICategorie } from 'src/types/categorie.interface';
import { ref } from 'vue';

export const useCategoriesStore = defineStore('Categories', () => {
  const categories = ref<any[]>();

  async function createCategories(categori: any) {
    return client
      .post<ICategorie>('/categories', categori)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[CategoriesStore] - An error occurred while createing via Categori',
          err.message
        );
        throw err;
      });
  }

  async function updateCategorie(data: any) {
    const id = data.get('id');
    return client
      .put(`/categories/${id}`, data)
      .then((res: any) => res.data)
      .catch((err) => {
        console.error(
          '[CategoriesStore] - An error occurred while fetching via updateCategorie',
          err.message
        );
        throw err;
      });
  }

  async function fetchCategories() {
    return client
      .get<ICategorie[]>('categories')
      .then((res) => {
        categories.value = res.data;
        return res.data;
      })
      .catch((err) => {
        console.error(
          '[CategoriesStore] - An error occurred while fetching via fetchCategorie',
          err.message
        );
        throw err;
      });
  }

  async function deleteCategorie(id: number) {
    return client
      .delete(`categories/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[CategoriesStore] - An error occurred while deleting via deleteCategorie',
          err.message
        );
        throw err;
      });
  }

  return { categories, createCategories, fetchCategories, updateCategorie, deleteCategorie };
});
