import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import DeviceList from '../views/DeviceList.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: DeviceList,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
