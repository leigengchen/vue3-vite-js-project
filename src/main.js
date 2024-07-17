import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import router from '@/router/index.js'
import store from '@/store'
import 'ant-design-vue/dist/reset.css'
import 'tailwindcss/tailwind.css'
import '@/assets/style/reset.css'

createApp(App)
  .use(Antd)
  .use(router)
  .use(store)
  .mount('#app')
