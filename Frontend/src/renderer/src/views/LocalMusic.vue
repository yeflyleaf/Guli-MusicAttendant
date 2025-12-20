<template>
  <div class="local-music-view">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('localMusic.title') }}</h1>
        <span class="music-count">{{ $t('common.total') }} {{ libraryStore.musicCount }} {{ $t('common.songs') }}</span>
      </div>
      <div class="header-right">
        <SearchBar class="local-search" />
        <el-button @click="handleRefresh" :loading="isRefreshing">
          <el-icon>
            <Refresh />
          </el-icon>
          {{ $t('common.refresh') || '刷新' }}
        </el-button>
        <el-button @click="handleScanFolder">
          <el-icon>
            <FolderAdd />
          </el-icon>
          {{ $t('settings.library.addFolder') }}
        </el-button>
        <el-button :type="isEditMode ? 'primary' : 'default'" @click="toggleEditMode">
          <el-icon>
            <Edit />
          </el-icon>
          {{ isEditMode ? $t('common.done') : $t('common.edit') }}
        </el-button>
        <el-button type="primary" @click="handlePlayAll" :disabled="musicList.length === 0">
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
        <el-button v-if="selectedIds.size > 0" text type="danger" @click="handleDeleteSelected">
          {{ $t('localMusic.removeSelected') }} ({{ selectedIds.size }})
        </el-button>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="music-list">
      <!-- 标准列表渲染（配合 keep-alive 持久化 DOM） -->
      <div class="list-content" ref="scrollContainer">
        <div class="list-header">
          <span class="col-index">#</span>
          <span class="col-title sortable" :class="{ active: sortBy === 'title' }" @click="handleSort('title')"
            v-if="settingsStore.localMusicHeaders.includes('title')">
            {{ $t('settings.appearance.headerTitle') }}
            <el-icon v-if="sortBy === 'title'" class="sort-icon">
              <ArrowUp v-if="sortOrder === 'ASC'" />
              <ArrowDown v-else />
            </el-icon>
          </span>
          <span class="col-artist sortable" :class="{ active: sortBy === 'artist' }" @click="handleSort('artist')"
            v-if="settingsStore.localMusicHeaders.includes('artist')">
            {{ $t('settings.appearance.headerArtist') }}
            <el-icon v-if="sortBy === 'artist'" class="sort-icon">
              <ArrowUp v-if="sortOrder === 'ASC'" />
              <ArrowDown v-else />
            </el-icon>
          </span>
          <span class="col-album" v-if="settingsStore.localMusicHeaders.includes('album')">{{
            $t('settings.appearance.headerAlbum') }}</span>
          <span class="col-duration sortable" :class="{ active: sortBy === 'duration' }" @click="handleSort('duration')"
            v-if="settingsStore.localMusicHeaders.includes('duration')">
            {{ $t('settings.appearance.headerDuration') }}
            <el-icon v-if="sortBy === 'duration'" class="sort-icon">
              <ArrowUp v-if="sortOrder === 'ASC'" />
              <ArrowDown v-else />
            </el-icon>
          </span>
          <span class="col-created sortable" :class="{ active: sortBy === 'created_at' }"
            @click="handleSort('created_at')" v-if="settingsStore.localMusicHeaders.includes('created_at')">
            {{ $t('settings.appearance.headerCreatedAt') }}
            <el-icon v-if="sortBy === 'created_at'" class="sort-icon">
              <ArrowUp v-if="sortOrder === 'ASC'" />
              <ArrowDown v-else />
            </el-icon>
          </span>
          <span class="col-actions"></span>
        </div>
        <div v-for="(song, index) in visibleMusicList" :key="song.id" class="list-item" :class="{
          active: playerStore.currentSong?.id === song.id,
          selected: selectedIds.has(song.id)
        }" @dblclick="handlePlay(song, index)">
          <span class="col-index">
            <el-checkbox v-if="isEditMode" :model-value="selectedIds.has(song.id)"
              @change="handleSelect(song.id, $event as boolean)" @click.stop />
            <span class="index-num" v-show="!isEditMode || !selectedIds.has(song.id)">
              <el-icon v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying">
                <MusicPlay />
              </el-icon>
              <span v-else>{{ index + 1 }}</span>
            </span>
          </span>

          <div class="col-title" v-if="settingsStore.localMusicHeaders.includes('title')">
            <div class="song-cover-small">
              <img v-if="song.cover_path && song.cover_path.length > 5"
                :src="`local-image://${song.cover_path.replace(/\\\\/g, '/')}`" alt="" loading="lazy" />
              <el-icon v-else>
                <Headset />
              </el-icon>
            </div>
            <div class="song-info">
              <div class="song-name truncate" :title="song.title">{{ song.title }}</div>
            </div>
          </div>

          <span class="col-artist truncate" :title="song.artist"
            v-if="settingsStore.localMusicHeaders.includes('artist')">{{ song.artist }}</span>
          <span class="col-album truncate" :title="song.album"
            v-if="settingsStore.localMusicHeaders.includes('album')">{{ song.album }}</span>
          <span class="col-duration" v-if="settingsStore.localMusicHeaders.includes('duration')">{{
            formatDuration(song.duration) }}</span>
          <span class="col-created" v-if="settingsStore.localMusicHeaders.includes('created_at')">{{
            formatRelativeTime(song.created_at) }}</span>

          <div class="col-actions">
            <el-icon class="action-btn" :class="{ active: song.is_favorite }"
              @click.stop="handleToggleFavorite(song.id)">
              <StarFilled v-if="song.is_favorite" />
              <Star v-else />
            </el-icon>
            <el-dropdown trigger="click" @command="handleCommand($event, song)">
              <el-icon class="action-btn" @click.stop>
                <MoreFilled />
              </el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="play">{{ $t('player.play') || '播放' }}</el-dropdown-item>
                  <el-dropdown-item command="addToQueue">{{ $t('player.addToQueue') }}</el-dropdown-item>
                  <el-dropdown-item command="addToPlaylist">{{ $t('playlist.addToPlaylist') }}</el-dropdown-item>
                  <el-dropdown-item command="showInFolder">{{ $t('localMusic.showInFolder') || '在文件夹中显示'
                  }}</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>{{ $t('common.delete') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="musicList.length === 0" class="empty-state">
          <el-icon class="empty-icon">
            <FolderOpened />
          </el-icon>
          <p>{{ $t('localMusic.noMusic') }}</p>
        </div>
      </div>
    </div>

    <!-- 添加到歌单对话框 -->
    <AddToPlaylistDialog v-model="showAddToPlaylistDialog" :song="selectedSongForPlaylist" />
  </div>
</template>

<script setup lang="ts">
import AddToPlaylistDialog from '@/components/Base/AddToPlaylistDialog.vue'
import SearchBar from '@/components/Base/SearchBar.vue'
import { useIpc } from '@/hooks/useIpc'
import { useLibraryStore } from '@/store/library.store'
import { usePlayerStore } from '@/store/player.store'
import { useSettingsStore } from '@/store/settings.store'
import type { Music } from '@/types/music'
import { throttle } from '@/utils/debounce'
import { formatDuration, formatRelativeTime } from '@/utils/format'
import {
  ArrowDown,
  ArrowUp,
  Edit,
  FolderAdd,
  FolderOpened,
  Headset,
  MoreFilled,
  Refresh,
  Star,
  StarFilled,
  VideoPlay
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, h, nextTick, onActivated, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
// 定义组件名称，用于 keep-alive 的 include 匹配
defineOptions({
  name: 'LocalMusic'
})

// 自定义播放中图标组件（使用 render 函数避免运行时编译）
const MusicPlay = {
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      innerHTML: '<rect x="6" y="4" width="4" height="16"><animate attributeName="height" values="16;8;16" dur="0.6s" repeatCount="indefinite"/></rect><rect x="14" y="4" width="4" height="16"><animate attributeName="height" values="8;16;8" dur="0.6s" repeatCount="indefinite"/></rect>'
    })
  }
}

