import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/Index.vue')
  },
  {
    path: '/recycle',
    name: 'Recycle',
    component: () => import('../views/Recycle.vue')
  },
  {
    path: '/scan',
    name: 'Scan',
    component: () => import('../views/Scan.vue')
  },
  {
    path: '/thankyou',
    name: 'Thankyou',
    component: () => import('../views/Thankyou.vue')
  },
  {
    path: '/nonmember',
    name: 'Nonmember',
    component: () => import('../views/Nonmember.vue')
  },
  {
    path: '/nonmember-elec',
    name: 'NonmemberElec',
    component: () => import('../views/NonmemberElec.vue')
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('../views/Error.vue')
  },
  {
    path: '/error-normal',
    name: 'ErrorNormal',
    component: () => import('../views/ErrorNormal.vue')
  },
  {
    path: '/offline',
    name: 'Offline',
    component: () => import('../views/Offline.vue')
  },
  {
    path: '/offline-normal',
    name: 'OfflineNormal',
    component: () => import('../views/OfflineNormal.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
