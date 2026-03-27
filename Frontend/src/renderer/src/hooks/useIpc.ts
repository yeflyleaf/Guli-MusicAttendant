/**
 * IPC 通信 Hook
 * 封装与主进程的通信
 */
import { onMounted, onUnmounted } from 'vue'

export function useIpc() {

  // 监听全局快捷键（现在已委托给 MediaSession 处理蓝牙信号）
  const setupShortcutListeners = () => {
    // 可以在这里添加常规非媒体键的自定义逻辑
  }

  // 清理监听器
  const cleanupListeners = () => {
    window.electron.removeAllListeners('shortcut:playPause')
    window.electron.removeAllListeners('shortcut:next')
    window.electron.removeAllListeners('shortcut:previous')
    window.electron.removeAllListeners('shortcut:stop')
  }

  // 选择文件夹
  const selectFolder = async (): Promise<string | null> => {
    return window.electron.dialog.selectFolder()
  }

  // 选择多个文件夹
  const selectFolders = async (): Promise<string[]> => {
    return window.electron.dialog.selectFolders()
  }

  // 扫描文件夹
  const scanFolder = async (folderPath?: string) => {
    return window.electron.dialog.scanFolder(folderPath)
  }

  // 扫描所有已添加的文件夹
  const scanAllFolders = async () => {
    return window.electron.dialog.scanAllFolders()
  }

  // 重置并扫描所有已添加的文件夹
  const resetAndScanAllFolders = async () => {
    return window.electron.dialog.resetAndScanAllFolders()
  }

  // 在文件管理器中显示
  const showInFolder = (filePath: string) => {
    window.electron.dialog.showInFolder(filePath)
  }

  // 显示消息
  const showMessage = async (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    return window.electron.dialog.showMessage({
      type,
      message
    })
  }

  // 确认对话框
  const confirm = async (message: string, title?: string): Promise<boolean> => {
    return window.electron.dialog.confirm(message, title)
  }

  // 窗口控制
  const minimizeWindow = () => window.electron.window.minimize()
  const maximizeWindow = () => window.electron.window.maximize()
  const closeWindow = () => window.electron.window.close()
  const isMaximized = () => window.electron.window.isMaximized()
  const switchToMiniPlayer = () => window.electron.window.switchToMiniPlayer()
  const switchToFullPlayer = () => window.electron.window.switchToFullPlayer()
  const isMiniPlayer = () => window.electron.window.isMiniPlayer()

  // 添加音乐文件夹
  const addMusicFolder = async (folder: string) => {
    return window.electron.settings.addMusicFolder(folder)
  }

  return {
    setupShortcutListeners,
    cleanupListeners,
    selectFolder,
    selectFolders,
    scanFolder,
    scanAllFolders,
    resetAndScanAllFolders,
    addMusicFolder,
    showInFolder,
    showMessage,
    confirm,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    isMaximized,
    switchToMiniPlayer,
    switchToFullPlayer,
    isMiniPlayer
  } as const
}

/**
 * 自动设置和清理快捷键监听器的 Hook
 */
export function useShortcuts() {
  const { setupShortcutListeners, cleanupListeners } = useIpc()

  onMounted(() => {
    setupShortcutListeners()
  })

  onUnmounted(() => {
    cleanupListeners()
  })
}
