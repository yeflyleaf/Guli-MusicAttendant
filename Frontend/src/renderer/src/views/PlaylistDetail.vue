<template>
  <div class="playlist-detail-view" v-if="playlist">
    <!-- 歌单头部 -->
    <div class="playlist-header">
      <div class="playlist-cover">
        <img v-if="firstSongCover" :src="`local-image://${firstSongCover.replace(/\\\\/g, '/')}`" alt="" />
        <el-icon v-else>
          <Tickets />
        </el-icon>
      </div>
      <div class="playlist-info">
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <p class="playlist-desc" v-if="playlist.description">{{ playlist.description }}</p>
        <div class="playlist-meta">
          <span>{{ playlist.song_count }} 首歌曲</span>
          <span>•</span>
          <span>创建于 {{ formatDate(playlist.created_at) }}</span>
        </div>
        <div class="playlist-actions">
          <el-button type="primary" @click="handlePlayAll" :disabled="songs.length === 0">
            <el-icon>
              <VideoPlay />
            </el-icon>
            播放全部
          </el-button>
          <el-button @click="handleOpenImport">
            <el-icon>
              <Plus />
            </el-icon>
            导入歌曲
          </el-button>
          <el-button :type="isEditMode ? 'primary' : 'default'" @click="toggleEditMode">
            <el-icon>
              <Edit />
            </el-icon>
            {{ isEditMode ? '完成' : '编辑' }}
          </el-button>
          <el-button type="danger" plain @click="handleDelete">
            <el-icon>
              <Delete />
            </el-icon>
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 编辑模式工具栏 -->
    <div class="toolbar" v-if="songs.length > 0 && isEditMode">
      <div class="toolbar-left">
        <el-checkbox v-model="selectAll" :indeterminate="isIndeterminate" @change="handleSelectAll">
          全选
        </el-checkbox>
        <el-button v-if="selectedIds.size > 0" text type="danger" @click="handleBatchRemove">
          移除选中 ({{ selectedIds.size }})
        </el-button>
      </div>
      <el-button text @click="showEditDialog = true">
        <el-icon>
          <Setting />
        </el-icon>
        修改歌单信息
      </el-button>
    </div>

    <!-- 歌曲列表 -->
    <div class="songs-list" ref="scrollContainer" v-if="songs.length > 0">
      <div ref="sortableList" class="sortable-container">
        <div v-for="(song, index) in songs" :key="song.id" :data-id="song.id" class="list-item" :class="{
          active: playerStore.currentSong?.id === song.id,
          selected: selectedIds.has(song.id),
          'is-draggable': isEditMode,
          invalid: libraryStore.invalidMusicIds.has(song.id)
        }" @dblclick="handlePlay(index)">
          <!-- 拖拽手柄 -->
          <span class="col-drag" v-if="isEditMode">
            <el-icon class="drag-handle">
              <Menu />
            </el-icon>
          </span>

          <span class="col-index">
            <el-checkbox v-if="isEditMode" :model-value="selectedIds.has(song.id)"
              @change="(checked: boolean) => handleSelect(song.id, checked)" @click.stop />
            <span class="index-num" v-show="!isEditMode || !selectedIds.has(song.id)">{{ index + 1 }}</span>
          </span>

          <div class="col-title">
            <div class="song-cover-small">
              <img v-if="song.cover_path && song.cover_path.length > 5"
                :src="`local-image://${song.cover_path.replace(/\\\\/g, '/')}`" alt="" />
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

          <span class="col-duration">{{ formatDuration(song.duration) }}</span>

          <div class="col-actions">
            <el-tooltip content="从歌单移除" placement="top">
              <el-icon class="action-btn remove-btn" @click.stop="handleRemoveSong(song.id)">
                <Delete />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-icon class="empty-icon">
        <Tickets />
      </el-icon>
      <p>歌单暂无歌曲</p>
      <p class="empty-hint">在本地音乐页面将歌曲添加到歌单</p>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑歌单" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="歌单名称">
          <el-input v-model="editForm.name" placeholder="请输入歌单名称" />
        </el-form-item>
        <el-form-item label="歌单描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="添加描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入歌曲对话框 -->
    <el-dialog v-model="showImportDialog" title="导入歌曲" width="700px" :close-on-click-modal="false"
      class="import-dialog">
      <!-- 搜索框 -->
      <div class="import-search">
        <el-input v-model="importSearchKeyword" placeholder="搜索歌曲..." :prefix-icon="Search" clearable />
        <div class="import-stats">
          <span>已选择 {{ importSelectedIds.size }} 首</span>
          <el-button text size="small" @click="handleImportSelectAll" v-if="filteredImportMusic.length > 0">
            {{ isAllImportSelected ? '取消全选' : '全选' }}
          </el-button>
        </div>
      </div>

      <!-- 歌曲列表 -->
      <div class="import-list">
        <div v-for="song in filteredImportMusic" :key="song.id" class="import-item" :class="{
          selected: importSelectedIds.has(song.id),
          disabled: existingSongIds.has(song.id)
        }" @click="handleToggleImportSelect(song)">
          <el-checkbox :model-value="importSelectedIds.has(song.id)" :disabled="existingSongIds.has(song.id)"
            @click.stop @change="handleToggleImportSelect(song)" />
          <div class="import-song-cover">
            <img v-if="song.cover_path && song.cover_path.length > 5"
              :src="`local-image://${song.cover_path.replace(/\\\\/g, '/')}`" alt="" loading="lazy" />
            <el-icon v-else>
              <Headset />
            </el-icon>
          </div>
          <div class="import-song-info">
            <div class="import-song-title truncate" :title="song.title">{{ song.title }}</div>
            <div class="import-song-artist truncate" :title="song.artist">{{ song.artist }}</div>
          </div>
          <span class="import-song-duration">{{ formatDuration(song.duration) }}</span>
          <span v-if="existingSongIds.has(song.id)" class="import-existing-tag">已添加</span>
        </div>
        <div v-if="filteredImportMusic.length === 0" class="import-empty">
          <el-icon>
            <Tickets />
          </el-icon>
          <p>{{ importSearchKeyword ? '未找到匹配的歌曲' : '本地音乐库为空' }}</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" :disabled="importSelectedIds.size === 0" @click="handleImportSongs">
          导入 ({{ importSelectedIds.size }})
        </el-button>
      </template>
    </el-dialog>
  </div>

  <!-- 加载中 -->
  <div v-else class="loading-state">
    <el-icon class="loading-icon">
      <Loading />
    </el-icon>
    <p>加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { showConfirm } from '@/hooks/useConfirm'
