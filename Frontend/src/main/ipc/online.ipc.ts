/**
 * 在线音乐模块 IPC 处理器
 * 负责处理渲染进程发来的在线搜索、播放、下载请求
 */
import { ipcMain } from 'electron'
import * as onlineService from '../services/online.service'

/**
 * 注册在线音乐模块的 IPC 处理器
 */
export function setupOnlineIpc(): void {
  console.log('[IPC] Registering online handlers...')

  // 初始化在线服务监听器
  onlineService.initOnlineServiceListeners()

  // 搜索
  ipcMain.handle('online:search', async (_event, params) => {
    try {
      const result = await onlineService.search(params)
      return result
    } catch (error) {
      console.error('[IPC] online:search error:', error)
      throw error
    }
  })

  // 获取播放链接
  ipcMain.handle('online:getPlayUrl', async (_event, params) => {
    try {
      const url = await onlineService.getPlayUrl(params)
      return url
    } catch (error) {
      console.error('[IPC] online:getPlayUrl error:', error)
      throw error
    }
  })

  // 下载音乐
  ipcMain.handle('online:download', async (_event, params) => {
    try {
      const result = await onlineService.downloadMusic(params)
      return result
    } catch (error) {
      console.error('[IPC] online:download error:', error)
      throw error
    }
  })

  console.log('[IPC] Online handlers registered')
}
