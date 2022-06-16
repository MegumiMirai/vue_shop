import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
// 导入组件
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'

Vue.use(VueRouter)

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

// 挂载路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token字符串
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()

  // if (to.path !== '/login' && !sessionStorage.getItem('token')) {
  //   next('/login')
  // } else {
  //   next()
  // }
})

export default router
