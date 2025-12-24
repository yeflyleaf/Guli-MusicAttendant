<template>
  <div class="mini-player">
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
          <!-- 窗口控制按钮组 - 悬停时显示 -->
          <div class="window-controls">
            <!-- 切换到完整播放器 -->
            <button class="window-btn expand-btn" @click="handleSwitchToFull" :title="$t('miniPlayer.switchToFull')">
              <el-icon>
                <FullScreen />
              </el-icon>
            </button>
            <!-- 最小化 -->
            <button class="window-btn minimize-btn" @click="handleMinimize" title="最小化">
              <el-icon>
                <Minus />
              </el-icon>
            </button>
            <!-- 关闭 -->
            <button class="window-btn close-btn" @click="handleClose" title="关闭">
              <el-icon>
                <Close />
              </el-icon>
            </button>
          </div>
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

      <!-- 控制按钮 - 三栏布局：左侧队列+模式、中间播放控制、右侧音量 -->
      <div class="controls">
        <!-- 左侧：播放队列 + 播放模式 -->
        <div class="controls-left">
          <el-popover v-model:visible="queuePopoverVisible" trigger="click" placement="top" :width="280"
            popper-style="padding: 0;">
            <template #reference>
              <div class="queue-btn-wrapper">
                <el-icon class="control-btn small">
                  <List />
                </el-icon>
                <span v-if="playerStore.queueLength > 0" class="queue-badge">{{ playerStore.queueLength }}</span>
              </div>
            </template>
            <div class="mini-queue" @mouseenter="handleQueueMouseEnter" @mouseleave="handleQueueMouseLeave">
              <div class="mini-queue-header">
                <span>{{ $t('player.playQueue') }} ({{ playerStore.queueLength }})</span>
              </div>
              <div class="mini-queue-list" ref="miniQueueListRef">
                <div v-for="(song, index) in playerStore.queue" :key="song.id" class="mini-queue-item"
                  :class="{ active: index === playerStore.currentIndex }" :ref="el => setQueueItemRef(el, index)"
                  @click="handlePlayFromQueue(song)">
                  <span class="queue-song-title truncate">{{ song.title }}</span>
                  <span class="queue-song-artist truncate">{{ song.artist }}</span>
                </div>
                <div v-if="playerStore.queue.length === 0" class="mini-queue-empty">
                  {{ $t('player.emptyQueue') }}
                </div>
              </div>
            </div>
          </el-popover>

          <!-- 播放模式 -->
          <el-tooltip :content="playModeText" placement="top">
            <el-icon class="control-btn small" @click="playerStore.togglePlayMode">
              <component :is="playModeIcon" />
            </el-icon>
          </el-tooltip>
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
          <el-popover trigger="hover" placement="top" :width="36" popper-class="mini-player-volume-popover"
            :hide-after="300" :offset="5">
            <template #reference>
              <el-icon class="control-btn small" @click="playerStore.toggleMute">
                <component :is="volumeIcon" />
              </el-icon>
            </template>
            <div class="volume-slider" @wheel.prevent="handleVolumeWheel">
              <el-slider v-model="volumePercent" vertical height="80px" :show-tooltip="false" />
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
  Close,
  FullScreen,
  Headset,
  List,
  Minus,
  Refresh,
  RefreshRight,
  Sort,
  Switch,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

const playerStore = usePlayerStore()

// 音频控制（不需要作为主播放器，因为全局音频已在 App.vue 中初始化）
const { seek, setVolume } = useAudio(false)

// 播放队列弹窗控制
const queuePopoverVisible = ref(false)
let queueCloseTimer: ReturnType<typeof setTimeout> | null = null

// 迷你播放队列列表 ref
const miniQueueListRef = ref<HTMLElement | null>(null)
const queueItemRefs = ref<Map<number, HTMLElement>>(new Map())

// 设置队列项的 ref
const setQueueItemRef = (el: HTMLElement | null | unknown, index: number) => {
  if (el instanceof HTMLElement) {
    queueItemRefs.value.set(index, el)
  } else {
    queueItemRefs.value.delete(index)
  }
}

