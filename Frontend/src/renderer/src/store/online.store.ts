/**
 * 在线搜索状态管理
 * 完全独立于本地音乐库，不污染 library.store
 * 与 source.store 协同工作，使用自定义源进行搜索
 */
import type {
    DownloadProgress,
    OnlineMusic,
    OnlineSearchParams
} from '@/types/online'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSourceStore } from './source.store'

export const useOnlineStore = defineStore('online', () => {
  // 获取源管理 store
  const sourceStore = useSourceStore()

  // ==================== 状态 ====================

  /** 搜索关键词 */
  const keyword = ref('')

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

  /** 下载进度映射表 */
  const downloadProgress = ref<Map<string, DownloadProgress>>(new Map())

  /** 当前正在获取播放链接的音乐ID */
  const loadingPlayUrl = ref<string | null>(null)

  // ==================== 计算属性 ====================

  /** 是否有搜索结果 */
  const hasResults = computed(() => searchResults.value.length > 0)

  /** 总页数 */
  const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value))

  /** 当前选中的源（从 sourceStore 获取） */
  const currentSource = computed(() => sourceStore.currentSourceId)

  /** 当前源信息 */
  const currentSourceInfo = computed(() => sourceStore.currentSource)

  /** 启用的源列表 */
  const enabledSources = computed(() => sourceStore.enabledSources)

  /** 是否有可用源 */
  const hasAvailableSources = computed(() => sourceStore.hasEnabledSources)

  // ==================== 方法 ====================

  /**
   * 初始化：加载源
   */
  async function initialize(): Promise<void> {
    await sourceStore.loadSources()
  }

  /**
   * 执行搜索
   */
  async function search(params?: Partial<OnlineSearchParams>) {
    const searchKeyword = params?.keyword ?? keyword.value
    if (!searchKeyword.trim()) {
      searchError.value = '请输入搜索关键词'
      return
    }

    // 检查是否有可用源
    if (!hasAvailableSources.value) {
      searchError.value = '没有可用的音乐源，请先导入源脚本'
      return
    }

    // 使用传入的源或当前选中的源
    const sourceId = params?.source ?? sourceStore.currentSourceId
    if (!sourceId) {
      searchError.value = '请选择一个音乐源'
      return
    }

    // 更新关键词
    keyword.value = searchKeyword.trim()

    // 更新源
    if (params?.source) {
      sourceStore.setCurrentSource(params.source)
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
        source: sourceId,
        page: currentPage.value,
        pageSize: pageSize.value
      })

      // 为每个结果添加源信息
      searchResults.value = result.list.map(item => ({
        ...item,
        source: sourceId
      }))
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
        quality: music.quality,
        extra: music.extra
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
      // 先获取播放链接
      let playUrl = music.playUrl
      if (!playUrl) {
        playUrl = await getPlayUrl(music)
        if (!playUrl) {
          throw new Error('无法获取播放链接')
        }
      }

      // 更新状态为下载中
      downloadProgress.value.set(music.id, {
        id: music.id,
        progress: 0,
        status: 'downloading'
      })

      const result = await window.electron.online.download({
        music: { ...music, playUrl }
      })

      if (!result.success) {
        throw new Error(result.error || '下载失败')
      }

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
    clearResults()
    downloadProgress.value.clear()
  }

  /**
   * 切换源
   */
  function setSource(sourceId: string) {
    sourceStore.setCurrentSource(sourceId)
  }

  return {
    // 状态
    keyword,
    searchResults,
    totalResults,
    currentPage,
    pageSize,
    isSearching,
    searchError,
    downloadProgress,
    loadingPlayUrl,

    // 计算属性
    hasResults,
    totalPages,
    currentSource,
    currentSourceInfo,
    enabledSources,
    hasAvailableSources,

    // 方法
    initialize,
    search,
    searchNextPage,
    searchPrevPage,
    goToPage,
    getPlayUrl,
    downloadMusic,
    getDownloadProgress,
    clearResults,
    reset,
    setSource
  }
})
