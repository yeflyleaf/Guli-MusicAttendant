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
  ipcMain.handle('settings:set', (_event, key: SettingKey, value: string) => {
    return settingRepo.setSetting(key, value)
  })

  // 批量设置
  ipcMain.handle('settings:setMultiple', (_event, settings: Partial<Settings>) => {
    return settingRepo.setSettings(settings)
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
