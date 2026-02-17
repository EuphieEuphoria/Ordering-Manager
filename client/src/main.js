/**
 * @file Main Vue application
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// Import CSS
import './assets/main.css'

// Import Vue App
import App from './App.vue'

// Import Configurations
import router from './router'
import { setupAxios } from './configs/api'

// Create Vue App
const app = createApp(App)

// Install Libraries
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  // Theme Configuration
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark-mode',
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)

// Install Directives
app.directive('tooltip', Tooltip)

// Setup Interceptors
setupAxios()

// Mount Vue App on page
app.mount('#app')
