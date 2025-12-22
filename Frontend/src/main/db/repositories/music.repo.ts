/**
 * 歌曲数据仓库
 * 封装所有歌曲相关的数据库操作
 * 使用内存缓存加速检索
 */
import type { Music, MusicCreateDTO, MusicQueryParams } from '../../types/music'
import { cache, CACHE_KEYS, execute, invalidateMusicCache, queryAll, queryOne, transaction } from '../index'

/**
 * 获取所有歌曲（使用缓存）
 */
export function getAllMusic(params?: MusicQueryParams): Music[] {
  // 无参数查询使用缓存
  const useCache = !params || (!params.keyword && params.isFavorite === undefined && !params.limit)

  if (useCache) {
    const cached = cache.get<Music[]>(CACHE_KEYS.ALL_MUSIC)
    if (cached) {
      console.log(`[Cache] Hit: ${CACHE_KEYS.ALL_MUSIC} (${cached.length} songs)`)
      return cached
    }
  }

  let sql = 'SELECT * FROM music WHERE hidden_from_local = 0'
  const bindParams: unknown[] = []

  if (params?.keyword) {
    sql += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ?)'
    const keyword = `%${params.keyword}%`
    bindParams.push(keyword, keyword, keyword)
  }

  if (params?.isFavorite !== undefined) {
    sql += ' AND is_favorite = ?'
    bindParams.push(params.isFavorite ? 1 : 0)
  }

  // 排序
  const orderBy = params?.orderBy || 'created_at'
  const order = params?.order || 'DESC'
  sql += ` ORDER BY ${orderBy} ${order}`

  // 分页
  if (params?.limit) {
    sql += ' LIMIT ?'
    bindParams.push(params.limit)

    if (params?.offset) {
      sql += ' OFFSET ?'
      bindParams.push(params.offset)
    }
  }

  const result = queryAll<Music>(sql, bindParams)

  // 无参数查询存入缓存
  if (useCache) {
    cache.set(CACHE_KEYS.ALL_MUSIC, result)
    console.log(`[Cache] Set: ${CACHE_KEYS.ALL_MUSIC} (${result.length} songs)`)
  }

  return result
}

/**
 * 根据ID获取歌曲
 */
export function getMusicById(id: number): Music | undefined {
  return queryOne<Music>('SELECT * FROM music WHERE id = ?', [id])
}

/**
 * 根据文件路径获取歌曲
 */
export function getMusicByPath(filePath: string): Music | undefined {
  return queryOne<Music>('SELECT * FROM music WHERE file_path = ?', [filePath])
}

/**
 * 添加歌曲
 */
export function createMusic(data: MusicCreateDTO): number {
  const result = execute(`
    INSERT INTO music (
      title, artist, album, duration, file_path, file_size,
      format, bitrate, sample_rate, cover_path, lyrics_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.title,
    data.artist || '未知歌手',
    data.album || '未知专辑',
    data.duration || 0,
    data.filePath,
    data.fileSize || 0,
    data.format || null,
    data.bitrate || null,
    data.sampleRate || null,
    data.coverPath || null,
    data.lyricsPath || null
  ])

  // 清除缓存
  invalidateMusicCache()

  return result.lastInsertRowid
}

/**
 * 批量添加歌曲
 */
export function createMusicBatch(dataList: MusicCreateDTO[]): number[] {
  const ids = transaction(() => {
    const insertedIds: number[] = []

    for (const data of dataList) {
      try {
        const result = execute(`
          INSERT OR IGNORE INTO music (
            title, artist, album, duration, file_path, file_size,
            format, bitrate, sample_rate, cover_path, lyrics_path
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          data.title,
          data.artist || '未知歌手',
          data.album || '未知专辑',
          data.duration || 0,
          data.filePath,
          data.fileSize || 0,
          data.format || null,
          data.bitrate || null,
          data.sampleRate || null,
          data.coverPath || null,
          data.lyricsPath || null
        ])

        if (result.lastInsertRowid) {
          insertedIds.push(result.lastInsertRowid)
        }
      } catch {
        // 忽略重复的
      }
    }

    return insertedIds
  })

  // 清除缓存
  if (ids.length > 0) {
    invalidateMusicCache()
  }

  return ids
}

/**
 * 更新歌曲信息
 */
export function updateMusic(id: number, data: Partial<MusicCreateDTO>): boolean {
  const fields: string[] = []
  const values: unknown[] = []

  if (data.title !== undefined) {
    fields.push('title = ?')
    values.push(data.title)
  }
  if (data.artist !== undefined) {
    fields.push('artist = ?')
    values.push(data.artist)
  }
  if (data.album !== undefined) {
    fields.push('album = ?')
    values.push(data.album)
  }
  if (data.coverPath !== undefined) {
    fields.push('cover_path = ?')
    values.push(data.coverPath)
  }
  if (data.lyricsPath !== undefined) {
    fields.push('lyrics_path = ?')
    values.push(data.lyricsPath)
  }

  if (fields.length === 0) {
    return false
  }

  fields.push("updated_at = datetime('now', 'localtime')")
  values.push(id)

  const result = execute(`UPDATE music SET ${fields.join(', ')} WHERE id = ?`, values)

  if (result.changes > 0) {
    invalidateMusicCache()
  }

  return result.changes > 0
}

