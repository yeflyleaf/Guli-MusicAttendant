/**
 * 主进程入口文件
 * 初始化 Electron 应用
 */
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, globalShortcut } from 'electron'
import { closeDatabase, initDatabase } from './db'
import { getAllSettings } from './db/repositories/setting.repo'
import { setupAllIpc } from './ipc'
import { registerLocalAudioProtocol, setupProtocolHandlers } from './services/protocol.service'
import { scanAllFolders } from './services/scanner.service'
import { createMainWindow, getMainWindow } from './services/window.service'

// 禁用 Windows 7 的 GPU 加速（解决兼容性问题）
// app.disableHardwareAcceleration()

// 设置应用名称
app.setName('故里音乐助手')

// 生产模式下重定向 userData 到安装目录，避免写入 C 盘
if (app.isPackaged) {
  const path = require('path')
  const fs = require('fs')
  const exeDir = path.dirname(app.getPath('exe'))
  const userDataPath = path.join(exeDir, 'data', 'user_data')

  try {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }
    app.setPath('userData', userDataPath)
    console.log('[Main] User data path redirected to:', userDataPath)
  } catch (error) {
    console.error('[Main] Failed to redirect user data path:', error)
    // 如果无法创建目录（例如没有权限），则回退到默认路径（C盘），但这是最后的手段
  }
}

// 注册自定义协议 scheme（必须在 app.ready 之前调用）
registerLocalAudioProtocol()

// 单例模式：确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  // 其他实例尝试启动时，聚焦当前窗口
  app.on('second-instance', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })

  // 应用准备就绪
  app.whenReady().then(async () => {
    console.log('[Main] Starting application...')

    // 设置 Windows 应用用户模型 ID
    electronApp.setAppUserModelId('com.guli.music-attendant')

    // 注册自定义协议处理器（必须在 app.ready 之后调用）
    setupProtocolHandlers()

    // 开发模式下的窗口优化
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    try {
      // 初始化数据库（同步，better-sqlite3 是原生绑定）
      console.log('[Main] Initializing database...')
      initDatabase()

      // 注册 IPC 处理器
      console.log('[Main] Registering IPC handlers...')
      setupAllIpc()

      // 创建主窗口
      console.log('[Main] Creating main window...')
      createMainWindow()

      // 注册全局快捷键
      registerGlobalShortcuts()

      // 检查自动扫描设置
      const settings = getAllSettings()
      if (settings.autoScan && settings.musicFolders.length > 0) {
        console.log('[Main] Auto-scan enabled, starting scan...')
        // 异步执行扫描，不阻塞启动
        scanAllFolders().then(result => {
          console.log(`[Main] Auto-scan complete: Added ${result.added} songs`)
        }).catch(err => {
          console.error('[Main] Auto-scan failed:', err)
        })
      }

      console.log('[Main] Application started successfully')
    } catch (error) {
      console.error('[Main] Failed to start:', error)
    }
  })

  // macOS：点击 Dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })

  // 所有窗口关闭时退出（macOS 除外）
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  // 应用退出前清理
  app.on('before-quit', () => {
    console.log('[Main] Application exiting, cleaning up resources...')

    // 注销全局快捷键
    globalShortcut.unregisterAll()

    // 关闭数据库连接
    closeDatabase()
  })
}

/**
 * 注册全局媒体快捷键
 */
function registerGlobalShortcuts(): void {
  // 播放/暂停
  globalShortcut.register('MediaPlayPause', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('shortcut:playPause')
    }
  })

  // 下一曲
  globalShortcut.register('MediaNextTrack', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('shortcut:next')
    }
  })

  // 上一曲
  globalShortcut.register('MediaPreviousTrack', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('shortcut:previous')
    }
  })

  // 停止
  globalShortcut.register('MediaStop', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('shortcut:stop')
    }
  })

  console.log('[Main] Global media shortcuts registered')
}
