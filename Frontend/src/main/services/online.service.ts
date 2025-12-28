/**
 * 在线音乐服务
 * 提供在线搜索、获取播放链接等功能
 * 完全独立于本地音乐管理
 */

// ==================== 类型定义 ====================

export interface OnlineMusic {
  id: string
  name: string
  artist: string
  album?: string
  duration?: number
  cover?: string
  source: string
  quality?: string
  playUrl?: string
  size?: number
}

export interface OnlineSearchResult {
  list: OnlineMusic[]
  total: number
  source: string
  page?: number
  pageSize?: number
}

export interface OnlineSearchParams {
  keyword: string
  source: string
  page?: number
  pageSize?: number
}

export interface GetPlayUrlParams {
  id: string
  source: string
  quality?: string
}

export interface DownloadParams {
  music: OnlineMusic
  targetDir?: string
}

export interface DownloadResult {
  success: boolean
  localPath?: string
  error?: string
}

// ==================== Mock 数据 ====================

/**
 * 生成 Mock 搜索结果
 * 用于开发测试，后续会替换为真实的源脚本调用
 */
function generateMockResults(keyword: string, page: number = 1, pageSize: number = 30): OnlineSearchResult {
  const mockSongs = [
    { name: '晴天', artist: '周杰伦', album: '叶惠美' },
    { name: '稻香', artist: '周杰伦', album: '魔杰座' },
    { name: '七里香', artist: '周杰伦', album: '七里香' },
    { name: '夜曲', artist: '周杰伦', album: '十一月的肖邦' },
    { name: '青花瓷', artist: '周杰伦', album: '我很忙' },
    { name: '告白气球', artist: '周杰伦', album: '周杰伦的床边故事' },
    { name: '简单爱', artist: '周杰伦', album: '范特西' },
    { name: '以父之名', artist: '周杰伦', album: '叶惠美' },
    { name: '双截棍', artist: '周杰伦', album: '范特西' },
    { name: '本草纲目', artist: '周杰伦', album: '依然范特西' },
    { name: '搁浅', artist: '周杰伦', album: '七里香' },
    { name: '退后', artist: '周杰伦', album: '依然范特西' },
    { name: '霍元甲', artist: '周杰伦', album: '霍元甲' },
    { name: '千里之外', artist: '周杰伦/费玉清', album: '依然范特西' },
    { name: '菊花台', artist: '周杰伦', album: '依然范特西' },
    { name: '听妈妈的话', artist: '周杰伦', album: '依然范特西' },
    { name: '发如雪', artist: '周杰伦', album: '十一月的肖邦' },
    { name: '珊瑚海', artist: '周杰伦/Lara', album: '十一月的肖邦' },
    { name: '不能说的秘密', artist: '周杰伦', album: '不能说的秘密电影原声带' },
    { name: '彩虹', artist: '周杰伦', album: '我很忙' },
    { name: '甜甜的', artist: '周杰伦', album: '我很忙' },
    { name: '蒲公英的约定', artist: '周杰伦', album: '我很忙' },
    { name: '给我一首歌的时间', artist: '周杰伦', album: '魔杰座' },
    { name: '说好的幸福呢', artist: '周杰伦', album: '魔杰座' },
    { name: '烟花易冷', artist: '周杰伦', album: '跨时代' },
    { name: '爱在西元前', artist: '周杰伦', album: '范特西' },
    { name: '安静', artist: '周杰伦', album: '范特西' },
    { name: '龙卷风', artist: '周杰伦', album: 'Jay' },
    { name: '可爱女人', artist: '周杰伦', album: 'Jay' },
    { name: '星晴', artist: '周杰伦', album: 'Jay' }
  ]

  // 根据关键词筛选（模糊匹配）
  const filtered = mockSongs.filter(song =>
    song.name.toLowerCase().includes(keyword.toLowerCase()) ||
    song.artist.toLowerCase().includes(keyword.toLowerCase()) ||
    song.album.toLowerCase().includes(keyword.toLowerCase())
  )

  // 如果没有匹配，返回全部（模拟广泛搜索）
  const results = filtered.length > 0 ? filtered : mockSongs

  // 分页处理
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedResults = results.slice(start, end)

  // 转换为 OnlineMusic 格式
  const list: OnlineMusic[] = paginatedResults.map((song, index) => ({
    id: `mock_${start + index + 1}`,
    name: song.name,
    artist: song.artist,
    album: song.album,
    duration: 180 + Math.floor(Math.random() * 120), // 3-5分钟随机时长
    cover: '', // Mock 数据没有封面
    source: 'mock',
    quality: '320k',
    size: 8 * 1024 * 1024 + Math.floor(Math.random() * 4 * 1024 * 1024) // 8-12MB
  }))

  return {
    list,
    total: results.length,
    source: 'mock',
    page,
    pageSize
  }
}

/**
 * 生成 Mock 播放链接
 * 使用公共测试音频 URL
 */
function generateMockPlayUrl(id: string): string {
  // 使用 SampleLib 的免费音频样本（公共域）
  const mockUrls = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  ]

  // 根据 ID 选择一个 URL（保持一致性）
  const numId = parseInt(id.replace('mock_', ''), 10) || 1
  return mockUrls[(numId - 1) % mockUrls.length]
}

// ==================== 服务方法 ====================

/**
 * 在线搜索
 */
export async function search(params: OnlineSearchParams): Promise<OnlineSearchResult> {
  console.log('[OnlineService] Searching:', params)

  const { keyword, source, page = 1, pageSize = 30 } = params

  // 当前仅支持 Mock 源
  if (source === 'mock') {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    return generateMockResults(keyword, page, pageSize)
  }

  // TODO: 支持其他源（通过源脚本执行）
  throw new Error(`不支持的音乐源: ${source}`)
}

/**
 * 获取播放链接
 */
export async function getPlayUrl(params: GetPlayUrlParams): Promise<string> {
  console.log('[OnlineService] Getting play URL:', params)

  const { id, source } = params

  // 当前仅支持 Mock 源
  if (source === 'mock') {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    return generateMockPlayUrl(id)
  }

  // TODO: 支持其他源
  throw new Error(`不支持的音乐源: ${source}`)
}

/**
 * 下载音乐
 * 委托给 download.service 处理
 */
export async function downloadMusic(params: DownloadParams): Promise<DownloadResult> {
  console.log('[OnlineService] Downloading:', params)

  // 委托给下载服务处理
  const downloadService = await import('./download.service')
  return downloadService.downloadMusic(params)
}

