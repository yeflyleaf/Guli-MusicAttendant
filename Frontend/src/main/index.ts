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
import { createTray, destroyTray } from './services/tray.service'
import { createMainWindow, getMainWindow } from './services/window.service'

// 禁用 Windows 7 的 GPU 加速（解决兼容性问题）
// app.disableHardwareAcceleration()

// 强制设置应用名称为 GL_Music，这决定了 userData 的路径
// 结果路径: C:\Users\<用户名>\AppData\Roaming\GL_Music
app.setName('GL_Music')

// 注意：窗口显示的标题 "故里音乐助手" 已在 window.service.ts 中单独设置
// 所以这里设置英文名不会影响用户看到的窗口标题

// 生产模式下使用 C 盘默认的 userData 路径
// 路径通常为: C:\Users\<用户名>\AppData\Roaming\GL_Music
if (app.isPackaged) {
  console.log('[Main] User data path:', app.getPath('userData'))
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

      // 创建系统托盘
      console.log('[Main] Creating system tray...')
      createTray()

      // 注册全局快捷键
      registerGlobalShortcuts()

      // 检查自动扫描设置
      const settings = getAllSettings()
      if (settings.autoScan && settings.musicFolders.length > 0) {
        console.log('[Main] Auto-scan enabled, starting scan...')
        // 异步执行扫描，不阻塞启动
        scanAllFolders().then(result => {
          console.log(`[Main] Auto-scan complete: Added ${result.added} songs`)
          // 扫描完成后通知渲染进程刷新数据
          const mainWindow = getMainWindow()
          if (mainWindow) {
            mainWindow.webContents.send('scan:complete', result)
          }
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

    // 销毁系统托盘
    destroyTray()

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