/**
 * 删除歌曲
 */
export function deleteMusic(id: number): boolean {
  const result = execute('DELETE FROM music WHERE id = ?', [id])

  if (result.changes > 0) {
    invalidateMusicCache()
  }

  return result.changes > 0
}

/**
 * 批量删除歌曲
 */
export function deleteMusicBatch(ids: number[]): number {
  if (ids.length === 0) return 0

  const placeholders = ids.map(() => '?').join(',')
  const result = execute(`DELETE FROM music WHERE id IN (${placeholders})`, ids)
  return result.changes
}

/**
 * 删除所有歌曲
 */
export function deleteAllMusic(): number {
  const result = execute('DELETE FROM music')

  if (result.changes > 0) {
    invalidateMusicCache()
  }

  return result.changes
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(id: number): boolean {
  const result = execute(`
    UPDATE music
    SET is_favorite = CASE WHEN is_favorite = 0 THEN 1 ELSE 0 END,
        updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `, [id])
  return result.changes > 0
}

/**
 * 增加播放次数
 */
export function incrementPlayCount(id: number): boolean {
  const result = execute(`
    UPDATE music
    SET play_count = play_count + 1,
        last_played_at = datetime('now', 'localtime'),
        updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `, [id])
  return result.changes > 0
}

/**
 * 获取歌曲总数
 */
export function getMusicCount(): number {
  const result = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM music')
  return result?.count || 0
}

/**
 * 获取收藏歌曲
 */
export function getFavoriteMusic(): Music[] {
  return queryAll<Music>('SELECT * FROM music WHERE is_favorite = 1 ORDER BY updated_at DESC')
}

/**
 * 获取最近播放
 */
export function getRecentlyPlayed(limit = 50): Music[] {
  return queryAll<Music>(`
    SELECT * FROM music
    WHERE last_played_at IS NOT NULL
    ORDER BY last_played_at DESC
    LIMIT ?
  `, [limit])
}

/**
 * 移除最近播放记录（不删除歌曲，仅清除播放时间）
 */
export function removeRecentlyPlayed(ids: number[]): boolean {
  if (ids.length === 0) return false

  const placeholders = ids.map(() => '?').join(',')
  const result = execute(`
    UPDATE music
    SET last_played_at = NULL
    WHERE id IN (${placeholders})
  `, ids)

  return result.changes > 0
}

/**
 * 清空最近播放记录
 */
export function clearRecentlyPlayed(): boolean {
  const result = execute(`
    UPDATE music
    SET last_played_at = NULL
    WHERE last_played_at IS NOT NULL
  `)

  return result.changes > 0
}

/**
 * 获取最常播放
 */
export function getMostPlayed(limit = 50): Music[] {
  return queryAll<Music>(`
    SELECT * FROM music
    WHERE play_count > 0
    ORDER BY play_count DESC
    LIMIT ?
  `, [limit])
}

/**
 * 获取所有歌曲的文件路径
 */
export function getAllMusicPaths(): Set<string> {
  const result = queryAll<{ file_path: string }>('SELECT file_path FROM music')
  return new Set(result.map(r => r.file_path))
}

/**
 * 获取指定目录下的所有歌曲（仅返回ID和路径）
 */
export function getMusicByDirectory(dirPath: string): { id: number, file_path: string }[] {
  return queryAll<{ id: number, file_path: string }>(
    'SELECT id, file_path FROM music WHERE file_path LIKE ?',
    [`${dirPath}%`]
  )
}

/**
 * 从本地音乐列表隐藏歌曲（不删除数据）
 */
export function hideFromLocal(id: number): boolean {
  const result = execute(`
    UPDATE music
    SET hidden_from_local = 1,
        updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `, [id])

  if (result.changes > 0) {
    invalidateMusicCache()
  }

  return result.changes > 0
}

/**
 * 批量从本地音乐列表隐藏歌曲（不删除数据）
 */
export function hideFromLocalBatch(ids: number[]): number {
  if (ids.length === 0) return 0

  const placeholders = ids.map(() => '?').join(',')
  const result = execute(`
    UPDATE music
    SET hidden_from_local = 1,
        updated_at = datetime('now', 'localtime')
    WHERE id IN (${placeholders})
  `, ids)

  if (result.changes > 0) {
    invalidateMusicCache()
  }

  return result.changes
}

/**
 * 恢复本地音乐列表中的隐藏歌曲
 */
export function unhideFromLocal(id: number): boolean {
  const result = execute(`
    UPDATE music
    SET hidden_from_local = 0,
        updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `, [id])

  if (result.changes > 0) {
    invalidateMusicCache()
  }

  return result.changes > 0
}

/**
 * 恢复所有隐藏的歌曲
 */
export function unhideAllFromLocal(): number {
  const result = execute(`
    UPDATE music
    SET hidden_from_local = 0,
        updated_at = datetime('now', 'localtime')
    WHERE hidden_from_local = 1
  `)

  if (result.changes > 0) {
    invalidateMusicCache()
  }

  return result.changes
}
