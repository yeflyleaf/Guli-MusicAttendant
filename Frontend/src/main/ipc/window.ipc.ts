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

  console.log('[IPC] Window control handler registered')
}
