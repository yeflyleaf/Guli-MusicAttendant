/**
 * 音频元数据解析服务
 * 使用 music-metadata 库解析音频文件的标签信息
 */
import crypto from 'crypto'
import { app } from 'electron'
import fs from 'fs'
import * as mm from 'music-metadata'
import path from 'path'
import type { AudioMetadata } from '../types/music'

/**
 * 获取封面图片存储目录
 */
function getCoverDirectory(): string {
  const isDev = !app.isPackaged
  let baseDir: string
  
  if (isDev) {
    baseDir = path.join(app.getAppPath(), 'data', 'covers')
  } else {
    baseDir = path.join(app.getPath('userData'), 'covers')
  }
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true })
  }
  
  return baseDir
}

/**
 * 解析音频文件元数据
 * @param filePath 音频文件路径
 */
export async function parseMetadata(filePath: string): Promise<AudioMetadata> {
  try {
    const metadata = await mm.parseFile(filePath, {
      duration: true,
      skipCovers: false
    })
    
    const result: AudioMetadata = {
      title: metadata.common.title,
      artist: metadata.common.artist || metadata.common.artists?.join(', '),
      album: metadata.common.album,
      duration: metadata.format.duration,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
      format: metadata.format.container
    }
    
    // 提取封面图片
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      result.cover = Buffer.from(metadata.common.picture[0].data)
    }
    
    // 提取内嵌歌词
    if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
      result.lyrics = metadata.common.lyrics[0]
    }
    
    return result
    
  } catch (error) {
    console.error(`[Metadata] Parse failed: ${filePath}`, error)
    throw error
  }
}

/**
 * 提取封面图片并保存到文件
 * @param audioPath 音频文件路径（用于生成唯一文件名）
 * @param coverData 封面图片数据
 * @returns 保存的封面图片路径
 */
export async function extractCover(audioPath: string, coverData: Buffer): Promise<string> {
  const coverDir = getCoverDirectory()
  
  // 使用音频文件路径的 hash 作为封面文件名，避免重复
  const hash = crypto.createHash('md5').update(audioPath).digest('hex')
  
  // 检测图片格式
  let ext = '.jpg'
  if (coverData[0] === 0x89 && coverData[1] === 0x50) {
    ext = '.png'
  } else if (coverData[0] === 0x47 && coverData[1] === 0x49) {
    ext = '.gif'
  }
  
  const coverPath = path.join(coverDir, `${hash}${ext}`)
  
  // 如果已存在则直接返回
  try {
    await fs.promises.access(coverPath)
    return coverPath
  } catch {
    // 文件不存在，继续写入
  }
  
  // 保存封面文件
  await fs.promises.writeFile(coverPath, coverData)
  console.log(`[Metadata] Cover saved: ${coverPath}`)
  
  return coverPath
}

/**
 * 读取歌词文件内容
 * @param lyricsPath 歌词文件路径
 */
export function readLyricsFile(lyricsPath: string): string | null {
  try {
    if (!fs.existsSync(lyricsPath)) {
      return null
    }
    
    // 尝试多种编码读取
    let content = fs.readFileSync(lyricsPath, 'utf-8')
    
    // 检查是否有乱码（简单检测）
    if (content.includes('�')) {
      // 尝试 GBK 编码（需要 iconv-lite，这里简化处理）
      console.warn(`[Metadata] Lyrics file may be non-UTF-8 encoded: ${lyricsPath}`)
    }
    
    return content
    
  } catch (error) {
    console.error(`[Metadata] Failed to read lyrics file: ${lyricsPath}`, error)
    return null
  }
}

/**
 * 获取音频文件时长（快速方法，只读取必要信息）
 */
export async function getDuration(filePath: string): Promise<number> {
  try {
    const metadata = await mm.parseFile(filePath, {
      duration: true,
      skipCovers: true
    })
    return metadata.format.duration || 0
  } catch {
    return 0
  }
}

/**
 * 批量获取元数据（使用流式解析提升性能）
 */
export async function parseMetadataBatch(
  filePaths: string[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, AudioMetadata>> {
  const results = new Map<string, AudioMetadata>()
  
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i]
    
    try {
      const metadata = await parseMetadata(filePath)
      results.set(filePath, metadata)
    } catch {
      // 解析失败的文件跳过
    }
    
    if (onProgress) {
      onProgress(i + 1, filePaths.length)
    }
  }
  
  return results
}
