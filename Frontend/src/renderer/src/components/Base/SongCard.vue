<template>
  <div class="song-card" @click="handlePlay" @contextmenu.prevent="showContextMenu">
    <!-- 封面 -->
    <div class="card-cover">
      <img v-if="song.cover_path && song.cover_path.length > 5"
        :src="`local-image://${song.cover_path.replace(/\\\\/g, '/')}`" alt="封面" loading="lazy" />
      <div v-else class="cover-placeholder">
        <el-icon>
          <Headset />
        </el-icon>
      </div>

      <!-- 播放按钮遮罩 -->
      <div class="cover-overlay">
        <div class="play-btn">
          <el-icon>
            <VideoPlay />
          </el-icon>
        </div>
      </div>

      <!-- 收藏标记 -->
      <div v-if="song.is_favorite" class="favorite-badge">
        <el-icon>
          <StarFilled />
        </el-icon>
      </div>
    </div>

    <!-- 信息 -->
    <div class="card-info">
      <div class="card-title truncate" :title="song.title">{{ song.title }}</div>
      <div class="card-artist truncate" :title="song.artist">{{ song.artist }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Music } from '@/types/music';
import { Headset, StarFilled, VideoPlay } from '@element-plus/icons-vue';

interface Props {
  song: Music
}

const props = defineProps<Props>()
const emit = defineEmits<{
  play: [song: Music]
  contextmenu: [event: MouseEvent, song: Music]
}>()

const handlePlay = () => {
  emit('play', props.song)
}

const showContextMenu = (event: MouseEvent) => {
  emit('contextmenu', event, props.song)
}
</script>

<style lang="scss" scoped>
.song-card {
  display: flex;
  flex-direction: column;
  padding: $spacing-sm;
  border-radius: $border-radius-lg;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $bg-hover;
    transform: translateY(-4px);

    .cover-overlay {
      opacity: 1;
    }
  }
}

.card-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: $border-radius-md;
  overflow: hidden;
  margin-bottom: $spacing-sm;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gradient-card;
    color: $text-muted;
    font-size: 40px;
  }

  .cover-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity $transition-fast;

    .play-btn {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $gradient-primary;
      border-radius: 50%;
      color: white;
      font-size: 24px;
      box-shadow: $shadow-glow;
      transition: transform $transition-fast;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .favorite-badge {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    color: #FFD700;
    font-size: 1rem;
  }
}

.card-info {
  padding: 0 $spacing-xs;
}

.card-title {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: 4px;
}

.card-artist {
  font-size: $font-size-sm;
  color: $text-muted;
}
</style>
