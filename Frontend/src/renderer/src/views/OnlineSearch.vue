<template>
  <div class="online-search-page">
    <!-- 页面标题和搜索区域 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon">
            <Search />
          </el-icon>
          在线搜索
        </h1>
        <span class="result-count" v-if="onlineStore.hasResults">
          共 {{ onlineStore.totalResults }} 首
        </span>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input v-model="searchKeyword" placeholder="搜索歌曲、歌手、专辑..." size="large" clearable @keyup.enter="handleSearch"
          class="search-input">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" size="large" :loading="onlineStore.isSearching" @click="handleSearch">
          搜索
        </el-button>
      </div>
    </div>

    <!-- 源选择器 -->
    <div class="source-selector" v-if="onlineStore.enabledSources.length > 0">
      <span class="source-label">音乐源：</span>
      <el-select v-model="selectedSource" size="small" style="width: 150px;" @change="handleSourceChange">
        <el-option v-for="source in onlineStore.enabledSources" :key="source.id" :label="source.name"
          :value="source.id" />
      </el-select>
    </div>
    <div class="source-selector" v-else>
      <el-button type="warning" text @click="goToSettings">
        请先在设置中导入音乐源
      </el-button>
    </div>

    <!-- 搜索结果列表 -->
    <div class="results-container" v-loading="onlineStore.isSearching">
      <!-- 空状态 -->
      <div v-if="!onlineStore.hasResults && !onlineStore.isSearching" class="empty-state">
        <el-icon class="empty-icon">
          <Search />
        </el-icon>
        <p class="empty-text">{{ emptyText }}</p>
        <p class="empty-hint">输入关键词开始搜索</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="onlineStore.searchError" class="error-state">
        <el-icon class="error-icon">
          <Warning />
        </el-icon>
        <p class="error-text">{{ onlineStore.searchError }}</p>
        <el-button type="primary" @click="handleSearch">重试</el-button>
      </div>

      <!-- 音乐列表 -->
      <div v-if="onlineStore.hasResults" class="music-list">
        <!-- 列表头部 -->
        <div class="list-header">
          <div class="col col-index">#</div>
          <div class="col col-title">歌曲</div>
          <div class="col col-artist">歌手</div>
          <div class="col col-album">专辑</div>
          <div class="col col-duration">时长</div>
          <div class="col col-actions">操作</div>
        </div>

        <!-- 列表内容 -->
        <div v-for="(music, index) in onlineStore.searchResults" :key="music.id" class="list-item" :class="{
          'is-playing': isCurrentPlaying(music),
          'is-loading': onlineStore.loadingPlayUrl === music.id
        }" @dblclick="handlePlay(music)">
          <!-- 序号 -->
          <div class="col col-index">
            <span v-if="!isCurrentPlaying(music)">{{ index + 1 }}</span>
            <el-icon v-else class="playing-icon">
              <VideoPlay />
            </el-icon>
          </div>

          <!-- 歌曲信息 -->
          <div class="col col-title">
            <img v-if="music.cover" :src="music.cover" class="music-cover" loading="lazy" />
            <div v-else class="music-cover placeholder">
              <el-icon>
                <Headset />
              </el-icon>
            </div>
            <div class="music-info">
              <span class="music-name" :title="music.name">{{ music.name }}</span>
              <span v-if="music.quality" class="quality-tag">{{ music.quality }}</span>
            </div>
          </div>

          <!-- 歌手 -->
          <div class="col col-artist" :title="music.artist">
            {{ music.artist || '未知歌手' }}
          </div>

          <!-- 专辑 -->
          <div class="col col-album" :title="music.album">
            {{ music.album || '未知专辑' }}
          </div>

          <!-- 时长 -->
          <div class="col col-duration">
            {{ formatDuration(music.duration) }}
          </div>

          <!-- 操作按钮 -->
          <div class="col col-actions">
            <!-- 播放按钮 -->
            <el-tooltip content="播放" placement="top">
              <el-button circle size="small" :loading="onlineStore.loadingPlayUrl === music.id"
                @click.stop="handlePlay(music)">
                <el-icon>
                  <VideoPlay />
                </el-icon>
              </el-button>
            </el-tooltip>

            <!-- 下载按钮 -->
            <el-tooltip content="下载" placement="top">
              <el-button circle size="small" :loading="isDownloading(music.id)" :disabled="isDownloaded(music.id)"
                @click.stop="handleDownload(music)">
                <el-icon v-if="isDownloaded(music.id)"><Select /></el-icon>
                <el-icon v-else>
                  <Download />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="onlineStore.totalPages > 1" class="pagination">
        <el-pagination v-model:current-page="currentPage" :page-size="onlineStore.pageSize"
          :total="onlineStore.totalResults" layout="prev, pager, next" @current-change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOnlineStore } from '@/store/online.store'
