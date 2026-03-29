/**
 * 内存优化 Hook
 * 当窗口最小化或隐藏到托盘时，激进地降低内存占用
 * 只在这两种情况下启用，不影响正常使用体验
 *
 * 目标：从峰值 ~1300MB 降低到 ~500MB
 */
import { onMounted, onUnmounted, ref } from 'vue'

// 内存优化状态 - 导出供其他组件使用
export const isMemoryOptimized = ref(false)

// 低内存模式标志 - 用于控制组件是否渲染
export const isLowMemoryMode = ref(false)

let isInitialized = false

// 优化配置
const CONFIG = {
  // 延迟执行内存优化的时间（毫秒）
  OPTIMIZATION_DELAY: 500,
  // 增加恢复延迟到 150ms，给予操作系统足够的时间恢复进程优先级和线程调度
  RESTORE_DELAY: 150,
}

// 记录所有计划中的 GC 定时器，在退出模式时及时清除
const gcTimeouts: Set<number> = new Set()

// 防抖定时器
let optimizationTimer: number | null = null
let restoreTimer: number | null = null

// savedState 已移除，因为图片和画布清理改为组件内部逻辑

/**
 * 暂停所有 CSS 动画
 */
function pauseAllAnimations(): void {
  console.log('[MemoryOptimization] Pausing all CSS animations...')

  // 添加全局样式暂停所有动画
  const style = document.createElement('style')
  style.id = 'memory-optimization-pause-animations'
  style.textContent = `
    *, *::before, *::after {
      animation-play-state: paused !important;
      transition: none !important;
    }
  `
  document.head.appendChild(style)
}

/**
 * 恢复所有 CSS 动画
 */
function resumeAllAnimations(): void {
  console.log('[MemoryOptimization] Resuming all CSS animations...')

  const style = document.getElementById('memory-optimization-pause-animations')
  if (style) {
    style.remove()
  }
}

// Canvas 和图片清理逻辑已移除，由组件内部的 isLowMemoryMode 状态处理
// 这样可以避免从托盘恢复时出现的画布重置和闪烁情况

// 图片清理逻辑已移除，Vue 会自然保持响应式状态

/**
 * 通知 Store 进入低内存模式
 * Store 会清理不必要的缓存数据
 */
function notifyStoresEnterLowMemory(): void {
  console.log('[MemoryOptimization] Notifying stores to enter low memory mode...')

  window.dispatchEvent(new CustomEvent('memory-optimization:enter-low-memory'))
}

/**
 * 通知 Store 退出低内存模式
 */
function notifyStoresExitLowMemory(): void {
  console.log('[MemoryOptimization] Notifying stores to exit low memory mode...')

  window.dispatchEvent(new CustomEvent('memory-optimization:exit-low-memory'))
}

/**
 * 暂停音频可视化
 */
function pauseAudioVisualization(): void {
  console.log('[MemoryOptimization] Pausing audio visualization...')
  window.dispatchEvent(new CustomEvent('memory-optimization:pause-visualization'))
}

/**
 * 恢复音频可视化
 */
function resumeAudioVisualization(): void {
  console.log('[MemoryOptimization] Resuming audio visualization...')
  window.dispatchEvent(new CustomEvent('memory-optimization:resume-visualization'))
}

/**
 * 尝试触发垃圾回收
 */
function triggerGarbageCollection(): void {
  console.log('[MemoryOptimization] Triggering garbage collection...')

  // 移除同步分配大内存块的操作（会引起主线程卡顿）
  // 现在的内存压力由 Electron 自动通告 V8

  // 如果有 gc() 函数可用（需要 --expose-gc 启动参数）
  if (typeof (globalThis as { gc?: () => void }).gc === 'function') {
    (globalThis as { gc: () => void }).gc()
    console.log('[MemoryOptimization] Manual GC triggered')
  }

  // 清除 Renderer Cache（Image Cache, WebFrame Cache 等）
  if (window.electron?.window?.clearMemoryCache) {
    // 这将清除 WebFrame 缓存和主进程的部分缓存并触发主进程 GC
    window.electron.window.clearMemoryCache()
    console.log('[MemoryOptimization] Renderer and Main memory caches cleared')
  }
}

// 周期性 GC 逻辑已移除

/**
 * 执行激进的内存优化
 */
