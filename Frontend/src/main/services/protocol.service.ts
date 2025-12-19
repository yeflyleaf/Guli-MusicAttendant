/**
 * 自定义协议服务
 * 用于安全地访问本地音频文件
 */
import { net, protocol } from 'electron'
import { createReadStream, existsSync, statSync } from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

// 支持的音频文件扩展名
const AUDIO_EXTENSIONS = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.ape']
// 支持的图片文件扩展名
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']

// MIME 类型映射
const MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.wav': 'audio/wav',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.wma': 'audio/x-ms-wma',
  '.ape': 'audio/ape',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp'
}

/**
 * 获取文件的 MIME 类型
 */
function getMimeType(ext: string): string {
  return MIME_TYPES[ext] || 'application/octet-stream'
}

/**
 * 注册自定义协议 'local-audio' 用于访问本地音频文件
 * 使用方式: local-audio://path/to/file.mp3
 */
export function registerLocalAudioProtocol(): void {
  // 注册为标准协议（支持 fetch, XHR 等）
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'local-audio',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        bypassCSP: true
      }
    },
    {
      scheme: 'local-image',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        bypassCSP: true
      }
    }
  ])
}

/**
 * 在 app ready 后注册协议处理器
 */
export function setupProtocolHandlers(): void {
  // 处理 local-audio 协议 (支持 Range 请求以实现音频跳转)
  protocol.handle('local-audio', async (request) => {
    try {
      // 从 URL 中提取文件路径
      // URL 格式: local-audio://D:/path/to/file.mp3 或 local-audio://d/path/to/file.mp3
      let filePath = decodeURIComponent(request.url.replace('local-audio://', ''))

      // 处理前导斜杠（Windows 路径）
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1)
      }

      // 恢复 Windows 驱动器号的冒号
      // 如果路径以 "d/" 或 "D/" 格式开头（单字母后跟斜杠），添加冒号
      if (/^[a-zA-Z]\//.test(filePath)) {
        filePath = filePath[0] + ':' + filePath.substring(1)
      }

      // 规范化路径
      filePath = path.normalize(filePath)

      // 验证文件扩展名
      const ext = path.extname(filePath).toLowerCase()
      if (!AUDIO_EXTENSIONS.includes(ext)) {
        console.error('[Protocol] Unsupported audio format:', ext)
        return new Response('Unsupported audio format', { status: 415 })
      }

      // 验证文件是否存在
      if (!existsSync(filePath)) {
        console.error('[Protocol] File not found:', filePath)
        return new Response('File not found', { status: 404 })
      }

      // 获取文件大小
      const stat = statSync(filePath)
      const fileSize = stat.size

      // 检查是否有 Range 请求头
      const rangeHeader = request.headers.get('Range')

      if (rangeHeader) {
        // 解析 Range 头 (格式: bytes=start-end)
        const match = rangeHeader.match(/bytes=(\d*)-(\d*)/)
        if (match) {
          const start = match[1] ? parseInt(match[1], 10) : 0
          const end = match[2] ? parseInt(match[2], 10) : fileSize - 1

          // 验证范围有效性
          if (start >= fileSize || end >= fileSize || start > end) {
            return new Response('Range Not Satisfiable', {
              status: 416,
              headers: {
                'Content-Range': `bytes */${fileSize}`
              }
            })
          }

          const chunkSize = end - start + 1

          // 使用 createReadStream 读取指定范围
          const stream = createReadStream(filePath, { start, end })

          // 返回 206 Partial Content
          return new Response(stream as unknown as ReadableStream, {
            status: 206,
            headers: {
              'Content-Type': getMimeType(ext),
              'Content-Length': chunkSize.toString(),
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes'
            }
          })
        }
      }

      // 无 Range 请求，返回完整文件
      const stream = createReadStream(filePath)
      return new Response(stream as unknown as ReadableStream, {
        status: 200,
        headers: {
          'Content-Type': getMimeType(ext),
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes'
        }
      })
    } catch (error) {
      console.error('[Protocol] Failed to load audio file:', error)
      return new Response('Internal error', { status: 500 })
    }
  })

  // 处理 local-image 协议
  protocol.handle('local-image', async (request) => {
    try {
      let filePath = decodeURIComponent(request.url.replace('local-image://', ''))

      // 处理前导斜杠
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1)
      }

      // 恢复 Windows 驱动器号的冒号
      if (/^[a-zA-Z]\//.test(filePath)) {
        filePath = filePath[0] + ':' + filePath.substring(1)
      }

      filePath = path.normalize(filePath)

      const ext = path.extname(filePath).toLowerCase()
      if (!IMAGE_EXTENSIONS.includes(ext)) {
        console.error('[Protocol] Unsupported image format:', ext)
        return new Response('Unsupported image format', { status: 415 })
      }

      if (!existsSync(filePath)) {
        console.error('[Protocol] Image file not found:', filePath)
        return new Response('File not found', { status: 404 })
      }

      const fileUrl = pathToFileURL(filePath).href
      return net.fetch(fileUrl)
    } catch (error) {
      console.error('[Protocol] Failed to load image file:', error)
      return new Response('Internal error', { status: 500 })
    }
  })

  console.log('[Protocol] Custom protocol handlers registered')
}

/**
 * 将本地文件路径转换为 local-audio 协议 URL
 */
export function getLocalAudioUrl(filePath: string): string {
  // 确保路径使用正斜杠
  const normalizedPath = filePath.replace(/\\/g, '/')
  return `local-audio://${normalizedPath}`
}

/**
 * 将本地文件路径转换为 local-image 协议 URL
 */
export function getLocalImageUrl(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/')
  return `local-image://${normalizedPath}`
}
