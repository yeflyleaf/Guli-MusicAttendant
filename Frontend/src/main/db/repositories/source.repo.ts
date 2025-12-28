/**
 * 音乐源仓库
 * 管理自定义音乐源的持久化存储
 */
import type { StoredSource } from '../../types/source'
import { getDatabase } from '../index'

// ==================== 表初始化 ====================

/**
 * 初始化音乐源表
 */
export function initSourceTable(): void {
  const db = getDatabase()

  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      author TEXT,
      script_content TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      supports TEXT NOT NULL,
      imported_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  console.log('[SourceRepo] Table initialized')
}

// ==================== CRUD 操作 ====================

/**
 * 获取所有音乐源
 */
export function getAllSources(): StoredSource[] {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT * FROM sources ORDER BY imported_at DESC
  `)

  const rows = stmt.all() as Array<{
    id: string
    name: string
    version: string
    description: string | null
    icon: string | null
    author: string | null
    script_content: string
    enabled: number
    supports: string
    imported_at: string
    updated_at: string
  }>

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    version: row.version,
    description: row.description || undefined,
    icon: row.icon || undefined,
    author: row.author || undefined,
    scriptContent: row.script_content,
    enabled: row.enabled === 1,
    supports: JSON.parse(row.supports),
    importedAt: row.imported_at,
    updatedAt: row.updated_at
  }))
}

/**
 * 获取启用的音乐源
 */
export function getEnabledSources(): StoredSource[] {
  return getAllSources().filter(s => s.enabled)
}

/**
 * 根据 ID 获取音乐源
 */
export function getSourceById(id: string): StoredSource | null {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM sources WHERE id = ?')
  const row = stmt.get(id) as {
    id: string
    name: string
    version: string
    description: string | null
    icon: string | null
    author: string | null
    script_content: string
    enabled: number
    supports: string
    imported_at: string
    updated_at: string
  } | undefined

  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    version: row.version,
    description: row.description || undefined,
    icon: row.icon || undefined,
    author: row.author || undefined,
    scriptContent: row.script_content,
    enabled: row.enabled === 1,
    supports: JSON.parse(row.supports),
    importedAt: row.imported_at,
    updatedAt: row.updated_at
  }
}

/**
 * 添加或更新音乐源
 */
export function upsertSource(source: StoredSource): boolean {
  const db = getDatabase()

  const stmt = db.prepare(`
    INSERT INTO sources (id, name, version, description, icon, author, script_content, enabled, supports, imported_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      version = excluded.version,
      description = excluded.description,
      icon = excluded.icon,
      author = excluded.author,
      script_content = excluded.script_content,
      enabled = excluded.enabled,
      supports = excluded.supports,
      updated_at = excluded.updated_at
  `)

  try {
    stmt.run(
      source.id,
      source.name,
      source.version,
      source.description || null,
      source.icon || null,
      source.author || null,
      source.scriptContent,
      source.enabled ? 1 : 0,
      JSON.stringify(source.supports),
      source.importedAt,
      source.updatedAt
    )
    return true
  } catch (error) {
    console.error('[SourceRepo] Failed to upsert source:', error)
    return false
  }
}

/**
 * 删除音乐源
 */
export function deleteSource(id: string): boolean {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM sources WHERE id = ?')

  try {
    const result = stmt.run(id)
    return result.changes > 0
  } catch (error) {
    console.error('[SourceRepo] Failed to delete source:', error)
    return false
  }
}

/**
 * 切换音乐源启用状态
 */
export function toggleSourceEnabled(id: string): boolean {
  const db = getDatabase()
  const stmt = db.prepare(`
    UPDATE sources SET enabled = NOT enabled, updated_at = ? WHERE id = ?
  `)

  try {
    const result = stmt.run(new Date().toISOString(), id)
    return result.changes > 0
  } catch (error) {
    console.error('[SourceRepo] Failed to toggle source:', error)
    return false
  }
}