import { usePlayerStore } from '@/store/player.store'
import type { OnlineMusic } from '@/types/online'
import {
  Download,
  Headset,
  Search,
  Select,
  VideoPlay,
  Warning
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const onlineStore = useOnlineStore()
const playerStore = usePlayerStore()

// 初始化时加载源
onMounted(async () => {
  await onlineStore.initialize()
  // 初始化完成后，同步选中的源
  if (onlineStore.currentSource && !selectedSource.value) {
    selectedSource.value = onlineStore.currentSource
  }
})

// 搜索关键词（本地状态，避免实时更新 store）
const searchKeyword = ref(onlineStore.keyword)

// 选中的源
const selectedSource = ref(onlineStore.currentSource)

// 当前页码
const currentPage = ref(onlineStore.currentPage)

// 监听源变化，同步选中状态
watch(() => onlineStore.currentSource, (newVal) => {
  if (newVal && newVal !== selectedSource.value) {
    selectedSource.value = newVal
  }
}, { immediate: true })

// 如果没有选中源但有可用源，自动选择第一个
watch(() => onlineStore.enabledSources, (sources) => {
  if (sources.length > 0 && !selectedSource.value) {
    selectedSource.value = sources[0].id
    onlineStore.setSource(sources[0].id)
  }
  // 如果已有选中源，确保同步
  if (sources.length > 0 && onlineStore.currentSource && !selectedSource.value) {
    selectedSource.value = onlineStore.currentSource
  }
}, { immediate: true })

// 空状态文本
const emptyText = computed(() => {
  if (!onlineStore.hasAvailableSources) {
    return '没有可用的音乐源，请先在设置中导入源脚本'
  }
  if (onlineStore.keyword) {
    return `未找到"${onlineStore.keyword}"的相关结果`
  }
  return '在这里搜索你喜欢的音乐'
})

/**
 * 切换源
 */
function handleSourceChange(sourceId: string) {
  onlineStore.setSource(sourceId)
}

/**
 * 跳转到设置页
 */
function goToSettings() {
  router.push('/settings')
}

/**
 * 格式化时长
 */
function formatDuration(seconds?: number): string {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 判断是否正在播放
 */
function isCurrentPlaying(music: OnlineMusic): boolean {
  const current = playerStore.currentSong
  if (!current) return false
  // 在线音乐使用 playUrl 判断
  return current.file_path === music.playUrl
}

/**
 * 判断是否正在下载
 */
function isDownloading(id: string): boolean {
  const progress = onlineStore.getDownloadProgress(id)
  return progress?.status === 'downloading' || progress?.status === 'pending'
}

/**
 * 判断是否已下载
 */
function isDownloaded(id: string): boolean {
  const progress = onlineStore.getDownloadProgress(id)
  return progress?.status === 'completed'
}

/**
 * 执行搜索
 */
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  if (!onlineStore.hasAvailableSources) {
    ElMessage.warning('没有可用的音乐源，请先在设置中导入源脚本')
    return
  }

  if (!selectedSource.value) {
    ElMessage.warning('请选择一个音乐源')
    return
  }

  await onlineStore.search({
    keyword: searchKeyword.value,
    source: selectedSource.value
  })
}

/**
 * 翻页
 */
async function handlePageChange(page: number) {
  await onlineStore.goToPage(page)
}

/**
 * 播放在线音乐
 */
async function handlePlay(music: OnlineMusic) {
  // 获取播放链接
  const playUrl = await onlineStore.getPlayUrl(music)

  if (!playUrl) {
    ElMessage.error('获取播放链接失败')
    return
  }

  // 构造临时的 Music 对象用于播放（不入库）
  const tempMusic = {
    id: -1,  // 负数 ID 表示临时对象
    title: music.name,
    artist: music.artist,
    album: music.album || '',
    duration: music.duration || 0,
    file_path: playUrl,  // 使用播放链接作为路径
    file_size: music.size || 0,
    format: 'online',
    bitrate: 0,
    sample_rate: 0,
    cover_path: music.cover || '',
    lyrics_path: '',
    play_count: 0,
    is_favorite: 0,
    last_played_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_hidden: 0
  }

  // 播放
  playerStore.playNow(tempMusic)
  ElMessage.success(`正在播放: ${music.name}`)
}

/**
 * 下载音乐
 */
async function handleDownload(music: OnlineMusic) {
  ElMessage.info(`开始下载: ${music.name}`)

  const success = await onlineStore.downloadMusic(music)

  if (success) {
    ElMessage.success(`下载完成: ${music.name}`)
  } else {
    ElMessage.error(`下载失败: ${music.name}`)
  }
}
</script>

<style lang="scss" scoped>
.online-search-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $spacing-lg;
  border-bottom: 1px solid $border-color-light;
  margin-bottom: $spacing-lg;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: $spacing-md;
}