import { useLibraryStore } from '@/store/library.store'
import { usePlayerStore } from '@/store/player.store'
import type { Music } from '@/types/music'
import type { Playlist } from '@/types/playlist'
import { formatDate, formatDuration } from '@/utils/format'
import { Delete, Edit, Headset, Loading, Menu, Plus, Search, Setting, Tickets, VideoPlay, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Sortable from 'sortablejs'
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

// 定义组件名称，用于 keep-alive 的 include 匹配
defineOptions({
  name: 'PlaylistDetail'
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const playerStore = usePlayerStore()
const libraryStore = useLibraryStore()

const playlist = ref<Playlist | null>(null)
const songs = ref<Music[]>([])
const showEditDialog = ref(false)
const editForm = ref({ name: '', description: '' })

// 导入歌曲对话框状态
const showImportDialog = ref(false)
const importSearchKeyword = ref('')
const importSelectedIds = ref<Set<number>>(new Set())

// 批量选择状态
const selectedIds = ref<Set<number>>(new Set())
const selectAll = ref(false)
const isIndeterminate = computed(() => {
  return selectedIds.value.size > 0 && selectedIds.value.size < songs.value.length
})

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

// 滚动容器引用和滚动位置保存
const scrollContainer = ref<HTMLElement | null>(null)
const savedScrollTop = ref(0)

// Sortable.js 相关引用
const sortableList = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

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

// 初始化 Sortable 实例
const initSortable = () => {
  if (!sortableList.value) return

  // 如果已存在实例，先销毁
  if (sortableInstance) {
    sortableInstance.destroy()
  }

  sortableInstance = Sortable.create(sortableList.value, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'drag-ghost',
    chosenClass: 'drag-chosen',
    dragClass: 'drag-item',
    disabled: !isEditMode.value,
    onEnd: handleDragEnd
  })
}

// 销毁 Sortable 实例
const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

// 监听编辑模式变化，启用/禁用 Sortable
watch(isEditMode, (newValue) => {
  if (sortableInstance) {
    sortableInstance.option('disabled', !newValue)
  }
})

// 监听歌曲列表变化，重新初始化 Sortable
watch(() => songs.value.length, () => {
  nextTick(() => {
    if (songs.value.length > 0 && sortableList.value) {
      initSortable()
    }
  })
})

// 组件卸载时销毁 Sortable 实例
onBeforeUnmount(() => {
  destroySortable()
})

// 获取第一首歌的封面（调整顺序后立即更新）
const firstSongCover = computed(() => {
  const firstSong = songs.value[0]
  if (firstSong && firstSong.cover_path && firstSong.cover_path.length > 5) {
    return firstSong.cover_path
  }
  return null
})

// 加载歌单数据
const loadPlaylist = async () => {
  const id = Number(route.params.id)
  if (!id) return

  playlist.value = await window.electron.playlist.getById(id) || null

  if (playlist.value) {
    songs.value = await window.electron.playlist.getMusic(id)
    editForm.value = {
      name: playlist.value.name,
      description: playlist.value.description || ''
    }
  }
}

// 播放全部
const handlePlayAll = () => {
  if (songs.value.length > 0) {
    playerStore.setQueue(songs.value, 0)
  }
}

// 播放单曲
const handlePlay = (index: number) => {
  playerStore.setQueue(songs.value, index)
}

// 拖拽排序完成后保存新顺序
const handleDragEnd = async (evt: Sortable.SortableEvent) => {
  if (!playlist.value) return
  const { oldIndex, newIndex } = evt
  if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return

  // 更新本地 songs 数组顺序
  const movedItem = songs.value.splice(oldIndex, 1)[0]
  songs.value.splice(newIndex, 0, movedItem)

  // 获取新的歌曲ID顺序
  const musicIds = songs.value.map(song => song.id)

  // 保存到数据库
  await window.electron.playlist.updateOrder(playlist.value.id, musicIds)

  // 刷新歌单列表（更新侧边栏的封面显示）
  await libraryStore.refreshPlaylists()

  ElMessage.success('歌曲顺序已更新')
}

// 删除歌单
const handleDelete = async () => {
  const confirmed = await showConfirm({ message: t('playlist.confirmDelete', { name: playlist.value!.name }), type: 'warning' })
  if (!confirmed) return

  await libraryStore.deletePlaylist(playlist.value!.id)
  ElMessage.success('歌单已删除')
  router.push('/')
}

// 从歌单移除歌曲
const handleRemoveSong = async (musicId: number) => {
  await window.electron.playlist.removeMusic(playlist.value!.id, musicId)
  songs.value = songs.value.filter(s => s.id !== musicId)
  selectedIds.value.delete(musicId)
  await libraryStore.refreshPlaylists()
  ElMessage.success('已从歌单移除')
}

// 全选
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedIds.value = new Set(songs.value.map(s => s.id))
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

// 批量移除
const handleBatchRemove = async () => {
  if (selectedIds.value.size === 0 || !playlist.value) return

  const confirmed = await showConfirm({
    message: t('playlist.confirmRemoveSongs', { count: selectedIds.value.size }),
    type: 'warning'
  })
  if (!confirmed) return

  // 逐个移除（目前没有批量移除API）
  for (const musicId of selectedIds.value) {
    await window.electron.playlist.removeMusic(playlist.value.id, musicId)
  }

  // 更新本地状态
  songs.value = songs.value.filter(s => !selectedIds.value.has(s.id))
  selectedIds.value = new Set()
  selectAll.value = false

  await libraryStore.refreshPlaylists()
  ElMessage.success('已移除选中的歌曲')
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editForm.value.name.trim()) {
    ElMessage.warning('请输入歌单名称')
    return
  }

  await window.electron.playlist.update(playlist.value!.id, {
    name: editForm.value.name.trim(),
    description: editForm.value.description.trim()
  })

  playlist.value!.name = editForm.value.name.trim()
  playlist.value!.description = editForm.value.description.trim()

  await libraryStore.refreshPlaylists()
  showEditDialog.value = false
  ElMessage.success('保存成功')
}

onMounted(loadPlaylist)

watch(() => route.params.id, loadPlaylist)

// ==================== 导入歌曲相关 ====================

// 当前歌单已有歌曲的 ID 集合
const existingSongIds = computed(() => {
  return new Set(songs.value.map(s => s.id))
})

// 过滤后的可导入音乐列表
const filteredImportMusic = computed(() => {
  const keyword = importSearchKeyword.value.trim().toLowerCase()
  const allMusic = libraryStore.allMusic

  if (!keyword) {
    return allMusic
  }

  return allMusic.filter(song =>
    song.title.toLowerCase().includes(keyword) ||
    song.artist?.toLowerCase().includes(keyword) ||
    song.album?.toLowerCase().includes(keyword)
  )
})

// 导入对话框是否全选（排除已添加的歌曲）
const isAllImportSelected = computed(() => {
  const selectable = filteredImportMusic.value.filter(s => !existingSongIds.value.has(s.id))
  if (selectable.length === 0) return false
  return selectable.every(s => importSelectedIds.value.has(s.id))
})

// 打开导入对话框
const handleOpenImport = () => {
  importSearchKeyword.value = ''
  importSelectedIds.value = new Set()
  showImportDialog.value = true
}

// 切换选择
const handleToggleImportSelect = (song: Music) => {
  if (existingSongIds.value.has(song.id)) return

  if (importSelectedIds.value.has(song.id)) {
    importSelectedIds.value.delete(song.id)
  } else {
    importSelectedIds.value.add(song.id)
  }
  // 触发响应式更新
  importSelectedIds.value = new Set(importSelectedIds.value)
}

// 导入对话框全选/取消全选
const handleImportSelectAll = () => {
  const selectable = filteredImportMusic.value.filter(s => !existingSongIds.value.has(s.id))

  if (isAllImportSelected.value) {
    // 取消全选
    for (const song of selectable) {
      importSelectedIds.value.delete(song.id)
    }
  } else {
    // 全选
    for (const song of selectable) {
      importSelectedIds.value.add(song.id)
    }
  }
  importSelectedIds.value = new Set(importSelectedIds.value)
}

// 执行导入
const handleImportSongs = async () => {
  if (importSelectedIds.value.size === 0 || !playlist.value) return

  const musicIds = Array.from(importSelectedIds.value)

  try {
    const addedCount = await window.electron.playlist.addMusicBatch(playlist.value.id, musicIds)

    // 刷新歌单数据
    songs.value = await window.electron.playlist.getMusic(playlist.value.id)
    await libraryStore.refreshPlaylists()

    showImportDialog.value = false
    ElMessage.success(`成功导入 ${addedCount} 首歌曲`)
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
}
</script>

<style lang="scss" scoped>
.playlist-detail-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.playlist-header {
  display: flex;
  gap: $spacing-xl;
  padding: $spacing-xl;
  background: $gradient-card;
  border-radius: $border-radius-xl;
  margin-bottom: $spacing-xl;
}

.playlist-cover {
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-primary;
  border-radius: $border-radius-lg;
  color: white;
  font-size: 64px;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .playlist-name {
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-sm;
  }

  .playlist-desc {
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }

  .playlist-meta {
    display: flex;
    gap: $spacing-sm;
    color: $text-muted;
    font-size: $font-size-sm;
    margin-bottom: $spacing-lg;
  }

  .playlist-actions {
    display: flex;
    gap: $spacing-sm;
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

.songs-list {
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
  contain-intrinsic-size: 0 64px;

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

  // 可拖拽状态
  &.is-draggable {
    cursor: move;
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

// 拖拽手柄列
.col-drag {
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .drag-handle {
    font-size: 18px;
    color: $text-muted;
    cursor: grab;
    transition: color $transition-fast;

    &:hover {
      color: $primary-color;
    }

    &:active {
      cursor: grabbing;
    }
  }
}

// 拖拽样式
.drag-ghost {
  opacity: 0.5;
  background: rgba(var(--primary-color-rgb), 0.1) !important;
}

.drag-chosen {
  background: $bg-hover !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.drag-item {
  background: $bg-secondary;
  border-radius: $border-radius-sm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.col-index {
  width: 50px;
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

.col-duration {
  width: 80px;
  text-align: right;
  color: $text-muted;
  font-size: $font-size-sm;
}

.col-actions {
  width: 60px;
  display: flex;
  justify-content: flex-end;

  .action-btn {
    font-size: 34px;
    color: $text-muted;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    opacity: 0;
    transition: all $transition-fast;

    &:hover {
      opacity: 1;
      color: $error-color;
      background: rgba($error-color, 0.15);
    }
  }
}

.list-item:hover .col-actions .action-btn {
  opacity: 1;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: $text-muted;

  .empty-icon,
  .loading-icon {
    font-size: 64px;
    margin-bottom: $spacing-md;
    color: $primary-color;
    opacity: 0.5;
  }

  .loading-icon {
    animation: spin 1s linear infinite;
  }

  p {
    margin-bottom: $spacing-sm;
  }

  .empty-hint {
    font-size: $font-size-sm;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ==================== 导入歌曲对话框样式 ====================
.import-search {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;

  :deep(.el-input) {
    flex: 1;
  }

  .import-stats {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $text-muted;
    font-size: $font-size-sm;
    white-space: nowrap;
  }
}

.import-list {
  height: 400px;
  overflow-y: auto;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-md;
  background: $bg-secondary;
}

.import-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover:not(.disabled) {
    background: $bg-hover;
  }

  &.selected {
    background: rgba(var(--primary-color-rgb), 0.1);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .import-song-cover {
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

  .import-song-info {
    flex: 1;
    min-width: 0;

    .import-song-title {
      font-size: $font-size-base;
      color: $text-primary;
      margin-bottom: 2px;
    }

    .import-song-artist {
      font-size: $font-size-sm;
      color: $text-muted;
    }
  }

  .import-song-duration {
    font-size: $font-size-sm;
    color: $text-muted;
    width: 60px;
    text-align: right;
  }

  .import-existing-tag {
    font-size: $font-size-xs;
    color: $text-muted;
    background: $bg-tertiary;
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.import-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $text-muted;

  .el-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }

  p {
    font-size: $font-size-sm;
  }
}
</style>
