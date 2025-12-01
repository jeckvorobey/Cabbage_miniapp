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
      {
        path: '/',
        name: '',
        children: [
          {
            path: '',
            name: 'dashboard',
            component: () => import('pages/DashboardPage.vue')
          },
          {
            path: 'create',
            name: 'products-create',
            component: () => import('pages/ProductPage.vue'),
          },
          {
            path: ':id/edit',
            name: 'products-edit',
            component: () => import('pages/ProductPage.vue'),
          },
        ],
      },
      { path: '/user', name: 'user', component: () => import('pages/UserPage.vue') },
      { path: '/users', name: 'users', component: () => import('pages/UsersPage.vue') },
      { path: '/units', name: 'units', component: () => import('pages/UnitsPage.vue') },
      { path: '/catalog', name: 'catalog', component: () => import('pages/CatalogPage.vue') },
      { path: '/categories', name: 'categories', component: () => import('pages/CategoriesPage.vue') },
      { path: '/history', name: 'history', component: () => import('pages/OrderHistoryPage.vue') },
      { path: '/reviews', name: 'reviews', component: () => import('pages/ReviewsPage.vue') },
      { path: '/delivery', name: 'delivery', component: () => import('pages/DeliveryPage.vue') },
      { path: '/product', name: 'product', component: () => import('src/pages/ProductPage.vue') },
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
