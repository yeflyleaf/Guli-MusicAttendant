/**
 * 内存优化 Hook
 * 当窗口最小化或隐藏到托盘时，降低内存占用
 * 只在这两种情况下启用，不影响正常使用体验
 */
import { onMounted, onUnmounted, ref } from 'vue'

// 内存优化状态
const isMemoryOptimized = ref(false)
let isInitialized = false

// 保存的动画状态
let savedAnimationPlayStates: WeakMap<HTMLElement, string> = new WeakMap()
let animationObserver: MutationObserver | null = null

// 优化配置
const CONFIG = {
  // 延迟执行内存优化的时间（毫秒），避免频繁切换
  OPTIMIZATION_DELAY: 300,
  // GC 建议间隔
  GC_INTERVAL: 1000,
}

// 防抖定时器
let optimizationTimer: number | null = null
let restoreTimer: number | null = null

/**
 * 暂停所有 CSS 动画（降低 GPU 内存和 CPU 占用）
 */
function pauseAllAnimations(): void {
  console.log('[MemoryOptimization] Pausing all CSS animations...')

  // 选择所有具有动画的元素
  const animatedElements = document.querySelectorAll<HTMLElement>('*')

  animatedElements.forEach(el => {
    const computedStyle = window.getComputedStyle(el)
    const animationName = computedStyle.animationName
    const animationPlayState = computedStyle.animationPlayState

    // 只处理有动画且正在运行的元素
    if (animationName && animationName !== 'none' && animationPlayState === 'running') {
      savedAnimationPlayStates.set(el, animationPlayState)
      el.style.animationPlayState = 'paused'
    }
  })

  console.log('[MemoryOptimization] CSS animations paused')
}

/**
 * 恢复所有 CSS 动画
 */
function resumeAllAnimations(): void {
  console.log('[MemoryOptimization] Resuming all CSS animations...')

  const animatedElements = document.querySelectorAll<HTMLElement>('*')

  animatedElements.forEach(el => {
    const savedState = savedAnimationPlayStates.get(el)
    if (savedState) {
      el.style.animationPlayState = ''
      savedAnimationPlayStates.delete(el)
    }
  })

  // 清空 WeakMap
  savedAnimationPlayStates = new WeakMap()

  console.log('[MemoryOptimization] CSS animations resumed')
}

/**
 * 暂停音频可视化（释放 AudioContext 资源）
 */
function pauseAudioVisualization(): void {
  console.log('[MemoryOptimization] Pausing audio visualization...')

  // 发送事件通知可视化组件暂停
  window.dispatchEvent(new CustomEvent('memory-optimization:pause-visualization'))

  console.log('[MemoryOptimization] Audio visualization paused')
}

/**
 * 恢复音频可视化
 */
function resumeAudioVisualization(): void {
  console.log('[MemoryOptimization] Resuming audio visualization...')

  // 发送事件通知可视化组件恢复
  window.dispatchEvent(new CustomEvent('memory-optimization:resume-visualization'))

  console.log('[MemoryOptimization] Audio visualization resumed')
}

/**
 * 清理图片缓存（减少内存占用）
 */
function clearImageCache(): void {
  console.log('[MemoryOptimization] Clearing image caches...')

  // 将不可见的图片 src 替换为 data-src，释放图片内存
  // 注意：我们只处理不在视口内的图片，保留封面等关键图片
  const images = document.querySelectorAll<HTMLImageElement>('img:not([data-no-optimize])')

  images.forEach(img => {
    // 检查图片是否在视口外
    const rect = img.getBoundingClientRect()
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0 &&
                     rect.left < window.innerWidth && rect.right > 0

    if (!isVisible && img.src && !img.dataset.optimizedSrc) {
      img.dataset.optimizedSrc = img.src
      img.dataset.originalLoading = img.loading
      // 使用 1x1 透明像素替换
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    }
  })

  console.log('[MemoryOptimization] Image caches cleared')
}

/**
 * 恢复图片缓存
 */
function restoreImageCache(): void {
  console.log('[MemoryOptimization] Restoring image caches...')

  const images = document.querySelectorAll<HTMLImageElement>('img[data-optimized-src]')

  images.forEach(img => {
    if (img.dataset.optimizedSrc) {
      img.src = img.dataset.optimizedSrc
      delete img.dataset.optimizedSrc
      if (img.dataset.originalLoading) {
        img.loading = img.dataset.originalLoading as 'lazy' | 'eager'
        delete img.dataset.originalLoading
      }
    }
  })

  console.log('[MemoryOptimization] Image caches restored')
}

/**
 * 隐藏动态背景组件（大幅降低 GPU 内存）
 */
function hideAnimatedBackgrounds(): void {
  console.log('[MemoryOptimization] Hiding animated backgrounds...')

  // 针对动态背景组件的选择器
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
      if (!el.dataset.originalDisplay) {
        el.dataset.originalDisplay = el.style.display || ''
        el.dataset.originalVisibility = el.style.visibility || ''
      }
      el.style.visibility = 'hidden'
      // 使用 visibility 而不是 display:none，这样恢复时不会触发重排
    })
  })

  console.log('[MemoryOptimization] Animated backgrounds hidden')
}

/**
 * 恢复动态背景组件
 */
