/**
 * 设置相关 IPC 通信处理
 */
import { ipcMain } from 'electron'
import * as musicRepo from '../db/repositories/music.repo'
import * as settingRepo from '../db/repositories/setting.repo'
import type { SettingKey, Settings } from '../types/settings'

/**
 * 注册设置相关的 IPC 处理器
 */
export function setupSettingsIpc(): void {
  // 获取所有设置
  ipcMain.handle('settings:getAll', () => {
    return settingRepo.getAllSettings()
  })

  // 获取单个设置项
  ipcMain.handle('settings:get', (_event, key: SettingKey) => {
    return settingRepo.getSetting(key)
  })

  // 设置单个配置项
  ipcMain.handle('settings:set', (_event, key: SettingKey, value: Settings[SettingKey]) => {
    // 将值转换为字符串存储
    let strValue: string
    if (typeof value === 'object') {
      strValue = JSON.stringify(value)
    } else if (typeof value === 'boolean') {
      strValue = value ? 'true' : 'false'
    } else {
      strValue = String(value)
    }
    return settingRepo.setSetting(key, strValue)
  })

  // 批量设置
  ipcMain.handle('settings:setMultiple', (_event, settings: Partial<Settings>) => {
    const result = settingRepo.setSettings(settings)

    // 如果托盘相关设置发生变化，更新托盘状态
    if ('showTrayIcon' in settings || 'minimizeToTray' in settings || 'closeToTray' in settings) {
      import('../services/tray.service').then(({ updateTrayFromSettings }) => {
        updateTrayFromSettings()
      })
    }

    return result
  })

  // 获取音乐文件夹列表
  ipcMain.handle('settings:getMusicFolders', () => {
    return settingRepo.getMusicFolders()
  })

  // 添加音乐文件夹
  ipcMain.handle('settings:addMusicFolder', (_event, folder: string) => {
    return settingRepo.addMusicFolder(folder)
  })

  // 移除音乐文件夹
  ipcMain.handle('settings:removeMusicFolder', (_event, folder: string) => {
    return settingRepo.removeMusicFolder(folder)
  })

  // 重置所有设置
  ipcMain.handle('settings:reset', () => {
    // 重置设置
    const success = settingRepo.resetSettings()

    // 同时清空音乐库，因为音乐文件夹设置已被重置
    if (success) {
      musicRepo.deleteAllMusic()
      console.log('[Settings] Settings reset and music library cleared')
    }

    return success
  })

  console.log('[IPC] Settings handler registered')
}
