/**
 * 数据库连接管理
 * 使用 better-sqlite3 实现高性能 SQLite 数据库操作
 * 集成内存缓存实现类似 Redis 的快速检索
 */
import Database from 'better-sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'

// 数据库单例
let db: Database.Database | null = null
let dbPath: string = ''

// ============ 内存缓存层（类似 Redis） ============
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // 生存时间（毫秒），0 表示永不过期
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()

  set<T>(key: string, data: T, ttl: number = 0): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // 检查是否过期
    if (entry.ttl > 0 && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  // 清除带有特定前缀的所有缓存
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }
}

// 全局缓存实例
export const cache = new MemoryCache()

// 缓存 key 常量
export const CACHE_KEYS = {
  ALL_MUSIC: 'music:all',
  FAVORITES: 'music:favorites',
  RECENTLY_PLAYED: 'music:recentlyPlayed',
  PLAYLISTS: 'playlists:all'
}

/**
 * 获取数据库存储路径
 * 开发环境：项目根目录 /data
 * 生产环境：C盘用户数据目录 (AppData/Roaming/故里音乐助手/data)
 */
function getDatabasePath(): string {
  const isDev = !app.isPackaged

  let dataPath: string

  if (isDev) {
    // 开发环境：项目根目录
    dataPath = path.join(app.getAppPath(), 'data')
  } else {
    // 生产环境：使用 C 盘用户数据目录
    // 路径通常为: C:\Users\<用户名>\AppData\Roaming\GL_Music\data
    dataPath = path.join(app.getPath('userData'), 'data')
    console.log('[Database] Using user data directory for data:', dataPath)
  }

  // 确保目录存在
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
  }

  return path.join(dataPath, 'music.db')
}

/**
 * 初始化数据库
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db
  }

  dbPath = getDatabasePath()
  console.log('[Database] Initializing database with better-sqlite3:', dbPath)
  console.time('[Database] Initialization')

  // 创建数据库连接
  db = new Database(dbPath)

  // 优化性能设置
  db.pragma('journal_mode = WAL') // 写入性能提升
  db.pragma('synchronous = NORMAL') // 平衡安全与性能
  db.pragma('cache_size = 10000') // 增加缓存大小
  db.pragma('temp_store = MEMORY') // 临时表存储在内存中

  // 执行建表语句
  const schema = getSchema()
  db.exec(schema)

  console.timeEnd('[Database] Initialization')
  console.log('[Database] Initialization complete')

  return db
}

/**
 * 获取数据库实例
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized, please call initDatabase() first')
  }
  return db
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    cache.clear()
    console.log('[Database] Connection closed')
  }
}

/**
 * 执行查询并返回所有结果（支持缓存）
 */
export function queryAll<T>(sql: string, params: unknown[] = [], cacheKey?: string): T[] {
  // 尝试从缓存获取
  if (cacheKey) {
    const cached = cache.get<T[]>(cacheKey)
    if (cached) {
      console.log(`[Cache] Hit: ${cacheKey}`)
      return cached
    }
  }

  const database = getDatabase()
  const stmt = database.prepare(sql)
  const results = stmt.all(...params) as T[]

  // 存入缓存
  if (cacheKey) {
    cache.set(cacheKey, results)
    console.log(`[Cache] Set: ${cacheKey} (${results.length} items)`)
  }

  return results
}

/**
 * 执行查询并返回第一条结果
 */
export function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
  const database = getDatabase()
  const stmt = database.prepare(sql)
  return stmt.get(...params) as T | undefined
}

/**
 * 执行 SQL 语句（INSERT/UPDATE/DELETE）
 */
export function execute(sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: number } {
  const database = getDatabase()
  const stmt = database.prepare(sql)
  const result = stmt.run(...params)

  return {
    changes: result.changes,
    lastInsertRowid: Number(result.lastInsertRowid)
  }
}

/**
 * 执行事务
 */
export function transaction<T>(fn: () => T): T {
  const database = getDatabase()
  const transactionFn = database.transaction(fn)
  return transactionFn()
}

/**
 * 使缓存失效（数据变更时调用）
 */
export function invalidateMusicCache(): void {
  cache.invalidatePrefix('music:')
  console.log('[Cache] Music cache invalidated')
}

export function invalidatePlaylistCache(): void {
  cache.invalidatePrefix('playlists:')
  console.log('[Cache] Playlist cache invalidated')
}

/**
 * 获取数据库表结构
 */
function getSchema(): string {
  return `
    -- 歌曲表
    CREATE TABLE IF NOT EXISTS music (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT DEFAULT '未知歌手',
        album TEXT DEFAULT '未知专辑',
        duration REAL DEFAULT 0,
        file_path TEXT NOT NULL UNIQUE,
        file_size INTEGER DEFAULT 0,
        format TEXT,
        bitrate INTEGER,
        sample_rate INTEGER,
        cover_path TEXT,
        lyrics_path TEXT,
        play_count INTEGER DEFAULT 0,
        is_favorite INTEGER DEFAULT 0,
        last_played_at TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 歌单表
    CREATE TABLE IF NOT EXISTS playlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        cover_path TEXT,
        song_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 歌单-歌曲关联表
    CREATE TABLE IF NOT EXISTS playlist_music (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL,
        music_id INTEGER NOT NULL,
        sort_order INTEGER DEFAULT 0,
        added_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE,
        FOREIGN KEY (music_id) REFERENCES music(id) ON DELETE CASCADE,
        UNIQUE(playlist_id, music_id)
    );

    -- 用户设置表
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 播放历史表
    CREATE TABLE IF NOT EXISTS play_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        music_id INTEGER NOT NULL,
        played_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (music_id) REFERENCES music(id) ON DELETE CASCADE
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_music_title ON music(title);
    CREATE INDEX IF NOT EXISTS idx_music_artist ON music(artist);
    CREATE INDEX IF NOT EXISTS idx_music_album ON music(album);
    CREATE INDEX IF NOT EXISTS idx_music_file_path ON music(file_path);

    -- 插入默认设置
    INSERT OR IGNORE INTO settings (key, value) VALUES
        ('theme', 'dark'),
        ('volume', '0.7'),
        ('playMode', 'sequence'),
        ('language', 'zh-CN'),
        ('musicFolders', '[]'),
        ('autoScan', 'true'),
        ('visualizerEnabled', 'true'),
        ('disableSplashScreen', 'false'),
        ('lastScannedAt', '');
  `
}

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
  queryAll,
  queryOne,
  execute,
  transaction,
  cache,
  CACHE_KEYS,
  invalidateMusicCache,
  invalidatePlaylistCache
}
