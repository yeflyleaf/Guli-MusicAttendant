/**
 * Vue 应用入口
 */
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './assets/styles/main.scss'
import i18n from './locales'
import router from './router'

// 创建 Vue 应用
const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(ElementPlus, { size: 'default', zIndex: 3000 })

// 在挂载前就开始预加载数据（与渲染并行）
import { useLibraryStore } from './store/library.store'
import { useSettingsStore } from './store/settings.store'

const libraryStore = useLibraryStore(pinia)
const settingsStore = useSettingsStore(pinia)

// 立即开始加载数据（不等待）
console.log('[Main] Starting data preload...')
const preloadPromise = Promise.all([
  settingsStore.loadSettings(),
  libraryStore.loadAll()
]).then(() => {
  console.log('[Main] Data preload complete!')
})

// 导出 preloadPromise 供其他组件等待（如果需要）
;(window as any).__preloadPromise = preloadPromise

// 挂载应用（与数据加载并行）
app.mount('#app')

