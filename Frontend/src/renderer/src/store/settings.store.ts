/**
 * 设置状态管理
 */
import { setLocale, type LocaleCode } from '@/locales'
import type { FileNamingRule, LyricsEncoding, MusicSource, PlayMode, Settings, SplashTheme, Theme } from '@/types/settings'
import { defineStore } from 'pinia'

interface SettingsState extends Settings {
  isLoaded: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: 'dark',
    splashTheme: 'cosmic',
    volume: 0.6,
    playMode: 'sequence',
    language: 'zh-CN',
    fontSize: 14,
    localMusicHeaders: ['title', 'artist', 'album', 'duration', 'created_at'],
    visualizationStyle: 'bars',
    visualizationFrameRate: 60,
    rememberPlaybackStatus: true,
    gaplessPlayback: true,
    musicFolders: [],
    autoScan: true,
    visualizerEnabled: true,
    disableSplashScreen: false,
    showTrayIcon: true,
    minimizeToTray: false,
    closeToTray: false,
    quickSwitchThemes: ['dark', 'light'],
    // 下载设置
    downloadEnabled: true,
    downloadSkipExisting: true,
    downloadPath: '',
    downloadConcurrent: 3,
    downloadNamingRule: 'name-artist',
    downloadEmbedCover: true,
    downloadEmbedLyrics: true,
    downloadEmbedTranslation: true,
    downloadEmbedRomaji: false,
    downloadLyricsEnabled: true,
    downloadLyricsTranslation: true,
    downloadLyricsRomaji: false,
    downloadLyricsEncoding: 'utf-8',
    // 音乐来源
    musicSources: [],
    isLoaded: false
  }),

  actions: {
    /**
     * 加载设置
     */
    async loadSettings() {
      try {
        const settings = await window.electron.settings.getAll()

        this.theme = settings.theme as Theme
        this.splashTheme = (settings.splashTheme ?? 'cosmic') as SplashTheme
        this.volume = Number(settings.volume ?? 0.7)
        this.playMode = settings.playMode as PlayMode
        this.language = settings.language
        this.fontSize = Number(settings.fontSize ?? 14)
        this.localMusicHeaders = settings.localMusicHeaders ?? ['title', 'artist', 'album', 'duration', 'created_at']
        this.visualizationStyle = settings.visualizationStyle ?? 'bars'
        this.visualizationFrameRate = Number(settings.visualizationFrameRate ?? 60)
        this.rememberPlaybackStatus = Boolean(settings.rememberPlaybackStatus ?? true)
        this.gaplessPlayback = Boolean(settings.gaplessPlayback ?? false)
        this.musicFolders = settings.musicFolders ?? []
        this.autoScan = Boolean(settings.autoScan ?? true)
        this.visualizerEnabled = Boolean(settings.visualizerEnabled ?? true)
        this.disableSplashScreen = Boolean(settings.disableSplashScreen ?? false)
        this.showTrayIcon = Boolean(settings.showTrayIcon ?? true)
        this.minimizeToTray = Boolean(settings.minimizeToTray ?? false)
        this.closeToTray = Boolean(settings.closeToTray ?? false)
        this.quickSwitchThemes = (settings.quickSwitchThemes ?? ['dark', 'light']) as unknown as [Theme, Theme]

        // 下载设置
        this.downloadEnabled = Boolean(settings.downloadEnabled ?? true)
        this.downloadSkipExisting = Boolean(settings.downloadSkipExisting ?? true)
        this.downloadPath = (settings.downloadPath as string) ?? ''
        this.downloadConcurrent = Number(settings.downloadConcurrent ?? 3)
        this.downloadNamingRule = (settings.downloadNamingRule ?? 'name-artist') as FileNamingRule
        this.downloadEmbedCover = Boolean(settings.downloadEmbedCover ?? true)
        this.downloadEmbedLyrics = Boolean(settings.downloadEmbedLyrics ?? true)
        this.downloadEmbedTranslation = Boolean(settings.downloadEmbedTranslation ?? true)
        this.downloadEmbedRomaji = Boolean(settings.downloadEmbedRomaji ?? false)
        this.downloadLyricsEnabled = Boolean(settings.downloadLyricsEnabled ?? true)
        this.downloadLyricsTranslation = Boolean(settings.downloadLyricsTranslation ?? true)
        this.downloadLyricsRomaji = Boolean(settings.downloadLyricsRomaji ?? false)
        this.downloadLyricsEncoding = (settings.downloadLyricsEncoding ?? 'utf-8') as LyricsEncoding

        // 音乐来源
        this.musicSources = (settings.musicSources ?? []) as MusicSource[]

        this.isLoaded = true

        // 应用主题和外观
        this.applyTheme()
        this.applyAppearance()
        this.applyLanguage()

      } catch (error) {
        console.error('[Settings] 加载设置失败:', error)
      }
    },

    /**
     * 保存设置
     */
    async saveSettings(settings: Partial<Settings>) {
      try {
        // 将响应式对象转换为普通对象，避免 IPC 克隆错误
        const rawSettings = JSON.parse(JSON.stringify(settings))
        await window.electron.settings.setMultiple(rawSettings)

        // 更新本地状态
        Object.assign(this, settings)

        // 如果更改了主题，应用主题
        if (settings.theme) {
          this.applyTheme()
        }

        // 如果更改了外观设置，应用外观
        if (settings.fontSize) {
          this.applyAppearance()
        }

        return true
      } catch (error) {
        console.error('[Settings] 保存设置失败:', error)
        return false
      }
    },

    /**
     * 设置主题
     */
    async setTheme(theme: Theme) {
      console.log('[SettingsStore] setTheme called with:', theme)
      this.theme = theme
      this.applyTheme()
      await window.electron.settings.set('theme', theme)
      console.log('[SettingsStore] Theme saved, current theme:', this.theme)
    },

    /**
     * 设置快捷切换主题
     */
    async setQuickSwitchThemes(themes: [Theme, Theme]) {
      this.quickSwitchThemes = themes
      await window.electron.settings.setMultiple({ quickSwitchThemes: themes })
    },

    /**
     * 切换快捷主题
     */
    async toggleQuickSwitchTheme() {
      const [theme1, theme2] = this.quickSwitchThemes
      // 如果当前主题是 theme1，切换到 theme2
      // 如果当前主题是 theme2，切换到 theme1
      // 如果当前主题既不是 theme1 也不是 theme2，切换到 theme1
      const nextTheme = this.theme === theme1 ? theme2 : theme1
      await this.setTheme(nextTheme)
    },

    /**
     * 应用主题
     */
    applyTheme() {
      document.documentElement.classList.remove('light', 'dark', 'interstellar', 'gothic', 'papercut', 'quantum', 'sugarland', 'wasteland')
      document.documentElement.classList.add(this.theme)

      // Element Plus 暗色模式（interstellar、gothic、papercut、quantum 和 wasteland 使用暗色模式）
      // sugarland 使用浅色模式
      if (this.theme === 'dark' || this.theme === 'interstellar' || this.theme === 'gothic' || this.theme === 'papercut' || this.theme === 'quantum' || this.theme === 'wasteland') {
        document.documentElement.classList.add('dark')
      }
    },

    /**
     * 应用外观设置
     */
    applyAppearance() {
      document.documentElement.style.setProperty('--font-size-base', `${this.fontSize}px`)
    },

    /**
     * 应用语言设置
     */
    applyLanguage() {
      setLocale(this.language as LocaleCode)
    },

    /**
     * 设置语言
     */
    async setLanguage(language: string) {
      this.language = language
      this.applyLanguage()
      await window.electron.settings.set('language', language)
    },

    /**
     * 设置音量
     */
    async setVolume(volume: number) {
      this.volume = volume
      await window.electron.settings.setMultiple({ volume })
    },

    /**
     * 设置播放模式
     */
    async setPlayMode(mode: PlayMode) {
      this.playMode = mode
      await window.electron.settings.set('playMode', mode)
    },

    /**
     * 添加音乐文件夹
     */
    async addMusicFolder(folder: string) {
      try {
        await window.electron.settings.addMusicFolder(folder)
        this.musicFolders.push(folder)

        // 添加文件夹后，重新验证所有歌曲路径（之前无效的歌曲可能现在有效了）
        import('@/store/library.store').then(({ useLibraryStore }) => {
          const libraryStore = useLibraryStore()
          libraryStore.validateMusicPaths()
        })

        return true
      } catch (error) {
        console.error('[Settings] 添加音乐文件夹失败:', error)
        return false
      }
    },

    /**
     * 移除音乐文件夹
     */
    async removeMusicFolder(folder: string) {
      try {
        await window.electron.settings.removeMusicFolder(folder)
        this.musicFolders = this.musicFolders.filter(f => f !== folder)

        // 删除文件夹后，验证所有歌曲路径，标记无效歌曲
        import('@/store/library.store').then(({ useLibraryStore }) => {
          const libraryStore = useLibraryStore()
          libraryStore.validateMusicPaths()
        })

        return true
      } catch (error) {
        console.error('[Settings] 移除音乐文件夹失败:', error)
        return false
      }
    },

    /**
     * 重置设置
     */
    async resetSettings() {
      try {
        await window.electron.settings.reset()
        await this.loadSettings()
        return true
      } catch (error) {
        console.error('[Settings] 重置设置失败:', error)
        return false
      }
    },

    // ===================== 音乐来源管理 =====================

    /**
     * 添加音乐来源
     */
    async addMusicSource(source: MusicSource) {
      try {
        // 检查是否已存在相同ID的源
        const existingIndex = this.musicSources.findIndex(s => s.id === source.id)
        if (existingIndex >= 0) {
          // 更新已存在的源
          this.musicSources[existingIndex] = source
        } else {
          // 添加新源
          this.musicSources.push(source)
        }
        await this.saveSettings({ musicSources: this.musicSources })
        console.log('[Settings] 添加音乐来源:', source.name)
        return true
      } catch (error) {
        console.error('[Settings] 添加音乐来源失败:', error)
        return false
      }
    },

    /**
     * 删除音乐来源
     */
    async removeMusicSource(sourceId: string) {
      try {
        this.musicSources = this.musicSources.filter(s => s.id !== sourceId)
        await this.saveSettings({ musicSources: this.musicSources })
        console.log('[Settings] 删除音乐来源:', sourceId)
        return true
      } catch (error) {
        console.error('[Settings] 删除音乐来源失败:', error)
        return false
      }
    },

    /**
     * 更新音乐来源
     */
    async updateMusicSource(source: MusicSource) {
      try {
        const index = this.musicSources.findIndex(s => s.id === source.id)
        if (index >= 0) {
          this.musicSources[index] = source
          await this.saveSettings({ musicSources: this.musicSources })
          console.log('[Settings] 更新音乐来源:', source.name)
          return true
        }
        return false
      } catch (error) {
        console.error('[Settings] 更新音乐来源失败:', error)
        return false
      }
    },

    /**
     * 切换音乐来源启用状态
     */
    async toggleMusicSourceEnabled(sourceId: string, enabled: boolean) {
      try {
        const index = this.musicSources.findIndex(s => s.id === sourceId)
        if (index >= 0) {
          this.musicSources[index].enabled = enabled
          await this.saveSettings({ musicSources: this.musicSources })
          console.log('[Settings] 切换音乐来源状态:', sourceId, enabled)
          return true
        }
        return false
      } catch (error) {
        console.error('[Settings] 切换音乐来源状态失败:', error)
        return false
      }
    },

    /**
     * 更新音乐来源选项
     */
    async updateMusicSourceOption(sourceId: string, options: Partial<MusicSource>) {
      try {
        const index = this.musicSources.findIndex(s => s.id === sourceId)
        if (index >= 0) {
          Object.assign(this.musicSources[index], options)
          await this.saveSettings({ musicSources: this.musicSources })
          return true
        }
        return false
      } catch (error) {
        console.error('[Settings] 更新音乐来源选项失败:', error)
        return false
      }
    },

    /**
     * 从后端同步音乐源列表
     * 将后端返回的源信息转换为前端 MusicSource 格式
     */
    setMusicSourcesFromBackend(sources: Array<{
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
    }>) {
      this.musicSources = sources.map(s => ({
        id: s.id,
        name: s.name,
        version: s.version,
        icon: s.icon || '🎵',
        enabled: s.enabled,
        initialized: true,
        allowUpdatePopup: true
      }))
      console.log('[Settings] 从后端同步音乐源:', this.musicSources.length)
    }
  }
})
