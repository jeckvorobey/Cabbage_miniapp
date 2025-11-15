import { defineStore } from 'pinia';
import { client } from 'src/boot/axios';
import type { IUnit } from 'src/types/unit.interface';
import { ref } from 'vue';

export const useUsersStore = defineStore('Users', () => {

  const users = ref()

  async function fetchUsers() {
    return client
      .get<IUnit[]>('users')
      .then((res) => {
        users.value = res.data
      })
      .catch((err) => {
        console.error(
          '[UsersStore ] - An error occurred while fetching via fetchUsers',
          err.message,
        );
        throw err;
      });
  }

  return {users, fetchUsers};
});
