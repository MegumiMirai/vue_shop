import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标样式
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// axios请求拦截
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
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
