/**
 * 设置相关类型定义
 */

// 播放模式
export type PlayMode = 'sequence' | 'loop' | 'single' | 'random'

// 主题
export type Theme = 'dark' | 'light' | 'interstellar' | 'gothic' | 'papercut' | 'quantum'

// 开屏动画主题
export type SplashTheme = 'cosmic' | 'emerald' | 'molten' | 'abyss' | 'brass' | 'prism' | 'sanctum' | 'silicon' | 'ethereal' | 'cyber' | 'sakura' | 'chronos'

// 设置键名
export type SettingKey =
  | 'theme'
  | 'splashTheme'
  | 'volume'
  | 'playMode'
  | 'language'
  | 'fontSize'
  | 'localMusicHeaders'
  | 'visualizationStyle'
  | 'visualizationFrameRate'
  | 'rememberPlaybackStatus'
  | 'gaplessPlayback'
  | 'musicFolders'
  | 'autoScan'
  | 'visualizerEnabled'
  | 'disableSplashScreen'
  | 'showTrayIcon'
  | 'minimizeToTray'
  | 'closeToTray'
  | 'quickSwitchThemes'

// 完整设置对象
export interface Settings {
  theme: Theme               // 主题：暗色/亮色
  splashTheme: SplashTheme   // 开屏动画主题
  volume: number             // 音量 0-1
  playMode: PlayMode         // 播放模式
  language: string           // 语言
  fontSize: number           // 文字大小
  localMusicHeaders: string[] // 本地音乐列表显示的表头
  visualizationStyle: string // 音频可视化样式
  visualizationFrameRate: number // 音频可视化帧率
  rememberPlaybackStatus: boolean // 重启后记住播放状态
  gaplessPlayback: boolean   // 无缝播放
  musicFolders: string[]     // 音乐文件夹列表
  autoScan: boolean          // 启动时自动扫描
  visualizerEnabled: boolean // 启用可视化
  disableSplashScreen: boolean // 下次启动时关闭过场动画
  showTrayIcon: boolean      // 在系统托盘显示应用图标
  minimizeToTray: boolean    // 最小化到系统托盘
  closeToTray: boolean       // 关闭到系统托盘
  quickSwitchThemes: [Theme, Theme] // 快捷切换的主题
}