const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()
const settingsStore = useSettingsStore()
const { selectFolder, scanFolder, scanAllFolders, addMusicFolder, showInFolder, confirm } = useIpc()

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

// 排序
const sortBy = ref('created_at')
const sortOrder = ref<'ASC' | 'DESC'>('DESC')

// 处理排序点击
const handleSort = (field: string) => {
  if (sortBy.value === field) {
    // 同一列点击切换排序方向
    sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    // 不同列点击，设置新的排序字段，根据字段类型设置默认排序方向
    sortBy.value = field
    // 时间类型默认降序，其他默认升序
    sortOrder.value = field === 'created_at' ? 'DESC' : 'ASC'
  }
}

// 选择状态
const selectedIds = ref<Set<number>>(new Set())
const selectAll = ref(false)

// 编辑模式
const isEditMode = ref(false)
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    // 退出编辑模式时清空选择
    selectedIds.value = new Set()
    selectAll.value = false
  }
}

// 添加到歌单对话框状态
const showAddToPlaylistDialog = ref(false)
const selectedSongForPlaylist = ref<Music | null>(null)
const isIndeterminate = computed(() => {
  return selectedIds.value.size > 0 && selectedIds.value.size < musicList.value.length
})

/**
 * 英文优先排序比较函数
 * 英文字符排在中文字符前面
 */
