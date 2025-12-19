/**
 * 本地文件扫描服务
 * 负责递归扫描文件夹，找出所有音频文件
 */
import fs from 'fs'
import path from 'path'
import * as musicRepo from '../db/repositories/music.repo'
import { getMusicFolders } from '../db/repositories/setting.repo'
import type { MusicCreateDTO, ScanResult } from '../types/music'
import { extractCover, parseMetadata } from './metadata.service'

// 支持的音频格式
const SUPPORTED_FORMATS = ['.mp3', '.flac', '.wav', '.aac', '.m4a', '.ogg', '.wma']

/**
 * 检查文件是否为支持的音频格式
 */
function isAudioFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return SUPPORTED_FORMATS.includes(ext)
}

/**
 * 递归扫描目录获取所有音频文件路径 (异步并行)
 * @param dirPath 目录路径
 */
async function scanDirectoryRecursive(dirPath: string): Promise<string[]> {
  const files: string[] = []
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })

    const tasks = entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // 跳过隐藏文件夹和系统文件夹
        if (!entry.name.startsWith('.') && !entry.name.startsWith('$')) {
          const subFiles = await scanDirectoryRecursive(fullPath)
          files.push(...subFiles)
        }
      } else if (entry.isFile() && isAudioFile(entry.name)) {
        files.push(fullPath)
      }
    })

    await Promise.all(tasks)
  } catch (error) {
    console.error(`[Scanner] Cannot read directory: ${dirPath}`, error)
  }

  return files
}

/**
 * 扫描单个目录并导入歌曲
 * @param dirPath 目录路径
 * @param onProgress 进度回调 (current, total, currentFile)
 */
export async function scanDirectory(
  dirPath: string,
  onProgress?: (current: number, total: number, currentFile: string) => void
): Promise<ScanResult> {
  const result: ScanResult = {
    total: 0,
    added: 0,
    skipped: 0,
    failed: 0,
    errors: []
  }

  console.log(`[Scanner] Starting scan: ${dirPath}`)

  // 检查目录是否存在
  if (!fs.existsSync(dirPath)) {
    result.errors.push(`Directory not found: ${dirPath}`)
    return result
  }

  // 1. 递归获取所有音频文件 (异步)
  const audioFiles = await scanDirectoryRecursive(dirPath)
  result.total = audioFiles.length

  console.log(`[Scanner] Found ${audioFiles.length} audio files`)

  // 2. 获取数据库中已存在的所有文件路径，用于快速排重
  const existingPaths = musicRepo.getAllMusicPaths()

  // 3. 并行处理文件
  const songsToAdd: MusicCreateDTO[] = []
  let processedCount = 0

  // 并发控制
  const CONCURRENCY = 10
  const queue = [...audioFiles]

  const worker = async () => {
    while (queue.length > 0) {
      const filePath = queue.shift()
      if (!filePath) break

      // 报告进度
      processedCount++
      if (onProgress) {
        onProgress(processedCount, audioFiles.length, path.basename(filePath))
      }

      // 检查是否已存在 (内存中检查，O(1))
      if (existingPaths.has(filePath)) {
        result.skipped++
        continue
      }

      try {
        // 解析元数据
        const metadata = await parseMetadata(filePath)
        const stats = await fs.promises.stat(filePath)

        // 尝试提取封面
        let coverPath: string | undefined
        if (metadata.cover) {
          coverPath = await extractCover(filePath, metadata.cover)
        }

        // 查找同目录下的歌词文件
        const lyricsPath = await findLyricsFile(filePath)

        const songData: MusicCreateDTO = {
          title: metadata.title || path.basename(filePath, path.extname(filePath)),
          artist: metadata.artist,
          album: metadata.album,
          duration: metadata.duration,
          filePath: filePath,
          fileSize: stats.size,
          format: metadata.format,
          bitrate: metadata.bitrate,
          sampleRate: metadata.sampleRate,
          coverPath,
          lyricsPath
        }

        songsToAdd.push(songData)

      } catch (error) {
        result.failed++
        const errorMsg = error instanceof Error ? error.message : String(error)
        result.errors.push(`${path.basename(filePath)}: ${errorMsg}`)
        console.error(`[Scanner] Failed to process file: ${filePath}`, error)
      }
    }
  }

  // 启动工作线程
  const workers = []
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker())
  }

  await Promise.all(workers)

  // 4. 批量写入数据库
  if (songsToAdd.length > 0) {
    try {
      const ids = musicRepo.createMusicBatch(songsToAdd)
      result.added = ids.length
      console.log(`[Scanner] Successfully added ${ids.length} songs`)
    } catch (error) {
      console.error('[Scanner] Batch database write failed', error)
      result.errors.push('Batch database write failed')
    }
  }

  console.log(`[Scanner] Scan complete: Total ${result.total}, Added ${result.added}, Skipped ${result.skipped}, Failed ${result.failed}`)

  return result
}

