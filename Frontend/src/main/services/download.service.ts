/**
 * 下载服务
 * 负责从网络下载音频文件到本地
 */
import { app } from 'electron'
import fs from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'
import { getMusicFolders } from '../db/repositories/setting.repo'
import type { DownloadResult, OnlineMusic } from './online.service'
import { scanDirectory } from './scanner.service'

// 重新导出类型
export type { DownloadResult }

/**
 * 下载参数
 */
export interface DownloadParams {
  music: OnlineMusic
  targetDir?: string
}

/**
 * 下载进度回调
 */
export type DownloadProgressCallback = (progress: number, downloaded: number, total: number) => void

/**
 * 获取下载目录
 * 优先使用用户配置的第一个音乐文件夹,否则使用默认下载目录
 */
function getDownloadDirectory(): string {
  const musicFolders = getMusicFolders()

  if (musicFolders.length > 0) {
    // 使用第一个音乐文件夹作为下载目录
    return musicFolders[0]
  }

  // 默认下载目录
  const defaultDir = path.join(app.getPath('music'), 'GL_Music_Downloads')

  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true })
  }

  return defaultDir
}

/**
 * 生成安全的文件名
 * 移除文件名中的非法字符
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')   // 替换 Windows 非法字符
    .replace(/\s+/g, ' ')            // 合并多个空格
    .trim()
    .slice(0, 200)                   // 限制长度
}

/**
 * 从 URL 获取文件扩展名
 */
function getExtensionFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const ext = path.extname(pathname).toLowerCase()

    // 常见音频格式
    const audioExtensions = ['.mp3', '.flac', '.wav', '.aac', '.m4a', '.ogg', '.wma']

    if (audioExtensions.includes(ext)) {
      return ext
    }
  } catch {
    // URL 解析失败
  }

  // 默认使用 mp3
  return '.mp3'
}

/**
 * 下载文件
 */
async function downloadFile(
  url: string,
  destPath: string,
  onProgress?: DownloadProgressCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http

    const request = protocol.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          downloadFile(redirectUrl, destPath, onProgress)
            .then(resolve)
            .catch(reject)
          return
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        return
      }

      const totalSize = parseInt(response.headers['content-length'] || '0', 10)
      let downloadedSize = 0

      const file = fs.createWriteStream(destPath)

      response.on('data', (chunk) => {
        downloadedSize += chunk.length
        if (onProgress && totalSize > 0) {
          const progress = Math.round((downloadedSize / totalSize) * 100)
          onProgress(progress, downloadedSize, totalSize)
        }
      })

      response.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve()
      })

      file.on('error', (err) => {
        fs.unlink(destPath, () => {}) // 删除不完整的文件
        reject(err)
      })
    })

    request.on('error', (err) => {
      reject(err)
    })

    // 设置超时
    request.setTimeout(60000, () => {
      request.destroy()
      reject(new Error('Download timeout'))
    })
  })
}

/**
 * 下载在线音乐
 */
export async function downloadMusic(params: DownloadParams): Promise<DownloadResult> {
  const { music, targetDir } = params

  console.log('[DownloadService] Starting download:', music.name)

  // 首先获取播放链接（如果还没有）
  let playUrl = music.playUrl
  if (!playUrl) {
    // 需要先获取播放链接
    const { getPlayUrl } = await import('./online.service')
    playUrl = await getPlayUrl({
      id: music.id,
      source: music.source,
      quality: music.quality
    })
  }

  if (!playUrl) {
    return {
      success: false,
      error: '无法获取下载链接'
    }
  }

  // 确定下载目录
  const downloadDir = targetDir || getDownloadDirectory()

  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true })
  }

  // 生成文件名
  const artist = sanitizeFilename(music.artist || '未知歌手')
  const songName = sanitizeFilename(music.name)
  const ext = getExtensionFromUrl(playUrl)
  const filename = `${artist} - ${songName}${ext}`
  const destPath = path.join(downloadDir, filename)

  // 检查文件是否已存在
  if (fs.existsSync(destPath)) {
    console.log('[DownloadService] File already exists:', destPath)
    return {
      success: true,
      localPath: destPath
    }
  }

  try {
    // 下载文件
    console.log('[DownloadService] Downloading to:', destPath)
    await downloadFile(playUrl, destPath, (progress, downloaded, total) => {
      console.log(`[DownloadService] Progress: ${progress}% (${downloaded}/${total})`)
    })

    console.log('[DownloadService] Download completed:', destPath)

    // 触发扫描以入库
    try {
      console.log('[DownloadService] Triggering scan to import song...')
      const scanResult = await scanDirectory(downloadDir)
      console.log('[DownloadService] Scan result:', scanResult)
    } catch (scanError) {
      console.error('[DownloadService] Scan failed:', scanError)
      // 扫描失败不影响下载结果
    }

    return {
      success: true,
      localPath: destPath
    }

  } catch (error) {
    console.error('[DownloadService] Download failed:', error)

    // 清理不完整的文件
    if (fs.existsSync(destPath)) {
      try {
        fs.unlinkSync(destPath)
      } catch {
        // 忽略清理错误
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '下载失败'
    }
  }
}