const compareWithEnglishFirst = (strA: string, strB: string): number => {
  const a = strA || ''
  const b = strB || ''

  // 判断首字符是否为ASCII（英文/数字/符号）
  const aIsAscii = a.charCodeAt(0) < 128
  const bIsAscii = b.charCodeAt(0) < 128

  // 如果一个是英文一个是中文，英文优先
  if (aIsAscii && !bIsAscii) return -1
  if (!aIsAscii && bIsAscii) return 1

  // 同类型使用 localeCompare 比较
  return a.localeCompare(b, 'zh-CN')
}

// 音乐列表（根据排序方式和排序方向排序）
const musicList = computed(() => {
  const list = [...libraryStore.displayMusic]
  const isAsc = sortOrder.value === 'ASC'

  // 客户端排序，支持升序/降序，英文优先
  switch (sortBy.value) {
    case 'title':
      return list.sort((a, b) => {
        const cmp = compareWithEnglishFirst(a.title, b.title)
        return isAsc ? cmp : -cmp
      })
    case 'artist':
      return list.sort((a, b) => {
        const cmp = compareWithEnglishFirst(a.artist || '', b.artist || '')
        return isAsc ? cmp : -cmp
      })
    case 'duration':
      return list.sort((a, b) => {
        const cmp = (a.duration || 0) - (b.duration || 0)
        return isAsc ? cmp : -cmp
      })
    case 'play_count':
      return list.sort((a, b) => {
        const cmp = (a.play_count || 0) - (b.play_count || 0)
        return isAsc ? cmp : -cmp
      })
    case 'created_at':
    default:
      return list.sort((a, b) => {
        const cmp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        return isAsc ? cmp : -cmp
      })
  }
})

// 渐进式渲染：解决首次进入页面时的卡顿问题
// 先渲染少量数据，然后异步渲染剩余数据
const renderLimit = ref(20)
const visibleMusicList = computed(() => {
  return musicList.value.slice(0, renderLimit.value)
})


// 渐进式渲染函数
let isRendering = false
const startProgressiveRender = () => {
  if (isRendering) return

  const total = musicList.value.length
  if (total === 0 || renderLimit.value >= total) return

  isRendering = true
  const batchSize = 40 // 每帧渲染的数量

  const renderNextBatch = () => {
    const currentTotal = musicList.value.length
    if (renderLimit.value < currentTotal) {
      renderLimit.value = Math.min(renderLimit.value + batchSize, currentTotal)
      requestAnimationFrame(renderNextBatch)
    } else {
      isRendering = false
    }
  }

  requestAnimationFrame(renderNextBatch)
}

onMounted(() => {
  // 延迟执行全量渲染，确保页面切换动画完成
  setTimeout(() => {
    startProgressiveRender()
  }, 300)
})

// 监听音乐列表变化（处理生产环境下数据异步加载的情况）
watch(() => musicList.value.length, (newLen, oldLen) => {
  if (newLen > 0 && (oldLen === 0 || oldLen === undefined)) {
    // 数据首次加载完成，开始渐进式渲染
    setTimeout(() => {
      startProgressiveRender()
    }, 100)
  } else if (newLen > renderLimit.value) {
    // 数据增加了，确保能显示全部
    startProgressiveRender()
  }
}, { immediate: true })

// 全选
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedIds.value = new Set(musicList.value.map(s => s.id))
  } else {
    selectedIds.value = new Set()
  }
}

// 单选
const handleSelect = (id: number, checked: boolean) => {
  if (checked) {
    selectedIds.value.add(id)
  } else {
    selectedIds.value.delete(id)
  }
  selectedIds.value = new Set(selectedIds.value) // 触发响应式
}

