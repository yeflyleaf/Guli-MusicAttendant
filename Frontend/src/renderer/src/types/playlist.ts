/**
 * 歌单类型定义 (前端)
 */

export interface Playlist {
  id: number
  name: string
  description: string | null
  cover_path: string | null
  song_count: number
  created_at: string
  updated_at: string
}

export interface PlaylistCreateDTO {
  name: string
  description?: string
  coverPath?: string
}
