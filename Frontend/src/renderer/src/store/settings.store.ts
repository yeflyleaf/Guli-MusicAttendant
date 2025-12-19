/**
 * 设置状态管理
 */
import type { PlayMode, Settings, Theme } from '@/types/settings'
import { defineStore } from 'pinia'

interface SettingsState extends Settings {
  isLoaded: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: 'dark',
    volume: 0.7,
    playMode: 'sequence',
    language: 'zh-CN',
    musicFolders: [],
    autoScan: true,
    showLyrics: true,
    visualizerEnabled: true,
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
        this.volume = settings.volume
        this.playMode = settings.playMode
        this.language = settings.language
        this.musicFolders = settings.musicFolders
        this.autoScan = settings.autoScan
        this.showLyrics = settings.showLyrics
        this.visualizerEnabled = settings.visualizerEnabled
        this.isLoaded = true
        
        // 应用主题
        this.applyTheme()
        
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
      this.theme = theme
      this.applyTheme()
      await window.electron.settings.set('theme', theme)
    },

    /**
     * 应用主题
     */
    applyTheme() {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(this.theme)
      
      // Element Plus 暗色模式
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark')
      }
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
