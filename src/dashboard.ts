// 儿童大屏独立入口 - 复用原始组件，不加载管理后台框架
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import UserDashboardPage from './views/kids/dashboard/UserDashboardPage.vue'
import DashboardIcon from './components/Icon/DashboardIcon'

const app = createApp(UserDashboardPage)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册轻量版 Icon 组件（替代管理后台的 Icon）
app.component('Icon', DashboardIcon)

app.use(ElementPlus)
app.mount('#dashboard-app')
