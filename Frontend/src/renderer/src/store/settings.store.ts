/**
 * 设置状态管理
 */
import { setLocale, type LocaleCode } from '@/locales'
import type { PlayMode, Settings, Theme } from '@/types/settings'
import { defineStore } from 'pinia'

interface SettingsState extends Settings {
  isLoaded: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: 'dark',
    splashTheme: 'cosmic',
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
    disableSplashScreen: false,
    showTrayIcon: true,
    minimizeToTray: false,
    closeToTray: false,
    quickSwitchThemes: ['dark', 'light'],
    isLoaded: false
  }),

  actions: {
    /**
     * 加载设置
     */
    async loadSettings() {
      try {
        const settings = await window.electron.settings.getAll()

        this.theme = settings.theme
        this.splashTheme = settings.splashTheme ?? 'cosmic'
        this.volume = settings.volume
        this.playMode = settings.playMode
        this.language = settings.language
        this.fontSize = settings.fontSize ?? 14
        this.localMusicHeaders = settings.localMusicHeaders ?? ['title', 'artist', 'album', 'duration', 'created_at']
        this.visualizationStyle = settings.visualizationStyle ?? 'bars'
        this.visualizationFrameRate = settings.visualizationFrameRate ?? 60
        this.rememberPlaybackStatus = settings.rememberPlaybackStatus ?? true
        this.gaplessPlayback = settings.gaplessPlayback ?? false
        this.musicFolders = settings.musicFolders
        this.autoScan = settings.autoScan
        this.visualizerEnabled = settings.visualizerEnabled
        this.disableSplashScreen = settings.disableSplashScreen ?? false
        this.showTrayIcon = settings.showTrayIcon ?? true
        this.minimizeToTray = settings.minimizeToTray ?? false
        this.minimizeToTray = settings.minimizeToTray ?? false
        this.closeToTray = settings.closeToTray ?? false
        this.quickSwitchThemes = settings.quickSwitchThemes ?? ['dark', 'light']
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
        await window.electron.settings.setMultiple(settings)

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
      document.documentElement.classList.remove('light', 'dark', 'interstellar', 'gothic', 'papercut', 'quantum')
      document.documentElement.classList.add(this.theme)

      // Element Plus 暗色模式（interstellar、gothic、papercut 和 quantum 也使用暗色模式）
      if (this.theme === 'dark' || this.theme === 'interstellar' || this.theme === 'gothic' || this.theme === 'papercut' || this.theme === 'quantum') {
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
      await window.electron.settings.set('volume', String(volume))
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
    }
  }
})
