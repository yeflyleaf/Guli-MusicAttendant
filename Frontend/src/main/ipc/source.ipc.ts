/**
 * 音乐源 IPC 处理器
 * 处理自定义源的导入、管理和执行
 */
import { ipcMain } from 'electron'
import * as sourceRepo from '../db/repositories/source.repo'
import {
  createGhostWindow,
  executeInGhost,
  getLoadedSources,
  injectSourceScript,
  isSourceLoaded,
  removeSource as removeLoadedSource
} from '../services/api-runner.service'
import type { SourceMeta, StoredSource } from '../types/source'

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 30000

// 等待中的请求
const pendingRequests = new Map<string, {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
  timeout: NodeJS.Timeout
}>()

/**
 * 生成唯一请求 ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 注册源管理的 IPC 处理器
 */
export function setupSourceIpc(): void {
  console.log('[IPC] Registering source handlers...')

  // ==================== 源管理 ====================

  // 获取所有源
  ipcMain.handle('source:getAll', () => {
    return sourceRepo.getAllSources()
  })

  // 获取启用的源
  ipcMain.handle('source:getEnabled', () => {
    return sourceRepo.getEnabledSources()
  })

  // 导入源脚本
  ipcMain.handle('source:import', async (_event, scriptContent: string) => {
    try {
      // 解析脚本元信息
      const meta = parseSourceMeta(scriptContent)
      if (!meta) {
        return { success: false, error: '无法解析源脚本元信息，请确保脚本格式正确' }
      }

      // 检查是否已存在
      const existing = sourceRepo.getSourceById(meta.id)
      const isUpdate = !!existing

      // 创建存储对象
      const now = new Date().toISOString()
      const storedSource: StoredSource = {
        id: meta.id,
        name: meta.name,
        version: meta.version,
        description: meta.description,
        icon: meta.icon,
        author: meta.author,
        scriptContent,
        enabled: true,
        supports: meta.supports,
        importedAt: existing?.importedAt || now,
        updatedAt: now
      }

      // 保存到数据库
      const saved = sourceRepo.upsertSource(storedSource)
      if (!saved) {
        return { success: false, error: '保存源脚本失败' }
      }

      // 加载到 Ghost Window
      const loaded = await injectSourceScript(meta.id, meta.name, scriptContent)
      if (!loaded) {
        return { success: false, error: '加载源脚本失败' }
      }

      return {
        success: true,
        source: storedSource,
        isUpdate
      }
    } catch (error) {
      console.error('[SourceIpc] Import failed:', error)
      return { success: false, error: error instanceof Error ? error.message : '导入失败' }
    }
  })

  // 删除源
  // 删除源
  // 删除源
  ipcMain.handle('source:delete', (_event, sourceId: string) => {
    console.log('[SourceIpc] Deleting source with id:', sourceId)

    // 检查源是否存在
    const existing = sourceRepo.getSourceById(sourceId)

    if (!existing) {
      console.log('[SourceIpc] Source not found in DB, considering it deleted.')
      // 即使数据库中没有，也要尝试从内存中移除（如果已加载）
      removeLoadedSource(sourceId)
      return true
    }

    const deleted = sourceRepo.deleteSource(sourceId)
    console.log('[SourceIpc] Delete result:', deleted)

    if (deleted) {
      removeLoadedSource(sourceId)
    }
    return deleted
  })

  // 切换源启用状态
  ipcMain.handle('source:toggle', async (_event, sourceId: string) => {
    const toggled = sourceRepo.toggleSourceEnabled(sourceId)
    if (toggled) {
      const source = sourceRepo.getSourceById(sourceId)
      if (source) {
        if (source.enabled && !isSourceLoaded(sourceId)) {
          // 启用时加载脚本
          await injectSourceScript(sourceId, source.name, source.scriptContent)
        } else if (!source.enabled) {
          // 禁用时移除
          removeLoadedSource(sourceId)
        }
      }
    }
    return toggled
  })

  // 获取已加载的源
  ipcMain.handle('source:getLoaded', () => {
    return getLoadedSources()
  })

  // ==================== 源执行 ====================

  // 执行搜索
  ipcMain.handle('source:search', async (_event, params: {
    sourceId: string
    keyword: string
    page: number
    pageSize: number
  }) => {
    const { sourceId, keyword, page, pageSize } = params

    // 确保源已加载
    if (!isSourceLoaded(sourceId)) {
      const source = sourceRepo.getSourceById(sourceId)
      if (!source || !source.enabled) {
        throw new Error(`源 ${sourceId} 未找到或未启用`)
      }
      await injectSourceScript(sourceId, source.name, source.scriptContent)
    }

    const requestId = generateRequestId()

    // 创建 Promise 等待响应
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId)
        reject(new Error('搜索请求超时'))
      }, REQUEST_TIMEOUT)

      pendingRequests.set(requestId, { resolve, reject, timeout })

      // 执行搜索脚本
      executeInGhost(`
        if (typeof guliSource !== 'undefined' && typeof guliSource.search === 'function') {
          guliSource.search({
            requestId: '${requestId}',
            sourceId: '${sourceId}',
            keyword: '${keyword.replace(/'/g, "\\'")}',
            page: ${page},
            pageSize: ${pageSize}
          }).then(result => {
            window.guli_api.send('source:response', {
              requestId: '${requestId}',
              ...result
            })
          }).catch(err => {
            window.guli_api.send('source:response', {
              requestId: '${requestId}',
              success: false,
              error: err.message || '搜索失败'
            })
          })
        } else {
          window.guli_api.send('source:response', {
            requestId: '${requestId}',
            success: false,
            error: '源脚本未正确实现 search 方法'
          })
        }
      `).catch(err => {
        pendingRequests.delete(requestId)
        clearTimeout(timeout)
        reject(err)
      })
    })

    return result
  })

  // 获取播放链接
  ipcMain.handle('source:getPlayUrl', async (_event, params: {
    sourceId: string
    musicId: string
    quality?: string
    extra?: Record<string, unknown>
  }) => {
    const { sourceId, musicId, quality, extra } = params

    // 确保源已加载
    if (!isSourceLoaded(sourceId)) {
      const source = sourceRepo.getSourceById(sourceId)
      if (!source || !source.enabled) {
        throw new Error(`源 ${sourceId} 未找到或未启用`)
      }
      await injectSourceScript(sourceId, source.name, source.scriptContent)
    }

    const requestId = generateRequestId()

    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId)
        reject(new Error('获取播放链接超时'))
      }, REQUEST_TIMEOUT)

      pendingRequests.set(requestId, { resolve, reject, timeout })

      executeInGhost(`
        if (typeof guliSource !== 'undefined' && typeof guliSource.getPlayUrl === 'function') {
          guliSource.getPlayUrl({
            requestId: '${requestId}',
            sourceId: '${sourceId}',
            musicId: '${musicId}',
            quality: '${quality || ''}',
            extra: ${JSON.stringify(extra || {})}
          }).then(result => {
            window.guli_api.send('source:response', {
              requestId: '${requestId}',
              ...result
            })
          }).catch(err => {
            window.guli_api.send('source:response', {
              requestId: '${requestId}',
              success: false,
              error: err.message || '获取播放链接失败'
            })
          })
        } else {
          window.guli_api.send('source:response', {
            requestId: '${requestId}',
            success: false,
            error: '源脚本未正确实现 getPlayUrl 方法'
          })
        }
      `).catch(err => {
        pendingRequests.delete(requestId)
        clearTimeout(timeout)
        reject(err)
      })
    })

    return result
  })

  // 监听源响应
  ipcMain.on('source:response', (_event, data: { requestId: string; success: boolean; error?: string }) => {
    const pending = pendingRequests.get(data.requestId)
    if (pending) {
      clearTimeout(pending.timeout)
      pendingRequests.delete(data.requestId)

      if (data.success) {
        pending.resolve(data)
      } else {
        pending.reject(new Error(data.error || '请求失败'))
      }
    }
  })

  console.log('[IPC] Source handlers registered')
}