.page-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0;

  .title-icon {
    font-size: 28px;
    color: $primary-color;
  }
}

.result-count {
  font-size: $font-size-sm;
  color: $text-muted;
}

.search-box {
  display: flex;
  gap: $spacing-sm;

  .search-input {
    width: 320px;
  }
}

.source-selector {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.03);
  border-radius: $border-radius-md;

  .source-label {
    color: $text-muted;
    font-size: $font-size-sm;
  }
}

.results-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

// 空状态
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: $text-muted;

  .empty-icon,
  .error-icon {
    font-size: 64px;
    margin-bottom: $spacing-lg;
    opacity: 0.5;
  }

  .error-icon {
    color: $warning-color;
  }

  .empty-text,
  .error-text {
    font-size: $font-size-lg;
    margin-bottom: $spacing-sm;
  }

  .empty-hint {
    font-size: $font-size-sm;
  }
}

// 音乐列表
.music-list {
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  color: $text-muted;
  border-bottom: 1px solid $border-color-light;
  position: sticky;
  top: 0;
  background: $bg-secondary;
  z-index: 1;
}

.list-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $bg-hover;
  }

  &.is-playing {
    background: rgba(var(--primary-color-rgb), 0.1);

    .music-name {
      color: $primary-color;
    }

    .playing-icon {
      color: $primary-color;
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  &.is-loading {
    opacity: 0.7;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.col {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-index {
  width: 50px;
  text-align: center;
  color: $text-muted;
  flex-shrink: 0;
}

.col-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  min-width: 200px;
}

.col-artist {
  width: 150px;
  color: $text-secondary;
  flex-shrink: 0;
}

.col-album {
  width: 150px;
  color: $text-muted;
  flex-shrink: 0;
}

.col-duration {
  width: 60px;
  text-align: center;
  color: $text-muted;
  flex-shrink: 0;
}

.col-actions {
  width: 100px;
  display: flex;
  justify-content: center;
  gap: $spacing-xs;
  flex-shrink: 0;
}

.music-cover {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-sm;
  object-fit: cover;
  flex-shrink: 0;

  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    color: $text-muted;
  }
}

.music-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.music-name {
  font-weight: 500;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quality-tag {
  font-size: 10px;
  padding: 1px 4px;
  background: rgba(var(--primary-color-rgb), 0.2);
  color: $primary-color;
  border-radius: 2px;
  width: fit-content;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: $spacing-lg 0;
}
</style>
