/**
 * LRC 歌词解析器
 * 解析 LRC 格式的歌词文件
 */

// 歌词行
export interface LyricLine {
  time: number      // 时间（秒）
  text: string      // 歌词文本
}

// 歌词元信息
export interface LyricMeta {
  title?: string    // 标题 [ti:xxx]
  artist?: string   // 艺术家 [ar:xxx]
  album?: string    // 专辑 [al:xxx]
  author?: string   // 歌词作者 [by:xxx]
  offset?: number   // 时间偏移 [offset:xxx]
}

// 解析结果
export interface ParsedLyrics {
  meta: LyricMeta
  lines: LyricLine[]
}

/**
 * 解析时间标签 [mm:ss.xx] 或 [mm:ss:xx]
 * @param timeStr 时间字符串
 * @returns 秒数
 */
function parseTime(timeStr: string): number {
  // 匹配 [mm:ss.xx] 或 [mm:ss:xx] 或 [mm:ss]
  const match = timeStr.match(/\[(\d{1,2}):(\d{2})([.:]\d{1,3})?\]/)
  if (!match) return -1
  
  const minutes = parseInt(match[1], 10)
  const seconds = parseInt(match[2], 10)
  const ms = match[3] ? parseFloat('0' + match[3].replace(':', '.')) : 0
  
  return minutes * 60 + seconds + ms
}

/**
 * 解析元信息标签
 * @param line 行内容
 * @param meta 元信息对象
 */
function parseMeta(line: string, meta: LyricMeta): boolean {
  const metaMatch = line.match(/^\[(ti|ar|al|by|offset):([^\]]*)\]/)
  if (!metaMatch) return false
  
  const [, tag, value] = metaMatch
  switch (tag) {
    case 'ti':
      meta.title = value.trim()
      break
    case 'ar':
      meta.artist = value.trim()
      break
    case 'al':
      meta.album = value.trim()
      break
    case 'by':
      meta.author = value.trim()
      break
    case 'offset':
      meta.offset = parseInt(value.trim(), 10)
      break
  }
  
  return true
}

/**
 * 解析 LRC 歌词
 * @param lrcContent LRC 文件内容
 * @returns 解析结果
 */
export function parseLyrics(lrcContent: string): ParsedLyrics {
  const result: ParsedLyrics = {
    meta: {},
    lines: []
  }
  
  if (!lrcContent) return result
  
  // 按行分割
  const lines = lrcContent.split(/\r?\n/)
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    
    // 尝试解析元信息
    if (parseMeta(trimmedLine, result.meta)) {
      continue
    }
    
    // 解析歌词行
    // 支持多时间标签 [00:01.00][00:15.00]歌词内容
    const timeMatches = trimmedLine.match(/\[\d{1,2}:\d{2}([.:]\d{1,3})?\]/g)
    if (!timeMatches) continue
    
    // 获取歌词文本（去除所有时间标签）
    const text = trimmedLine.replace(/\[\d{1,2}:\d{2}([.:]\d{1,3})?\]/g, '').trim()
    if (!text) continue
    
    // 为每个时间标签创建一行
    for (const timeMatch of timeMatches) {
      const time = parseTime(timeMatch)
      if (time >= 0) {
        result.lines.push({ time, text })
      }
    }
  }
  
  // 按时间排序
  result.lines.sort((a, b) => a.time - b.time)
  
  // 应用时间偏移
  if (result.meta.offset) {
    const offsetSec = result.meta.offset / 1000
    result.lines = result.lines.map(line => ({
      ...line,
      time: line.time + offsetSec
    }))
  }
  
  return result
}

/**
 * 根据当前时间获取对应的歌词行索引
 * @param lines 歌词行数组
 * @param currentTime 当前时间（秒）
 * @returns 当前歌词行索引
 */
export function getCurrentLineIndex(lines: LyricLine[], currentTime: number): number {
  if (lines.length === 0) return -1
  
  // 二分查找
  let left = 0
  let right = lines.length - 1
  let result = -1
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    
    if (lines[mid].time <= currentTime) {
      result = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  
  return result
}

/**
 * 将歌词解析结果转换为纯文本
 * @param lyrics 解析结果
 * @returns 纯文本歌词
 */
export function lyricsToText(lyrics: ParsedLyrics): string {
  return lyrics.lines.map(line => line.text).join('\n')
}

/**
 * 生成 LRC 格式内容
 * @param lyrics 解析结果
 * @returns LRC 格式字符串
 */
export function toLrcString(lyrics: ParsedLyrics): string {
  const lines: string[] = []
  
  // 添加元信息
  if (lyrics.meta.title) lines.push(`[ti:${lyrics.meta.title}]`)
  if (lyrics.meta.artist) lines.push(`[ar:${lyrics.meta.artist}]`)
  if (lyrics.meta.album) lines.push(`[al:${lyrics.meta.album}]`)
  if (lyrics.meta.author) lines.push(`[by:${lyrics.meta.author}]`)
  
  // 添加歌词行
  for (const line of lyrics.lines) {
    const minutes = Math.floor(line.time / 60)
    const seconds = (line.time % 60).toFixed(2)
    lines.push(`[${minutes.toString().padStart(2, '0')}:${seconds.padStart(5, '0')}]${line.text}`)
  }
  
  return lines.join('\n')
}
