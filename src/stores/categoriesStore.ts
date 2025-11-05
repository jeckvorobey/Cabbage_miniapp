import { defineStore } from 'pinia';
import { client } from 'src/boot/axios';
import type { ICategorie } from 'src/types/categorie';

export const useCategoriesStore = defineStore('Categories', () => {
  async function createCategories(categori: ICategorie) {
    return client
      .post<ICategorie>('/categories', categori)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[CategoriesStore] - An error occurred while createing via Categori',
          err.message,
        );
        throw err;
      });
  }

  async function updateCategorie(id: number, data: any) {
    return client
      .put(`/categories/${id}`, { data })
      .then((res: any) =>  res.data)
      .catch((err) => {
        console.error('[CategoriesStore] - An error occurred while fetching via updateCategorie', err.message)
        throw err
      })
  }

  async function deleteCategories(id: number) {
    return client
      .delete(`categories/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[CategoriesStore] - An error occurred while deleting via Categori',
          err.message,
        );
        throw err;
      });
  }

  return { createCategories, updateCategorie, deleteCategories };
});