/**
 * 解析源脚本中的元信息
 * 支持两种格式：
 * 1. GULI_SOURCE_META 对象（原生格式）
 * 2. JSDoc 注释格式（@name, @version 等）
 */
function parseSourceMeta(scriptContent: string): SourceMeta | null {
  // 尝试解析原生格式
  const nativeMeta = parseNativeSourceMeta(scriptContent)
  if (nativeMeta) {
    console.log('[SourceIpc] Parsed native format source:', nativeMeta.name)
    return nativeMeta
  }

  // 尝试解析外部脚本格式
  const externalMeta = parseExternalScriptMeta(scriptContent)
  if (externalMeta) {
    console.log('[SourceIpc] Parsed external script format:', externalMeta.name)
    return externalMeta
  }

  console.error('[SourceIpc] Could not parse source metadata from script')
  return null
}

/**
 * 解析原生 GULI_SOURCE_META 格式
 */
function parseNativeSourceMeta(scriptContent: string): SourceMeta | null {
  try {
    // 查找 GULI_SOURCE_META 定义
    const metaMatch = scriptContent.match(/const\s+GULI_SOURCE_META\s*=\s*(\{[\s\S]*?\});/)
    if (!metaMatch) {
      return null
    }

    // 使用 Function 解析对象
    const metaStr = metaMatch[1]
    const meta = new Function(`return ${metaStr}`)() as SourceMeta

    // 验证必要字段
    if (!meta.id || !meta.name || !meta.version) {
      return null
    }

    return meta
  } catch {
    return null
  }
}

