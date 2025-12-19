export interface LyricLine {
  time: number
  text: string
}

/**
 * 解析 LRC 格式歌词
 * @param lrcContent LRC 文本内容
 */
export function parseLrc(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n')
  const result: LyricLine[] = []

  // 时间标签正则 [mm:ss.xx]
  const timeReg = /\[(\d{2}):(\d{2})(\.\d{2,3})?\]/g

  for (const line of lines) {
    const matches = [...line.matchAll(timeReg)]
    if (matches.length === 0) continue

    const text = line.replace(timeReg, '').trim()
    if (!text) continue

    for (const match of matches) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = match[3] ? parseFloat(match[3]) * 1000 : 0

      const time = minutes * 60 + seconds + milliseconds / 1000

      result.push({
        time,
        text
      })
    }
  }

  // 按时间排序
  result.sort((a, b) => a.time - b.time)

  return result
}
