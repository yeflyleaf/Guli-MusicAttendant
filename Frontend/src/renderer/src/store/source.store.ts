/**
 * 音乐源状态管理
 * 管理自定义音乐源的加载、导入和切换
 */
import type { ImportResult, MusicSource } from '@/types/source'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSourceStore = defineStore('source', () => {
  // ==================== 状态 ====================

  /** 所有音乐源 */
  const sources = ref<MusicSource[]>([])

  /** 当前选中的源ID */
  const currentSourceId = ref<string>('')

  /** 是否正在加载 */
  const isLoading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  // ==================== 计算属性 ====================

  /** 启用的源列表 */
  const enabledSources = computed(() =>
    sources.value.filter(s => s.enabled)
  )

  /** 当前选中的源 */
  const currentSource = computed(() =>
    sources.value.find(s => s.id === currentSourceId.value)
  )

  /** 是否有可用的源 */
  const hasEnabledSources = computed(() =>
    enabledSources.value.length > 0
  )

  // ==================== 方法 ====================

  /**
   * 加载所有源
   */
  async function loadSources(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      sources.value = await window.electron.source.getAll()

      // 如果没有选中的源，选择第一个启用的源
      if (!currentSourceId.value && enabledSources.value.length > 0) {
        currentSourceId.value = enabledSources.value[0].id
      }
    } catch (err) {
      console.error('[SourceStore] Failed to load sources:', err)
      error.value = err instanceof Error ? err.message : '加载源失败'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 导入源脚本
   */
  async function importSource(scriptContent: string): Promise<ImportResult> {
    isLoading.value = true
    error.value = null

    try {
      const result = await window.electron.source.import(scriptContent)

      if (result.success) {
        // 重新加载源列表
        await loadSources()

        // 自动选择新导入的源
        if (result.source) {
          currentSourceId.value = result.source.id
        }
      }

      return result
    } catch (err) {
      console.error('[SourceStore] Failed to import source:', err)
      const errorMsg = err instanceof Error ? err.message : '导入失败'
      error.value = errorMsg
      return { success: false, error: errorMsg }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除源
   */
  async function deleteSource(sourceId: string): Promise<boolean> {
    try {
      const deleted = await window.electron.source.delete(sourceId)

      if (deleted) {
        sources.value = sources.value.filter(s => s.id !== sourceId)

        // 如果删除的是当前源，切换到第一个可用源
        if (currentSourceId.value === sourceId) {
          currentSourceId.value = enabledSources.value[0]?.id || ''
        }
      }

      return deleted
    } catch (err) {
      console.error('[SourceStore] Failed to delete source:', err)
      return false
    }
  }

  /**
   * 切换源启用状态
   */
  async function toggleSource(sourceId: string): Promise<boolean> {
    try {
      const toggled = await window.electron.source.toggle(sourceId)

      if (toggled) {
        const source = sources.value.find(s => s.id === sourceId)
        if (source) {
          source.enabled = !source.enabled
        }
      }

      return toggled
    } catch (err) {
      console.error('[SourceStore] Failed to toggle source:', err)
      return false
    }
  }

  /**
   * 设置当前源
   */
  function setCurrentSource(sourceId: string): void {
    if (sources.value.some(s => s.id === sourceId && s.enabled)) {
      currentSourceId.value = sourceId
    }
  }

  /**
   * 通过文件选择导入源
   */
  async function importFromFile(): Promise<ImportResult> {
    try {
      const result = await window.electron.dialog.selectScriptFile()
      if (!result) {
        return { success: false, error: '未选择文件' }
      }

      if (result.error) {
        return { success: false, error: result.error }
      }

      if (!result.content) {
        return { success: false, error: '无法读取文件内容' }
      }

      return await importSource(result.content)
    } catch (err) {
      console.error('[SourceStore] Failed to import from file:', err)
      return { success: false, error: err instanceof Error ? err.message : '导入失败' }
    }
  }

  /**
   * 通过 URL 导入源
   */
  async function importFromUrl(url: string): Promise<ImportResult> {
    try {
      const result = await window.electron.dialog.fetchUrlContent(url)
      if (!result) {
        return { success: false, error: '无法从 URL 获取内容' }
      }

      return await importSource(result.content)
    } catch (err) {
      console.error('[SourceStore] Failed to import from URL:', err)
      return { success: false, error: err instanceof Error ? err.message : '导入失败' }
    }
  }

  return {
    // 状态
    sources,
    currentSourceId,
    isLoading,
    error,

    // 计算属性
    enabledSources,
    currentSource,
    hasEnabledSources,

    // 方法
    loadSources,
    importSource,
    deleteSource,
    toggleSource,
    setCurrentSource,
    importFromFile,
    importFromUrl
  }
})
