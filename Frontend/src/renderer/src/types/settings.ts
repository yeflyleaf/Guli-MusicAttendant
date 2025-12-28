/**
 * 设置类型定义 (前端)
 */

// 播放模式
export type PlayMode = 'sequence' | 'loop' | 'single' | 'random'

// 主题
export type Theme = 'dark' | 'light' | 'interstellar' | 'gothic' | 'papercut' | 'quantum' | 'sugarland' | 'wasteland'

// 开屏动画主题
export type SplashTheme =
  | 'cosmic'
  | 'emerald'
  | 'molten'
  | 'abyss'
  | 'brass'
  | 'prism'
  | 'sanctum'
  | 'silicon'
  | 'ethereal'
  | 'cyber'
  | 'sakura'
  | 'chronos'

// 文件命名方式
export type FileNamingRule = 'name-artist' | 'artist-name' | 'name'

// 歌词编码格式
export type LyricsEncoding = 'utf-8' | 'gbk'

// 音乐来源定义
export interface MusicSource {
  id: string                   // 唯一标识符
  name: string                 // 源名称
  icon?: string                // 源图标（emoji或URL）
  version?: string             // 版本号
  enabled: boolean             // 是否启用
  initialized?: boolean        // 是否初始化成功
  allowUpdatePopup: boolean    // 允许显示更新弹窗
  scriptPath?: string          // 脚本文件路径
  scriptContent?: string       // 脚本内容（用于在线导入）
  sourceUrl?: string           // 来源URL（用于在线导入）
}

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
  // 下载设置
  | 'downloadEnabled'
  | 'downloadSkipExisting'
  | 'downloadPath'
  | 'downloadConcurrent'
  | 'downloadNamingRule'
  | 'downloadEmbedCover'
  | 'downloadEmbedLyrics'
  | 'downloadEmbedTranslation'
  | 'downloadEmbedRomaji'
  | 'downloadLyricsEnabled'
  | 'downloadLyricsTranslation'
  | 'downloadLyricsRomaji'
  | 'downloadLyricsEncoding'
  // 音乐来源
  | 'musicSources'

// 完整设置对象
export interface Settings {
  theme: Theme // 主题：暗色/亮色
  splashTheme: SplashTheme // 开屏动画主题
  volume: number // 音量 0-1
  playMode: PlayMode // 播放模式
  language: string // 语言
  fontSize: number // 文字大小
  localMusicHeaders: string[] // 本地音乐列表显示的表头
  visualizationStyle: string // 音频可视化样式
  visualizationFrameRate: number // 音频可视化帧率
  rememberPlaybackStatus: boolean // 重启后记住播放状态
  gaplessPlayback: boolean // 无缝播放
  musicFolders: string[] // 音乐文件夹列表
  autoScan: boolean // 启动时自动扫描
  visualizerEnabled: boolean // 启用可视化
  disableSplashScreen: boolean // 下次启动时关闭过场动画
  showTrayIcon: boolean // 在系统托盘显示应用图标
  minimizeToTray: boolean // 最小化到系统托盘
  closeToTray: boolean // 关闭到系统托盘
  quickSwitchThemes: [Theme, Theme] // 快捷切换的主题

  // 下载设置
  downloadEnabled: boolean // 是否启用下载功能
  downloadSkipExisting: boolean // 下载目录存在同名文件时跳过
  downloadPath: string // 下载路径
  downloadConcurrent: number // 同时下载任务数
  downloadNamingRule: FileNamingRule // 文件命名方式
  downloadEmbedCover: boolean // 嵌入封面
  downloadEmbedLyrics: boolean // 嵌入歌词
  downloadEmbedTranslation: boolean // 嵌入翻译歌词
  downloadEmbedRomaji: boolean // 嵌入罗马音歌词
  downloadLyricsEnabled: boolean // 歌词下载是否启用
  downloadLyricsTranslation: boolean // 同时将翻译歌词写入歌词文件
  downloadLyricsRomaji: boolean // 同时将罗马音歌词写入歌词文件
  downloadLyricsEncoding: LyricsEncoding // 歌词文件编码格式

  // 音乐来源
  musicSources: MusicSource[] // 音乐来源列表
}

