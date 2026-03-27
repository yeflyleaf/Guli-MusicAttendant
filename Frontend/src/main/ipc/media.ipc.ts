/**
 * 媒体相关 IPC 处理器
 * 提供封面图 base64 读取等功能，供 MediaSession API 使用
 */
import { ipcMain } from 'electron'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

// 支持的图片扩展名
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']

// 扩展名到 MIME 类型
const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp'
}

export function setupMediaIpc(): void {
  /**
   * 读取封面图片文件并返回 data URL (base64)
   * 用于 MediaSession artwork，因为 Windows SMTC 无法访问自定义协议
   */
  ipcMain.handle('media:getCoverDataUrl', async (_event, filePath: string): Promise<string | null> => {
    try {
      if (!filePath || filePath.length < 5) {
        return null
      }

      // 规范化路径
      const normalizedPath = path.normalize(filePath)

      // 检查文件是否存在
      if (!existsSync(normalizedPath)) {
        console.warn('[Media IPC] Cover file not found:', normalizedPath)
        return null
      }

      // 检查扩展名
      const ext = path.extname(normalizedPath).toLowerCase()
      if (!IMAGE_EXTENSIONS.includes(ext)) {
        console.warn('[Media IPC] Unsupported cover format:', ext)
        return null
      }

      // 读取文件为 Buffer 并转 base64
      const buffer = readFileSync(normalizedPath)
      const mimeType = MIME_MAP[ext] || 'image/png'
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${mimeType};base64,${base64}`

      console.log('[Media IPC] Cover loaded:', normalizedPath, `(${Math.round(buffer.length / 1024)}KB)`)
      return dataUrl
    } catch (error) {
      console.error('[Media IPC] Failed to read cover file:', error)
      return null
    }
  })

  console.log('[Media IPC] Media IPC handlers registered')
}
