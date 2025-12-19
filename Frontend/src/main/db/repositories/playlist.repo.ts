/**
 * 歌单数据仓库
 */
import type { Music } from '../../types/music'
import type { Playlist, PlaylistCreateDTO } from '../../types/playlist'
import { execute, queryAll, queryOne, transaction } from '../index'

/**
 * 获取所有歌单
 */
export function getAllPlaylists(): Playlist[] {
  return queryAll<Playlist>(`
    SELECT p.*, 
           (SELECT COUNT(*) FROM playlist_music pm WHERE pm.playlist_id = p.id) as song_count
    FROM playlist p 
    ORDER BY p.created_at DESC
  `)
}

/**
 * 根据ID获取歌单
 */
export function getPlaylistById(id: number): Playlist | undefined {
  return queryOne<Playlist>(`
    SELECT p.*, 
           (SELECT COUNT(*) FROM playlist_music pm WHERE pm.playlist_id = p.id) as song_count
    FROM playlist p 
    WHERE p.id = ?
  `, [id])
}

/**
 * 创建歌单
 */
export function createPlaylist(data: PlaylistCreateDTO): number {
  const result = execute(`
    INSERT INTO playlist (name, description, cover_path) 
    VALUES (?, ?, ?)
  `, [data.name, data.description || null, data.coverPath || null])
  return result.lastInsertRowid
}

/**
 * 更新歌单
 */
export function updatePlaylist(id: number, data: Partial<PlaylistCreateDTO>): boolean {
  const fields: string[] = []
  const values: unknown[] = []
  
  if (data.name !== undefined) {
    fields.push('name = ?')
    values.push(data.name)
  }
  if (data.description !== undefined) {
    fields.push('description = ?')
    values.push(data.description)
  }
  if (data.coverPath !== undefined) {
    fields.push('cover_path = ?')
    values.push(data.coverPath)
  }
  
  if (fields.length === 0) {
    return false
  }
  
  fields.push("updated_at = datetime('now', 'localtime')")
  values.push(id)
  
  const result = execute(`UPDATE playlist SET ${fields.join(', ')} WHERE id = ?`, values)
  return result.changes > 0
}

/**
 * 删除歌单
 */
export function deletePlaylist(id: number): boolean {
  const result = execute('DELETE FROM playlist WHERE id = ?', [id])
  return result.changes > 0
}

/**
 * 获取歌单中的所有歌曲
 */
export function getPlaylistMusic(playlistId: number): Music[] {
  return queryAll<Music>(`
    SELECT m.* FROM music m
    INNER JOIN playlist_music pm ON m.id = pm.music_id
    WHERE pm.playlist_id = ?
    ORDER BY pm.sort_order ASC, pm.added_at ASC
  `, [playlistId])
}

/**
 * 添加歌曲到歌单
 */
export function addMusicToPlaylist(playlistId: number, musicId: number): boolean {
  // 获取最大排序号
  const maxResult = queryOne<{ max_order: number | null }>(
    'SELECT MAX(sort_order) as max_order FROM playlist_music WHERE playlist_id = ?',
    [playlistId]
  )
  const newOrder = (maxResult?.max_order || 0) + 1
  
  try {
    execute(`
      INSERT OR IGNORE INTO playlist_music (playlist_id, music_id, sort_order)
      VALUES (?, ?, ?)
    `, [playlistId, musicId, newOrder])
    return true
  } catch {
    return false
  }
}

/**
 * 批量添加歌曲到歌单
 */
export function addMusicBatchToPlaylist(playlistId: number, musicIds: number[]): number {
  return transaction(() => {
    const maxResult = queryOne<{ max_order: number | null }>(
      'SELECT MAX(sort_order) as max_order FROM playlist_music WHERE playlist_id = ?',
      [playlistId]
    )
    let currentOrder = (maxResult?.max_order || 0) + 1
    let addedCount = 0
    
    for (const musicId of musicIds) {
      try {
        const result = execute(`
          INSERT OR IGNORE INTO playlist_music (playlist_id, music_id, sort_order)
          VALUES (?, ?, ?)
        `, [playlistId, musicId, currentOrder++])
        if (result.changes > 0) {
          addedCount++
        }
      } catch {
        // 忽略
      }
    }
    
    return addedCount
  })
}

/**
 * 从歌单中移除歌曲
 */
export function removeMusicFromPlaylist(playlistId: number, musicId: number): boolean {
  const result = execute('DELETE FROM playlist_music WHERE playlist_id = ? AND music_id = ?', [playlistId, musicId])
  return result.changes > 0
}

/**
 * 清空歌单
 */
export function clearPlaylist(playlistId: number): number {
  const result = execute('DELETE FROM playlist_music WHERE playlist_id = ?', [playlistId])
  return result.changes
}

/**
 * 更新歌单内歌曲顺序
 */
export function updatePlaylistOrder(playlistId: number, musicIds: number[]): boolean {
  return transaction(() => {
    musicIds.forEach((musicId, index) => {
      execute(`
        UPDATE playlist_music SET sort_order = ? 
        WHERE playlist_id = ? AND music_id = ?
      `, [index, playlistId, musicId])
    })
    return true
  })
}

/**
 * 检查歌曲是否在歌单中
 */
export function isMusicInPlaylist(playlistId: number, musicId: number): boolean {
  const result = queryOne<{ exists: number }>(
    'SELECT 1 as exists FROM playlist_music WHERE playlist_id = ? AND music_id = ? LIMIT 1',
    [playlistId, musicId]
  )
  return !!result
}
