/**
 * 在线音乐服务
 * 提供在线搜索、获取播放链接等功能
 * 支持原生源脚本和外部源脚本两种格式
 */
import { ipcMain } from 'electron'
import * as sourceRepo from '../db/repositories/source.repo'
import {
  executeInGhost,
  getSourceType,
  injectSourceScript,
  isSourceLoaded,
  sendScriptEvent
} from './api-runner.service'

// ==================== 类型定义 ====================

export interface OnlineMusic {
  id: string
  name: string
  artist: string
  album?: string
  duration?: number
  cover?: string
  source: string
  quality?: string
  playUrl?: string
  size?: number
  extra?: Record<string, unknown>
}

export interface OnlineSearchResult {
  list: OnlineMusic[]
  total: number
  source: string
  page?: number
  pageSize?: number
}

export interface OnlineSearchParams {
  keyword: string
  source: string
  page?: number
  pageSize?: number
}

export interface GetPlayUrlParams {
  id: string
  source: string
  quality?: string
  extra?: Record<string, unknown>
}

export interface DownloadParams {
  music: OnlineMusic
  targetDir?: string
}

export interface DownloadResult {
  success: boolean
  localPath?: string
  error?: string
}

// 请求超时时间
const REQUEST_TIMEOUT = 30000

// 待处理请求映射
const pendingRequests = new Map<string, {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
  timeout: NodeJS.Timeout
}>()

/**
 * 生成请求 ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 解析时长字符串或数字为秒数
 */
function parseDuration(duration: string | number | undefined): number {
  if (typeof duration === 'number') return duration
  if (!duration) return 0

  if (typeof duration === 'string') {
    if (duration.includes(':')) {
      const parts = duration.split(':').map(Number)
      if (parts.length === 2) return parts[0] * 60 + parts[1]
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    const parsed = parseInt(duration)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// ==================== 服务方法 ====================

/**
 * 确保源已加载
 */
async function ensureSourceLoaded(sourceId: string): Promise<void> {
  if (isSourceLoaded(sourceId)) {
    return
  }

  const source = sourceRepo.getSourceById(sourceId)
  if (!source) {
    throw new Error(`源 ${sourceId} 不存在`)
  }
  if (!source.enabled) {
    throw new Error(`源 ${sourceId} 未启用`)
  }

  await injectSourceScript(sourceId, source.name, source.scriptContent)
}

/**
 * 在线搜索
 */
export async function search(params: OnlineSearchParams): Promise<OnlineSearchResult> {
  console.log('[OnlineService] Searching:', params)

  const { keyword, source, page = 1, pageSize = 30 } = params

  // 检查源是否存在
  const sourceInfo = sourceRepo.getSourceById(source)
  if (!sourceInfo) {
    throw new Error(`音乐源 "${source}" 不存在，请先导入源脚本`)
  }
  if (!sourceInfo.enabled) {
    throw new Error(`音乐源 "${source}" 未启用`)
  }

  // 确保源已加载
  await ensureSourceLoaded(source)

  // 根据源类型选择不同的调用方式
  const sourceType = getSourceType(source)

  if (sourceType === 'external') {
    // 外部脚本使用事件驱动方式
    return await searchWithExternalScript(source, keyword, page, pageSize)
  } else {
    // 原生脚本使用直接调用方式
    return await searchWithNativeScript(source, keyword, page, pageSize)
  }
}

/**
 * 使用原生脚本搜索
 */
async function searchWithNativeScript(
  source: string,
  keyword: string,
  page: number,
  pageSize: number
): Promise<OnlineSearchResult> {
  const requestId = generateRequestId()

  const result = await new Promise<OnlineSearchResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(new Error('搜索请求超时'))
    }, REQUEST_TIMEOUT)

    pendingRequests.set(requestId, { resolve: resolve as (value: unknown) => void, reject, timeout })

    executeInGhost(`
      (async () => {
        try {
          if (typeof guliSource === 'undefined' || typeof guliSource.search !== 'function') {
            throw new Error('源脚本未正确实现 search 方法');
          }
          const result = await guliSource.search({
            keyword: ${JSON.stringify(keyword)},
            page: ${page},
            pageSize: ${pageSize}
          });
          window.guli_api.send('online:searchResult', {
            requestId: '${requestId}',
            success: true,
            list: result.list || [],
            total: result.total || 0
          });
        } catch (err) {
          window.guli_api.send('online:searchResult', {
            requestId: '${requestId}',
            success: false,
            error: err.message || '搜索失败'
          });
        }
      })();
    `).catch(err => {
      clearTimeout(timeout)
      pendingRequests.delete(requestId)
      reject(err)
    })
  })

  return {
    ...result,
    source,
    page,
    pageSize
  }
}

