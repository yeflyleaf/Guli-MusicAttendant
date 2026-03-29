/**
 * IPC 通信入口
 * 聚合所有 IPC 处理器
 */
import { setupDialogIpc } from './dialog.ipc'
import { setupMediaIpc } from './media.ipc'
import { setupMusicIpc } from './music.ipc'
import { setupPlaylistIpc } from './playlist.ipc'
import { setupSettingsIpc } from './settings.ipc'
import { setupTrayIpc } from './tray.ipc'
import { setupWindowIpc } from './window.ipc'

/**
 * 初始化所有 IPC 处理器
 */
export function setupAllIpc(): void {
  console.log('[IPC] Initializing IPC handlers...')

  setupMusicIpc()
  setupPlaylistIpc()
  setupDialogIpc()
  setupWindowIpc()
  setupSettingsIpc()
  setupMediaIpc()   // 媒体控件（封面等）
  setupTrayIpc()    // 系统托盘更新

  console.log('[IPC] All IPC handlers initialized')
}

export {
  setupDialogIpc, setupMediaIpc, setupMusicIpc,
  setupPlaylistIpc, setupSettingsIpc, setupTrayIpc, setupWindowIpc
}

