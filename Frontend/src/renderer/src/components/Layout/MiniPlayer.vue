<template>
  <div class="mini-player" @mousedown="handleDragStart">
    <!-- 顶部封面区域 300x300 -->
    <div class="cover-section">
      <!-- 封面图 -->
      <div class="cover-wrapper">
        <img v-if="playerStore.currentSong?.cover_path && playerStore.currentSong.cover_path.length > 5"
          :src="`local-image://${playerStore.currentSong.cover_path.replace(/\\\\/g, '/')}`" alt="封面"
          class="cover-image" />
        <div v-else class="cover-placeholder">
          <el-icon>
            <Headset />
          </el-icon>
        </div>
        <!-- 封面上的信息 -->
        <div class="cover-overlay">
          <!-- 关闭迷你播放器按钮 -->
          <button class="close-mini-btn" @click="handleSwitchToFull" :title="$t('miniPlayer.switchToFull')">
            <el-icon>
              <FullScreen />
            </el-icon>
          </button>
          <!-- 歌曲信息 -->
          <div class="song-info">
            <div class="song-title truncate" :title="playerStore.currentSong?.title || $t('miniPlayer.noPlaying')">
              {{ playerStore.currentSong?.title || $t('miniPlayer.noPlaying') }}
            </div>
            <div class="song-artist truncate" :title="playerStore.currentSong?.artist || ''">
              {{ playerStore.currentSong?.artist || '' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部控制栏 300x60 -->
    <div class="control-section">
      <!-- 进度条 -->
      <div class="progress-bar">
        <el-slider v-model="localProgress" :show-tooltip="false" class="progress-slider" @input="onSliderInput"
          @change="onSliderChange" />
      </div>

      <!-- 控制按钮 - 三栏布局：左侧队列、中间播放控制、右侧音量 -->
      <div class="controls">
        <!-- 左侧：播放队列 -->
        <div class="controls-left">
          <el-popover trigger="click" placement="top" :width="280" popper-style="padding: 0;">
            <template #reference>
              <div class="queue-btn-wrapper">
                <el-icon class="control-btn small">
                  <List />
                </el-icon>
                <span v-if="playerStore.queueLength > 0" class="queue-badge">{{ playerStore.queueLength }}</span>
              </div>
            </template>
            <div class="mini-queue">
              <div class="mini-queue-header">
                <span>{{ $t('player.playQueue') }} ({{ playerStore.queueLength }})</span>
              </div>
              <div class="mini-queue-list">
                <div v-for="(song, index) in playerStore.queue" :key="song.id" class="mini-queue-item"
                  :class="{ active: index === playerStore.currentIndex }" @click="handlePlayFromQueue(song)">
                  <span class="queue-song-title truncate">{{ song.title }}</span>
                  <span class="queue-song-artist truncate">{{ song.artist }}</span>
                </div>
                <div v-if="playerStore.queue.length === 0" class="mini-queue-empty">
                  {{ $t('player.emptyQueue') }}
                </div>
              </div>
            </div>
          </el-popover>
        </div>

        <!-- 中间：播放控制按钮 -->
        <div class="controls-center">
          <!-- 上一首 -->
          <el-icon class="control-btn" :class="{ disabled: !playerStore.hasPrevious }" @click="playerStore.previous">
            <CaretLeft />
          </el-icon>

          <!-- 播放/暂停 -->
          <div class="play-btn" :class="{ playing: playerStore.isPlaying }" @click="playerStore.togglePlay">
            <el-icon>
              <VideoPause v-if="playerStore.isPlaying" />
              <VideoPlay v-else />
            </el-icon>
          </div>

          <!-- 下一首 -->
          <el-icon class="control-btn" :class="{ disabled: !playerStore.hasNext }" @click="playerStore.next">
            <CaretRight />
          </el-icon>
        </div>

        <!-- 右侧：音量控制 -->
        <div class="controls-right">
          <el-popover trigger="hover" placement="top" :width="36" popper-style="min-width: auto; padding: 12px 0;">
            <template #reference>
              <el-icon class="control-btn small" @click="playerStore.toggleMute">
                <component :is="volumeIcon" />
              </el-icon>
            </template>
            <div class="volume-slider" @wheel.prevent="handleVolumeWheel">
              <el-slider v-model="volumePercent" vertical height="80px" :show-tooltip="false"
                @input="handleVolumeChange" />
              <span class="volume-value">{{ volumePercent }}%</span>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VolumeHigh, VolumeLow, VolumeMedium, VolumeMute } from '@/components/Icons/VolumeIcons'
import { useAudio } from '@/hooks/useAudio'
import { usePlayerStore } from '@/store/player.store'
import type { Music } from '@/types/music'
import {
  CaretLeft,
  CaretRight,
  FullScreen,
  Headset,
  List,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'

const playerStore = usePlayerStore()

// 音频控制（不需要作为主播放器，因为全局音频已在 App.vue 中初始化）
const { seek, setVolume } = useAudio(false)

// 进度条逻辑
const localProgress = ref(0)
const isDragging = ref(false)

// 监听播放进度 -> 更新滑块 (仅在非拖动状态下)
watch(() => playerStore.progress, (newVal) => {
  if (!isDragging.value) {
    localProgress.value = newVal
  }
})

// 用户拖动/点击中 -> 标记为正在交互
const onSliderInput = (val: number) => {
  isDragging.value = true
  localProgress.value = val
}

// 用户松手/交互结束 -> 执行跳转
const onSliderChange = (val: number) => {
  if (!playerStore.duration || !isFinite(playerStore.duration)) {
    localProgress.value = 0
    return
  }

  isDragging.value = true
  const targetTime = (val / 100) * playerStore.duration
  playerStore.setCurrentTime(targetTime)
  seek(targetTime)

  setTimeout(() => {
    isDragging.value = false
  }, 200)
}

// 音量百分比
const volumePercent = computed({
  get: () => Math.round(playerStore.volume * 100),
  set: () => { }
})

// 音量图标
const volumeIcon = computed(() => {
  const vol = playerStore.volume * 100
  if (vol === 0 || playerStore.isMuted) return VolumeMute
  if (vol < 30) return VolumeLow
  if (vol < 70) return VolumeMedium
  return VolumeHigh
})

// 处理音量滚轮
const handleVolumeWheel = (e: WheelEvent) => {
  const step = 0.05
  const delta = e.deltaY < 0 ? step : -step
  const newVolume = Math.min(Math.max(playerStore.volume + delta, 0), 1)
  setVolume(newVolume)
}

// 处理音量变化
const handleVolumeChange = (value: number) => {
  setVolume(value / 100)
}

// 从队列播放歌曲
const handlePlayFromQueue = (song: Music) => {
  playerStore.play(song, false)
}

// 切换回完整播放器
const handleSwitchToFull = () => {
  window.electron?.window?.switchToFullPlayer?.()
}

// 拖动窗口（用于无边框窗口）
const handleDragStart = (e: MouseEvent) => {
  // 只有点击封面区域才能拖动
  const target = e.target as HTMLElement
  if (target.closest('.control-section') || target.closest('.close-mini-btn')) {
    return
  }
  // 触发原生窗口拖动
  // 由于是无边框窗口，需要通过 IPC 实现拖动
}
</script>

<style lang="scss" scoped>
.mini-player {
  width: 300px;
  height: 360px;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
  overflow: hidden;
  user-select: none;
}

// 封面区域 300x300
.cover-section {
  width: 300px;
  height: 300px;
  position: relative;
  flex-shrink: 0;
}

.cover-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.cover-image {
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
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3));
  color: $text-muted;
  font-size: 80px;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 40%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
}