/**
 * 使用外部脚本搜索
 * 通过事件机制调用外部脚本的 search 功能
 */
async function searchWithExternalScript(
  source: string,
  keyword: string,
  page: number,
  pageSize: number
): Promise<OnlineSearchResult> {
  console.log('[OnlineService] Attempting search with external script:', source)

  const requestId = generateRequestId()
  const platform = extractExternalSourceType(source)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = await new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(new Error('搜索请求超时'))
    }, REQUEST_TIMEOUT)

    pendingRequests.set(requestId, { resolve, reject, timeout })

    // 触发外部脚本的请求事件
    // LX 脚本通常监听 'request' 事件，action 为 'search'
    sendScriptEvent('request', {
      requestId,
      source: platform,
      action: 'search',
      info: {
        keyword,
        page,
        limit: pageSize,
        type: 'music' // 明确指定搜索类型
      }
    })
  })

  // 映射结果到 OnlineSearchResult
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = (rawResult.list || []).map((item: any) => ({
    id: item.songmid || item.id || item.musicId,
    name: item.name || item.title,
    artist: item.singer || item.artist,
    album: item.albumName || item.album,
    duration: parseDuration(item.interval || item.duration),
    cover: item.img || item.cover || item.pic,
    source: source, // 使用脚本 ID 作为 source
    quality: item.quality,
    extra: item // 保留原始数据
  }))

  return {
    list,
    total: rawResult.total || list.length,
    source,
    page,
    pageSize
  }
}

/**
 * 获取播放链接
 */
export async function getPlayUrl(params: GetPlayUrlParams): Promise<string> {
  console.log('[OnlineService] Getting play URL:', params)

  const { id, source, quality, extra } = params

  // 确保源已加载
  await ensureSourceLoaded(source)

  const sourceType = getSourceType(source)

  if (sourceType === 'external') {
    return await getPlayUrlWithExternalScript(source, id, quality || '128k', extra || {})
  } else {
    return await getPlayUrlWithNativeScript(source, id, quality, extra)
  }
}

/**
 * 使用原生脚本获取播放链接
 */
async function getPlayUrlWithNativeScript(
  _source: string,
  id: string,
  quality?: string,
  extra?: Record<string, unknown>
): Promise<string> {
  const requestId = generateRequestId()

  const result = await new Promise<{ url: string }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(new Error('获取播放链接超时'))
    }, REQUEST_TIMEOUT)

    pendingRequests.set(requestId, { resolve: resolve as (value: unknown) => void, reject, timeout })

    executeInGhost(`
      (async () => {
        try {
          if (typeof guliSource === 'undefined' || typeof guliSource.getPlayUrl !== 'function') {
            throw new Error('源脚本未正确实现 getPlayUrl 方法');
          }
          const result = await guliSource.getPlayUrl({
            id: ${JSON.stringify(id)},
            quality: ${JSON.stringify(quality || '')},
            extra: ${JSON.stringify(extra || {})}
          });
          window.guli_api.send('online:playUrlResult', {
            requestId: '${requestId}',
            success: true,
            url: result.url || result
          });
        } catch (err) {
          window.guli_api.send('online:playUrlResult', {
            requestId: '${requestId}',
            success: false,
            error: err.message || '获取播放链接失败'
          });
        }
      })();
    `).catch(err => {
      clearTimeout(timeout)
      pendingRequests.delete(requestId)
      reject(err)
    })
  })

  return result.url
}

