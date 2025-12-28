/**
 * IPC 通信入口
 * 聚合所有 IPC 处理器
 */
import { setupDialogIpc } from './dialog.ipc'
import { setupMusicIpc } from './music.ipc'
import { setupOnlineIpc } from './online.ipc'
import { setupPlaylistIpc } from './playlist.ipc'
import { setupSettingsIpc } from './settings.ipc'
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
  setupOnlineIpc()  // 在线音乐模块

  console.log('[IPC] All IPC handlers initialized')
}

export {
    setupDialogIpc, setupMusicIpc, setupOnlineIpc,
    setupPlaylistIpc, setupSettingsIpc, setupWindowIpc
}

