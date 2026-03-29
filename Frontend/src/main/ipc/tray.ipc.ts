/**
 * 系统托盘相关 IPC 通信处理
 */
import { ipcMain } from 'electron'
import * as trayService from '../services/tray.service'

/**
 * 注册系统托盘的 IPC 处理器
 */
export function setupTrayIpc(): void {
  // 更新托盘状态（播放/暂停、曲目信息）
  ipcMain.on('tray:updateStatus', (_event, status: { isPlaying: boolean; title?: string; artist?: string }) => {
    trayService.updateTrayStatus(status)
  })

  console.log('[IPC] Tray handler registered')
}
