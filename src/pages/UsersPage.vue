<template>
  <q-infinite-scroll @load="onLoad" :offset="250">
    <h6 class="text-center q-mt-md q-mb-md">Пользователи</h6>
    <q-card class="my-card q-ma-sm" flat bordered>
      <q-list v-for="(user, index) in usersStore.users" :key="index">
        <q-item>
          <q-item-section avatar>
            <q-icon color="primary" name="local_bar" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
            <q-item-label caption>{{ user.telegram_id }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ accessLevel(user.role) }}</q-item-label>
          </q-item-section>
          <q-item-action>
<!--            <q-btn-->
<!--              v-if="admin"-->
<!--              flat-->
<!--              round-->
<!--              color="red"-->
<!--              icon="disabled_visible"-->
<!--              @click="disabledUser(user)"-->
<!--            />-->
            <q-btn-dropdown dense flat color="primary" dropdown-icon="change_history">
              <q-list>
                <q-item
                  v-for="(it, index) in roleData"
                  :key="index"
                  v-close-popup
                  clickable
                  @click="selectRole(user.id, it.value)"
                >
                  <q-item-section>
                    <q-item-label>{{ it.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-item-action>
        </q-item>
        <q-separator />
      </q-list>
    </q-card>
  </q-infinite-scroll>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { accessLevel } from 'src/use/useUtils';
import { useUsersStore } from 'src/stores/usersStore';

const $q = useQuasar();
const usersStore = useUsersStore();
const pagination = ref({
  offset: 0,
  limit: 20,
  total: 0,
  has_more: true,
});

const roleData = ref([
  { name: 'Администратор', value: 1 },
  { name: 'Менеджер', value: 2 },
  { name: 'Пользователь', value: 9 },
]);

const onLoad = async (index: number, done: (stop?: boolean) => void) => {
  if (!pagination.value.has_more) {
    done(true);
    return;
  }
  await fetchUsers();
  pagination.value.offset += pagination.value.limit;
  done();
};

async function fetchUsers(reset?: boolean) {
  try {
    $q.loading.show();
    const res = await usersStore.fetchUsers(pagination.value);
    if (res) {
      pagination.value.total = res.total;
      pagination.value.has_more = res.has_more;
      if (usersStore?.users?.length && !reset) {
        usersStore.users.push(res.items);
      } else {
        usersStore.users = res.items;
      }
    }
  } catch (e: any) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

function selectRole(id: number, role: number) {
  $q.dialog({
    title: 'Изменение прав пользователя',
    message: 'Вы уверенны что хотите изменить права этого пользователя?',
    cancel: true,
    persistent: true,
  }).onOk(  () => {
     changeRole(id, role);
  });
}

async function changeRole(id: number, role: number) {
  try {
    $q.loading.show();
    const res = await usersStore.updateUserRole(id, role);
    if (res) {
      await fetchUsers(true);
      $q.notify({
        message: `Роль изменена`,
        color: 'primary',
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    $q.loading.hide();
  }
}

// function disabledUser(user: any) {
//   try {
//     $q.loading.show();
//   } catch (e) {
//     console.error(e);
//   } finally {
//     $q.notify({
//       message: `Пользователь ${user.name} заблокирован`,
//       color: 'primary',
//     });
//     $q.loading.hide();
//   }
// }
</script>
