/**
 * 在线搜索状态管理
 * 完全独立于本地音乐库，不污染 library.store
 */
import type {
    DownloadProgress,
    OnlineMusic,
    OnlineSearchParams,
    OnlineSource
} from '@/types/online'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useOnlineStore = defineStore('online', () => {
  // ==================== 状态 ====================

  /** 搜索关键词 */
  const keyword = ref('')

  /** 当前选中的源 */
  const currentSource = ref('mock')

  /** 搜索结果列表 */
  const searchResults = ref<OnlineMusic[]>([])

  /** 搜索结果总数 */
  const totalResults = ref(0)

  /** 当前页码 */
  const currentPage = ref(1)

  /** 每页数量 */
  const pageSize = ref(30)

  /** 是否正在搜索 */
  const isSearching = ref(false)

  /** 搜索错误信息 */
  const searchError = ref<string | null>(null)

  /** 可用的音乐源列表 */
  const sources = ref<OnlineSource[]>([
    { id: 'mock', name: '测试源', enabled: true, isCustom: false }
  ])

  /** 下载进度映射表 */
  const downloadProgress = ref<Map<string, DownloadProgress>>(new Map())

  /** 当前正在获取播放链接的音乐ID */
  const loadingPlayUrl = ref<string | null>(null)

  // ==================== 计算属性 ====================

  /** 是否有搜索结果 */
  const hasResults = computed(() => searchResults.value.length > 0)

  /** 总页数 */
  const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value))

  /** 当前源信息 */
  const currentSourceInfo = computed(() =>
    sources.value.find(s => s.id === currentSource.value)
  )

  /** 启用的源列表 */
  const enabledSources = computed(() =>
    sources.value.filter(s => s.enabled)
  )

  // ==================== 方法 ====================

  /**
   * 执行搜索
   */
  async function search(params?: Partial<OnlineSearchParams>) {
    const searchKeyword = params?.keyword ?? keyword.value
    if (!searchKeyword.trim()) {
      searchError.value = '请输入搜索关键词'
      return
    }

    // 更新关键词
    keyword.value = searchKeyword.trim()

    // 更新源
    if (params?.source) {
      currentSource.value = params.source
    }

    // 更新页码
    if (params?.page) {
      currentPage.value = params.page
    } else {
      currentPage.value = 1
    }

    isSearching.value = true
    searchError.value = null

    try {
      const result = await window.electron.online.search({
        keyword: keyword.value,
        source: currentSource.value,
        page: currentPage.value,
        pageSize: pageSize.value
      })

      searchResults.value = result.list
      totalResults.value = result.total

    } catch (error) {
      console.error('[OnlineStore] Search failed:', error)
      searchError.value = error instanceof Error ? error.message : '搜索失败'
      searchResults.value = []
      totalResults.value = 0
    } finally {
      isSearching.value = false
    }
  }

  /**
   * 搜索下一页
   */
  async function searchNextPage() {
    if (currentPage.value < totalPages.value) {
      await search({ page: currentPage.value + 1 })
    }
  }

  /**
   * 搜索上一页
   */
  async function searchPrevPage() {
    if (currentPage.value > 1) {
      await search({ page: currentPage.value - 1 })
    }
  }

  /**
   * 跳转到指定页
   */
  async function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      await search({ page })
    }
  }

  /**
   * 获取播放链接
   */
  async function getPlayUrl(music: OnlineMusic): Promise<string | null> {
    if (music.playUrl) {
      return music.playUrl
    }

    loadingPlayUrl.value = music.id

    try {
      const url = await window.electron.online.getPlayUrl({
        id: music.id,
        source: music.source,
        quality: music.quality
      })

      // 更新结果列表中的 playUrl
      const index = searchResults.value.findIndex(m => m.id === music.id)
      if (index !== -1) {
        searchResults.value[index].playUrl = url
      }

      return url
    } catch (error) {
      console.error('[OnlineStore] Get play URL failed:', error)
      return null
    } finally {
      loadingPlayUrl.value = null
    }
  }

  /**
   * 下载音乐
   */
  async function downloadMusic(music: OnlineMusic): Promise<boolean> {
    // 初始化下载进度
    downloadProgress.value.set(music.id, {
      id: music.id,
      progress: 0,
      status: 'pending'
    })

    try {
      // 更新状态为下载中
      downloadProgress.value.set(music.id, {
        id: music.id,
        progress: 0,
        status: 'downloading'
      })

      const result = await window.electron.online.download({ music })

      // 更新状态为完成
      downloadProgress.value.set(music.id, {
        id: music.id,
        progress: 100,
        status: 'completed',
        localPath: result.localPath
      })

      return true
    } catch (error) {
      console.error('[OnlineStore] Download failed:', error)

      // 更新状态为失败
      downloadProgress.value.set(music.id, {
        id: music.id,
        progress: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : '下载失败'
      })

      return false
    }
  }

  /**
   * 获取下载进度
   */
  function getDownloadProgress(id: string): DownloadProgress | undefined {
    return downloadProgress.value.get(id)
  }

  /**
   * 清除搜索结果
   */
  function clearResults() {
    searchResults.value = []
    totalResults.value = 0
    currentPage.value = 1
    searchError.value = null
  }

  /**
   * 重置状态
   */
  function reset() {
    keyword.value = ''
    currentSource.value = 'mock'
    clearResults()
    downloadProgress.value.clear()
  }

  /**
   * 切换源
   */
  function setSource(sourceId: string) {
    if (sources.value.some(s => s.id === sourceId)) {
      currentSource.value = sourceId
    }
  }

  /**
   * 添加自定义源
   */
  function addCustomSource(source: OnlineSource) {
    if (!sources.value.some(s => s.id === source.id)) {
      sources.value.push({ ...source, isCustom: true })
    }
  }

  /**
   * 移除自定义源
   */
  function removeCustomSource(sourceId: string) {
    const index = sources.value.findIndex(s => s.id === sourceId && s.isCustom)
    if (index !== -1) {
      sources.value.splice(index, 1)
      // 如果删除的是当前源，切换回默认源
      if (currentSource.value === sourceId) {
        currentSource.value = 'mock'
      }
    }
  }

  return {
    // 状态
    keyword,
    currentSource,
    searchResults,
    totalResults,
    currentPage,
    pageSize,
    isSearching,
    searchError,
    sources,
    downloadProgress,
    loadingPlayUrl,

    // 计算属性
    hasResults,
    totalPages,
    currentSourceInfo,
    enabledSources,

    // 方法
    search,
    searchNextPage,
    searchPrevPage,
    goToPage,
    getPlayUrl,
    downloadMusic,
    getDownloadProgress,
    clearResults,
    reset,
    setSource,
    addCustomSource,
    removeCustomSource
  }
})
