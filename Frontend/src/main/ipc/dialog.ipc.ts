/**
 * 对话框相关 IPC 通信处理
 * 处理文件选择、消息提示等系统对话框
 */
import { dialog, ipcMain, shell } from 'electron'
import fs from 'fs'
import * as settingRepo from '../db/repositories/setting.repo'
import { scanDirectories, scanDirectory } from '../services/scanner.service'
import { getMainWindow } from '../services/window.service'

/**
 * 注册对话框相关的 IPC 处理器
 */
export function setupDialogIpc(): void {
  // 选择文件夹
  ipcMain.handle('dialog:selectFolder', async () => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return null

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '选择音乐文件夹'
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  // 选择多个文件夹
  ipcMain.handle('dialog:selectFolders', async () => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return []

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'multiSelections'],
      title: '选择音乐文件夹'
    })

    if (result.canceled) {
      return []
    }

    return result.filePaths
  })

  // 选择音频文件
  ipcMain.handle('dialog:selectAudioFiles', async () => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return []

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      title: '选择音频文件',
      filters: [
        { name: '音频文件', extensions: ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'wma'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })

    if (result.canceled) {
      return []
    }

    return result.filePaths
  })

  // 扫描文件夹
  ipcMain.handle('dialog:scanFolder', async (_event, folderPath?: string) => {
    let targetPath = folderPath

    // 如果没有指定路径，弹出选择对话框
    if (!targetPath) {
      const mainWindow = getMainWindow()
      if (!mainWindow) return null

      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: '选择要扫描的音乐文件夹'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return null
      }

      targetPath = result.filePaths[0]
    }

    // 执行扫描
    const scanResult = await scanDirectory(targetPath, (current, total, file) => {
      // 发送进度到渲染进程
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send('scan:progress', { current, total, file })
      }
    })

    return scanResult
  })

  // 扫描所有已添加的音乐文件夹
  ipcMain.handle('dialog:scanAllFolders', async () => {
    const folders = settingRepo.getMusicFolders()

    if (folders.length === 0) {
      return { total: 0, added: 0, skipped: 0, failed: 0, errors: ['未设置音乐文件夹'] }
    }

    const scanResult = await scanDirectories(folders, (current, total, file, dir) => {
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send('scan:progress', { current, total, file, dir })
      }
    })

    return scanResult
  })

  // 扫描所有已添加的音乐文件夹（增量扫描，只添加不删除）
  ipcMain.handle('dialog:resetAndScanAllFolders', async () => {
    const folders = settingRepo.getMusicFolders()

    if (folders.length === 0) {
      return { total: 0, added: 0, skipped: 0, failed: 0, errors: ['未设置音乐文件夹'] }
    }

    // 增量扫描：不删除现有记录，只添加新歌曲
    console.log('[IPC] Starting incremental scan (add only, no delete)')

    const scanResult = await scanDirectories(folders, (current, total, file, dir) => {
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send('scan:progress', { current, total, file, dir })
      }
    })

    return scanResult
  })

  // 在文件管理器中显示文件
  ipcMain.handle('dialog:showInFolder', (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  // 用默认程序打开文件
  ipcMain.handle('dialog:openFile', (_event, filePath: string) => {
    return shell.openPath(filePath)
  })

  // 显示消息框
  ipcMain.handle('dialog:showMessage', async (_event, options: {
    type?: 'none' | 'info' | 'error' | 'question' | 'warning'
    title?: string
    message: string
    detail?: string
    buttons?: string[]
  }) => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return -1

    const result = await dialog.showMessageBox(mainWindow, {
      type: options.type || 'info',
      title: options.title || '提示',
      message: options.message,
      detail: options.detail,
      buttons: options.buttons || ['确定']
    })

    return result.response
  })

  // 显示确认对话框
  ipcMain.handle('dialog:confirm', async (_event, message: string, title?: string) => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return false

    const result = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      title: title || '确认',
      message: message,
      buttons: ['确定', '取消'],
      defaultId: 0,
      cancelId: 1
    })

    return result.response === 0
  })

  // 读取文件内容
  ipcMain.handle('dialog:readFile', async (_event, filePath: string) => {
    try {
      return await fs.promises.readFile(filePath, 'utf-8')
    } catch (e) {
      console.error('Failed to read file:', filePath, e)
      return null
    }
  })

  // 验证歌曲路径是否在音乐文件夹中
  ipcMain.handle('dialog:validateMusicPath', (_event, filePath: string) => {
    const folders = settingRepo.getMusicFolders()

    if (folders.length === 0) {
      // 没有设置任何音乐文件夹，允许播放
      return { valid: true, inFolder: false }
    }

    // 标准化路径用于比较
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase()

    for (const folder of folders) {
      const normalizedFolder = folder.replace(/\\/g, '/').toLowerCase()
      if (normalizedPath.startsWith(normalizedFolder)) {
        return { valid: true, inFolder: true }
      }
    }

    // 检查文件是否实际存在于本地
    const fileExists = fs.existsSync(filePath)

    return {
      valid: false,
      inFolder: false,
      fileExists,
      musicFolders: folders
    }
  })

  console.log('[IPC] Dialog handler registered')
}
