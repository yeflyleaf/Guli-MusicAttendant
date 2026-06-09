<template>
  <aside class="sidebar">
    <!-- 主导航 -->
    <nav class="nav-section">
      <div class="nav-title">发现音乐</div>
      <router-link v-for="item in mainNavItems" :key="item.path" :to="item.path" class="nav-item"
        :class="{ active: $route.path === item.path }">
        <el-icon class="nav-icon">
          <component :is="item.icon" />
        </el-icon>
        <span class="nav-text">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- 我的音乐 -->
    <nav class="nav-section">
      <div class="nav-title">我的音乐</div>
      <router-link v-for="item in myMusicItems" :key="item.path" :to="item.path" class="nav-item"
        :class="{ active: $route.path === item.path }">
        <el-icon class="nav-icon">
          <component :is="item.icon" />
        </el-icon>
        <span class="nav-text">{{ item.label }}</span>
        <span v-if="item.count !== undefined" class="nav-count">{{ item.count }}</span>
      </router-link>
    </nav>

    <!-- 歌单列表 -->
    <nav class="nav-section playlists-section">
      <div class="nav-title">
        <span>我的歌单</span>
        <el-icon class="add-btn" @click="handleCreatePlaylist">
          <Plus />
        </el-icon>
      </div>
      <div class="playlist-list">
        <router-link v-for="playlist in libraryStore.playlists" :key="playlist.id" :to="`/playlist/${playlist.id}`"
          class="nav-item playlist-item" :class="{ active: $route.path === `/playlist/${playlist.id}` }">
          <div class="playlist-cover-small">
            <img v-if="playlist.first_cover && playlist.first_cover.length > 5"
              :src="`local-image://${playlist.first_cover.replace(/\\\\/g, '/')}`" alt="" loading="lazy" />
            <el-icon v-else class="nav-icon">
              <Tickets />
            </el-icon>
          </div>
          <span class="nav-text truncate" :title="playlist.name">{{ playlist.name }}</span>
          <span class="nav-count">{{ playlist.song_count }}</span>
        </router-link>
        <div v-if="libraryStore.playlists.length === 0" class="empty-playlists">
          暂无歌单
        </div>
      </div>
    </nav>

    <!-- 底部设置入口 -->
    <div class="sidebar-footer">
      <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
        <el-icon class="nav-icon">
          <Setting />
        </el-icon>
        <span class="nav-text">设置</span>
      </router-link>
    </div>

    <!-- 创建歌单对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建歌单" width="400px" :close-on-click-modal="false">
      <el-form :model="newPlaylist" label-width="80px">
        <el-form-item label="歌单名称">
          <el-input v-model="newPlaylist.name" placeholder="请输入歌单名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="歌单描述">
          <el-input v-model="newPlaylist.description" type="textarea" placeholder="添加简介（可选）" :rows="3"
            maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCreatePlaylist">创建</el-button>
      </template>
    </el-dialog>
  </aside>
</template>

<script setup lang="ts">
import { useLibraryStore } from '@/store/library.store'
import {
  Clock,
  Headset,
  HomeFilled,
  Plus,
  Setting,
  Star,
  Tickets
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()
const libraryStore = useLibraryStore()

// 主导航项
const mainNavItems = [
  { path: '/', label: '首页', icon: HomeFilled }
]

// 我的音乐导航项
const myMusicItems = computed(() => [
  { path: '/local-music', label: '本地音乐', icon: Headset, count: libraryStore.musicCount },
  { path: '/favorites', label: '我喜欢', icon: Star, count: libraryStore.favoriteCount },
  { path: '/recently-played', label: '最近播放', icon: Clock }
])

// 创建歌单
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
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: $sidebar-width;
  min-width: $sidebar-width;
  height: 100%;
  background: rgba($bg-secondary-rgb, 0.5);
  border-right: 1px solid $border-color;
  overflow: hidden;
}

.nav-section {
  padding: $spacing-md 0;

  &:not(:last-child) {
    border-bottom: 1px solid $border-color-light;
  }
}

.nav-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-xs;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .add-btn {
    font-size: 25px;
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      color: $primary-color;
      background: $bg-hover;
    }
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  margin: 2px $spacing-sm;
  color: $text-secondary;
  text-decoration: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    color: $text-primary;
    background: $bg-hover;
  }

  &.active {
    color: $text-primary;
    background: $gradient-card;

    .nav-icon {
      color: $primary-color;
    }
  }

  .nav-icon {
    font-size: 22px;
    transition: color $transition-fast;
  }

  .nav-text {
    flex: 1;
    font-size: $font-size-base;
  }

  .nav-count {
    font-size: $font-size-xs;
    color: $text-muted;
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.playlists-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .playlist-list {
    flex: 1;
    overflow-y: auto;
    padding-bottom: $spacing-md;
  }
}

.playlist-cover-small {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-tertiary;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .nav-icon {
    font-size: $font-size-md;
    color: $text-muted;
  }
}

.playlist-item {
  .nav-text {
    max-width: 120px;
  }
}

.empty-playlists {
  padding: $spacing-lg;
  text-align: center;
  color: $text-muted;
  font-size: $font-size-sm;
}

.sidebar-footer {
  padding: $spacing-md 0;
  border-top: 1px solid $border-color-light;
}
</style>
