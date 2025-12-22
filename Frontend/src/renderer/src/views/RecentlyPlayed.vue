<template>
  <div class="recently-played-view">
    <div class="page-header">
      <div class="header-left">
        <el-icon class="page-icon">
          <Clock />
        </el-icon>
        <div>
          <h1 class="page-title">{{ $t('recentlyPlayed.title') }}</h1>
          <span class="music-count">{{ $t('common.total') }} {{ displayedRecentlyPlayed.length }} / {{
            libraryStore.recentlyPlayed.length }}
            {{ $t('common.songs') }}</span>
        </div>
      </div>
      <div class="header-right">
        <!-- 本地搜索框 -->
        <div class="local-search-box">
          <el-icon class="search-icon">
            <Search />
          </el-icon>
          <input v-model="localSearchKeyword" type="text" class="search-input"
            :placeholder="$t('recentlyPlayed.searchPlaceholder')" @input="handleLocalSearch" />
          <el-icon v-if="localSearchKeyword" class="search-clear" @click="clearLocalSearch">
            <Close />
          </el-icon>
        </div>
        <el-button :type="isEditMode ? 'primary' : 'default'" @click="toggleEditMode">
          <el-icon>
            <Edit />
          </el-icon>
          {{ isEditMode ? $t('common.done') : $t('common.edit') }}
        </el-button>
        <el-button v-if="displayedRecentlyPlayed.length > 0" @click="handleClearAll">
          <el-icon>
            <Delete />
          </el-icon>
          {{ $t('recentlyPlayed.clearAll') }}
        </el-button>
        <el-button type="primary" @click="handlePlayAll" :disabled="displayedRecentlyPlayed.length === 0">
          <el-icon>
            <VideoPlay />
          </el-icon>
          {{ $t('localMusic.playAll') }}
        </el-button>
      </div>
    </div>

    <!-- 编辑模式工具栏 -->
    <div class="toolbar" v-if="isEditMode">
      <div class="toolbar-left">
        <el-checkbox v-model="selectAll" :indeterminate="isIndeterminate" @change="handleSelectAll">
          {{ $t('common.selectAll') }}
        </el-checkbox>
        <el-button v-if="selectedIds.size > 0" text type="danger" @click="handleBatchClear">
          {{ $t('recentlyPlayed.removeSelected') }} ({{ selectedIds.size }})
        </el-button>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="music-list" ref="scrollContainer" v-if="displayedRecentlyPlayed.length > 0">
      <div v-for="(song, index) in visibleRecentlyPlayed" :key="song.id" class="list-item" :class="{
        active: playerStore.currentSong?.id === song.id,
        selected: selectedIds.has(song.id),
        invalid: libraryStore.invalidMusicIds.has(song.id)
      }" @dblclick="handlePlay(index)">
        <span class="col-index">
          <el-checkbox v-if="isEditMode" :model-value="selectedIds.has(song.id)"
            @change="handleSelect(song.id, $event as boolean)" @click.stop />
          <span class="index-num" v-show="!isEditMode || !selectedIds.has(song.id)">{{ index + 1 }}</span>
        </span>

        <div class="col-title">
          <div class="song-cover-small">
            <img v-if="song.cover_path && song.cover_path.length > 5"
              :src="`local-image://${song.cover_path.replace(/\\\\/g, '/')}`" alt="" loading="lazy" />
            <el-icon v-else>
              <Headset />
            </el-icon>
          </div>
          <div class="song-info">
            <div class="song-name-wrapper">
              <span class="song-name truncate" :title="song.title">{{ song.title }}</span>
              <el-tooltip v-if="libraryStore.invalidMusicIds.has(song.id)"
                :content="$t('localMusic.invalidPathTooltip')" placement="top">
                <el-icon class="invalid-icon">
                  <WarningFilled />
                </el-icon>
              </el-tooltip>
            </div>
            <div class="song-artist truncate" :title="song.artist">{{ song.artist }}</div>
          </div>
        </div>

        <span class="col-time">{{ formatRelativeTime(song.last_played_at) }}</span>
        <span class="col-duration">{{ formatDuration(song.duration) }}</span>

        <div class="col-actions">
          <el-icon class="action-btn" :class="{ active: song.is_favorite }" @click.stop="handleToggleFavorite(song.id)">
            <StarFilled v-if="song.is_favorite" />
            <Star v-else />
          </el-icon>
          <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, song)">
            <el-icon class="action-btn" @click.stop>
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="play">{{ $t('player.play') || '播放' }}</el-dropdown-item>
                <el-dropdown-item command="addToQueue">{{ $t('player.addToQueue') }}</el-dropdown-item>
                <el-dropdown-item command="addToPlaylist">{{ $t('playlist.addToPlaylist') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-icon class="empty-icon">
        <Clock />
      </el-icon>
      <p>{{ $t('recentlyPlayed.noHistory') }}</p>
    </div>

    <!-- 添加到歌单对话框 -->
    <AddToPlaylistDialog v-model="showAddToPlaylistDialog" :song="selectedSongForPlaylist" />

    <!-- 自定义确认对话框 -->
    <CustomConfirmDialog v-model="confirmDialogVisible" :title="confirmDialogTitle" :message="confirmDialogMessage"
      :type="confirmDialogType" @confirm="handleConfirmDialogConfirm" @cancel="handleConfirmDialogCancel" />
  </div>
</template>

<script setup lang="ts">
import AddToPlaylistDialog from '@/components/Base/AddToPlaylistDialog.vue'
import CustomConfirmDialog from '@/components/Base/CustomConfirmDialog.vue'
import { useLibraryStore } from '@/store/library.store'
import { usePlayerStore } from '@/store/player.store'
import { formatDuration, formatRelativeTime } from '@/utils/format'
import { Clock, Close, Delete, Edit, Headset, MoreFilled, Search, Star, StarFilled, VideoPlay, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onActivated, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

// 定义组件名称，用于 keep-alive 的 include 匹配
defineOptions({
  name: 'RecentlyPlayed'
})

import type { Music } from '@/types/music'

const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()
const { t } = useI18n()

// ==================== 本地搜索功能 ====================
const localSearchKeyword = ref('')

// 根据搜索关键词过滤最近播放歌曲
const displayedRecentlyPlayed = computed(() => {
  const keyword = localSearchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return libraryStore.recentlyPlayed
  }
  return libraryStore.recentlyPlayed.filter(song =>
    song.title.toLowerCase().includes(keyword) ||
    song.artist?.toLowerCase().includes(keyword) ||
    song.album?.toLowerCase().includes(keyword)
  )
})

// 处理本地搜索（输入时自动搜索）
const handleLocalSearch = () => {
  // 搜索逻辑已在 computed 中实现，无需额外操作
}

// 清除本地搜索
const clearLocalSearch = () => {
  localSearchKeyword.value = ''
}

// 编辑模式
const isEditMode = ref(false)
const selectedIds = ref<Set<number>>(new Set())
const selectAll = ref(false)

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    selectedIds.value = new Set()
    selectAll.value = false
  }
}