/**
 * 使用外部脚本获取播放链接
 */
async function getPlayUrlWithExternalScript(
  source: string,
  musicId: string,
  quality: string,
  extra: Record<string, unknown>
): Promise<string> {
  const requestId = generateRequestId()

  // 从 extra 中获取外部脚本需要的音乐信息
  const musicInfo = extra || {}

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(new Error('获取播放链接超时'))
    }, REQUEST_TIMEOUT)

    pendingRequests.set(requestId, {
      resolve: resolve as (value: unknown) => void,
      reject,
      timeout
    })

    // 触发外部脚本的请求事件
    sendScriptEvent('request', {
      requestId,
      source: extractExternalSourceType(source),
      action: 'musicUrl',
      info: {
        musicInfo: {
          ...musicInfo,
          songmid: musicId
        },
        type: quality
      }
    })
  })
}

/**
 * 从源ID提取外部脚本源类型
 */
function extractExternalSourceType(sourceId: string): string {
  const storedSource = sourceRepo.getSourceById(sourceId)
  if (!storedSource) return 'kw'

  const name = storedSource.name.toLowerCase()

  if (name.includes('酷我') || name.includes('kuwo')) return 'kw'
  if (name.includes('酷狗') || name.includes('kugou')) return 'kg'
  if (name.includes('咪咕') || name.includes('migu')) return 'mg'
  if (name.includes('qq') || name.includes('腾讯')) return 'tx'
  if (name.includes('网易') || name.includes('netease') || name.includes('云音乐')) return 'wy'
  if (name.includes('野草') || name.includes('wild')) return 'kw' // 野草通常是酷我源

  return 'kw'
}

/**
 * 下载音乐
 */
export async function downloadMusic(params: DownloadParams): Promise<DownloadResult> {
  console.log('[OnlineService] Downloading:', params)

  const downloadService = await import('./download.service')
  return downloadService.downloadMusic(params)
}

// ==================== IPC 响应监听 ====================

/**
 * 初始化响应监听器
 */
export function initOnlineServiceListeners(): void {
  // 搜索结果响应
  ipcMain.on('online:searchResult', (_event, data: {
    requestId: string
    success: boolean
    list?: OnlineMusic[]
    total?: number
    error?: string
  }) => {
    const pending = pendingRequests.get(data.requestId)
    if (pending) {
      clearTimeout(pending.timeout)
      pendingRequests.delete(data.requestId)

      if (data.success) {
        pending.resolve({ list: data.list, total: data.total })
      } else {
        pending.reject(new Error(data.error || '搜索失败'))
      }
    }
  })

  // 播放链接结果响应
  ipcMain.on('online:playUrlResult', (_event, data: {
    requestId: string
    success: boolean
    url?: string
    error?: string
  }) => {
    const pending = pendingRequests.get(data.requestId)
    if (pending) {
      clearTimeout(pending.timeout)
      pendingRequests.delete(data.requestId)

      if (data.success) {
        pending.resolve({ url: data.url })
      } else {
        pending.reject(new Error(data.error || '获取播放链接失败'))
      }
    }
  })

  // 外部脚本响应
  ipcMain.on('script:event', (_event, { eventName, data }) => {
    if (eventName === 'inited') {
      console.log('[OnlineService] External script initialized:', data)
    }
  })

  // 外部脚本结果响应
  ipcMain.on('script:eventResult', (_event, { requestId, result, error }) => {
    const pending = pendingRequests.get(requestId)
    if (pending) {
      clearTimeout(pending.timeout)
      pendingRequests.delete(requestId)

      if (error) {
        pending.reject(new Error(error))
      } else {
        // 外部脚本返回的是结果对象（搜索结果或播放URL）
        pending.resolve(result)
      }
    }
  })

  console.log('[OnlineService] IPC listeners initialized')
}
