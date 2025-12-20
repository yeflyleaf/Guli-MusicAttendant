<template>
  <div class="playlists-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="gradient-text">{{ $t('playlist.title') }}</span>
      </h1>
      <p class="page-subtitle">{{ $t('common.total') }} {{ displayedPlaylists.length }} / {{
        libraryStore.playlists.length }} {{ $t('common.playlists') }}</p>
    </div>

    <!-- 操作栏 -->
    <div class="toolbar">
      <!-- 本地搜索框 -->
      <div class="local-search-box">
        <el-icon class="search-icon">
          <Search />
        </el-icon>
        <input v-model="localSearchKeyword" type="text" class="search-input"
          :placeholder="$t('playlist.searchPlaceholder')" @input="handleLocalSearch" />
        <el-icon v-if="localSearchKeyword" class="search-clear" @click="clearLocalSearch">
          <Close />
        </el-icon>
      </div>
      <el-button type="primary" @click="handleCreatePlaylist">
        <el-icon>
          <Plus />
        </el-icon>
        {{ $t('playlist.createNew') }}
      </el-button>
    </div>

    <!-- 歌单网格 -->
    <div class="playlist-grid" :class="{ 'fullscreen': isFullscreen }" v-if="displayedPlaylists.length > 0">
      <div v-for="playlist in displayedPlaylists" :key="playlist.id" class="playlist-card glass"
        @click="$router.push(`/playlist/${playlist.id}`)">
        <!-- 封面 -->
        <div class="playlist-cover">
          <img v-if="playlist.first_cover && playlist.first_cover.length > 5"
            :src="`local-image://${playlist.first_cover.replace(/\\\\/g, '/')}`" alt="" loading="lazy"
            class="cover-image" />
          <div v-else class="cover-placeholder">
            <el-icon>
              <Tickets />
            </el-icon>
          </div>
          <!-- 悬停遮罩 -->
          <div class="cover-overlay">
            <el-icon class="play-icon">
              <VideoPlay />
            </el-icon>
          </div>
          <!-- 歌曲数量标签 -->
          <div class="song-count-badge">
            {{ playlist.song_count }} {{ $t('common.songs') }}
          </div>
        </div>

        <!-- 歌单信息 -->
        <div class="playlist-info">
          <div class="playlist-name truncate" :title="playlist.name">
            {{ playlist.name }}
          </div>
          <div class="playlist-desc truncate" v-if="playlist.description">
            {{ playlist.description }}
          </div>
          <div class="playlist-meta">
            <span class="meta-item">
              <el-icon>
                <Calendar />
              </el-icon>
              {{ formatDate(playlist.created_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state glass" v-else>
      <el-icon class="empty-icon">
        <Tickets />
      </el-icon>
      <h3>{{ $t('playlist.noPlaylists') }}</h3>
      <el-button type="primary" size="large" @click="handleCreatePlaylist">
        <el-icon>
          <Plus />
        </el-icon>
        {{ $t('playlist.createNew') }}
      </el-button>
    </div>

    <!-- 创建歌单对话框 -->
    <el-dialog v-model="showCreateDialog" :title="$t('playlist.createNew')" width="400px" :close-on-click-modal="false">
      <el-form :model="newPlaylist" label-width="80px">
        <el-form-item :label="$t('playlist.playlistName')">
          <el-input v-model="newPlaylist.name" :placeholder="$t('playlist.playlistName')" maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmCreatePlaylist">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useLibraryStore } from '@/store/library.store'
import { Calendar, Close, Plus, Search, Tickets, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'Playlists'
})

const router = useRouter()
const libraryStore = useLibraryStore()

// ==================== 响应式全屏检测 ====================
const isFullscreen = ref(false)

// 检查是否全屏/最大化
const checkFullscreen = () => {
  const screenWidth = window.screen.availWidth
  const screenHeight = window.screen.availHeight
  const windowWidth = window.outerWidth
  const windowHeight = window.outerHeight
  // 如果窗口尺寸接近屏幕可用尺寸，认为是全屏/最大化状态
  isFullscreen.value = windowWidth >= screenWidth - 50 && windowHeight >= screenHeight - 50
}

onMounted(() => {
  checkFullscreen()
  window.addEventListener('resize', checkFullscreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkFullscreen)
})

// ==================== 本地搜索功能 ====================
const localSearchKeyword = ref('')

// 根据搜索关键词过滤歌单
const displayedPlaylists = computed(() => {
  const keyword = localSearchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return libraryStore.playlists
  }
  return libraryStore.playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(keyword) ||
    playlist.description?.toLowerCase().includes(keyword)
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

// 创建歌单相关
const showCreateDialog = ref(false)
const newPlaylist = ref({
  name: '',
  description: ''
})

const handleCreatePlaylist = () => {
  newPlaylist.value = { name: '', description: '' }
  showCreateDialog.value = true
}

const confirmCreatePlaylist = async () => {
  if (!newPlaylist.value.name.trim()) {
    ElMessage.warning('请输入歌单名称')
    return
  }

  const id = await libraryStore.createPlaylist(
    newPlaylist.value.name.trim(),
    newPlaylist.value.description.trim()
  )

  if (id) {
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    router.push(`/playlist/${id}`)
  } else {
    ElMessage.error('创建失败')
  }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style lang="scss" scoped>
.playlists-view {
  min-height: 100%;
  padding-bottom: $spacing-xl;
}

.page-header {
  margin-bottom: $spacing-lg;

  .page-title {
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-xs;
  }

  .page-subtitle {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;

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
}

// 歌单网格 - 默认每行5个
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-md;

  // 全屏时每行7个
  &.fullscreen {
    grid-template-columns: repeat(7, 1fr);
    gap: $spacing-lg;
  }
}

// 歌单卡片
.playlist-card {
  border-radius: $border-radius-lg;
  overflow: hidden;
  cursor: pointer;
  transition: all $transition-normal;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;

    .cover-overlay {
      opacity: 1;
    }

    .cover-image,
    .cover-placeholder {
      transform: scale(1.05);
    }
  }
}

// 歌单封面
.playlist-cover {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: $bg-tertiary;

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-normal;
  }

  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gradient-card;
    transition: transform $transition-normal;

    .el-icon {
      font-size: 48px;
      color: $text-muted;

      // 全屏/大窗口时使用更大的图标
      @media (min-width: 1400px) {
        font-size: 64px;
      }
    }
  }

  .cover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity $transition-fast;

    .play-icon {
      font-size: 36px;
      color: white;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));

      // 全屏/大窗口时使用更大的图标
      @media (min-width: 1400px) {
        font-size: 48px;
      }
    }
  }

  .song-count-badge {
    position: absolute;
    bottom: $spacing-sm;
    right: $spacing-sm;
    padding: 4px 8px;
    font-size: $font-size-xs;
    color: white;
    background: rgba(0, 0, 0, 0.6);
    border-radius: $border-radius-sm;
    backdrop-filter: blur(4px);
  }
}

// 歌单信息
.playlist-info {
  padding: $spacing-md;

  .playlist-name {
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }

  .playlist-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }

  .playlist-meta {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: $font-size-xs;
      color: $text-muted;

      .el-icon {
        font-size: 1rem;
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xxl * 2;
  border-radius: $border-radius-xl;
  text-align: center;

  .empty-icon {
    font-size: 80px;
    color: $primary-color;
    margin-bottom: $spacing-lg;
  }

  h3 {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-sm;
  }

  p {
    color: $text-secondary;
    margin-bottom: $spacing-lg;
  }
}
</style>