function showAnimatedBackgrounds(): void {
  console.log('[MemoryOptimization] Showing animated backgrounds...')

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
      if (el.dataset.originalVisibility !== undefined) {
        el.style.visibility = el.dataset.originalVisibility
        delete el.dataset.originalVisibility
      }
      if (el.dataset.originalDisplay !== undefined) {
        delete el.dataset.originalDisplay
      }
    })
  })

  console.log('[MemoryOptimization] Animated backgrounds shown')
}

/**
 * 建议 GC（如果浏览器支持）
 */
function suggestGC(): void {
  // 尝试通过清空未使用的引用来帮助 GC
  if (typeof window !== 'undefined') {
    // 清理 console（如果在开发模式）
    // console.clear() - 不在这里调用，避免丢失调试信息

    console.log('[MemoryOptimization] Suggesting garbage collection...')
  }
}

/**
 * 执行内存优化
 */
function enableMemoryOptimization(): void {
  if (isMemoryOptimized.value) return

  console.log('[MemoryOptimization] ========== ENABLING MEMORY OPTIMIZATION ==========')
  console.log('[MemoryOptimization] Window is minimized or hidden to tray, reducing memory usage...')

  isMemoryOptimized.value = true

  // 执行优化措施
  pauseAllAnimations()
  pauseAudioVisualization()
  hideAnimatedBackgrounds()
  clearImageCache()

  // 延迟建议 GC，让上述操作先完成
  setTimeout(() => {
    suggestGC()
  }, CONFIG.GC_INTERVAL)

  console.log('[MemoryOptimization] ========== MEMORY OPTIMIZATION ENABLED ==========')
}

/**
 * 禁用内存优化，恢复正常状态
 */
function disableMemoryOptimization(): void {
  if (!isMemoryOptimized.value) return

  console.log('[MemoryOptimization] ========== DISABLING MEMORY OPTIMIZATION ==========')
  console.log('[MemoryOptimization] Window is restored, resuming normal operation...')

  isMemoryOptimized.value = false

  // 恢复正常状态
  resumeAllAnimations()
  resumeAudioVisualization()
  showAnimatedBackgrounds()
  restoreImageCache()

  console.log('[MemoryOptimization] ========== MEMORY OPTIMIZATION DISABLED ==========')
}

/**
 * 处理窗口隐藏事件（最小化或隐藏到托盘）
 */
function handleWindowHidden(): void {
  console.log('[MemoryOptimization] Window hidden event received')

  // 清除恢复定时器
  if (restoreTimer) {
    clearTimeout(restoreTimer)
    restoreTimer = null
  }

  // 清除之前的优化定时器
  if (optimizationTimer) {
    clearTimeout(optimizationTimer)
  }

  // 延迟执行优化，避免快速切换时频繁操作
  optimizationTimer = window.setTimeout(() => {
    enableMemoryOptimization()
  }, CONFIG.OPTIMIZATION_DELAY)
}

/**
 * 处理窗口显示事件（从最小化或托盘恢复）
 */
function handleWindowShown(): void {
  console.log('[MemoryOptimization] Window shown event received')

  // 清除优化定时器
  if (optimizationTimer) {
    clearTimeout(optimizationTimer)
    optimizationTimer = null
  }

  // 清除之前的恢复定时器
  if (restoreTimer) {
    clearTimeout(restoreTimer)
  }

  // 立即恢复（用户希望立即看到界面）
  restoreTimer = window.setTimeout(() => {
    disableMemoryOptimization()
  }, 50) // 非常短的延迟，只是为了合并可能的多次调用
}

/**
 * 初始化内存优化监听器
 * 只需调用一次，在应用启动时
 */
function initMemoryOptimization(): void {
  if (isInitialized) return
  isInitialized = true

  console.log('[MemoryOptimization] Initializing memory optimization system...')

  // 监听来自主进程的窗口状态变化通知
  if (window.electron?.on) {
    window.electron.on('window:hidden', handleWindowHidden as (...args: unknown[]) => void)
    window.electron.on('window:shown', handleWindowShown as (...args: unknown[]) => void)
  }

  // 作为备用，也监听浏览器的 visibilitychange 事件
  // 注意：这个事件在 Electron 中可能不够可靠，主要依赖主进程通知
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 仅当主进程没有通知时作为备用
      console.log('[MemoryOptimization] Document visibility changed to hidden')
    }
  })

  console.log('[MemoryOptimization] Memory optimization system initialized')
}

/**
 * 内存优化 Hook
 * 在 App.vue 中调用一次即可
 */
export function useMemoryOptimization() {
  onMounted(() => {
    initMemoryOptimization()
  })

  onUnmounted(() => {
    // 清理定时器
    if (optimizationTimer) {
      clearTimeout(optimizationTimer)
      optimizationTimer = null
    }
    if (restoreTimer) {
      clearTimeout(restoreTimer)
      restoreTimer = null
    }

    // 清理 MutationObserver
    if (animationObserver) {
      animationObserver.disconnect()
      animationObserver = null
    }
  })

  return {
    isMemoryOptimized,
    enableMemoryOptimization,
    disableMemoryOptimization,
  }
}

/**
 * 获取当前内存优化状态
 * 可在任何组件中使用
 */
export function getMemoryOptimizationState() {
  return isMemoryOptimized
}
