/**
 * 自定义音乐源类型定义
 * 定义源脚本必须实现的接口标准
 */

// ==================== 源脚本元信息 ====================

/**
 * 源脚本的元信息
 * 脚本必须通过 guli_api.send('source:register', info) 注册
 */
export interface SourceMeta {
  /** 源的唯一标识 */
  id: string
  /** 源的显示名称 */
  name: string
  /** 源的版本号 */
  version: string
  /** 源的描述 */
  description?: string
  /** 源的图标 URL 或 Base64 */
  icon?: string
  /** 源作者 */
  author?: string
  /** 支持的功能 */
  supports: {
    search?: boolean
    getPlayUrl?: boolean
    getLyrics?: boolean
    getAlbum?: boolean
    getArtist?: boolean
  }
}

// ==================== 搜索相关 ====================

/**
 * 搜索请求参数
 */
export interface SourceSearchRequest {
  /** 请求ID，用于匹配响应 */
  requestId: string
  /** 源ID */
  sourceId: string
  /** 搜索关键词 */
  keyword: string
  /** 页码 */
  page: number
  /** 每页数量 */
  pageSize: number
}

/**
 * 搜索结果中的音乐项
 */
export interface SourceMusicItem {
  /** 音乐ID（源内唯一） */
  id: string
  /** 歌曲名称 */
  name: string
  /** 艺术家 */
  artist: string
  /** 专辑名称 */
  album?: string
  /** 时长（秒） */
  duration?: number
  /** 封面图片 URL */
  cover?: string
  /** 音质信息 */
  quality?: string
  /** 文件大小（字节） */
  size?: number
  /** 额外数据（源脚本可自定义，用于后续获取播放链接） */
  extra?: Record<string, unknown>
}

/**
 * 搜索响应
 */
export interface SourceSearchResponse {
  /** 请求ID，与请求匹配 */
  requestId: string
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 搜索结果列表 */
  list?: SourceMusicItem[]
  /** 总结果数 */
  total?: number
}

// ==================== 播放链接相关 ====================

/**
 * 获取播放链接请求
 */
export interface SourcePlayUrlRequest {
  /** 请求ID */
  requestId: string
  /** 源ID */
  sourceId: string
  /** 音乐ID */
  musicId: string
  /** 音质偏好 */
  quality?: string
  /** 额外数据（来自搜索结果的 extra 字段） */
  extra?: Record<string, unknown>
}

/**
 * 播放链接响应
 */
export interface SourcePlayUrlResponse {
  /** 请求ID */
  requestId: string
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 播放链接 */
  url?: string
  /** 链接有效期（毫秒时间戳） */
  expiresAt?: number
  /** 请求头（某些源需要特定 Referer 等） */
  headers?: Record<string, string>
}

// ==================== 歌词相关 ====================

/**
 * 获取歌词请求
 */
export interface SourceLyricsRequest {
  requestId: string
  sourceId: string
  musicId: string
  extra?: Record<string, unknown>
}

/**
 * 歌词响应
 */
export interface SourceLyricsResponse {
  requestId: string
  success: boolean
  error?: string
  /** LRC 格式歌词 */
  lrc?: string
  /** 翻译歌词 */
  tlrc?: string
  /** 罗马音歌词 */
  rlrc?: string
}

// ==================== 存储的源信息 ====================

/**
 * 存储在数据库/配置中的源信息
 */
export interface StoredSource {
  /** 源ID */
  id: string
  /** 源名称 */
  name: string
  /** 源版本 */
  version: string
  /** 源描述 */
  description?: string
  /** 源图标 */
  icon?: string
  /** 源作者 */
  author?: string
  /** 脚本内容 */
  scriptContent: string
  /** 是否启用 */
  enabled: boolean
  /** 支持的功能 */
  supports: SourceMeta['supports']
  /** 导入时间 */
  importedAt: string
  /** 最后更新时间 */
  updatedAt: string
}
