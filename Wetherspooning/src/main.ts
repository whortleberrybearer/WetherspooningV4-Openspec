import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useTheme } from '@/composables/useTheme'

// Initialize theme before mounting app to prevent FOUC
const { initTheme } = useTheme()
initTheme()

const app = createApp(App)

app.use(router)

app.mount('#app')
