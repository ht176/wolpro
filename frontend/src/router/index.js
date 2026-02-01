import { createRouter, createWebHistory } from 'vue-router'
import DeviceList from '../views/DeviceList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DeviceList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