const isIndeterminate = computed(() => {
  return selectedIds.value.size > 0 && selectedIds.value.size < displayedRecentlyPlayed.value.length
})

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedIds.value = new Set(displayedRecentlyPlayed.value.map(s => s.id))
  } else {
    selectedIds.value = new Set()
  }
}

const handleSelect = (id: number, checked: boolean) => {
  if (checked) {
    selectedIds.value.add(id)
  } else {
    selectedIds.value.delete(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

// 自定义确认对话框状态
const confirmDialogVisible = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmDialogType = ref<'warning' | 'info'>('warning')
let resolveConfirm: ((value: boolean) => void) | null = null

const showConfirm = (message: string, title: string, type: 'warning' | 'info' = 'warning'): Promise<boolean> => {
  confirmDialogMessage.value = message
  confirmDialogTitle.value = title
  confirmDialogType.value = type
  confirmDialogVisible.value = true
  return new Promise((resolve) => {
    resolveConfirm = resolve
  })
}

const handleConfirmDialogConfirm = () => {
  if (resolveConfirm) {
    resolveConfirm(true)
    resolveConfirm = null
  }
}

const handleConfirmDialogCancel = () => {
  if (resolveConfirm) {
    resolveConfirm(false)
    resolveConfirm = null
  }
}

const handleBatchClear = async () => {
  if (selectedIds.value.size === 0) return

  const confirm = await showConfirm(
    t('recentlyPlayed.confirmRemove', { count: selectedIds.value.size }),
    t('common.warning'),
    'warning'
  )

  if (confirm) {
    const success = await libraryStore.removeRecentlyPlayed(Array.from(selectedIds.value))
    if (success) {
      ElMessage.success(t('recentlyPlayed.removeSuccess', { count: selectedIds.value.size }))
      selectedIds.value = new Set()
      selectAll.value = false
      if (displayedRecentlyPlayed.value.length === 0) {
        isEditMode.value = false
      }
    } else {
      ElMessage.error(t('common.error'))
    }
  }
}

const handleClearAll = async () => {
  const confirm = await showConfirm(
    t('recentlyPlayed.confirmClearAll'),
    t('common.warning'),
    'warning'
  )

  if (confirm) {
    const success = await libraryStore.clearRecentlyPlayed()
    if (success) {
      ElMessage.success(t('recentlyPlayed.clearSuccess'))
      isEditMode.value = false
    } else {
      ElMessage.error(t('common.error'))
    }
  }
}

// 添加到歌单对话框状态
const showAddToPlaylistDialog = ref(false)
const selectedSongForPlaylist = ref<Music | null>(null)

// 滚动容器引用和滚动位置保存
const scrollContainer = ref<HTMLElement | null>(null)
const savedScrollTop = ref(0)

// 路由离开前保存滚动位置
onBeforeRouteLeave((_to, _from, next) => {
  if (scrollContainer.value) {
    savedScrollTop.value = scrollContainer.value.scrollTop
  }
  next()
})

// 组件被 keep-alive 激活时恢复滚动位置
onActivated(() => {
  nextTick(() => {
    if (scrollContainer.value && savedScrollTop.value > 0) {
      scrollContainer.value.scrollTop = savedScrollTop.value
    }
  })
})

// 渐进式渲染：解决首次进入页面时的卡顿问题
// 先渲染少量数据，然后异步渲染剩余数据
const renderLimit = ref(10)
const visibleRecentlyPlayed = computed(() => {
  return displayedRecentlyPlayed.value.slice(0, renderLimit.value)
})

onMounted(() => {
  // 延迟执行全量渲染，确保页面切换动画（通常300-500ms）完全结束
  setTimeout(() => {
    const total = displayedRecentlyPlayed.value.length
    const batchSize = 50 // 每帧渲染的数量

    const renderNextBatch = () => {
      if (renderLimit.value < total) {
        renderLimit.value = Math.min(renderLimit.value + batchSize, total)
        requestAnimationFrame(renderNextBatch)
      }
    }

    requestAnimationFrame(renderNextBatch)
  }, 600)
})

const handlePlayAll = () => {
  if (displayedRecentlyPlayed.value.length > 0) {
    playerStore.setQueue(displayedRecentlyPlayed.value, 0)
  }
}

const handlePlay = (index: number) => {
  playerStore.setQueue(displayedRecentlyPlayed.value, index)
}

const handleToggleFavorite = async (id: number) => {
  await libraryStore.toggleFavorite(id)
}

// 下拉菜单命令
const handleCommand = (command: string, song: Music) => {
  switch (command) {
    case 'play':
      playerStore.play(song)
      break
    case 'addToQueue':
      playerStore.addToQueue(song)
      ElMessage.success('已添加到播放队列')
      break
    case 'addToPlaylist':
      selectedSongForPlaylist.value = song
      showAddToPlaylistDialog.value = true
      break
  }
}
</script>

<style lang="scss" scoped>
.recently-played-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  background: linear-gradient(135deg, rgba($info-color, 0.2) 0%, transparent 100%);
  border-radius: $border-radius-xl;

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  // 本地搜索框样式
  .local-search-box {
    position: relative;
    display: flex;
    align-items: center;
    width: 200px;
    height: 36px;
    padding: 0 $spacing-md;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid $border-color;
    border-radius: 18px;
    transition: all $transition-fast;

    &:focus-within {
      background: rgba(255, 255, 255, 0.08);
      border-color: $border-color-active;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }

    .search-icon {
      color: $text-muted;
      font-size: $font-size-md;
      margin-right: $spacing-sm;
    }

    .search-input {
      flex: 1;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: $text-primary;
      font-size: $font-size-base;

      &::placeholder {
        color: $text-muted;
      }
    }

    .search-clear {
      color: $text-muted;
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: all $transition-fast;

      &:hover {
        color: $text-primary;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .page-icon {
    font-size: 48px;
    color: $info-color;
  }

  .page-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin-bottom: 4px;
  }

  .music-count {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.02);
  border-radius: $border-radius-md;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }
}

.music-list {
  flex: 1;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-sm;
  transition: background $transition-fast;
  // 浏览器级别渲染优化：跳过视口外内容的渲染
  content-visibility: auto;
  contain-intrinsic-size: 0 56px;

  &:hover {
    background: $bg-hover;

    .col-actions .action-btn {
      opacity: 1;
    }
  }

  &.active {
    background: $gradient-card;

    .song-name {
      color: $primary-color;
    }
  }

  &.selected {
    background: rgba(var(--primary-color-rgb), 0.1);
  }

  &.invalid {
    opacity: 0.6;
    border-left: 3px solid #f56c6c;

    .song-name {
      color: $text-muted;
    }

    .invalid-icon {
      color: #f56c6c;
      font-size: 14px;
      margin-left: 6px;
      animation: pulse-warning 2s infinite;
    }
  }
}

@keyframes pulse-warning {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.col-index {
  width: 60px;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  color: $text-muted;
  font-size: $font-size-sm;

  .index-num {
    color: $text-muted;
  }
}

.col-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  min-width: 0;

  .song-cover-small {
    width: 48px;
    height: 48px;
    border-radius: $border-radius-sm;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    color: $text-muted;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .song-info {
    min-width: 0;
    flex: 1;
  }

  .song-name-wrapper {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .song-name {
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: 4px;
  }

  .song-artist {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.col-time {
  width: 100px;
  color: $text-muted;
  font-size: $font-size-sm;
}

.col-duration {
  width: 80px;
  text-align: right;
  color: $text-muted;
  font-size: $font-size-sm;
}

.col-actions {
  width: 80px;
  display: flex;
  justify-content: flex-end;
  gap: $spacing-xs;

  .action-btn {
    font-size: 30px;
    color: $text-muted;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    opacity: 0;
    transition: all $transition-fast;

    &.active {
      color: #FFD700;
      // opacity: 1; // 移除此行，让收藏状态默认也隐藏
    }

    &:hover {
      color: $text-primary;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.list-item:hover .col-actions .action-btn {
  opacity: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: $text-muted;

  .empty-icon {
    font-size: 64px;
    margin-bottom: $spacing-md;
    color: $info-color;
    opacity: 0.5;
  }

  p {
    margin-bottom: $spacing-sm;
  }

  .empty-hint {
    font-size: $font-size-sm;
  }
}
</style>
