// plugins/pinia.client.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin({
  name: 'pinia',
  setup() {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    return { provide: { pinia } }
  }
})