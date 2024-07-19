import { createRouter, createWebHistory } from 'vue-router'; // history
// import { start, done } from '@/utils/nprogress'

const routes = [
  {
    path: '/index',
    name: 'index',
    component: () => import('@/views/homePage/index.vue')
  },
  {
    path: '/detailPage',
    name: 'detailPage',
    component: () => import('@/views/detail/index.vue')
  },
  {
    path: '/',
    redirect: '/index'
  }
]

const router = createRouter({
  history: createWebHistory(), // history模式
  routes
})

// 路由拦截
router.beforeEach((to, from, next) => {
  start()
  next()
})

// 路由后置钩子
router.afterEach(() => {
  done()
})

export default router