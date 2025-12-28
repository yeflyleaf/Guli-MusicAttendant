/**
 * API Runner 服务
 * 管理隐形窗口（Ghost Window）生命周期
 * 用于安全地执行第三方源脚本
 */
import { BrowserWindow } from 'electron';
import { join } from 'path';

// 隐形窗口实例
let ghostWindow: BrowserWindow | null = null

// 已加载的源脚本
const loadedSources: Map<string, { name: string; initialized: boolean }> = new Map()

/**
 * 创建隐形窗口
 * 这个窗口用于执行第三方源脚本，完全隔离于主界面
 */
export function createGhostWindow(): BrowserWindow {
  if (ghostWindow && !ghostWindow.isDestroyed()) {
    return ghostWindow
  }

  ghostWindow = new BrowserWindow({
    show: false,           // 隐形窗口
    width: 400,
    height: 300,
    webPreferences: {
      preload: join(__dirname, '../preload/api-runner.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false        // 需要禁用沙盒以使用 preload
    }
  })

  // 加载空白页面
  ghostWindow.loadURL('about:blank')

  // 窗口销毁时清理
  ghostWindow.on('closed', () => {
    ghostWindow = null
    loadedSources.clear()
  })

  console.log('[ApiRunner] Ghost window created')
  return ghostWindow
}

/**
 * 获取隐形窗口实例
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
 * 注入并执行源脚本
 * @param sourceId 源标识
 * @param sourceName 源名称
 * @param scriptContent 脚本内容
 */
export async function injectSourceScript(
  sourceId: string,
  sourceName: string,
  scriptContent: string
): Promise<boolean> {
  const window = createGhostWindow()

  try {
    // 注入脚本
    await window.webContents.executeJavaScript(scriptContent)

    loadedSources.set(sourceId, { name: sourceName, initialized: true })
    console.log(`[ApiRunner] Source script loaded: ${sourceName} (${sourceId})`)
    return true
  } catch (error) {
    console.error(`[ApiRunner] Failed to load source script: ${sourceName}`, error)
    return false
  }
}

/**
 * 在源脚本环境中执行代码
 * @param code 要执行的代码
 */
export async function executeInGhost(code: string): Promise<unknown> {
  const window = getGhostWindow()
  if (!window || window.isDestroyed()) {
    throw new Error('Ghost window not available')
  }

  return window.webContents.executeJavaScript(code)
}

/**
 * 获取已加载的源列表
 */
export function getLoadedSources(): Array<{ id: string; name: string }> {
  const result: Array<{ id: string; name: string }> = []
  loadedSources.forEach(({ name }, id) => {
    result.push({ id, name })
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
 * 移除已加载的源
 */
export function removeSource(sourceId: string): boolean {
  return loadedSources.delete(sourceId)
}

// 初始化时不创建窗口，按需创建
console.log('[ApiRunner] Service initialized (window will be created on demand)')
