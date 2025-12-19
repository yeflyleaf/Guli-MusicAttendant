<template>
  <div class="playlist-detail-view" v-if="playlist">
    <!-- 歌单头部 -->
    <div class="playlist-header">
      <div class="playlist-cover">
        <el-icon>
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
          <el-button @click="showEditDialog = true">
            <el-icon>
              <Edit />
            </el-icon>
            编辑
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

    <!-- 歌曲列表 -->
    <div class="songs-list" ref="scrollContainer" v-if="songs.length > 0">
      <div v-for="(song, index) in visibleSongs" :key="song.id" class="list-item"
        :class="{ active: playerStore.currentSong?.id === song.id }" @dblclick="handlePlay(index)">
        <span class="col-index">{{ index + 1 }}</span>

        <div class="col-title">
          <div class="song-cover-small">
            <img v-if="song.cover_path" :src="`local-image://${song.cover_path.replace(/\\\\/g, '/')}`" alt="" />
            <el-icon v-else>
              <Headset />
            </el-icon>
          </div>
          <div class="song-info">
            <div class="song-name truncate" :title="song.title">{{ song.title }}</div>
            <div class="song-artist truncate" :title="song.artist">{{ song.artist }}</div>
          </div>
        </div>

        <span class="col-duration">{{ formatDuration(song.duration) }}</span>

        <div class="col-actions">
          <el-icon class="action-btn" @click.stop="handleRemoveSong(song.id)">
            <Close />
          </el-icon>
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
import { useLibraryStore } from '@/store/library.store'
import { usePlayerStore } from '@/store/player.store'
import type { Music } from '@/types/music'
import type { Playlist } from '@/types/playlist'
import { formatDate, formatDuration } from '@/utils/format'
import { Close, Delete, Edit, Headset, Loading, Tickets, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onActivated, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

// 定义组件名称，用于 keep-alive 的 include 匹配
defineOptions({
  name: 'PlaylistDetail'
})

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const libraryStore = useLibraryStore()

const playlist = ref<Playlist | null>(null)
const songs = ref<Music[]>([])
const showEditDialog = ref(false)
const editForm = ref({ name: '', description: '' })

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

// 渐进式渲染
const renderLimit = ref(10)
const visibleSongs = computed(() => {
  return songs.value.slice(0, renderLimit.value)
})

const startProgressiveRendering = () => {
  renderLimit.value = 10 // 重置为初始值

  setTimeout(() => {
    const total = songs.value.length
    const batchSize = 50

    const renderNextBatch = () => {
      if (renderLimit.value < total) {
        renderLimit.value = Math.min(renderLimit.value + batchSize, total)
        requestAnimationFrame(renderNextBatch)
      }
    }

    requestAnimationFrame(renderNextBatch)
  }, 300) // 稍微延迟一点，等待 DOM 更新
}

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
    // 开始渐进式渲染
    startProgressiveRendering()
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

// 删除歌单
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个歌单吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await libraryStore.deletePlaylist(playlist.value!.id)
    ElMessage.success('歌单已删除')
    router.push('/')
  } catch {
    // 用户取消
  }
}

// 从歌单移除歌曲
const handleRemoveSong = async (musicId: number) => {
  await window.electron.playlist.removeMusic(playlist.value!.id, musicId)
  songs.value = songs.value.filter(s => s.id !== musicId)
  await libraryStore.refreshPlaylists()
  ElMessage.success('已从歌单移除')
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
}

.col-index {
  width: 40px;
  color: $text-muted;
  font-size: $font-size-sm;
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
  width: 40px;
  display: flex;
  justify-content: flex-end;

  .action-btn {
    font-size: 16px;
    color: $text-muted;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    opacity: 0;
    transition: all $transition-fast;

    &:hover {
      color: $error-color;
      background: rgba($error-color, 0.1);
    }
  }
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
</style>
