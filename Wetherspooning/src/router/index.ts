import { createRouter, createWebHistory } from 'vue-router'
import PubLocationsMap from '@/views/PubLocationsMap.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PubLocationsMap,
    },
  ],
})

export default router
