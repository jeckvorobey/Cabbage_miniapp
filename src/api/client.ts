import axios from 'axios';

// Создаем axios клиент для использования в stores и компонентах
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://example.com/',
  timeout: 30000,
  withCredentials: true,
});

// Добавляем interceptor для автоматической подстановки токена
client.interceptors.request.use((request) => {
  if (!request.headers.SkipAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
  }

  return request;
});

