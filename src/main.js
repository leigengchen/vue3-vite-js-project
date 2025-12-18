import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import router from '@/router/index.js'
// import store from '@/store'
// import { createPinia } from 'pinia'
import 'ant-design-vue/dist/reset.css'
// import 'tailwindcss/tailwind.css'
import '@/assets/style/reset.css'
import './index.css'

// const pinia = createPinia()

createApp(App)
  .use(Antd)
  .use(router)
  // .use(pinia)
  // .use(store)
  .mount('#app')
