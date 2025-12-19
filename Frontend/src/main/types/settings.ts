/**
 * 设置相关类型定义
 */

// 播放模式
export type PlayMode = 'sequence' | 'loop' | 'single' | 'random'

// 主题
export type Theme = 'dark' | 'light'

// 设置键名
export type SettingKey = 
  | 'theme'
  | 'volume'
  | 'playMode'
  | 'language'
  | 'musicFolders'
  | 'autoScan'
  | 'showLyrics'
  | 'visualizerEnabled'

// 完整设置对象
export interface Settings {
  theme: Theme               // 主题：暗色/亮色
  volume: number             // 音量 0-1
  playMode: PlayMode         // 播放模式
  language: string           // 语言
  musicFolders: string[]     // 音乐文件夹列表
  autoScan: boolean          // 启动时自动扫描
  showLyrics: boolean        // 显示歌词
  visualizerEnabled: boolean // 启用可视化
}