// 刷新音乐库
const isRefreshing = ref(false)
const handleRefresh = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true

  try {
    ElMessage.info('正在刷新音乐库...')
    await scanAllFolders()
    await libraryStore.refreshMusic()
    ElMessage.success('刷新完成')
  } catch (error) {
    console.error(error)
    ElMessage.error('刷新失败')
  } finally {
    isRefreshing.value = false
  }
}

// 添加文件夹
const handleScanFolder = async () => {
  const folder = await selectFolder()
  if (!folder) return

  await addMusicFolder(folder)

  ElMessage.info('正在扫描音乐文件...')
  const result = await scanFolder(folder)

  if (result) {
    ElMessage.success(`扫描完成：新增 ${result.added} 首歌曲`)
    await libraryStore.refreshMusic()
  }
}

// 播放全部
const handlePlayAll = () => {
  if (musicList.value.length > 0) {
    playerStore.setQueue(musicList.value, 0)
  }
}

// 播放单曲（节流处理，防止双击触发多次）
const handlePlay = throttle((_song: Music, index: number) => {
  playerStore.setQueue(musicList.value, index)
}, 500)

// 切换收藏
const handleToggleFavorite = async (id: number) => {
  await libraryStore.toggleFavorite(id)
}

// 删除选中
const handleDeleteSelected = async () => {
  const confirmed = await confirm(`确定要删除选中的 ${selectedIds.value.size} 首歌曲吗？`)
  if (!confirmed) return

  await libraryStore.deleteMusicBatch(Array.from(selectedIds.value))
  selectedIds.value = new Set()
  ElMessage.success('删除成功')
}

// 下拉菜单命令
const handleCommand = async (command: string, song: Music) => {
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
    case 'showInFolder':
      showInFolder(song.file_path)
      break
    case 'delete':
      const confirmed = await confirm('确定要删除这首歌曲吗？')
      if (confirmed) {
        await libraryStore.deleteMusic(song.id)
        ElMessage.success('删除成功')
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.local-music-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-lg;

  .header-left {
    display: flex;
    align-items: baseline;
    gap: $spacing-md;
  }

  .page-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
  }

  .music-count {
    font-size: $font-size-sm;
    color: $text-muted;
  }

  .header-right {
    display: flex;
    gap: $spacing-sm;
    align-items: center;

    .local-search {
      width: 200px;
      margin-right: $spacing-md;
    }
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
}

.music-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.list-header {
  position: sticky;
  top: 0;
  will-change: transform;
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  color: $text-muted;
  border-bottom: 1px solid $border-color;
  background: $bg-secondary;
  z-index: 10;
  flex-shrink: 0;

  .sortable {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color $transition-fast;
    user-select: none;

    &:hover {
      color: $text-primary;
    }

    &.active {
      color: $primary-color;
    }

    .sort-icon {
      font-size: $font-size-xs;
    }
  }
}

.list-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-sm;
  transition: background $transition-fast;
  height: 56px;
  box-sizing: border-box;
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
    background: rgba($primary-color, 0.1);
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
  flex: 3;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  min-width: 0;

  .song-cover-small {
    width: 40px;
    height: 40px;
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
  }

  .song-name {
    font-size: $font-size-base;
    color: $text-primary;
  }
}

.col-artist {
  flex: 2;
  color: $text-secondary;
  font-size: $font-size-sm;
}

.col-album {
  flex: 2;
  color: $text-muted;
  font-size: $font-size-sm;
}

.col-duration {
  width: 80px;
  text-align: center;
  justify-content: center;
  color: $text-muted;
  font-size: $font-size-sm;
}

.col-created {
  width: 100px;
  text-align: center;
  justify-content: center;
  color: $text-muted;
  font-size: $font-size-sm;
}

.col-actions {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;

  .action-btn {
    font-size: 24px;
    color: $text-muted;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    opacity: 0;
    transition: all $transition-fast;

    &:hover {
      color: $text-primary;
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      color: #FFD700;
      // opacity: 1; // 移除此行，让收藏状态默认也隐藏
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xxl * 2;
  color: $text-muted;

  .empty-icon {
    font-size: 64px;
    margin-bottom: $spacing-md;
  }

  p {
    margin-bottom: $spacing-sm;
  }

  .empty-hint {
    font-size: $font-size-sm;
  }
}
</style>