function enableMemoryOptimization(): void {
  if (isMemoryOptimized.value) return

  console.log('[MemoryOptimization] ========================================')
  console.log('[MemoryOptimization] ENABLING AGGRESSIVE MEMORY OPTIMIZATION')
  console.log('[MemoryOptimization] ========================================')

  const startTime = performance.now()

  isMemoryOptimized.value = true
  isLowMemoryMode.value = true

  // 1. 暂停所有动画
  pauseAllAnimations()

  // 2. 暂停可视化
  pauseAudioVisualization()

  // 3. 通知 Store 进入低内存模式
  notifyStoresEnterLowMemory()

  // 4. 开启单次 GC
  triggerGarbageCollection()

  // 8. 延迟触发多次 GC 以确保彻底释放
  const t1 = window.setTimeout(() => {
    triggerGarbageCollection()
    const t2 = window.setTimeout(() => {
      triggerGarbageCollection()
      gcTimeouts.delete(t2)
    }, 1000)
    gcTimeouts.add(t2)
    const t3 = window.setTimeout(() => {
      triggerGarbageCollection()
      gcTimeouts.delete(t3)
    }, 5000)
    gcTimeouts.add(t3)
    gcTimeouts.delete(t1)
  }, 100)
  gcTimeouts.add(t1)

  const endTime = performance.now()
  console.log(`[MemoryOptimization] Optimization completed in ${(endTime - startTime).toFixed(2)}ms`)
  console.log('[MemoryOptimization] ========================================')
}

/**
 * 禁用内存优化，恢复正常状态
 */
function disableMemoryOptimization(): void {
  if (!isMemoryOptimized.value) return

  console.log('[MemoryOptimization] ========================================')
  console.log('[MemoryOptimization] DISABLING MEMORY OPTIMIZATION')
  console.log('[MemoryOptimization] ========================================')

  const startTime = performance.now()

  isMemoryOptimized.value = false
  isLowMemoryMode.value = false

  // 清除所有还在排队中的 GC 任务，防止恢复后出现莫名卡顿
  gcTimeouts.forEach(t => clearTimeout(t))
  gcTimeouts.clear()

  // 1. 恢复动画
  resumeAllAnimations()

  // 2. 通知 Store 退出低内存模式（先恢复数据）
  notifyStoresExitLowMemory()

  // 3. 恢复可视化
  resumeAudioVisualization()

  const endTime = performance.now()
  console.log(`[MemoryOptimization] Restoration completed in ${(endTime - startTime).toFixed(2)}ms`)
  console.log('[MemoryOptimization] ========================================')
}

/**
 * 处理窗口隐藏事件
 */
function handleWindowHidden(): void {
  console.log('[MemoryOptimization] Window hidden event received')

  if (restoreTimer) {
    clearTimeout(restoreTimer)
    restoreTimer = null
  }

  if (optimizationTimer) {
    clearTimeout(optimizationTimer)
  }

  optimizationTimer = window.setTimeout(() => {
    enableMemoryOptimization()
  }, CONFIG.OPTIMIZATION_DELAY)
}

/**
 * 处理窗口显示事件
 */
function handleWindowShown(): void {
  console.log('[MemoryOptimization] Window shown event received')

  if (optimizationTimer) {
    clearTimeout(optimizationTimer)
    optimizationTimer = null
  }

  if (restoreTimer) {
    clearTimeout(restoreTimer)
  }

  restoreTimer = window.setTimeout(() => {
    disableMemoryOptimization()
  }, CONFIG.RESTORE_DELAY)
}

/**
 * 初始化内存优化系统
 */
function initMemoryOptimization(): void {
  if (isInitialized) return
  isInitialized = true

  console.log('[MemoryOptimization] Initializing aggressive memory optimization system...')

  if (window.electron?.on) {
    window.electron.on('window:hidden', handleWindowHidden as (...args: unknown[]) => void)
    window.electron.on('window:shown', handleWindowShown as (...args: unknown[]) => void)
  }

  // 监听主题切换触发的清理请求
  window.addEventListener('memory-optimization:theme-cleanup', () => {
    console.log('[MemoryOptimization] Active theme cleanup requested...')
    triggerGarbageCollection()
    // 强制进行一次重绘后再次清理，以确保 canvas 对象被完全解构
    setTimeout(() => triggerGarbageCollection(), 500)
    setTimeout(() => triggerGarbageCollection(), 2000)
  })

  console.log('[MemoryOptimization] Memory optimization system initialized')
}

/**
 * 内存优化 Hook
 */
export function useMemoryOptimization() {
  onMounted(() => {
    initMemoryOptimization()
  })

  onUnmounted(() => {
    if (optimizationTimer) {
      clearTimeout(optimizationTimer)
      optimizationTimer = null
    }
    if (restoreTimer) {
      clearTimeout(restoreTimer)
      restoreTimer = null
    }
  })

  return {
    isLowMemoryMode,
    enableMemoryOptimization,
    disableMemoryOptimization,
    triggerGarbageCollection,
  }
}

/**
 * 获取内存优化状态
 */
export function getMemoryOptimizationState() {
  return {
    isMemoryOptimized,
    isLowMemoryMode,
  }
}