/**
 * 解析外部脚本的 JSDoc 注释格式
 * 格式示例：
 * /**
 *  * @name 源名称
 *  * @version 1
 *  * @author 作者
 *  * @description 描述
 *  *\/
 */
function parseExternalScriptMeta(scriptContent: string): SourceMeta | null {
  try {
    // 匹配 JSDoc 注释块
    const jsdocMatch = scriptContent.match(/\/\*\*[\s\S]*?\*\//)
    if (!jsdocMatch) {
      return null
    }

    const jsdocContent = jsdocMatch[0]

    // 提取各个字段
    const nameMatch = jsdocContent.match(/@name\s+(.+)/)
    const versionMatch = jsdocContent.match(/@version\s+(\S+)/)
    const authorMatch = jsdocContent.match(/@author\s+(.+)/)
    const descMatch = jsdocContent.match(/@description\s+(.+)/)

    const name = nameMatch?.[1]?.trim()
    const version = versionMatch?.[1]?.trim() || '1.0.0'

    if (!name) {
      return null
    }

    // 生成唯一 ID（基于名称）
    const id = `ext_${name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').toLowerCase()}_${Date.now().toString(36)}`

    return {
      id,
      name,
      version,
      description: descMatch?.[1]?.trim(),
      author: authorMatch?.[1]?.trim(),
      icon: '🎵',
      supports: {
        search: true,
        getPlayUrl: true,
        getLyrics: false
      }
    }
  } catch {
    return null
  }
}

/**
 * 初始化：启动时加载所有启用的源
 */
export async function initializeSources(): Promise<void> {
  console.log('[SourceIpc] Initializing sources...')

  // 创建 Ghost Window
  createGhostWindow()

  // 加载所有启用的源
  const enabledSources = sourceRepo.getEnabledSources()
  for (const source of enabledSources) {
    try {
      await injectSourceScript(source.id, source.name, source.scriptContent)
      console.log(`[SourceIpc] Loaded source: ${source.name}`)
    } catch (error) {
      console.error(`[SourceIpc] Failed to load source ${source.name}:`, error)
    }
  }

  console.log(`[SourceIpc] Initialized ${enabledSources.length} sources`)
}
