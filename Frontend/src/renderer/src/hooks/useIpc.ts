/**
 * IPC 通信 Hook
 * 封装与主进程的通信
 */
import { usePlayerStore } from '@/store/player.store'
import { onMounted, onUnmounted } from 'vue'

export function useIpc() {
  const playerStore = usePlayerStore()

  // 监听全局快捷键
  const setupShortcutListeners = () => {
    // 播放/暂停
    window.electron.on('shortcut:playPause', () => {
      playerStore.togglePlay()
    })

    // 下一曲
    window.electron.on('shortcut:next', () => {
      playerStore.next()
    })

    // 上一曲
    window.electron.on('shortcut:previous', () => {
      playerStore.previous()
    })

    // 停止
    window.electron.on('shortcut:stop', () => {
      playerStore.stop()
    })
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
    isMaximized
  }
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
