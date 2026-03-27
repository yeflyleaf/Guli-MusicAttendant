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
const REQUEST_TIMEOUT = 60000 // 60秒，因为外部脚本可能需要更多时间

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
    console.log(`[OnlineService] Source ${sourceId} is already loaded`)
    return
  }

  console.log(`[OnlineService] Loading source: ${sourceId}`)

  const source = sourceRepo.getSourceById(sourceId)
  if (!source) {
    throw new Error(`源 ${sourceId} 不存在`)
  }
  if (!source.enabled) {
    throw new Error(`源 ${sourceId} 未启用`)
  }

  const success = await injectSourceScript(sourceId, source.name, source.scriptContent)
  if (!success) {
    throw new Error(`无法加载源脚本: ${source.name}`)
  }

  console.log(`[OnlineService] Source ${sourceId} loaded successfully`)
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
  console.log(`[OnlineService] Source type for ${source}: ${sourceType}`)

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
  console.log('[OnlineService] Searching with external script:', source)

  const requestId = generateRequestId()
  const platform = extractExternalSourceType(source)
  console.log(`[OnlineService] External search: source=${source}, platform=${platform}, keyword=${keyword}, requestId=${requestId}`)

  const rawResult = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      console.error(`[OnlineService] Search request ${requestId} timed out`)
      reject(new Error('搜索请求超时'))
    }, REQUEST_TIMEOUT)

    pendingRequests.set(requestId, { resolve: resolve as (value: unknown) => void, reject, timeout })

    // 触发外部脚本的请求事件
    // LX 脚本通常监听 'request' 事件，action 为 'search'
    console.log(`[OnlineService] Sending search request...`)
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

  console.log('[OnlineService] Received raw search result:', rawResult)

  // 检查结果格式
  if (!rawResult) {
    console.error('[OnlineService] Empty result from external script')
    return { list: [], total: 0, source, page, pageSize }
  }

  // 映射结果到 OnlineSearchResult
  const rawList = (rawResult.list || rawResult.data || rawResult || []) as Record<string, unknown>[]
  const list = (Array.isArray(rawList) ? rawList : []).map((item: Record<string, unknown>) => ({
    id: String(item.songmid || item.id || item.musicId || Math.random()),
    name: String(item.name || item.title || item.songName || 'Unknown'),
    artist: String(item.singer || item.artist || item.singerName || 'Unknown'),
    album: String(item.albumName || item.album || ''),
    duration: parseDuration((item.interval ?? item.duration ?? item.time) as string | number | undefined),
    cover: String(item.img || item.cover || item.pic || item.albumPic || ''),
    source: source, // 使用脚本 ID 作为 source
    quality: item.quality as string | undefined,
    extra: item as Record<string, unknown> // 保留原始数据，以便获取播放链接时使用
  }))

  console.log(`[OnlineService] Mapped ${list.length} results`)

  return {
    list,
    total: (typeof rawResult.total === 'number' ? rawResult.total : typeof rawResult.totalNum === 'number' ? rawResult.totalNum : list.length),
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
  const platform = extractExternalSourceType(source)

  console.log(`[OnlineService] Getting play URL with external script: source=${source}, platform=${platform}, musicId=${musicId}, quality=${quality}`)

  // 从 extra 中获取外部脚本需要的音乐信息
  const musicInfo = extra || {}

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      console.error(`[OnlineService] Get play URL request ${requestId} timed out`)
      reject(new Error('获取播放链接超时'))
    }, REQUEST_TIMEOUT)

    pendingRequests.set(requestId, {
      resolve: (result: unknown) => {
        // 外部脚本可能返回 URL 字符串或包含 URL 的对象
        if (typeof result === 'string') {
          resolve(result)
        } else if (result && typeof result === 'object' && 'url' in result) {
          resolve((result as { url: string }).url)
        } else {
          console.error('[OnlineService] Unexpected result format:', result)
          reject(new Error('获取的播放链接格式无效'))
        }
      },
      reject,
      timeout
    })

    // 触发外部脚本的请求事件
    sendScriptEvent('request', {
      requestId,
      source: platform,
      action: 'musicUrl',
      info: {
        musicInfo: {
          ...musicInfo,
          songmid: musicId,
          id: musicId
        },
        type: quality
      }
    })
  })
}

/**
 * 从源ID提取外部脚本源类型
 * LX 脚本使用的平台标识：kw(酷我), kg(酷狗), mg(咪咕), tx(QQ音乐), wy(网易)
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
  if (name.includes('花') || name.includes('flower')) return 'kw' // 花海通常是酷我源

  // 默认返回 kw
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
  // 搜索结果响应（原生脚本）
  ipcMain.on('online:searchResult', (_event, data: {
    requestId: string
    success: boolean
    list?: OnlineMusic[]
    total?: number
    error?: string
  }) => {
    console.log(`[OnlineService] Received searchResult for ${data.requestId}:`, data.success ? 'success' : data.error)

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

  // 播放链接结果响应（原生脚本）
  ipcMain.on('online:playUrlResult', (_event, data: {
    requestId: string
    success: boolean
    url?: string
    error?: string
  }) => {
    console.log(`[OnlineService] Received playUrlResult for ${data.requestId}:`, data.success ? 'success' : data.error)

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

  // 外部脚本初始化事件
  ipcMain.on('script:event', (_event, { eventName, data }) => {
    if (eventName === 'inited') {
      console.log('[OnlineService] External script initialized:', data)
    }
  })

  // 外部脚本结果响应（关键！外部脚本的搜索/获取URL结果通过这里返回）
  ipcMain.on('script:eventResult', (_event, { requestId, result, error }) => {
    console.log(`[OnlineService] Received script:eventResult for ${requestId}`)

    const pending = pendingRequests.get(requestId)
    if (pending) {
      clearTimeout(pending.timeout)
      pendingRequests.delete(requestId)

      if (error) {
        console.error(`[OnlineService] Script event error for ${requestId}:`, error)
        pending.reject(new Error(error))
      } else {
        console.log(`[OnlineService] Script event result for ${requestId}:`, result)
        pending.resolve(result)
      }
    } else {
      console.warn(`[OnlineService] No pending request found for ${requestId}`)
    }
  })

  console.log('[OnlineService] IPC listeners initialized')
}
