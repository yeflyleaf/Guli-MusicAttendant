/**
 * 设置数据仓库
 */
import type { SettingKey, Settings } from '../../types/settings';
import { execute, queryAll, queryOne, transaction } from '../index';

/**
 * 获取所有设置
 */
export function getAllSettings(): Settings {
  const rows = queryAll<{ key: string; value: string }>('SELECT key, value FROM settings')

  const settings: Settings = {
    theme: 'dark',
    volume: 0.7,
    playMode: 'sequence',
    language: 'zh-CN',
    fontSize: 14,
    localMusicHeaders: ['title', 'artist', 'album', 'duration', 'created_at'],
    visualizationStyle: 'bars',
    visualizationFrameRate: 60,
    rememberPlaybackStatus: true,
    gaplessPlayback: false,
    musicFolders: [],
    autoScan: true,
    visualizerEnabled: true,
    disableSplashScreen: false
  }

  for (const row of rows) {
    switch (row.key) {
      case 'theme':
        settings.theme = row.value as 'dark' | 'light'
        break
      case 'volume':
        settings.volume = parseFloat(row.value)
        break
      case 'playMode':
        settings.playMode = row.value as 'sequence' | 'loop' | 'single' | 'random'
        break
      case 'language':
        settings.language = row.value
        break
      case 'fontSize':
        settings.fontSize = parseInt(row.value) || 14
        break
      case 'localMusicHeaders':
        try {
          settings.localMusicHeaders = JSON.parse(row.value)
        } catch {
          settings.localMusicHeaders = ['title', 'artist', 'album', 'duration', 'created_at']
        }
        break
      case 'visualizationStyle':
        settings.visualizationStyle = row.value
        break
      case 'visualizationFrameRate':
        settings.visualizationFrameRate = parseInt(row.value) || 60
        break
      case 'rememberPlaybackStatus':
        settings.rememberPlaybackStatus = row.value === 'true'
        break
      case 'gaplessPlayback':
        settings.gaplessPlayback = row.value === 'true'
        break
      case 'musicFolders':
        try {
          settings.musicFolders = JSON.parse(row.value)
        } catch {
          settings.musicFolders = []
        }
        break
      case 'autoScan':
        settings.autoScan = row.value === 'true'
        break
      case 'visualizerEnabled':
        settings.visualizerEnabled = row.value === 'true'
        break
      case 'disableSplashScreen':
        settings.disableSplashScreen = row.value === 'true'
        break
    }
  }

  return settings
}

/**
 * 获取单个设置项
 */
export function getSetting(key: SettingKey): string | null {
  const result = queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key])
  return result?.value ?? null
}

/**
 * 设置单个配置项
 */
export function setSetting(key: SettingKey, value: string): boolean {
  const result = execute(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, datetime('now', 'localtime'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = datetime('now', 'localtime')
  `, [key, value])
  return result.changes > 0
}

/**
 * 批量设置配置项
 */
export function setSettings(settings: Partial<Settings>): boolean {
  return transaction(() => {
    for (const [key, value] of Object.entries(settings)) {
      let strValue: string
      if (typeof value === 'object') {
        strValue = JSON.stringify(value)
      } else if (typeof value === 'boolean') {
        strValue = value ? 'true' : 'false'
      } else {
        strValue = String(value)
      }

      execute(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now', 'localtime'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now', 'localtime')
      `, [key, strValue])
    }
    return true
  })
}

/**
 * 获取音乐文件夹列表
 */
export function getMusicFolders(): string[] {
  const value = getSetting('musicFolders')
  if (!value) return []

  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

/**
 * 添加音乐文件夹
 */
export function addMusicFolder(folder: string): boolean {
  const folders = getMusicFolders()
  if (folders.includes(folder)) {
    return false
  }
  folders.push(folder)
  return setSetting('musicFolders', JSON.stringify(folders))
}

/**
 * 移除音乐文件夹
 */
export function removeMusicFolder(folder: string): boolean {
  const folders = getMusicFolders()
  const index = folders.indexOf(folder)
  if (index === -1) {
    return false
  }
  folders.splice(index, 1)
  return setSetting('musicFolders', JSON.stringify(folders))
}

/**
 * 重置所有设置为默认值
 */
export function resetSettings(): boolean {
  execute('DELETE FROM settings')

  const defaults = [
    ['theme', 'dark'],
    ['volume', '0.7'],
    ['playMode', 'sequence'],
    ['language', 'zh-CN'],
    ['fontSize', '14'],
    ['localMusicHeaders', '["title","artist","album","duration","created_at"]'],
    ['visualizationStyle', 'bars'],
    ['visualizationFrameRate', '60'],
    ['rememberPlaybackStatus', 'true'],
    ['gaplessPlayback', 'false'],
    ['musicFolders', '[]'],
    ['autoScan', 'true'],
    ['visualizerEnabled', 'true'],
    ['disableSplashScreen', 'false']
  ]

  return transaction(() => {
    for (const [key, value] of defaults) {
      execute('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value])
    }
    return true
  })
}
