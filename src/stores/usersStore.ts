import { defineStore } from 'pinia';
import { client } from 'src/boot/axios';
import { ref } from 'vue';

export const useUsersStore = defineStore('Users', () => {

  const users = ref()

  async function fetchUsers(params: any) {
    return client
      .get('users', { params })
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[UsersStore] - An error occurred while fetching via Users',
          err.message,
        );
        throw err;
      });
  }

  return {users, fetchUsers};
});
