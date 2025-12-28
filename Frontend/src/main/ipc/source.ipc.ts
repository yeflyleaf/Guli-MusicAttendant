import { randomUUID } from 'crypto'
import { ipcMain } from 'electron'
import * as sourceRepo from '../db/repositories/source.repo'
import { getLoadedSources } from '../services/api-runner.service'

/**
 * 解析脚本元数据
 */
function parseScriptMetadata(content: string): {
  name: string
  version: string
  description?: string
  author?: string
  icon?: string
  supports: {
    search?: boolean
    getPlayUrl?: boolean
    getLyrics?: boolean
  }
} {
  // 默认值
  const metadata = {
    name: 'Unknown Source',
    version: '1.0.0',
    description: '',
    author: '',
    icon: '',
    supports: {
      search: true,
      getPlayUrl: true,
      getLyrics: false
    }
  }

  try {
    // 尝试解析为 JSON (如果是 JSON 格式的源)
    const json = JSON.parse(content)
    if (json.name) metadata.name = json.name
    if (json.version) metadata.version = json.version
    if (json.description) metadata.description = json.description
    if (json.author) metadata.author = json.author
    return metadata
  } catch (e) {
    // 不是 JSON，尝试从注释或代码中提取
  }

  // 尝试提取 LX Music 格式的源信息
  // const info = { name: "...", version: "..." }
  const nameMatch = content.match(/name\s*:\s*['"](.+?)['"]/)
  if (nameMatch) metadata.name = nameMatch[1]

  const versionMatch = content.match(/version\s*:\s*['"](.+?)['"]/)
  if (versionMatch) metadata.version = versionMatch[1]

  const authorMatch = content.match(/author\s*:\s*['"](.+?)['"]/)
  if (authorMatch) metadata.author = authorMatch[1]

  const descMatch = content.match(/description\s*:\s*['"](.+?)['"]/)
  if (descMatch) metadata.description = descMatch[1]

  return metadata
}

/**
 * 设置自定义源 IPC
 */
export function setupSourceIpc(): void {
  // 获取所有源
  ipcMain.handle('source:getAll', () => {
    return sourceRepo.getAllSources()
  })

  // 获取启用的源
  ipcMain.handle('source:getEnabled', () => {
    return sourceRepo.getEnabledSources()
  })

  // 导入源
  ipcMain.handle('source:import', async (_event, scriptContent: string) => {
    try {
      if (!scriptContent) {
        throw new Error('Script content is empty')
      }

      const metadata = parseScriptMetadata(scriptContent)
      const id = randomUUID()
      const now = new Date().toISOString()

      const source = {
        id,
        name: metadata.name,
        version: metadata.version,
        description: metadata.description,
        icon: metadata.icon,
        author: metadata.author,
        scriptContent,
        enabled: true,
        supports: metadata.supports,
        importedAt: now,
        updatedAt: now
      }

      const success = sourceRepo.upsertSource(source)

      if (success) {
        return {
          success: true,
          source: {
            id: source.id,
            name: source.name,
            version: source.version
          }
        }
      } else {
        return {
          success: false,
          error: 'Failed to save source to database'
        }
      }
    } catch (error) {
      console.error('[SourceIPC] Import failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // 删除源
  ipcMain.handle('source:delete', (_event, id: string) => {
    return sourceRepo.deleteSource(id)
  })

  // 切换源启用状态
  ipcMain.handle('source:toggle', (_event, id: string) => {
    return sourceRepo.toggleSourceEnabled(id)
  })

  // 获取已加载的源
  ipcMain.handle('source:getLoaded', () => {
    return getLoadedSources()
  })

  console.log('[SourceIPC] Handlers initialized')
}