// 关闭迷你播放器按钮
.close-mini-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;

  .mini-player:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .el-icon {
    font-size: 18px;
  }
}

// 歌曲信息
.song-info {
  .song-title {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin-bottom: 4px;
    max-width: 268px;
  }

  .song-artist {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    max-width: 268px;
  }
}

// 控制区域 300x60
.control-section {
  width: 300px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  background: rgba($bg-secondary-rgb, 0.95);
  border-top: 1px solid $border-color;
}

// 进度条
.progress-bar {
  height: 12px;
  display: flex;
  align-items: center;

  .progress-slider {
    width: 100%;

    :deep(.el-slider__runway) {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
    }

    :deep(.el-slider__bar) {
      height: 4px;
      background: $gradient-primary;
    }

    :deep(.el-slider__button-wrapper) {
      display: none;
    }

    &:hover {
      :deep(.el-slider__button-wrapper) {
        display: block;
      }

      :deep(.el-slider__button) {
        width: 12px;
        height: 12px;
        border: 2px solid $primary-color;
        background: white;
      }
    }
  }
}

// 控制按钮 - 三栏布局
.controls {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

// 左侧区域（播放队列）
.controls-left {
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

// 中间区域（播放控制）
.controls-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

// 右侧区域（音量控制）
.controls-right {
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.control-btn {
  font-size: 24px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: $text-primary;
    transform: scale(1.1);
  }

  &.small {
    font-size: 20px;
  }

  &.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
}

.play-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-primary;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.6);
  }

  &:active {
    transform: scale(0.98);
  }

  &.playing {
    animation: pulse-mini 2s ease-in-out infinite;
  }
}

@keyframes pulse-mini {

  0%,
  100% {
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
  }

  50% {
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.7);
  }
}

// 音量滑块
.volume-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;

  .volume-value {
    margin-top: 8px;
    font-size: 11px;
    color: $text-muted;
  }
}

// 队列按钮
.queue-btn-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.queue-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary-color;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  padding: 0 4px;
}

// 迷你队列
.mini-queue {
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.mini-queue-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  border-bottom: 1px solid $border-color;
}

.mini-queue-list {
  flex: 1;
  overflow-y: auto;
  max-height: 240px;
}

.mini-queue-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: $bg-hover;
  }

  &.active {
    background: rgba($primary-color, 0.15);

    .queue-song-title {
      color: $primary-color;
    }
  }
}

.queue-song-title {
  font-size: 13px;
  color: $text-primary;
  max-width: 248px;
}

.queue-song-artist {
  font-size: 11px;
  color: $text-muted;
  max-width: 248px;
}

.mini-queue-empty {
  padding: 24px 16px;
  text-align: center;
  color: $text-muted;
  font-size: 13px;
}

// 工具类
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
