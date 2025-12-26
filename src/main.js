import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import PubLocationsMap from './components/PubLocationsMap.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PubLocationsMap
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
