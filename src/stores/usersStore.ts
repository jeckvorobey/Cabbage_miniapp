import { defineStore } from 'pinia';
import { client } from 'src/api/client';
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

  async function updateUserRole(id: number, role: number) {
    return client
      .patch(`/users/${id}/toggle-role`, { role })
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[UsersStore] - An error occurred while creating via updateUserRole',
          err.message,
        );
        throw err;
      });
  }

  async function updateMyPhone( phone: number) {
    return client
      .patch('/users/me/phone', { phone })
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[UsersStore] - An error occurred while creating via updateMyPhone',
          err.message,
        );
        throw err;
      });
  }


  return {users, fetchUsers, updateUserRole, updateMyPhone};
});
