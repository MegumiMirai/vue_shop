import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入字体图标样式
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入 NProgress 包对应的Js和CSS
import NProgress from 'nprogress'

import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'

// axios请求拦截
// 在 request 拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use((config) => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', (dtStr) => {
  dtStr = new Date(dtStr)
  const y = dtStr.getFullYear()
  const m = (dtStr.getMonth() + 1 + '').padStart(2, '0')
  const d = (dtStr.getDate() + '').padStart(2, '0')

  const hh = (dtStr.getHours() + '').padStart(2, '0')
  const mm = (dtStr.getMinutes() + '').padStart(2, '0')
  const ss = (dtStr.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
