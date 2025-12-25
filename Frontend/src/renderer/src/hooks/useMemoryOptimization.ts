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
  // 恢复延迟
  RESTORE_DELAY: 50,
}

// 防抖定时器
let optimizationTimer: number | null = null
let restoreTimer: number | null = null

// 保存的状态
interface SavedState {
  // 保存的图片数据
  images: Map<HTMLImageElement, { src: string; loading: string }>
  // 保存的 Canvas 上下文
  canvasContexts: Map<HTMLCanvasElement, ImageData | null>
  // 保存的 store 数据
  storeData: {
    libraryMusic: unknown[] | null
    favorites: unknown[] | null
    recentlyPlayed: unknown[] | null
    playlists: unknown[] | null
  }
}

const savedState: SavedState = {
  images: new Map(),
  canvasContexts: new Map(),
  storeData: {
    libraryMusic: null,
    favorites: null,
    recentlyPlayed: null,
    playlists: null,
  },
}

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

/**
 * 销毁所有 Canvas 上下文以释放 GPU 内存
 */
function destroyCanvasContexts(): void {
  console.log('[MemoryOptimization] Destroying canvas contexts...')

  const canvases = document.querySelectorAll<HTMLCanvasElement>('canvas')

  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 保存当前内容（如果需要恢复的话）
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        savedState.canvasContexts.set(canvas, imageData)
      } catch {
        savedState.canvasContexts.set(canvas, null)
      }

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // 重置画布尺寸为 1x1 以释放内存
    const originalWidth = canvas.width
    const originalHeight = canvas.height
    canvas.dataset.originalWidth = String(originalWidth)
    canvas.dataset.originalHeight = String(originalHeight)
    canvas.width = 1
    canvas.height = 1
  })

  console.log(`[MemoryOptimization] Destroyed ${canvases.length} canvas contexts`)
}

/**
 * 恢复 Canvas 上下文
 */
function restoreCanvasContexts(): void {
  console.log('[MemoryOptimization] Restoring canvas contexts...')

  const canvases = document.querySelectorAll<HTMLCanvasElement>('canvas')

  canvases.forEach(canvas => {
    // 恢复原始尺寸
    const originalWidth = parseInt(canvas.dataset.originalWidth || '0')
    const originalHeight = parseInt(canvas.dataset.originalHeight || '0')

    if (originalWidth > 0 && originalHeight > 0) {
      canvas.width = originalWidth
      canvas.height = originalHeight
      delete canvas.dataset.originalWidth
      delete canvas.dataset.originalHeight
    }
  })

  savedState.canvasContexts.clear()
}

/**
 * 清理所有图片以释放内存
 */
function clearAllImages(): void {
  console.log('[MemoryOptimization] Clearing all images...')

  const images = document.querySelectorAll<HTMLImageElement>('img')
  let clearedCount = 0

  images.forEach(img => {
    if (img.src && !img.src.startsWith('data:')) {
      // 保存原始状态
      savedState.images.set(img, {
        src: img.src,
        loading: img.loading,
      })

      // 清空图片
      img.src = ''
      img.removeAttribute('src')
      clearedCount++
    }
  })

  console.log(`[MemoryOptimization] Cleared ${clearedCount} images`)
}

/**
 * 恢复所有图片
 */
function restoreAllImages(): void {
  console.log('[MemoryOptimization] Restoring all images...')

  savedState.images.forEach((data, img) => {
    if (document.contains(img)) {
      img.src = data.src
      img.loading = data.loading as 'lazy' | 'eager'
    }
  })

  savedState.images.clear()
}

/**
 * 完全移除动态背景 DOM 元素
 */
function removeAnimatedBackgrounds(): void {
  console.log('[MemoryOptimization] Removing animated backgrounds from DOM...')

  const backgroundSelectors = [
    '.interstellar-cruise-background',
    '.gothic-sanctuary-background',
    '.papercut-theatre-background',
    '.quantum-foam-background',
    '.sugar-land-background',
    '.wasteland-afterglow-background',
  ]

  backgroundSelectors.forEach(selector => {
    const elements = document.querySelectorAll<HTMLElement>(selector)
    elements.forEach(el => {
      // 完全隐藏并清空内容
      el.style.display = 'none'
      el.style.visibility = 'hidden'

      // 移除所有子元素以释放内存
      const savedHTML = el.innerHTML
      el.dataset.savedHtml = savedHTML
      el.innerHTML = ''
    })
  })
}

/**
 * 恢复动态背景
 */
function restoreAnimatedBackgrounds(): void {
  console.log('[MemoryOptimization] Restoring animated backgrounds...')

  const backgroundSelectors = [
    '.interstellar-cruise-background',
    '.gothic-sanctuary-background',
    '.papercut-theatre-background',
    '.quantum-foam-background',
    '.sugar-land-background',
    '.wasteland-afterglow-background',
  ]

  backgroundSelectors.forEach(selector => {
    const elements = document.querySelectorAll<HTMLElement>(selector)
    elements.forEach(el => {
      // 恢复内容
      if (el.dataset.savedHtml) {
        el.innerHTML = el.dataset.savedHtml
        delete el.dataset.savedHtml
      }

      el.style.display = ''
      el.style.visibility = ''
    })
  })
}

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

  // 创建大量临时对象然后丢弃，以触发 GC
  // 这是一种启发式方法，不保证一定触发 GC
  try {
    const arrays: number[][] = []
    for (let i = 0; i < 100; i++) {
      arrays.push(new Array(10000).fill(0))
    }
    // 立即丢弃
    arrays.length = 0
  } catch {
    // 忽略内存不足错误
  }

  // 如果有 gc() 函数可用（需要 --expose-gc 启动参数）
  if (typeof (globalThis as { gc?: () => void }).gc === 'function') {
    (globalThis as { gc: () => void }).gc()
    console.log('[MemoryOptimization] Manual GC triggered')
  }
}

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

  // 3. 移除动态背景
  removeAnimatedBackgrounds()

  // 4. 销毁 Canvas 上下文
  destroyCanvasContexts()

  // 5. 清理图片
  clearAllImages()

  // 6. 通知 Store 进入低内存模式
  notifyStoresEnterLowMemory()

  // 7. 延迟触发 GC
  setTimeout(() => {
    triggerGarbageCollection()

    // 再次触发以确保效果
    setTimeout(() => {
      triggerGarbageCollection()
    }, 500)
  }, 100)

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

  // 1. 恢复动画
  resumeAllAnimations()

  // 2. 通知 Store 退出低内存模式（先恢复数据）
  notifyStoresExitLowMemory()

  // 3. 恢复图片
  restoreAllImages()

  // 4. 恢复 Canvas
  restoreCanvasContexts()

  // 5. 恢复动态背景
  restoreAnimatedBackgrounds()

  // 6. 恢复可视化
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
    isMemoryOptimized,
    isLowMemoryMode,
    enableMemoryOptimization,
    disableMemoryOptimization,
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
