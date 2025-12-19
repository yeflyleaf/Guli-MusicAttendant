<template>
  <div class="recently-played-view">
    <div class="page-header">
      <div class="header-left">
        <el-icon class="page-icon">
          <Clock />
        </el-icon>
        <div>
          <h1 class="page-title">最近播放</h1>
          <span class="music-count">共 {{ libraryStore.recentlyPlayed.length }} 首</span>
        </div>
      </div>
      <div class="header-right">
        <SearchBar class="local-search" />
        <el-button type="primary" @click="handlePlayAll" :disabled="libraryStore.recentlyPlayed.length === 0">
          <el-icon>
            <VideoPlay />
          </el-icon>
          播放全部
        </el-button>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="music-list" ref="scrollContainer" v-if="libraryStore.recentlyPlayed.length > 0">
      <div v-for="(song, index) in visibleRecentlyPlayed" :key="song.id" class="list-item"
        :class="{ active: playerStore.currentSong?.id === song.id }" @dblclick="handlePlay(index)">
        <span class="col-index">{{ index + 1 }}</span>

        <div class="col-title">
          <div class="song-cover-small">
            <img v-if="song.cover_path" :src="`local-image://${song.cover_path.replace(/\\\\/g, '/')}`" alt=""
              loading="lazy" />
            <el-icon v-else>
              <Headset />
            </el-icon>
          </div>
          <div class="song-info">
            <div class="song-name truncate" :title="song.title">{{ song.title }}</div>
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
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-icon class="empty-icon">
        <Clock />
      </el-icon>
      <p>暂无播放记录</p>
      <p class="empty-hint">播放过的歌曲会显示在这里</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '@/components/Base/SearchBar.vue'
import { useLibraryStore } from '@/store/library.store'
import { usePlayerStore } from '@/store/player.store'
import { formatDuration, formatRelativeTime } from '@/utils/format'
import { Clock, Headset, Star, StarFilled, VideoPlay } from '@element-plus/icons-vue'
import { computed, nextTick, onActivated, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

// 定义组件名称，用于 keep-alive 的 include 匹配
defineOptions({
  name: 'RecentlyPlayed'
})

const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()

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
  return libraryStore.recentlyPlayed.slice(0, renderLimit.value)
})

onMounted(() => {
  // 延迟执行全量渲染，确保页面切换动画（通常300-500ms）完全结束
  setTimeout(() => {
    const total = libraryStore.recentlyPlayed.length
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
  if (libraryStore.recentlyPlayed.length > 0) {
    playerStore.setQueue(libraryStore.recentlyPlayed, 0)
  }
}

const handlePlay = (index: number) => {
  playerStore.setQueue(libraryStore.recentlyPlayed, index)
}

const handleToggleFavorite = async (id: number) => {
  await libraryStore.toggleFavorite(id)
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

    .local-search {
      width: 200px;
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
  width: 60px;
  display: flex;
  justify-content: flex-end;

  .action-btn {
    font-size: 18px;
    color: $text-muted;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    opacity: 0;
    transition: all $transition-fast;

    &.active {
      color: $accent-color;
      opacity: 1;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
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
