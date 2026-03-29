/**
 * 系统托盘服务
 * 负责创建和管理系统托盘图标及菜单
 */
import { app, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import { getAllSettings } from '../db/repositories/setting.repo'
import { getMainWindow } from './window.service'

// 系统托盘实例
let tray: Tray | null = null

// 播放状态缓存
let isPlaying = false
let currentTitle = ''
let currentArtist = ''

/**
 * 创建系统托盘
 */
export function createTray(): Tray | null {
  const settings = getAllSettings()

  // 如果设置不显示托盘图标，则不创建
  if (!settings.showTrayIcon) {
    return null
  }

  // 如果托盘已存在，直接返回
  if (tray && !tray.isDestroyed()) {
    return tray
  }

  // 获取图标路径
  let iconPath: string
  if (app.isPackaged) {
    // 生产环境 - 图标在 resources 目录
    iconPath = join(process.resourcesPath, 'build/icons/icon.ico')
  } else {
    // 开发环境 - 使用 app.getAppPath() 获取项目根目录
    iconPath = join(app.getAppPath(), 'build/icons/icon.ico')
  }

  console.log('[Tray] Icon path:', iconPath)

  try {
    // 创建托盘图标
    const icon = nativeImage.createFromPath(iconPath)

    if (icon.isEmpty()) {
      console.warn('[Tray] Icon is empty, using default icon path')
      // 尝试备用路径
      const altPath = join(__dirname, '../../../build/icons/icon.ico')
      const altIcon = nativeImage.createFromPath(altPath)
      console.log('[Tray] Alternative icon path:', altPath, 'isEmpty:', altIcon.isEmpty())
      tray = new Tray(altIcon.isEmpty() ? nativeImage.createEmpty() : altIcon)
    } else {
      tray = new Tray(icon)
    }

    // 设置托盘提示文字
    tray.setToolTip('故里音乐助手')

    // 更新托盘菜单
    updateTrayMenu()

    // 双击托盘图标显示窗口
    tray.on('double-click', () => {
      showMainWindow()
    })

    console.log('[Tray] System tray created')
    return tray
  } catch (error) {
    console.error('[Tray] Failed to create system tray:', error)
    return null
  }
}

/**
 * 格式化字符串，超出长度则截断并添加省略号
 */
function truncate(str: string, maxLength: number): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

/**
 * 更新托盘菜单
 */
export function updateTrayMenu(): void {
  if (!tray || tray.isDestroyed()) return

  // 进一步缩短截断长度，并准备多行显示的文字
  const displayTitle = truncate(currentTitle || '', 20)
  const displayArtist = truncate(currentArtist || '', 15)

  // 构建菜单模板
  const menuTemplate: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = []

  // 如果正在播放，显示歌曲和歌手（分行显示）
  if (currentTitle) {
    menuTemplate.push(
      {
        label: `正在播放: ${displayTitle}`,
        enabled: false
      },
      {
        label: `(＠_＠) 歌手: ${displayArtist || '未知'}`,
        enabled: false
      },
      {
        type: 'separator'
      }
    )
  } else {
    menuTemplate.push(
      {
        label: '故里音乐助手',
        enabled: false
      },
      {
        type: 'separator'
      }
    )
  }

  // 添加常规控制项
  menuTemplate.push(
    {
      label: '显示主窗口',
      click: () => {
        showMainWindow()
      }
    },
    {
      type: 'separator'
    },
    {
      label: isPlaying ? '暂停' : '播放',
      click: () => {
        const mainWindow = getMainWindow()
        if (mainWindow) {
          mainWindow.webContents.send('shortcut:playPause')
        }
      }
    },
    {
      label: '上一曲',
      click: () => {
        const mainWindow = getMainWindow()
        if (mainWindow) {
          mainWindow.webContents.send('shortcut:previous')
        }
      }
    },
    {
      label: '下一曲',
      click: () => {
        const mainWindow = getMainWindow()
        if (mainWindow) {
          mainWindow.webContents.send('shortcut:next')
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      click: () => {
        // 强制退出应用（不触发 close-to-tray）
        forceQuitApp()
      }
    }
  )

  const contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setContextMenu(contextMenu)

  // 更新 ToolTip (也采用多行显示)
  if (currentTitle) {
    tray.setToolTip(`故里音乐助手\n曲名: ${displayTitle}\n歌手: ${displayArtist || '未知'}`)
  } else {
    tray.setToolTip('故里音乐助手')
  }
}

/**
 * 更新托盘状态
 */
export function updateTrayStatus(status: { isPlaying: boolean; title?: string; artist?: string }): void {
  isPlaying = status.isPlaying
  if (status.title !== undefined) currentTitle = status.title
  if (status.artist !== undefined) currentArtist = status.artist
  updateTrayMenu()
}

/**
 * 显示主窗口
 */
export function showMainWindow(): void {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.show()
    mainWindow.focus()
  }
}

/**
 * 销毁托盘
 */
export function destroyTray(): void {
  if (tray && !tray.isDestroyed()) {
    tray.destroy()
    tray = null
    console.log('[Tray] System tray destroyed')
  }
}

/**
 * 获取托盘实例
 */
export function getTray(): Tray | null {
  return tray
}

/**
 * 根据设置更新托盘状态
 */
export function updateTrayFromSettings(): void {
  const settings = getAllSettings()

  if (settings.showTrayIcon) {
    // 如果设置显示托盘且托盘不存在，创建托盘
    if (!tray || tray.isDestroyed()) {
      createTray()
    }
  } else {
    // 如果设置不显示托盘，销毁托盘
    destroyTray()
  }
}

// 标记是否是强制退出
let isForceQuitting = false

/**
 * 检查是否正在强制退出
 */
export function isForceQuit(): boolean {
  return isForceQuitting
}

/**
 * 强制退出应用
 */
export function forceQuitApp(): void {
  isForceQuitting = true
  app.quit()
}

/**
 * 重置强制退出标记
 */
export function resetForceQuit(): void {
  isForceQuitting = false
}
