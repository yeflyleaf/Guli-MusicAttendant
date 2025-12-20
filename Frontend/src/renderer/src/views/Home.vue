<template>
  <div class="home-view">
    <!-- 欢迎区域 -->
    <section class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          <span class="gradient-text">欢迎使用故里音乐助手</span>
          <span class="wave">👋</span>
        </h1>
        <p class="welcome-subtitle">让音乐充满你的每一天</p>
      </div>
      <div class="welcome-stats">
        <div class="stat-card glass">
          <el-icon class="stat-icon">
            <Headset />
          </el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ libraryStore.musicCount }}</span>
            <span class="stat-label">首歌曲</span>
          </div>
        </div>
        <div class="stat-card glass">
          <el-icon class="stat-icon">
            <Tickets />
          </el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ libraryStore.playlistCount }}</span>
            <span class="stat-label">个歌单</span>
          </div>
        </div>
        <div class="stat-card glass">
          <el-icon class="stat-icon">
            <Star />
          </el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ libraryStore.favoriteCount }}</span>
            <span class="stat-label">首收藏</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start" v-if="libraryStore.musicCount === 0">
      <div class="empty-state glass">
        <el-icon class="empty-icon">
          <FolderAdd />
        </el-icon>
        <h3>开始使用</h3>
        <p>添加您的音乐文件夹，开始管理本地音乐</p>
        <el-button type="primary" size="large" @click="handleAddFolder">
          <el-icon>
            <Plus />
          </el-icon>
          添加音乐文件夹
        </el-button>
      </div>
    </section>

    <!-- 最近播放 -->
    <section class="section" v-if="libraryStore.recentlyPlayed.length > 0">
      <div class="section-header">
        <h2 class="section-title">最近播放</h2>
        <router-link to="/recently-played" class="section-more">
          查看全部 <el-icon>
            <ArrowRight />
          </el-icon>
        </router-link>
      </div>
      <div class="song-grid">
        <SongCard v-for="song in libraryStore.recentlyPlayed.slice(0, displayCount)" :key="song.id" :song="song"
          @play="handlePlay" />
      </div>
    </section>

    <!-- 我的收藏 -->
    <section class="section" v-if="libraryStore.favorites.length > 0">
      <div class="section-header">
        <h2 class="section-title">我喜欢的音乐</h2>
        <router-link to="/favorites" class="section-more">
          查看全部 <el-icon>
            <ArrowRight />
          </el-icon>
        </router-link>
      </div>
      <div class="song-grid">
        <SongCard v-for="song in libraryStore.favorites.slice(0, displayCount)" :key="song.id" :song="song"
          @play="handlePlay" />
      </div>
    </section>

    <!-- 我的歌单 -->
    <section class="section" v-if="libraryStore.playlists.length > 0">
      <div class="section-header">
        <h2 class="section-title">我的歌单</h2>
      </div>
      <div class="playlist-grid">
        <div v-for="playlist in libraryStore.playlists.slice(0, 4)" :key="playlist.id" class="playlist-card glass"
          @click="$router.push(`/playlist/${playlist.id}`)">
          <div class="playlist-cover">
            <el-icon>
              <Tickets />
            </el-icon>
          </div>
          <div class="playlist-info">
            <div class="playlist-name truncate" :title="playlist.name">{{ playlist.name }}</div>
            <div class="playlist-count">{{ playlist.song_count }} 首歌曲</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import SongCard from '@/components/Base/SongCard.vue'
import { useIpc } from '@/hooks/useIpc'
import { useLibraryStore } from '@/store/library.store'
import { usePlayerStore } from '@/store/player.store'
import { useSettingsStore } from '@/store/settings.store'
import type { Music } from '@/types/music'
import { ArrowRight, FolderAdd, Headset, Plus, Star, Tickets } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()
const settingsStore = useSettingsStore()
const { selectFolder, scanFolder } = useIpc()

// 响应式全屏状态
const isFullscreen = ref(false)

// 根据全屏状态计算显示数量：默认5个，全屏7个
const displayCount = computed(() => isFullscreen.value ? 7 : 5)

// 检查是否全屏
const checkFullscreen = () => {
  // 检查窗口是否最大化（接近屏幕尺寸）
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

// 添加音乐文件夹
const handleAddFolder = async () => {
  const folder = await selectFolder()
  if (!folder) return

  // 添加到设置
  const success = await settingsStore.addMusicFolder(folder)
  if (!success) {
    ElMessage.error('添加文件夹失败')
    return
  }

  // 扫描文件夹
  ElMessage.info('正在扫描音乐文件...')
  const result = await scanFolder(folder)

  if (result) {
    ElMessage.success(`扫描完成：新增 ${result.added} 首歌曲`)
    await libraryStore.refreshMusic()
  }
}

// 播放歌曲
const handlePlay = (song: Music) => {
  playerStore.play(song)
}
</script>

<style lang="scss" scoped>
.home-view {
  min-height: 100%;
  padding-bottom: $spacing-xl;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-xxl;
  padding: $spacing-xl;
  background: $gradient-card;
  border-radius: $border-radius-xl;
  border: 1px solid $border-color;
}

.welcome-content {
  .welcome-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-sm;

    .wave {
      animation: wave 2s ease-in-out infinite;
    }
  }

  .welcome-subtitle {
    font-size: $font-size-md;
    color: $text-secondary;
  }
}

@keyframes wave {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(20deg);
  }

  75% {
    transform: rotate(-20deg);
  }
}

.welcome-stats {
  display: flex;
  gap: $spacing-md;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  border-radius: $border-radius-lg;
  min-width: 140px;

  .stat-icon {
    font-size: 28px;
    color: $primary-color;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .stat-label {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.quick-start {
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-xxl * 2;
    border-radius: $border-radius-xl;
    text-align: center;

    .empty-icon {
      font-size: 64px;
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
}

.section {
  margin-bottom: $spacing-xl;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
  }

  .section-more {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-sm;
    color: $text-muted;

    &:hover {
      color: $primary-color;
    }
  }
}

.song-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: $spacing-md;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: $spacing-md;
}

.playlist-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $bg-hover;
    transform: translateY(-2px);
  }

  .playlist-cover {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gradient-primary;
    border-radius: $border-radius-md;
    color: white;
    font-size: 24px;
  }

  .playlist-info {
    flex: 1;
    min-width: 0;
  }

  .playlist-name {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin-bottom: 4px;
  }

  .playlist-count {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}
</style>
