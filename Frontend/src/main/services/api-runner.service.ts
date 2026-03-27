/**
 * API Runner 服务
 * 管理隐形窗口生命周期
 * 安全执行第三方源脚本
 */
import axios from 'axios'
import { app, BrowserWindow, ipcMain } from 'electron'
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
const REQUEST_TIMEOUT = 60000

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
      sandbox: false, // 必须关闭 sandbox 才能在 preload 中使用 require
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

  // 开发模式下打开 DevTools 以查看渲染进程错误
  if (!app.isPackaged) {
    ghostWindow.webContents.openDevTools({ mode: 'detach' })
  }

  console.log('[ApiRunner] Ghost window created')
  return ghostWindow
}

/**
 * 设置 IPC 事件监听
 */
let listenersSetup = false

function setupEventListeners(): void {
  if (listenersSetup) return
  listenersSetup = true

  // 监听来自渲染进程的日志
  ipcMain.on('source-runner-log', (_event, { type, args }) => {
    const prefix = '[GhostWindow]'
    switch (type) {
      case 'log':
        console.log(prefix, ...args)
        break
      case 'error':
        console.error(prefix, ...args)
        break
      case 'warn':
        console.warn(prefix, ...args)
        break
    }
  })

  // 监听脚本初始化事件
  ipcMain.on('script:event', (_event, { eventName, data }) => {
    console.log('[ApiRunner] Script event:', eventName)

    if (eventName === 'inited') {
      if (data && typeof data === 'object') {
        console.log('[ApiRunner] Source initialized:', data)
        if ('sources' in data) {
          console.log('[ApiRunner] Available sources:', Object.keys(data.sources as object))
        }
      }
    }
  })

  // 监听脚本事件结果
  ipcMain.on('script:eventResult', (_event, { requestId, result, error }) => {
    console.log(`[ApiRunner] Received eventResult for ${requestId}:`, { result, error })

    const pending = pendingRequests.get(requestId)
    if (pending) {
      clearTimeout(pending.timeout)
      pendingRequests.delete(requestId)

      if (error) {
        console.error(`[ApiRunner] Request ${requestId} failed:`, error)
        pending.reject(new Error(error))
      } else {
        console.log(`[ApiRunner] Request ${requestId} succeeded`)
        pending.resolve(result)
      }
    } else {
      console.warn(`[ApiRunner] No pending request found for ${requestId}`)
    }
  })

  // 监听来自渲染进程的通用事件
  ipcMain.on('source-runner-event', (_event, { channel, data }) => {
    console.log('[ApiRunner] Source runner event:', channel, data)
  })

  console.log('[ApiRunner] Event listeners setup complete')
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
  if (scriptContent.includes('GULI_SOURCE_META') || scriptContent.includes('guliSource')) {
    return 'native'
  }
  return 'external'
}

/**
 * 下载脚本内容（如果提供的是 URL）
 */
