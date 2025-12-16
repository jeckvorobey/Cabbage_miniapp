import { defineStore } from 'pinia';
import { client } from 'src/api/client';
import type { IUnit } from 'src/types/unit.interface';
import { ref } from 'vue';

export const useUnitsStore = defineStore('Units', () => {
  const units = ref<IUnit[]>([]);

  async function createUnit(unit: IUnit) {
    return client
      .post<IUnit>('units', unit)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[UnitsStore] - An error occurred while createing via createUnit',
          err.message
        );
        throw err;
      });
  }

  async function fetchUnitsById(id: number) {
    return client
      .get<IUnit>(`/units/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[UnitsStore] - An error occurred while fetching via fetchUnitsById',
          err.message
        );
        throw err;
      });
  }

  async function fetchUnits() {
    return client
      .get<IUnit[]>('units')
      .then((res) => {
        units.value = res.data;
      })
      .catch((err) => {
        console.error(
          '[UnitsStore] - An error occurred while fetching via fetchUnits',
          err.message
        );
        throw err;
      });
  }

  async function updateUnit(id: number, data: IUnit) {
    return client
      .put(`/units/${id}`, data)
      .then((res: any) => res.data)
      .catch((err) => {
        console.error(
          '[UnitsStore] - An error occurred while fetching via updateUnit',
          err.message
        );
        throw err;
      });
  }

  async function deleteUnit(id: number) {
    return client
      .delete(`units/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[UnitsStore] - An error occurred while deleting via deleteUnit',
          err.message
        );
        throw err;
      });
  }

  return { createUnit, fetchUnitsById, fetchUnits, updateUnit, deleteUnit, units };
});
