import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: {
      hasAuth: true,
      headerTitle: '',
      sorting: ''
    },
    redirect: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: '/', component: () => import('pages/DashboardPage.vue') },
      { path: '/user', name: 'user', component: () => import('pages/UserPage.vue') },
      { path: '/users', name: 'users', component: () => import('pages/UsersPage.vue') },
      { path: '/units', name: 'units', component: () => import('pages/UnitsPage.vue') },
      { path: '/categories', name: 'categories', component: () => import('pages/CategoriesPage.vue') },
      { path: '/history', name: 'history', component: () => import('pages/OrderHistoryPage.vue') },
      { path: '/delivery', name: 'delivery', component: () => import('pages/DeliveryPage.vue') },
    ],
  },
  {
    path: '/start',
    name: 'start',
    meta: {
      hasAuth: false
    },
    component: () => import('pages/TelegramStartPage.vue')
  },
  {
    meta: {
      hasAuth: true
    },
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
