<template>
  <div v-if="loading" class="align-center pt-2.5">
    <h3>Загрузка...</h3>
  </div>
  <div v-if="!tgUser" class="align-center pt-2.5">
    <h4>Вам необходимо войти через Telegram.</h4>
  </div>
  <ExpandedViewport force/>
</template>

<script setup lang="ts">
  import { useAuthStore } from 'src/stores/authStore'
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const authStore = useAuthStore()
  const tgUser = ref()
  const loading = ref(true)

  onMounted( ()=> {
    tgUser.value = window?.Telegram?.WebApp?.initData
    getUser()
  })

  async function getUser() {
    try {
      localStorage.removeItem('token')
      authStore.token = null
      if (tgUser.value) {
        authStore.telegramData = tgUser.value
        const resp = await authStore.auth(authStore.telegramData)
        if (resp) router.push('/dashboard')
      }
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

</script>

<style scoped lang="scss">
</style>