// 滚动到当前播放的歌曲
const scrollToCurrentSong = () => {
  const currentIndex = playerStore.currentIndex
  if (currentIndex < 0 || !miniQueueListRef.value) return

  const currentItem = queueItemRefs.value.get(currentIndex)
  if (currentItem) {
    currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// 监听播放队列弹窗显示状态
watch(queuePopoverVisible, (visible) => {
  if (visible && playerStore.currentIndex >= 0) {
    // 使用 nextTick 确保 DOM 已更新
    nextTick(() => {
      // 再延迟一小段时间确保 Popover 完全渲染
      setTimeout(() => {
        scrollToCurrentSong()
      }, 100)
    })
  }
})

// 鼠标进入播放队列，取消关闭定时器
const handleQueueMouseEnter = () => {
  if (queueCloseTimer) {
    clearTimeout(queueCloseTimer)
    queueCloseTimer = null
  }
}

// 鼠标离开播放队列，1秒后自动关闭
const handleQueueMouseLeave = () => {
  queueCloseTimer = setTimeout(() => {
    queuePopoverVisible.value = false
    queueCloseTimer = null
  }, 1000)
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (queueCloseTimer) {
    clearTimeout(queueCloseTimer)
  }
})

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
  set: (val) => {
    setVolume(val / 100)
  }
})

// 音量图标
const volumeIcon = computed(() => {
  const vol = playerStore.volume * 100
  if (vol === 0 || playerStore.isMuted) return VolumeMute
  if (vol < 30) return VolumeLow
  if (vol < 70) return VolumeMedium
  return VolumeHigh
})

// 播放模式图标
const playModeIcon = computed(() => {
  switch (playerStore.playMode) {
    case 'sequence': return Sort
    case 'loop': return Refresh
    case 'single': return RefreshRight
    case 'random': return Switch
    default: return Sort
  }
})

// 播放模式文本
const playModeText = computed(() => {
  switch (playerStore.playMode) {
    case 'sequence': return '顺序播放'
    case 'loop': return '列表循环'
    case 'single': return '单曲循环'
    case 'random': return '随机播放'
    default: return '顺序播放'
  }
})

// 处理音量滚轮
const handleVolumeWheel = (e: WheelEvent) => {
  const step = 0.05
  const delta = e.deltaY < 0 ? step : -step
  const newVolume = Math.min(Math.max(playerStore.volume + delta, 0), 1)
  setVolume(newVolume)
}

// 从队列播放歌曲
const handlePlayFromQueue = (song: Music) => {
  playerStore.play(song, false)
}

// 切换回完整播放器
const handleSwitchToFull = () => {
  window.electron?.window?.switchToFullPlayer?.()
}

// 最小化窗口
const handleMinimize = () => {
  window.electron?.window?.minimize?.()
}

// 关闭窗口
const handleClose = () => {
  window.electron?.window?.close?.()
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

// 封面区域 300x300 - 可拖动区域
.cover-section {
  width: 300px;
  height: 300px;
  position: relative;
  flex-shrink: 0;
  -webkit-app-region: drag; // 允许拖动窗口
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

// 窗口控制按钮组
.window-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  -webkit-app-region: no-drag; // 禁止拖动，确保按钮可以点击

  .mini-player:hover & {
    opacity: 1;
  }
}

.window-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  .el-icon {
    font-size: 14px;
  }

  &:hover {
    transform: scale(1.05);
  }

  &.expand-btn:hover {
    background: rgba(139, 92, 246, 0.8);
  }

  &.minimize-btn:hover {
    background: rgba(255, 193, 7, 0.8);
  }

  &.close-btn:hover {
    background: rgba(239, 68, 68, 0.8);
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

// 控制区域 300x60 - 不可拖动
.control-section {
  width: 300px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  background: rgba($bg-secondary-rgb, 0.95);
  border-top: 1px solid $border-color;
  -webkit-app-region: no-drag; // 禁止拖动，确保控件可以操作
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
  justify-content: center;
  padding: 0 12px;
}

// 左侧区域（播放队列 + 播放模式）
.controls-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px; // 队列按钮和播放模式按钮之间的间距
}

// 中间区域（播放控制）- 不伸缩，保持固定居中
.controls-center {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

// 右侧区域（音量控制）
.controls-right {
  flex: 1;
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

// 迷你队列 - 禁止拖动，确保可以正常选择和点击
.mini-queue {
  max-height: 300px;
  display: flex;
  flex-direction: column;
  -webkit-app-region: no-drag;
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

<style lang="scss">
.mini-player-volume-popover {
  min-width: auto !important;
  padding: 12px 0 !important;
  -webkit-app-region: no-drag;
}
</style>
