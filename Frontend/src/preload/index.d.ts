/**
 * 预加载脚本类型声明
 * 为 window.electron 提供 TypeScript 类型支持
 */
import type { Music, MusicQueryParams, ScanResult } from '../main/types/music'
import type { Playlist, PlaylistCreateDTO } from '../main/types/playlist'
import type { SettingKey, Settings } from '../main/types/settings'

export interface ElectronAPI {
  // 歌曲相关
  music: {
    getAll: (params?: MusicQueryParams) => Promise<Music[]>
    getById: (id: number) => Promise<Music | undefined>
    getByPath: (filePath: string) => Promise<Music | undefined>
    delete: (id: number) => Promise<boolean>
    deleteBatch: (ids: number[]) => Promise<number>
    toggleFavorite: (id: number) => Promise<boolean>
    incrementPlayCount: (id: number) => Promise<boolean>
    getCount: () => Promise<number>
    getFavorites: () => Promise<Music[]>
    getRecentlyPlayed: (limit?: number) => Promise<Music[]>
    removeRecentlyPlayed: (ids: number[]) => Promise<boolean>
    clearRecentlyPlayed: () => Promise<boolean>
    getMostPlayed: (limit?: number) => Promise<Music[]>
    update: (id: number, data: Partial<{
      title: string
      artist: string
      album: string
      coverPath: string
      lyricsPath: string
    }>) => Promise<boolean>
  }

  // 歌单相关
  playlist: {
    getAll: () => Promise<Playlist[]>
    getById: (id: number) => Promise<Playlist | undefined>
    create: (data: PlaylistCreateDTO) => Promise<number>
    update: (id: number, data: Partial<PlaylistCreateDTO>) => Promise<boolean>
    delete: (id: number) => Promise<boolean>
    getMusic: (playlistId: number) => Promise<Music[]>
    addMusic: (playlistId: number, musicId: number) => Promise<boolean>
    addMusicBatch: (playlistId: number, musicIds: number[]) => Promise<number>
    removeMusic: (playlistId: number, musicId: number) => Promise<boolean>
    clear: (playlistId: number) => Promise<number>
    updateOrder: (playlistId: number, musicIds: number[]) => Promise<boolean>
    hasMusic: (playlistId: number, musicId: number) => Promise<boolean>
  }

  // 对话框相关
  dialog: {
    selectFolder: () => Promise<string | null>
    selectFolders: () => Promise<string[]>
    selectAudioFiles: () => Promise<string[]>
    scanFolder: (folderPath?: string) => Promise<ScanResult | null>
    scanAllFolders: () => Promise<ScanResult>
    resetAndScanAllFolders: () => Promise<ScanResult>
    showInFolder: (filePath: string) => void
    openFile: (filePath: string) => Promise<string>
    readFile: (filePath: string) => Promise<string | null>
    showMessage: (options: {
      type?: 'none' | 'info' | 'error' | 'question' | 'warning'
      title?: string
      message: string
      detail?: string
      buttons?: string[]
    }) => Promise<number>
    confirm: (message: string, title?: string) => Promise<boolean>
  }

  // 窗口控制
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    show: () => void
    isMaximized: () => Promise<boolean>
    setTitle: (title: string) => void
  }

  // 设置相关
  settings: {
    getAll: () => Promise<Settings>
    get: (key: SettingKey) => Promise<string | null>
    set: (key: SettingKey, value: string) => Promise<boolean>
    setMultiple: (settings: Partial<Settings>) => Promise<boolean>
    getMusicFolders: () => Promise<string[]>
    addMusicFolder: (folder: string) => Promise<boolean>
    removeMusicFolder: (folder: string) => Promise<boolean>
    reset: () => Promise<boolean>
  }

  // 事件监听
  on: (channel: string, callback: (...args: unknown[]) => void) => void
  off: (channel: string, callback: (...args: unknown[]) => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export { }

