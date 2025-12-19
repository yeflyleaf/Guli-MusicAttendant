/**
 * 预加载脚本
 * 在渲染进程加载之前执行，作为主进程和渲染进程之间的安全桥梁
 */
import { contextBridge, ipcRenderer } from 'electron'
import type { Music, MusicQueryParams, ScanResult } from '../main/types/music'
import type { Playlist, PlaylistCreateDTO } from '../main/types/playlist'
import type { SettingKey, Settings } from '../main/types/settings'

// 定义暴露给渲染进程的 API
const electronAPI = {
  // ==================== 歌曲相关 ====================
  music: {
    getAll: (params?: MusicQueryParams): Promise<Music[]> =>
      ipcRenderer.invoke('music:getAll', params),

    getById: (id: number): Promise<Music | undefined> =>
      ipcRenderer.invoke('music:getById', id),

    getByPath: (filePath: string): Promise<Music | undefined> =>
      ipcRenderer.invoke('music:getByPath', filePath),

    delete: (id: number): Promise<boolean> =>
      ipcRenderer.invoke('music:delete', id),

    deleteBatch: (ids: number[]): Promise<number> =>
      ipcRenderer.invoke('music:deleteBatch', ids),

    toggleFavorite: (id: number): Promise<boolean> =>
      ipcRenderer.invoke('music:toggleFavorite', id),

    incrementPlayCount: (id: number): Promise<boolean> =>
      ipcRenderer.invoke('music:incrementPlayCount', id),

    getCount: (): Promise<number> =>
      ipcRenderer.invoke('music:getCount'),

    getFavorites: (): Promise<Music[]> =>
      ipcRenderer.invoke('music:getFavorites'),

    getRecentlyPlayed: (limit?: number): Promise<Music[]> =>
      ipcRenderer.invoke('music:getRecentlyPlayed', limit),

    getMostPlayed: (limit?: number): Promise<Music[]> =>
      ipcRenderer.invoke('music:getMostPlayed', limit),

    update: (id: number, data: Partial<{
      title: string
      artist: string
      album: string
      coverPath: string
      lyricsPath: string
    }>): Promise<boolean> =>
      ipcRenderer.invoke('music:update', id, data)
  },

  // ==================== 歌单相关 ====================
  playlist: {
    getAll: (): Promise<Playlist[]> =>
      ipcRenderer.invoke('playlist:getAll'),

    getById: (id: number): Promise<Playlist | undefined> =>
      ipcRenderer.invoke('playlist:getById', id),

    create: (data: PlaylistCreateDTO): Promise<number> =>
      ipcRenderer.invoke('playlist:create', data),

    update: (id: number, data: Partial<PlaylistCreateDTO>): Promise<boolean> =>
      ipcRenderer.invoke('playlist:update', id, data),

    delete: (id: number): Promise<boolean> =>
      ipcRenderer.invoke('playlist:delete', id),

    getMusic: (playlistId: number): Promise<Music[]> =>
      ipcRenderer.invoke('playlist:getMusic', playlistId),

    addMusic: (playlistId: number, musicId: number): Promise<boolean> =>
      ipcRenderer.invoke('playlist:addMusic', playlistId, musicId),

    addMusicBatch: (playlistId: number, musicIds: number[]): Promise<number> =>
      ipcRenderer.invoke('playlist:addMusicBatch', playlistId, musicIds),

    removeMusic: (playlistId: number, musicId: number): Promise<boolean> =>
      ipcRenderer.invoke('playlist:removeMusic', playlistId, musicId),

    clear: (playlistId: number): Promise<number> =>
      ipcRenderer.invoke('playlist:clear', playlistId),

    updateOrder: (playlistId: number, musicIds: number[]): Promise<boolean> =>
      ipcRenderer.invoke('playlist:updateOrder', playlistId, musicIds),

    hasMusic: (playlistId: number, musicId: number): Promise<boolean> =>
      ipcRenderer.invoke('playlist:hasMusic', playlistId, musicId)
  },

  // ==================== 对话框相关 ====================
  dialog: {
    selectFolder: (): Promise<string | null> =>
      ipcRenderer.invoke('dialog:selectFolder'),

    selectFolders: (): Promise<string[]> =>
      ipcRenderer.invoke('dialog:selectFolders'),

    selectAudioFiles: (): Promise<string[]> =>
      ipcRenderer.invoke('dialog:selectAudioFiles'),

    scanFolder: (folderPath?: string): Promise<ScanResult | null> =>
      ipcRenderer.invoke('dialog:scanFolder', folderPath),

    scanAllFolders: (): Promise<ScanResult> =>
      ipcRenderer.invoke('dialog:scanAllFolders'),

    resetAndScanAllFolders: (): Promise<ScanResult> =>
      ipcRenderer.invoke('dialog:resetAndScanAllFolders'),

    showInFolder: (filePath: string): void => {
      ipcRenderer.invoke('dialog:showInFolder', filePath)
    },

    openFile: (filePath: string): Promise<string> =>
      ipcRenderer.invoke('dialog:openFile', filePath),

    readFile: (filePath: string): Promise<string | null> =>
      ipcRenderer.invoke('dialog:readFile', filePath),

    showMessage: (options: {
      type?: 'none' | 'info' | 'error' | 'question' | 'warning'
      title?: string
      message: string
      detail?: string
      buttons?: string[]
    }): Promise<number> =>
      ipcRenderer.invoke('dialog:showMessage', options),

    confirm: (message: string, title?: string): Promise<boolean> =>
      ipcRenderer.invoke('dialog:confirm', message, title)
  },

  // ==================== 窗口控制 ====================
  window: {
    minimize: (): void => {
      ipcRenderer.send('window:minimize')
    },

    maximize: (): void => {
      ipcRenderer.send('window:maximize')
    },

    close: (): void => {
      ipcRenderer.send('window:close')
    },

    isMaximized: (): Promise<boolean> =>
      ipcRenderer.invoke('window:isMaximized'),

    setTitle: (title: string): void => {
      ipcRenderer.send('window:setTitle', title)
    }
  },

  // ==================== 设置相关 ====================
  settings: {
    getAll: (): Promise<Settings> =>
      ipcRenderer.invoke('settings:getAll'),

    get: (key: SettingKey): Promise<string | null> =>
      ipcRenderer.invoke('settings:get', key),

    set: (key: SettingKey, value: string): Promise<boolean> =>
      ipcRenderer.invoke('settings:set', key, value),

    setMultiple: (settings: Partial<Settings>): Promise<boolean> =>
      ipcRenderer.invoke('settings:setMultiple', settings),

    getMusicFolders: (): Promise<string[]> =>
      ipcRenderer.invoke('settings:getMusicFolders'),

    addMusicFolder: (folder: string): Promise<boolean> =>
      ipcRenderer.invoke('settings:addMusicFolder', folder),

    removeMusicFolder: (folder: string): Promise<boolean> =>
      ipcRenderer.invoke('settings:removeMusicFolder', folder),

    reset: (): Promise<boolean> =>
      ipcRenderer.invoke('settings:reset')
  },

  // ==================== 事件监听 ====================
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    // 白名单：只允许监听特定频道
    const validChannels = [
      'scan:progress',
      'shortcut:playPause',
      'shortcut:next',
      'shortcut:previous',
      'shortcut:stop'
    ]

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    }
  },

  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

// 使用 contextBridge 安全地暴露 API
contextBridge.exposeInMainWorld('electron', electronAPI)

// 导出类型供渲染进程使用
export type ElectronAPI = typeof electronAPI
