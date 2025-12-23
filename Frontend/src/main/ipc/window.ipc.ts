/**
 * 窗口控制相关 IPC 通信处理
 */
import { ipcMain } from 'electron'
import * as windowService from '../services/window.service'

/**
 * 注册窗口控制的 IPC 处理器
 */
export function setupWindowIpc(): void {
  // 最小化窗口
  ipcMain.on('window:minimize', () => {
    windowService.minimizeWindow()
  })

  // 最大化/还原窗口
  ipcMain.on('window:maximize', () => {
    windowService.maximizeWindow()
  })

  // 关闭窗口
  ipcMain.on('window:close', () => {
    windowService.closeWindow()
  })

  // 显示窗口（由渲染进程在设置加载完成后调用）
  ipcMain.on('window:show', () => {
    windowService.showWindow()
  })

  // 检查是否最大化
  ipcMain.handle('window:isMaximized', () => {
    return windowService.isMaximized()
  })

  // 设置窗口标题
  ipcMain.on('window:setTitle', (_event, title: string) => {
    windowService.setTitle(title)
  })

  // 切换到迷你播放器
  ipcMain.on('window:switchToMiniPlayer', () => {
    windowService.switchToMiniPlayer()
  })

  // 切换回完整播放器
  ipcMain.on('window:switchToFullPlayer', () => {
    windowService.switchToFullPlayer()
  })

  // 检查是否为迷你播放器模式
  ipcMain.handle('window:isMiniPlayer', () => {
    return windowService.getIsMiniPlayer()
  })

  console.log('[IPC] Window control handler registered')
}

