import axios from 'axios'
import { randomUUID } from 'crypto'
import { ipcMain } from 'electron'
import * as sourceRepo from '../db/repositories/source.repo'
import { getLoadedSources, injectSourceScript } from '../services/api-runner.service'
import { getMainWindow } from '../services/window.service'

/**
 * 从 URL 下载脚本内容
 */
async function fetchScriptFromUrl(url: string): Promise<string> {
  console.log('[SourceIPC] Downloading script from URL:', url)
  try {
    const response = await axios.get(url, {
      responseType: 'text',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    console.log('[SourceIPC] Script downloaded, length:', response.data.length)
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[SourceIPC] Failed to download script:', message)
    throw new Error(`无法下载脚本: ${message}`)
  }
}

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
  } catch {
    // 不是 JSON，尝试从注释或代码中提取
  }

  // 尝试提取 LX Music 格式的源信息
  // 1. 尝试匹配 @name 格式 (JSDoc)
  const jsDocNameMatch = content.match(/@name\s+(.+)/)
  if (jsDocNameMatch) metadata.name = jsDocNameMatch[1].trim()
  else {
    // 2. 尝试匹配 name: "..." 格式
    const nameMatch = content.match(/name\s*:\s*['"](.+?)['"]/)
    if (nameMatch) metadata.name = nameMatch[1]
  }

  const jsDocVersionMatch = content.match(/@version\s+(.+)/)
  if (jsDocVersionMatch) metadata.version = jsDocVersionMatch[1].trim()
  else {
    const versionMatch = content.match(/version\s*:\s*['"](.+?)['"]/)
    if (versionMatch) metadata.version = versionMatch[1]
  }

  const jsDocAuthorMatch = content.match(/@author\s+(.+)/)
  if (jsDocAuthorMatch) metadata.author = jsDocAuthorMatch[1].trim()
  else {
    const authorMatch = content.match(/author\s*:\s*['"](.+?)['"]/)
    if (authorMatch) metadata.author = authorMatch[1]
  }

  const jsDocDescMatch = content.match(/@description\s+(.+)/)
  if (jsDocDescMatch) metadata.description = jsDocDescMatch[1].trim()
  else {
    const descMatch = content.match(/description\s*:\s*['"](.+?)['"]/)
    if (descMatch) metadata.description = descMatch[1]
  }

  // 从 URL 或脚本内容推断源名称
  if (metadata.name === 'Unknown Source') {
    // 尝试从脚本内容特征识别
    if (content.includes('flower') || content.includes('Flower')) {
      metadata.name = 'Flower 音乐源'
    } else if (content.includes('lx-music')) {
      metadata.name = 'LX Music 源'
    }
  }

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

  // 导入源（同时支持 URL 和脚本内容）
  ipcMain.handle('source:import', async (_event, scriptContentOrUrl: string) => {
    try {
      if (!scriptContentOrUrl) {
        throw new Error('Script content or URL is empty')
      }

      let scriptContent: string

      // 检查是否是 URL
      if (scriptContentOrUrl.startsWith('http://') || scriptContentOrUrl.startsWith('https://')) {
        console.log('[SourceIPC] Input is URL, downloading...')
        scriptContent = await fetchScriptFromUrl(scriptContentOrUrl)
      } else {
        scriptContent = scriptContentOrUrl
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
        console.log(`[SourceIPC] Source imported successfully: ${source.name} (${source.id})`)
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

  // 导入 URL 源（专门用于 URL 导入）
  ipcMain.handle('source:import-url', async (_event, url: string) => {
    try {
      if (!url) {
        throw new Error('URL is empty')
      }

      console.log('[SourceIPC] Importing source from URL:', url)

      // 步骤 1：下载脚本内容
      const scriptContent = await fetchScriptFromUrl(url)

      // 步骤 2：解析元数据
      const metadata = parseScriptMetadata(scriptContent)

      // 从 URL 推断更好的名称
      if (metadata.name === 'Unknown Source') {
        if (url.includes('flower')) {
          metadata.name = 'Flower 音乐源'
        } else if (url.includes('lx-music-source')) {
          metadata.name = 'LX Music 源'
        } else {
          // 从 URL 路径提取名称
          const urlPath = new URL(url).pathname
          const fileName = urlPath.split('/').pop()?.replace(/\.js$/, '') || 'Unknown'
          metadata.name = `自定义源 - ${fileName}`
        }
      }

      const id = randomUUID()
      const now = new Date().toISOString()

      const source = {
        id,
        name: metadata.name,
        version: metadata.version,
        description: metadata.description || `从 ${url} 导入`,
        icon: metadata.icon,
        author: metadata.author,
        scriptContent,
        enabled: true,
        supports: metadata.supports,
        importedAt: now,
        updatedAt: now
      }

      // 步骤 3：保存到数据库
      const success = sourceRepo.upsertSource(source)

      if (!success) {
        throw new Error('Failed to save source to database')
      }

      console.log(`[SourceIPC] Source saved: ${source.name} (${source.id})`)

      // 步骤 4：立即加载脚本到 Ghost Window
      const loadSuccess = await injectSourceScript(source.id, source.name, scriptContent)

      if (!loadSuccess) {
        console.warn('[SourceIPC] Source saved but failed to load into Ghost Window')
      }

      return {
        success: true,
        source: {
          id: source.id,
          name: source.name,
          version: source.version
        }
      }
    } catch (error) {
      console.error('[SourceIPC] Import URL failed:', error)
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

  // --- 日志和事件处理 ---

  // 接收隐形窗口发来的日志
  ipcMain.on('source-runner-log', (_, { type, args }) => {
    const prefix = `[GhostWindow ${type.toUpperCase()}]:`
    switch (type) {
      case 'log':
        console.log(prefix, ...args)
        break
      case 'error':
        console.error(prefix, ...args)
        break
      case 'warn':
        console.warn(prefix, ...args)
        break
    }
  })

  // 接收隐形窗口发来的搜索结果等事件
  ipcMain.on('source-runner-event', (_, { channel, data }) => {
    console.log('[SourceIPC] Received source-runner-event:', channel)

    // 如果是搜索结果，转发给渲染进程(UI)
    if (channel === 'search') {
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send('source:search-result', data)
      }
    }
  })

  console.log('[SourceIPC] Handlers initialized')
}
