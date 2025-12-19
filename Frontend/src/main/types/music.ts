/**
 * 歌曲相关类型定义
 */

// 数据库中的歌曲实体
export interface Music {
  id: number
  title: string
  artist: string
  album: string
  duration: number          // 时长（秒）
  file_path: string         // 文件路径
  file_size: number         // 文件大小（字节）
  format: string | null     // 音频格式
  bitrate: number | null    // 比特率
  sample_rate: number | null // 采样率
  cover_path: string | null  // 封面图片路径
  lyrics_path: string | null // 歌词文件路径
  play_count: number        // 播放次数
  is_favorite: number       // 是否收藏 (0/1)
  last_played_at: string | null
  created_at: string
  updated_at: string
}

// 创建歌曲的 DTO
export interface MusicCreateDTO {
  title: string
  artist?: string
  album?: string
  duration?: number
  filePath: string
  fileSize?: number
  format?: string
  bitrate?: number
  sampleRate?: number
  coverPath?: string
  lyricsPath?: string
}

// 查询参数
export interface MusicQueryParams {
  keyword?: string          // 搜索关键词
  isFavorite?: boolean      // 是否只查收藏
  orderBy?: 'title' | 'artist' | 'album' | 'created_at' | 'play_count' | 'duration'
  order?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}

// 扫描结果
export interface ScanResult {
  total: number             // 扫描的文件总数
  added: number             // 新增的歌曲数
  skipped: number           // 跳过的（已存在）
  failed: number            // 失败的
  errors: string[]          // 错误信息列表
}

// 音频元数据（从 music-metadata 解析）
export interface AudioMetadata {
  title?: string
  artist?: string
  album?: string
  duration?: number
  bitrate?: number
  sampleRate?: number
  format?: string
  cover?: Buffer            // 封面图片数据
  lyrics?: string           // 内嵌歌词
}
