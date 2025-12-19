/**
 * 歌单相关类型定义
 */

// 数据库中的歌单实体
export interface Playlist {
  id: number
  name: string
  description: string | null
  cover_path: string | null
  song_count: number
  created_at: string
  updated_at: string
}

// 创建歌单的 DTO
export interface PlaylistCreateDTO {
  name: string
  description?: string
  coverPath?: string
}

// 更新歌单的 DTO
export interface PlaylistUpdateDTO {
  name?: string
  description?: string
  coverPath?: string
}
