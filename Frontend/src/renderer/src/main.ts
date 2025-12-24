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

// 扩展 Window 类型以支持 __preloadPromise
declare global {
  interface Window {
    __preloadPromise?: Promise<void>
  }
}

// 导出 preloadPromise 供其他组件等待（如果需要）
window.__preloadPromise = preloadPromise

// 监听后台自动扫描完成事件，自动刷新音乐库
// 这确保了在过场动画期间完成扫描后，用户无需手动刷新即可看到最新的音乐列表
window.electron.on('scan:complete', async (result) => {
  const scanResult = result as { added?: number } | undefined
  console.log('[Main] Received scan:complete event:', scanResult)
  if (scanResult && scanResult.added && scanResult.added > 0) {
    console.log(`[Main] Auto-scan added ${scanResult.added} songs, refreshing library...`)
    await libraryStore.refreshMusic()
    console.log('[Main] Library refreshed after auto-scan')
  }
})

// 挂载应用（与数据加载并行）
app.mount('#app')

