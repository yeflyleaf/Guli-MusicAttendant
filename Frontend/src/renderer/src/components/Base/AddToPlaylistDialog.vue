<template>
  <el-dialog v-model="visible" title="添加到歌单" width="420px" :close-on-click-modal="true" class="add-to-playlist-dialog">
    <!-- 新建歌单入口 -->
    <div class="create-new" @click="showCreateForm = !showCreateForm">
      <el-icon class="create-icon">
        <Plus />
      </el-icon>
      <span>创建新歌单</span>
      <el-icon class="arrow-icon" :class="{ expanded: showCreateForm }">
        <ArrowDown />
      </el-icon>
    </div>

    <!-- 新建歌单表单 -->
    <transition name="slide">
      <div v-if="showCreateForm" class="create-form">
        <el-input v-model="newPlaylistName" placeholder="请输入歌单名称" maxlength="50" @keyup.enter="handleCreateAndAdd" />
        <el-button type="primary" size="small" :disabled="!newPlaylistName.trim()" @click="handleCreateAndAdd">
          创建并添加
        </el-button>
      </div>
    </transition>

    <!-- 分隔线 -->
    <el-divider v-if="playlists.length > 0">或选择已有歌单</el-divider>

    <!-- 歌单列表 -->
    <div class="playlist-list" v-if="playlists.length > 0">
      <div v-for="playlist in playlists" :key="playlist.id" class="playlist-item"
        :class="{ disabled: isInPlaylist(playlist.id) }" @click="handleAddToPlaylist(playlist)">
        <div class="playlist-cover">
          <img v-if="playlist.first_cover && playlist.first_cover.length > 5"
            :src="`local-image://${playlist.first_cover.replace(/\\\\/g, '/')}`" alt="" loading="lazy" />
          <el-icon v-else>
            <Tickets />
          </el-icon>
        </div>
        <div class="playlist-info">
          <div class="playlist-name truncate" :title="playlist.name">{{ playlist.name }}</div>
          <div class="playlist-count">{{ playlist.song_count }} 首歌曲</div>
        </div>
        <div class="playlist-status">
          <el-icon v-if="isInPlaylist(playlist.id)" class="added-icon">
            <Check />
          </el-icon>
          <el-icon v-else class="add-icon">
            <Plus />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!showCreateForm" class="empty-state">
      <el-icon class="empty-icon">
        <Tickets />
      </el-icon>
      <p>还没有歌单</p>
      <p class="hint">点击上方创建一个新歌单吧</p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useLibraryStore } from '@/store/library.store'
import type { Music } from '@/types/music'
import type { Playlist } from '@/types/playlist'
import { ArrowDown, Check, Plus, Tickets } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  song: Music | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const libraryStore = useLibraryStore()

// 对话框可见状态
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 歌单列表
const playlists = computed(() => libraryStore.playlists)

// 新建歌单相关
const showCreateForm = ref(false)
const newPlaylistName = ref('')

// 已存在于歌单中的歌单ID集合
const existingPlaylistIds = ref<Set<number>>(new Set())

// 检查是否已在歌单中
const isInPlaylist = (playlistId: number) => {
  return existingPlaylistIds.value.has(playlistId)
}

// 检查歌曲是否已在各个歌单中
const checkExistingPlaylists = async () => {
  if (!props.song) return

  existingPlaylistIds.value = new Set()

  for (const playlist of playlists.value) {
    const exists = await window.electron.playlist.hasMusic(playlist.id, props.song.id)
    if (exists) {
      existingPlaylistIds.value.add(playlist.id)
    }
  }
}

// 监听对话框打开
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    showCreateForm.value = false
    newPlaylistName.value = ''
    await checkExistingPlaylists()
  }
})

// 创建新歌单并添加歌曲
const handleCreateAndAdd = async () => {
  if (!newPlaylistName.value.trim() || !props.song) return

  const id = await libraryStore.createPlaylist(newPlaylistName.value.trim())

  if (id) {
    const success = await libraryStore.addToPlaylist(id, props.song.id)
    if (success) {
      ElMessage.success(`已添加到歌单"${newPlaylistName.value.trim()}"`)
      visible.value = false
    } else {
      ElMessage.error('添加失败')
    }
  } else {
    ElMessage.error('创建歌单失败')
  }
}

// 添加到已有歌单
const handleAddToPlaylist = async (playlist: Playlist) => {
  if (!props.song || isInPlaylist(playlist.id)) return

  const success = await libraryStore.addToPlaylist(playlist.id, props.song.id)

  if (success) {
    existingPlaylistIds.value.add(playlist.id)
    ElMessage.success(`已添加到歌单"${playlist.name}"`)
    visible.value = false
  } else {
    ElMessage.error('添加失败，可能歌曲已存在于歌单中')
  }
}
</script>

<style lang="scss" scoped>
.add-to-playlist-dialog {
  :deep(.el-dialog) {
    border-radius: $border-radius-lg;
    background: $bg-primary;
  }

  :deep(.el-dialog__header) {
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-color-light;
  }

  :deep(.el-dialog__body) {
    padding: $spacing-md $spacing-lg;
  }
}

.create-new {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-fast;
  background: rgba(var(--primary-color-rgb), 0.1);
  border: 1px dashed rgba(var(--primary-color-rgb), 0.3);

  &:hover {
    background: rgba(var(--primary-color-rgb), 0.15);
    border-color: $primary-color;
  }

  .create-icon {
    font-size: 20px;
    color: $primary-color;
  }

  span {
    flex: 1;
    font-size: $font-size-base;
    color: $text-primary;
  }

  .arrow-icon {
    font-size: 16px;
    color: $text-muted;
    transition: transform $transition-fast;

    &.expanded {
      transform: rotate(180deg);
    }
  }
}

.create-form {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $border-radius-md;

  :deep(.el-input) {
    flex: 1;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 80px;
  opacity: 1;
}

:deep(.el-divider__text) {
  background: $bg-primary;
  color: $text-muted;
  font-size: $font-size-sm;
}

.playlist-list {
  max-height: 300px;
  overflow-y: auto;
  margin: 0 (-$spacing-lg);
  padding: 0 $spacing-lg;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  margin: $spacing-xs 0;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover:not(.disabled) {
    background: $bg-hover;

    .add-icon {
      color: $primary-color;
    }
  }

  &.disabled {
    cursor: default;
    opacity: 0.6;
  }

  .playlist-cover {
    width: 40px;
    height: 40px;
    border-radius: $border-radius-sm;
    background: $bg-tertiary;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-muted;
    font-size: 20px;
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
    min-width: 0;

    .playlist-name {
      font-size: $font-size-base;
      color: $text-primary;
      margin-bottom: 2px;
    }

    .playlist-count {
      font-size: $font-size-xs;
      color: $text-muted;
    }
  }

  .playlist-status {
    .add-icon {
      font-size: 20px;
      color: $text-muted;
      transition: color $transition-fast;
    }

    .added-icon {
      font-size: 20px;
      color: $success-color;
    }
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-xl;
  color: $text-muted;

  .empty-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }

  p {
    margin: $spacing-xs 0;
  }

  .hint {
    font-size: $font-size-sm;
  }
}
</style>
