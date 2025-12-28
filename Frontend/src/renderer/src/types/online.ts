/**
 * 在线音乐模块类型定义
 * 注意：与本地 Music 类型完全分离，避免数据混淆
 */

/**
 * 在线音乐数据结构
 */
export interface OnlineMusic {
  /** 在线资源唯一标识（由源提供） */
  id: string
  /** 歌曲名称 */
  name: string
  /** 艺术家 */
  artist: string
  /** 专辑名 */
  album?: string
  /** 时长（秒） */
  duration?: number
  /** 封面 URL */
  cover?: string
  /** 来源标识（如 'kw', 'kg', 'wy'） */
  source: string
  /** 音质（如 '128k', '320k', 'flac'） */
  quality?: string
  /** 播放链接（临时，可能会过期） */
  playUrl?: string
  /** 文件大小（字节） */
  size?: number
  /** 额外数据（源脚本可自定义，用于后续获取播放链接等） */
  extra?: Record<string, unknown>
}

/**
 * 在线搜索结果
 */
export interface OnlineSearchResult {
  /** 音乐列表 */
  list: OnlineMusic[]
  /** 总数量 */
  total: number
  /** 来源标识 */
  source: string
  /** 当前页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 音乐源定义
 */
export interface OnlineSource {
  /** 源标识 */
  id: string
  /** 源名称（显示用） */
  name: string
  /** 源图标 */
  icon?: string
  /** 是否启用 */
  enabled: boolean
  /** 是否为用户自定义源 */
  isCustom?: boolean
  /** 脚本文件路径（如果是用户导入的） */
  scriptPath?: string
}

/**
 * 搜索参数
 */
export interface OnlineSearchParams {
  /** 搜索关键词 */
  keyword: string
  /** 源标识 */
  source: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 获取播放链接参数
 */
export interface GetPlayUrlParams {
  /** 音乐ID */
  id: string
  /** 源标识 */
  source: string
  /** 期望的音质 */
  quality?: string
}

/**
 * 下载参数
 */
export interface DownloadParams {
  /** 在线音乐对象 */
  music: OnlineMusic
  /** 下载目录 */
  targetDir?: string
}

/**
 * 下载状态
 */
export interface DownloadProgress {
  /** 音乐ID */
  id: string
  /** 下载进度 (0-100) */
  progress: number
  /** 下载状态 */
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  /** 错误信息 */
  error?: string
  /** 下载后的本地路径 */
  localPath?: string
}
