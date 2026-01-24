import type { Music, MusicQueryParams } from './music'
import type { Playlist, PlaylistCreateDTO } from './playlist'
import type { SettingKey, Settings } from './settings'

export { }

declare global {
  interface Window {
    electron: {
      // 歌曲相关
      music: {
        getAll: (params?: MusicQueryParams) => Promise<Music[]>
        getById: (id: number) => Promise<Music | null>
        getByPath: (filePath: string) => Promise<Music | null>
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
        update: (id: number, data: Partial<Music>) => Promise<boolean>
        // 从本地音乐列表隐藏歌曲（不删除数据）
        hideFromLocal: (id: number) => Promise<boolean>
        hideFromLocalBatch: (ids: number[]) => Promise<number>
        unhideFromLocal: (id: number) => Promise<boolean>
        unhideAllFromLocal: () => Promise<number>
      }

      // 歌单相关
      playlist: {
        getAll: () => Promise<Playlist[]>
        getById: (id: number) => Promise<Playlist | null>
        create: (data: PlaylistCreateDTO) => Promise<number>
        update: (id: number, data: Partial<Playlist>) => Promise<boolean>
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
        scanFolder: (folderPath?: string) => Promise<{ added: number; updated: number; total: number } | null>
        scanAllFolders: () => Promise<{ added: number; updated: number; total: number } | null>
        resetAndScanAllFolders: () => Promise<{ added: number; updated: number; total: number } | null>
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
        validateMusicPath: (filePath: string) => Promise<{
          valid: boolean
          inFolder: boolean
          fileExists?: boolean
          musicFolders?: string[]
        }>
        checkFileExists: (filePath: string) => Promise<boolean>
        checkFilesExist: (filePaths: string[]) => Promise<Record<string, boolean>>
        // 选择脚本文件（音乐源导入）
        selectScriptFile: () => Promise<{
          filePath: string
          content?: string
          name?: string
          version?: string
          icon?: string
          error?: string
        } | null>
        // 下载URL内容
        fetchUrlContent: (url: string) => Promise<{
          content: string
          name?: string
          version?: string
          icon?: string
        } | null>
      }

      // 窗口控制
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        isMaximized: () => Promise<boolean>
        setTitle: (title: string) => void
        show: () => void
        switchToFullPlayer: () => void
        isMiniPlayer: () => Promise<boolean>
      }

      // 设置相关
      settings: {
        getAll: () => Promise<Settings>
        get: <K extends SettingKey>(key: K) => Promise<Settings[K] | null>
        set: <K extends SettingKey>(key: K, value: Settings[K]) => Promise<boolean>
        setMultiple: (settings: Partial<Settings>) => Promise<boolean>
        getMusicFolders: () => Promise<string[]>
        addMusicFolder: (folder: string) => Promise<boolean>
        removeMusicFolder: (folder: string) => Promise<boolean>
        reset: () => Promise<boolean>
      }

      // 在线音乐相关
      online: {
        search: (params: {
          keyword: string
          source: string
          page?: number
          pageSize?: number
        }) => Promise<{
          list: Array<{
            id: string
            name: string
            artist: string
            album?: string
            duration?: number
            cover?: string
            source: string
            quality?: string
            playUrl?: string
            size?: number
            extra?: Record<string, unknown>
          }>
          total: number
          source: string
          page?: number
          pageSize?: number
        }>
        getPlayUrl: (params: {
          id: string
          source: string
          quality?: string
          extra?: Record<string, unknown>
        }) => Promise<string>
        download: (params: {
          music: {
            id: string
            name: string
            artist: string
            album?: string
            duration?: number
            cover?: string
            source: string
            quality?: string
            playUrl?: string
            size?: number
          }
          targetDir?: string
        }) => Promise<{
          success: boolean
          localPath?: string
          error?: string
        }>
      }

      // 音乐源管理
      source: {
        getAll: () => Promise<Array<{
          id: string
          name: string
          version: string
          description?: string
          icon?: string
          author?: string
          enabled: boolean
          supports: {
            search?: boolean
            getPlayUrl?: boolean
            getLyrics?: boolean
          }
          importedAt: string
          updatedAt: string
        }>>
        getEnabled: () => Promise<Array<{
          id: string
          name: string
          version: string
          description?: string
          icon?: string
          author?: string
          enabled: boolean
          supports: {
            search?: boolean
            getPlayUrl?: boolean
            getLyrics?: boolean
          }
          importedAt: string
          updatedAt: string
        }>>
        import: (scriptContent: string) => Promise<{
          success: boolean
          error?: string
          source?: {
            id: string
            name: string
            version: string
          }
          isUpdate?: boolean
        }>
        delete: (sourceId: string) => Promise<boolean>
        toggle: (sourceId: string) => Promise<boolean>
        getLoaded: () => Promise<Array<{ id: string; name: string }>>
      }

      // 事件监听
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on: (channel: string, callback: (...args: any[]) => void) => void
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      off: (channel: string, callback: (...args: any[]) => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}
