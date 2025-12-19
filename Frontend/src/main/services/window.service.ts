/**
 * 窗口管理服务
 * 负责创建和管理 Electron 窗口
 */
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

// 主窗口实例
let mainWindow: BrowserWindow | null = null

/**
 * 创建主窗口
 */
export function createMainWindow(): BrowserWindow {
  // 如果窗口已存在，直接返回
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus()
    return mainWindow
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,                    // 先隐藏，等准备好再显示
    frame: false,                   // 无边框窗口（自定义标题栏）
    titleBarStyle: 'hidden',        // macOS 上隐藏标题栏但保留红绿灯
    backgroundColor: '#1a1a2e',     // 背景色，避免白屏闪烁
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,       // 禁用 Node 集成（安全）
      contextIsolation: true,       // 启用上下文隔离（安全）
      sandbox: false,               // 需要禁用沙盒以使用 preload
      webSecurity: true
    }
  })

  // 窗口准备好后再显示，避免白屏
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 开发环境下加载 dev server
  // 生产环境下加载打包后的文件
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }

  // 开发模式下打开开发者工具
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'right' })
  }

  // 窗口关闭时清理引用
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

/**
 * 获取主窗口实例
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

/**
 * 窗口控制方法
 */
export function minimizeWindow(): void {
  mainWindow?.minimize()
}

export function maximizeWindow(): void {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
}

export function closeWindow(): void {
  mainWindow?.close()
}

export function isMaximized(): boolean {
  return mainWindow?.isMaximized() ?? false
}

/**
 * 设置窗口标题
 */
export function setTitle(title: string): void {
  mainWindow?.setTitle(title)
}

/**
 * 发送消息到渲染进程
 */
export function sendToRenderer(channel: string, ...args: unknown[]): void {
  mainWindow?.webContents.send(channel, ...args)
}
