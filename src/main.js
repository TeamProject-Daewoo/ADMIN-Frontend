import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/api/auth';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.directive('role', {
    mounted(el, binding) {
      const authStore = useAuthStore();
      const requiredRole = binding.value;
      
      if (!authStore.hasRole(requiredRole)) {

        el.parentNode?.removeChild(el);
      }
    }
  });

app.use(createPinia())
app.use(router)

app.mount('#app')
