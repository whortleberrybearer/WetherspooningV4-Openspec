import { createRouter, createWebHistory } from 'vue-router'
import MyVisitsView from '@/views/MyVisitsView.vue'
import SharedVisitsView from '@/views/SharedVisitsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MyVisitsView,
    },
    {
      path: '/visits/@:username',
      name: 'shared-visits',
      component: SharedVisitsView,
    },
  ],
})

export default router