/**
 * 扫描所有配置的音乐文件夹
 */
export async function scanAllFolders(): Promise<ScanResult> {
  const folders = getMusicFolders()
  return scanDirectories(folders)
}

/**
 * 重置并扫描所有文件夹 (清空数据库后重新扫描)
 */
export async function resetAndScanAllFolders(): Promise<ScanResult> {
  // 清空所有音乐
  musicRepo.deleteAllMusic()
  console.log('[Scanner] All music deleted for full rescan')

  // 重新扫描
  return scanAllFolders()
}

/**
 * 扫描多个目录
 */
export async function scanDirectories(
  dirPaths: string[],
  onProgress?: (current: number, total: number, currentFile: string, currentDir: string) => void
): Promise<ScanResult> {
  const totalResult: ScanResult = {
    total: 0,
    added: 0,
    skipped: 0,
    failed: 0,
    errors: []
  }

  for (const dirPath of dirPaths) {
    const result = await scanDirectory(dirPath, (current, total, file) => {
      if (onProgress) {
        onProgress(current, total, file, dirPath)
      }
    })

    totalResult.total += result.total
    totalResult.added += result.added
    totalResult.skipped += result.skipped
    totalResult.failed += result.failed
    totalResult.errors.push(...result.errors)
  }

  return totalResult
}

/**
 * 查找歌词文件 (异步)
 * 在同目录下查找同名的 .lrc 文件
 */
async function findLyricsFile(audioPath: string): Promise<string | undefined> {
  const dir = path.dirname(audioPath)
  const baseName = path.basename(audioPath, path.extname(audioPath))

  // 尝试多种可能的歌词文件名
  const possibleNames = [
    `${baseName}.lrc`,
    `${baseName}.LRC`,
    `${baseName}.txt`
  ]

  for (const name of possibleNames) {
    const lrcPath = path.join(dir, name)
    try {
      await fs.promises.access(lrcPath)
      return lrcPath
    } catch {
      // ignore
    }
  }

  return undefined
}

/**
 * 重新扫描指定目录（删除该目录下不存在的歌曲，添加新歌曲）
 */
export async function rescanDirectory(dirPath: string): Promise<ScanResult> {
  // 首先获取数据库中该目录下的所有歌曲
  const musicInDir = musicRepo.getMusicByDirectory(dirPath)

  // 检查哪些文件已经不存在了 (并行检查)
  const deletedIds: number[] = []
  const checkTasks = musicInDir.map(async (music) => {
    try {
      await fs.promises.access(music.file_path)
    } catch {
      deletedIds.push(music.id)
    }
  })

  await Promise.all(checkTasks)

  // 删除不存在的歌曲
  if (deletedIds.length > 0) {
    musicRepo.deleteMusicBatch(deletedIds)
    console.log(`[Scanner] Deleted ${deletedIds.length} non-existent songs`)
  }

  // 扫描新歌曲
  return scanDirectory(dirPath)
}
