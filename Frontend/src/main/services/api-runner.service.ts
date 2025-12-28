/**
 * API Runner 服务
 * 管理隐形窗口生命周期
 * 安全执行第三方源脚本
 */
import { BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'

// 隐形窗口实例
let ghostWindow: BrowserWindow | null = null

// 已加载的源脚本信息
interface LoadedSource {
  name: string
  initialized: boolean
  type: 'native' | 'external'  // native = Guli原生, external = 第三方脚本
  scriptContent?: string
}
const loadedSources: Map<string, LoadedSource> = new Map()

// 待处理的请求
const pendingRequests: Map<string, {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
  timeout: NodeJS.Timeout
}> = new Map()

// 请求超时时间
const REQUEST_TIMEOUT = 30000

/**
 * 创建隐形窗口
 */
export function createGhostWindow(): BrowserWindow {
  if (ghostWindow && !ghostWindow.isDestroyed()) {
    return ghostWindow
  }

  ghostWindow = new BrowserWindow({
    show: false,
    width: 400,
    height: 300,
    webPreferences: {
      preload: join(__dirname, '../preload/api-runner.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false // 允许跨域请求
    }
  })

  ghostWindow.loadURL('about:blank')

  ghostWindow.on('closed', () => {
    ghostWindow = null
    loadedSources.clear()
  })

  // 设置事件监听
  setupEventListeners()

  console.log('[ApiRunner] Ghost window created')
  return ghostWindow
}

/**
 * 设置 IPC 事件监听
 */
let listenersSetup = false

/**
 * 设置 IPC 事件监听
 */
function setupEventListeners(): void {
  if (listenersSetup) return
  listenersSetup = true

  // 监听脚本初始化事件
  ipcMain.on('script:event', (_event, { eventName, data }) => {
    console.log('[ApiRunner] Script event:', eventName)

    if (eventName === 'inited') {
      // 脚本初始化完成，记录可用的源
      if (data && typeof data === 'object' && 'sources' in data) {
        console.log('[ApiRunner] Sources registered:', Object.keys(data.sources as object))
      }
    }
  })

  // 监听脚本事件结果
  ipcMain.on('script:eventResult', (_event, { requestId, result, error }) => {
    const pending = pendingRequests.get(requestId)
    if (pending) {
      clearTimeout(pending.timeout)
      pendingRequests.delete(requestId)

      if (error) {
        pending.reject(new Error(error))
      } else {
        pending.resolve(result)
      }
    }
  })
}

/**
 * 获取隐形窗口
 */
export function getGhostWindow(): BrowserWindow | null {
  return ghostWindow
}

/**
 * 销毁隐形窗口
 */
export function destroyGhostWindow(): void {
  if (ghostWindow && !ghostWindow.isDestroyed()) {
    ghostWindow.close()
    ghostWindow = null
    loadedSources.clear()
    console.log('[ApiRunner] Ghost window destroyed')
  }
}

/**
 * 检测脚本类型
 */
function detectScriptType(scriptContent: string): 'native' | 'external' {
  // 原生格式检测
  if (scriptContent.includes('GULI_SOURCE_META') || scriptContent.includes('guliSource')) {
    return 'native'
  }
  // 其他格式视为外部脚本
  return 'external'
}

/**
 * 注入源脚本
 */
export async function injectSourceScript(
  sourceId: string,
  sourceName: string,
  scriptContent: string
): Promise<boolean> {
  const window = createGhostWindow()
  const scriptType = detectScriptType(scriptContent)

  try {
    // 确保窗口已加载完成
    if (window.webContents.isLoading()) {
      await new Promise<void>((resolve) => {
        window.webContents.once('did-finish-load', () => resolve())
      })
    }

    // 对外部脚本设置环境
    if (scriptType === 'external') {
      const setupCode = `
        (function() {
          // 确保全局对象存在
          if (!window.lx) window.lx = window.guli_api;

          // 设置脚本信息
          const apiNames = ['lx', 'musicApi', 'sourceApi'];
          apiNames.forEach(function(apiName) {
            if (window[apiName]) {
              if (!window[apiName].currentScriptInfo) {
                window[apiName].currentScriptInfo = {};
              }
              window[apiName].currentScriptInfo.version = '1';
              window[apiName].currentScriptInfo.name = ${JSON.stringify(sourceName)};
            }
          });
        })();
      `
      await window.webContents.executeJavaScript(setupCode)
    }

    // 注入主脚本
    await window.webContents.executeJavaScript(scriptContent)

    loadedSources.set(sourceId, {
      name: sourceName,
      initialized: true,
      type: scriptType,
      scriptContent
    })

    console.log(`[ApiRunner] Source loaded: ${sourceName} [${scriptType}]`)
    return true
  } catch (error) {
    console.error(`[ApiRunner] Failed to load: ${sourceName}`, error)
    return false
  }
}

/**
 * 在隐形窗口执行代码
 */
export async function executeInGhost(code: string): Promise<unknown> {
  const window = getGhostWindow()
  if (!window || window.isDestroyed()) {
    throw new Error('Ghost window not available')
  }
  return window.webContents.executeJavaScript(code)
}

/**
 * 向隐形窗口发送事件
 */
export function sendScriptEvent(eventName: string, data: unknown): void {
  const window = getGhostWindow()
  if (window && !window.isDestroyed()) {
    window.webContents.send('script:triggerEvent', { eventName, data })
  }
}

/**
 * 调用外部脚本获取音乐URL
 * 使用事件驱动方式通信
 */
export async function callExternalSource(
  sourceType: string,
  action: string,
  musicInfo: Record<string, unknown>,
  quality: string = '128k'
): Promise<string> {
  const window = getGhostWindow()
  if (!window || window.isDestroyed()) {
    throw new Error('Ghost window not available')
  }

  const requestId = `${Date.now()}_${Math.random().toString(36).substring(7)}`

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(new Error('Request timeout'))
    }, REQUEST_TIMEOUT)

    pendingRequests.set(requestId, { resolve: resolve as (v: unknown) => void, reject, timeout })

    // 发送请求事件
    window.webContents.send('script:triggerEvent', {
      eventName: 'request',
      data: {
        requestId,
        source: sourceType,
        action,
        info: {
          musicInfo,
          type: quality
        }
      }
    })
  })
}

/**
 * 获取源类型
 */
export function getSourceType(sourceId: string): 'native' | 'external' | null {
  return loadedSources.get(sourceId)?.type ?? null
}

/**
 * 获取已加载源列表
 */
export function getLoadedSources(): Array<{ id: string; name: string; type: string }> {
  const result: Array<{ id: string; name: string; type: string }> = []
  loadedSources.forEach(({ name, type }, id) => {
    result.push({ id, name, type })
  })
  return result
}

/**
 * 检查源是否已加载
 */
export function isSourceLoaded(sourceId: string): boolean {
  return loadedSources.has(sourceId)
}

/**
 * 移除源
 */
export function removeSource(sourceId: string): boolean {
  return loadedSources.delete(sourceId)
}

console.log('[ApiRunner] Service initialized (window will be created on demand)')
