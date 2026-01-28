export interface LyricLine {
  time: number
  text: string
  translation?: string // 中文翻译（可选）
}

/**
 * 检测文本是否主要包含中文字符
 * @param text 要检测的文本
 * @returns 如果文本主要是中文则返回 true
 */
function isMainlyChinese(text: string): boolean {
  // 移除空格和标点后检测
  const cleanText = text.replace(/[\s\p{P}]/gu, '')
  if (cleanText.length === 0) return false

  // 统计中文字符数量
  const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || []
  // 如果中文字符占比超过 50%，认为是中文
  return chineseChars.length / cleanText.length > 0.5
}

/**
 * 合并同一时间戳的双语歌词
 * 将中文翻译合并到外语主行的 translation 字段
 * @param lines 原始歌词行数组
 * @returns 合并后的歌词行数组
 */
function mergeBilingualLyrics(lines: LyricLine[]): LyricLine[] {
  if (lines.length === 0) return lines

  const result: LyricLine[] = []
  let i = 0

  while (i < lines.length) {
    const current = lines[i]
    const next = lines[i + 1]

    // 检查是否有同一时间戳的下一行（允许 0.01 秒的误差）
    if (next && Math.abs(current.time - next.time) < 0.01) {
      const currentIsChinese = isMainlyChinese(current.text)
      const nextIsChinese = isMainlyChinese(next.text)

      if (currentIsChinese && !nextIsChinese) {
        // 当前行是中文，下一行是外语 -> 外语为主，中文为翻译
        result.push({
          time: next.time,
          text: next.text,
          translation: current.text
        })
        i += 2
        continue
      } else if (!currentIsChinese && nextIsChinese) {
        // 当前行是外语，下一行是中文 -> 外语为主，中文为翻译
        result.push({
          time: current.time,
          text: current.text,
          translation: next.text
        })
        i += 2
        continue
      }
      // 如果两行都是同一语言，不合并，正常处理
    }

    // 单行歌词，直接添加
    result.push(current)
    i++
  }

  return result
}

/**
 * 解析 LRC 格式歌词
 * @param lrcContent LRC 文本内容
 * @returns 解析后的歌词行数组（自动合并双语歌词）
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

  // 合并双语歌词
  return mergeBilingualLyrics(result)
}
