/**
 * 音乐源类型定义（前端）
 */

/**
 * 存储的音乐源信息
 */
export interface MusicSource {
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
  /** 是否启用 */
  enabled: boolean
  /** 支持的功能 */
  supports: {
    search?: boolean
    getPlayUrl?: boolean
    getLyrics?: boolean
  }
  /** 导入时间 */
  importedAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean
  error?: string
  source?: {
    id: string
    name: string
    version: string
  }
  isUpdate?: boolean
}
