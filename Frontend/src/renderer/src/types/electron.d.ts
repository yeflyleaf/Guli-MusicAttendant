export { }

declare global {
  interface Window {
    electron: {
      // 歌曲相关
      music: {
        getAll: (params?: any) => Promise<any[]>
        getById: (id: number) => Promise<any>
        getByPath: (filePath: string) => Promise<any>
        delete: (id: number) => Promise<boolean>
        deleteBatch: (ids: number[]) => Promise<number>
        toggleFavorite: (id: number) => Promise<boolean>
        incrementPlayCount: (id: number) => Promise<boolean>
        getCount: () => Promise<number>
        getFavorites: () => Promise<any[]>
        getRecentlyPlayed: (limit?: number) => Promise<any[]>
        removeRecentlyPlayed: (ids: number[]) => Promise<boolean>
        clearRecentlyPlayed: () => Promise<boolean>
        getMostPlayed: (limit?: number) => Promise<any[]>
        update: (id: number, data: any) => Promise<boolean>
        // 从本地音乐列表隐藏歌曲（不删除数据）
        hideFromLocal: (id: number) => Promise<boolean>
        hideFromLocalBatch: (ids: number[]) => Promise<number>
        unhideFromLocal: (id: number) => Promise<boolean>
        unhideAllFromLocal: () => Promise<number>
      }

      // 歌单相关
      playlist: {
        getAll: () => Promise<any[]>
        getById: (id: number) => Promise<any>
        create: (data: any) => Promise<number>
        update: (id: number, data: any) => Promise<boolean>
        delete: (id: number) => Promise<boolean>
        getMusic: (playlistId: number) => Promise<any[]>
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
        scanFolder: (folderPath?: string) => Promise<any>
        scanAllFolders: () => Promise<any>
        resetAndScanAllFolders: () => Promise<any>
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
      }

      // 窗口控制
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        isMaximized: () => Promise<boolean>
        setTitle: (title: string) => void
      }

      // 设置相关
      settings: {
        getAll: () => Promise<any>
        get: (key: string) => Promise<string | null>
        set: (key: string, value: string) => Promise<boolean>
        setMultiple: (settings: any) => Promise<boolean>
        getMusicFolders: () => Promise<string[]>
        addMusicFolder: (folder: string) => Promise<boolean>
        removeMusicFolder: (folder: string) => Promise<boolean>
        reset: () => Promise<boolean>
      }

      // 事件监听
      on: (channel: string, callback: (...args: any[]) => void) => void
      off: (channel: string, callback: (...args: any[]) => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}