async function fetchScriptContent(urlOrContent: string): Promise<string> {
  if (urlOrContent.startsWith('http://') || urlOrContent.startsWith('https://')) {
    console.log('[ApiRunner] Downloading script from URL:', urlOrContent)
    try {
      const response = await axios.get(urlOrContent, {
        responseType: 'text',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      console.log('[ApiRunner] Script downloaded successfully, length:', response.data.length)
      return response.data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[ApiRunner] Failed to download script:', message)
      throw new Error(`无法下载脚本: ${message}`)
    }
  }
  return urlOrContent
}

/**
 * 注入源脚本
 */
export async function injectSourceScript(
  sourceId: string,
  sourceName: string,
  scriptContentOrUrl: string
): Promise<boolean> {
  const window = createGhostWindow()

  try {
    // 步骤1：如果是 URL，先下载脚本内容
    const scriptContent = await fetchScriptContent(scriptContentOrUrl)

    // 步骤2：检测脚本类型
    const scriptType = detectScriptType(scriptContent)
    console.log(`[ApiRunner] Script type detected: ${scriptType}`)

    // 步骤3：确保窗口已加载完成
    if (window.webContents.isLoading()) {
      await new Promise<void>((resolve) => {
        window.webContents.once('did-finish-load', () => resolve())
      })
    }

    // 步骤4：等待 preload 脚本初始化 (等待 window.lx 可用)
    console.log('[ApiRunner] Waiting for preload initialization...')
    const waitForPreload = `
      (async function() {
        let attempts = 0;
        const maxAttempts = 50;
        while (typeof window.lx === 'undefined' && attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
        console.log('[Wait] window.lx available:', typeof window.lx !== 'undefined', 'after', attempts, 'attempts');
        return {
          ready: typeof window.lx !== 'undefined',
          attempts: attempts
        };
      })();
    `
    const waitResult = await window.webContents.executeJavaScript(waitForPreload)
    console.log('[ApiRunner] Preload wait result:', waitResult)

    if (!waitResult.ready) {
      console.error('[ApiRunner] CRITICAL: window.lx is not available after waiting!')
      throw new Error('Preload script did not initialize lx object')
    }

    // 步骤5：将 window.lx 复制到 globalThis.lx（关键修复！）
    // 外部脚本使用 globalThis['lx'] 解构，必须确保 globalThis.lx 存在
    if (scriptType === 'external') {
      console.log(`[ApiRunner] Setting up environment for external script: ${sourceName}`)

      const setupCode = `
        (function() {
          console.log('[Setup] Copying window.lx to globalThis.lx');

          // 关键：将 window.lx 赋值给 globalThis.lx
          // 因为 contextBridge 只暴露到 window，但脚本访问 globalThis
          if (typeof globalThis.lx === 'undefined' && typeof window.lx !== 'undefined') {
            globalThis.lx = window.lx;
            console.log('[Setup] globalThis.lx set successfully');
          }

          // 设置脚本信息
          if (globalThis.lx) {
            globalThis.lx.currentScriptInfo = {
              version: '1',
              name: ${JSON.stringify(sourceName)},
              id: ${JSON.stringify(sourceId)}
            };

            // 添加 EVENT_NAMES 如果不存在
            if (!globalThis.lx.EVENT_NAMES) {
              globalThis.lx.EVENT_NAMES = {
                request: 'request',
                inited: 'inited',
                updateAlert: 'updateAlert'
              };
            }
          }

          // 验证
          console.log('[Setup] Verification:');
          console.log('  - globalThis.lx:', typeof globalThis.lx);
          console.log('  - globalThis.lx.request:', typeof globalThis.lx?.request);
          console.log('  - globalThis.lx.on:', typeof globalThis.lx?.on);
          console.log('  - globalThis.lx.send:', typeof globalThis.lx?.send);
          console.log('  - globalThis.lx.utils:', typeof globalThis.lx?.utils);
          console.log('  - globalThis.lx.utils.crypto:', typeof globalThis.lx?.utils?.crypto);
          console.log('  - globalThis.lx.utils.crypto.md5:', typeof globalThis.lx?.utils?.crypto?.md5);
          console.log('  - globalThis.lx.EVENT_NAMES:', globalThis.lx?.EVENT_NAMES);

          return {
            success: true,
            hasLx: typeof globalThis.lx !== 'undefined',
            hasRequest: typeof globalThis.lx?.request === 'function',
            hasUtils: typeof globalThis.lx?.utils !== 'undefined',
            hasCrypto: typeof globalThis.lx?.utils?.crypto !== 'undefined',
            hasMd5: typeof globalThis.lx?.utils?.crypto?.md5 === 'function'
          };
        })();
      `
      const setupResult = await window.webContents.executeJavaScript(setupCode)
      console.log('[ApiRunner] Environment setup result:', setupResult)

      if (!setupResult.hasLx || !setupResult.hasRequest) {
        console.error('[ApiRunner] CRITICAL: LX API not properly available!')
        throw new Error('LX API initialization failed')
      }

      if (!setupResult.hasMd5) {
        console.error('[ApiRunner] WARNING: utils.crypto.md5 is not available!')
      }
    }

    // 步骤6：注入主脚本
    console.log(`[ApiRunner] Injecting script: ${sourceName} (${scriptType}), length: ${scriptContent.length}`)

    if (scriptType === 'external') {
      const wrapped = `
        (function() {
          try {
            console.log('[Script] Starting execution of: ${sourceName}');
            console.log('[Script] globalThis.lx:', typeof globalThis.lx);
            console.log('[Script] globalThis.lx.request:', typeof globalThis.lx?.request);
            console.log('[Script] globalThis.lx.utils.crypto.md5:', typeof globalThis.lx?.utils?.crypto?.md5);

            // 执行脚本
            eval(${JSON.stringify(scriptContent)});

            console.log('[Script] Execution completed for: ${sourceName}');
            return { success: true };
          } catch (e) {
            console.error('[Script] Execution error:', e.name, e.message);
            console.error('[Script] Stack:', e.stack);
            return { success: false, error: e.message, name: e.name, stack: e.stack };
          }
        })();
      `
      const result = await window.webContents.executeJavaScript(wrapped)

      if (!result.success) {
        console.error(`[ApiRunner] Script execution failed: ${result.error}`)
        console.error(`[ApiRunner] Error name: ${result.name}`)
        console.error(`[ApiRunner] Stack: ${result.stack}`)
        return false
      }

      console.log(`[ApiRunner] External script executed successfully: ${sourceName}`)
    } else {
      await window.webContents.executeJavaScript(scriptContent)
      console.log(`[ApiRunner] Native script executed successfully: ${sourceName}`)
    }

    // 步骤7：记录已加载的源
    loadedSources.set(sourceId, {
      name: sourceName,
      initialized: true,
      type: scriptType,
      scriptContent
    })

    console.log(`[ApiRunner] Source loaded and registered: ${sourceName} (${sourceId})`)
    return true

  } catch (error) {
    console.error(`[ApiRunner] Failed to load source: ${sourceName}`, error)
    if (error instanceof Error) {
      console.error('[ApiRunner] Error details:', error.message, error.stack)
    }
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
    console.log(`[ApiRunner] Sending event '${eventName}' to script:`, data)
    window.webContents.send('script:triggerEvent', { eventName, data })
  } else {
    console.error('[ApiRunner] Cannot send event: Ghost window not available')
  }
}

/**
 * 调用外部脚本
 */
export async function callExternalSource(
  sourceType: string,
  action: string,
  info: Record<string, unknown>,
  quality: string = '128k'
): Promise<unknown> {
  const window = getGhostWindow()
  if (!window || window.isDestroyed()) {
    throw new Error('Ghost window not available')
  }

  const requestId = `${Date.now()}_${Math.random().toString(36).substring(7)}`

  console.log(`[ApiRunner] Calling external source: ${sourceType}, action: ${action}, requestId: ${requestId}`)

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      console.error(`[ApiRunner] Request ${requestId} timed out`)
      reject(new Error('Request timeout'))
    }, REQUEST_TIMEOUT)

    pendingRequests.set(requestId, { resolve: resolve as (v: unknown) => void, reject, timeout })

    sendScriptEvent('request', {
      requestId,
      source: sourceType,
      action,
      info: {
        ...info,
        type: quality
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

/**
 * 重新加载所有源
 */
export function reloadAllSources(): void {
  loadedSources.clear()
  console.log('[ApiRunner] All sources cleared, will reload on demand')
}

console.log('[ApiRunner] Service initialized (window will be created on demand)')

export const executeScript = executeInGhost
export const sendToRunner = sendScriptEvent
