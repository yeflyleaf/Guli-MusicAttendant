/**
 * 窗口管理服务
 * 负责创建和管理 Electron 窗口
 */
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { getAllSettings } from '../db/repositories/setting.repo'
import { isForceQuit } from './tray.service'

// 主窗口实例
let mainWindow: BrowserWindow | null = null

// 窗口隐藏状态（用于内存优化）
let isWindowHidden = false

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
    width: 1100,
    height: 800,
    minWidth: 1100,
    minHeight: 800,
    title: '故里音乐助手',           // 窗口标题
    show: false,                    // 先隐藏，等准备好再显示
    frame: false,                   // 无边框窗口（自定义标题栏）
    titleBarStyle: 'hidden',        // macOS 上隐藏标题栏但保留红绿灯
    backgroundColor: '#1a1a2e',     // 背景色，避免白屏闪烁
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      nodeIntegration: false,       // 禁用 Node 集成（安全）
      contextIsolation: true,       // 启用上下文隔离（安全）
      sandbox: false,               // 需要禁用沙盒以使用 preload
      webSecurity: true
    }
  })

  // 注意：不再在 ready-to-show 时自动显示窗口
  // 改为由渲染进程在设置加载完成后通知主进程显示窗口
  // 这样可以确保用户看到的第一帧就是正确的过场动画

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

  // 拦截窗口关闭事件，实现"关闭到托盘"
  mainWindow.on('close', (event) => {
    // 如果不是强制退出，检查是否需要关闭到托盘
    if (!isForceQuit()) {
      const settings = getAllSettings()
      if (settings.showTrayIcon && settings.closeToTray) {
        event.preventDefault()
        mainWindow?.hide()
        // 通知渲染进程启用内存优化（窗口隐藏到托盘）
        notifyWindowHidden()
        return
      }
    }
  })

  // 监听窗口最小化事件 - 通知渲染进程启用内存优化
  mainWindow.on('minimize', () => {
    console.log('[Window] Window minimized')
    notifyWindowHidden()
  })

  // 监听窗口隐藏事件 - 通知渲染进程启用内存优化
  mainWindow.on('hide', () => {
    console.log('[Window] Window hidden (to tray)')
    notifyWindowHidden()
  })

  // 监听窗口恢复事件 - 通知渲染进程禁用内存优化
  mainWindow.on('restore', () => {
    console.log('[Window] Window restored')
    notifyWindowShown()
  })

  // 监听窗口显示事件 - 通知渲染进程禁用内存优化
  mainWindow.on('show', () => {
    console.log('[Window] Window shown')
    notifyWindowShown()
  })

  // 窗口关闭时清理引用
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

/**
 * 通知渲染进程窗口已隐藏（最小化或隐藏到托盘）
 * 渲染进程收到此通知后会启用内存优化
 */
function notifyWindowHidden(): void {
  if (isWindowHidden) return // 避免重复通知
  isWindowHidden = true
  mainWindow?.webContents.send('window:hidden')
  console.log('[Window] Notified renderer: window hidden (memory optimization enabled)')
}

/**
 * 通知渲染进程窗口已显示
 * 渲染进程收到此通知后会禁用内存优化
 */
function notifyWindowShown(): void {
  if (!isWindowHidden) return // 避免重复通知
  isWindowHidden = false
  mainWindow?.webContents.send('window:shown')
  console.log('[Window] Notified renderer: window shown (memory optimization disabled)')
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
  const settings = getAllSettings()
  // 如果设置了最小化到托盘，则隐藏窗口而非最小化
  if (settings.showTrayIcon && settings.minimizeToTray) {
    mainWindow?.hide()
  } else {
    mainWindow?.minimize()
  }
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

export function showWindow(): void {
  mainWindow?.show()
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

// 迷你播放器状态
let isMiniPlayerMode = false
let savedWindowBounds: Electron.Rectangle | null = null
let wasMaximized = false

// 迷你播放器尺寸
const MINI_PLAYER_WIDTH = 300
const MINI_PLAYER_HEIGHT = 360

/**
 * 切换到迷你播放器模式
 */
export function switchToMiniPlayer(): void {
  if (!mainWindow || isMiniPlayerMode) return

  // 保存当前窗口状态
  wasMaximized = mainWindow.isMaximized()
  if (wasMaximized) {
    mainWindow.unmaximize()
  }
  savedWindowBounds = mainWindow.getBounds()

  // 获取当前窗口中心位置
  const currentBounds = mainWindow.getBounds()
  const centerX = currentBounds.x + currentBounds.width / 2
  const centerY = currentBounds.y + currentBounds.height / 2

  // 计算迷你播放器的位置（以当前窗口中心为基准）
  const miniX = Math.round(centerX - MINI_PLAYER_WIDTH / 2)
  const miniY = Math.round(centerY - MINI_PLAYER_HEIGHT / 2)

  // 设置迷你播放器属性
  mainWindow.setMinimumSize(MINI_PLAYER_WIDTH, MINI_PLAYER_HEIGHT)
  mainWindow.setMaximumSize(MINI_PLAYER_WIDTH, MINI_PLAYER_HEIGHT)
  mainWindow.setSize(MINI_PLAYER_WIDTH, MINI_PLAYER_HEIGHT)
  mainWindow.setPosition(miniX, miniY)
  mainWindow.setResizable(false)
  mainWindow.setAlwaysOnTop(true)

  isMiniPlayerMode = true

  // 通知渲染进程切换到迷你播放器界面
  mainWindow.webContents.send('window:miniPlayerMode', true)
}

/**
 * 切换回完整播放器模式
 */
export function switchToFullPlayer(): void {
  if (!mainWindow || !isMiniPlayerMode) return

  // 移除迷你播放器限制
  mainWindow.setAlwaysOnTop(false)
  mainWindow.setResizable(true)
  mainWindow.setMinimumSize(900, 600)
  mainWindow.setMaximumSize(0, 0) // 0,0 表示无限制

  // 恢复窗口大小和位置
  if (savedWindowBounds) {
    mainWindow.setBounds(savedWindowBounds)
    if (wasMaximized) {
      mainWindow.maximize()
    }
  } else {
    mainWindow.setSize(1100, 800)
    mainWindow.center()
  }

  isMiniPlayerMode = false
  savedWindowBounds = null
  wasMaximized = false

  // 通知渲染进程切换回完整播放器界面
  mainWindow.webContents.send('window:miniPlayerMode', false)
}

/**
 * 获取是否为迷你播放器模式
 */
export function getIsMiniPlayer(): boolean {
  return isMiniPlayerMode
}
