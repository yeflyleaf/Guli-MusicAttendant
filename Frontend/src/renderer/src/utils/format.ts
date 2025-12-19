/**
 * 格式化工具
 */

/**
 * 格式化时长
 * @param seconds 秒数
 * @returns 格式化后的时间字符串 (mm:ss 或 hh:mm:ss)
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const pad = (num: number) => num.toString().padStart(2, '0')
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
  }
  
  return `${pad(minutes)}:${pad(secs)}`
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = bytes
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @returns 格式化后的日期
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间
 * @param dateStr 日期字符串
 * @returns 格式化后的日期时间
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化相对时间
 * @param dateStr 日期字符串
 * @returns 相对时间描述
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  
  return `${Math.floor(days / 365)}年前`
}

/**
 * 格式化播放次数
 * @param count 播放次数
 * @returns 格式化后的次数
 */
export function formatPlayCount(count: number): string {
  if (!count || count < 0) return '0'
  
  if (count < 1000) return count.toString()
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`
  if (count < 100000000) return `${Math.floor(count / 10000)}万`
  
  return `${(count / 100000000).toFixed(1)}亿`
}

/**
 * 格式化比特率
 * @param bitrate 比特率 (bit/s)
 * @returns 格式化后的比特率
 */
export function formatBitrate(bitrate: number | null | undefined): string {
  if (!bitrate) return '-'
  return `${Math.round(bitrate / 1000)} kbps`
}

/**
 * 格式化采样率
 * @param sampleRate 采样率 (Hz)
 * @returns 格式化后的采样率
 */
export function formatSampleRate(sampleRate: number | null | undefined): string {
  if (!sampleRate) return '-'
  return `${(sampleRate / 1000).toFixed(1)} kHz`
}
