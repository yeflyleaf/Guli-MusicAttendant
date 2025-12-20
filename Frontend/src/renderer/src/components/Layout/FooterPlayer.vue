<template>
  <footer class="footer-player glass">
    <!-- 可视化 Canvas -->
    <canvas v-show="playerStore.isPlaying && settingsStore.visualizerEnabled" ref="canvasRef"
      class="visualizer-canvas"></canvas>

    <!-- 当前歌曲信息 -->
    <div class="player-left">
      <div v-if="playerStore.currentSong" class="song-info">
        <div class="song-cover" @click="toggleLyrics">
          <img v-if="playerStore.currentSong.cover_path && playerStore.currentSong.cover_path.length > 5"
            :src="`local-image://${playerStore.currentSong.cover_path.replace(/\\\\/g, '/')}`" alt="封面" />
          <div v-else class="cover-placeholder">
            <el-icon>
              <Headset />
            </el-icon>
          </div>
          <div class="cover-overlay">
            <el-icon>
              <Expand />
            </el-icon>
          </div>
        </div>
        <div class="song-detail">
          <div class="song-title-row">
            <div class="song-title truncate" :title="playerStore.currentSong.title">{{ playerStore.currentSong.title }}
            </div>
            <el-icon class="favorite-btn" :class="{ active: playerStore.currentSong.is_favorite }"
              @click="handleToggleFavorite">
              <StarFilled v-if="playerStore.currentSong.is_favorite" />
              <Star v-else />
            </el-icon>
          </div>
          <div class="song-artist truncate" :title="playerStore.currentSong.artist">{{ playerStore.currentSong.artist }}
          </div>
        </div>
      </div>
      <div v-else class="no-song">
        <span class="text-muted">暂无播放</span>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="player-center">
      <div class="control-buttons">
        <!-- 播放模式 -->
        <el-tooltip :content="playModeText" placement="top">
          <el-icon class="control-btn small" @click="playerStore.togglePlayMode">
            <component :is="playModeIcon" />
          </el-icon>
        </el-tooltip>

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

        <!-- 音量控制 -->
        <el-popover trigger="hover" placement="top" :width="40">
          <template #reference>
            <el-icon class="control-btn small" @click="playerStore.toggleMute">
              <component :is="volumeIcon" />
            </el-icon>
          </template>
          <div class="volume-slider">
            <el-slider v-model="volumePercent" vertical height="100px" :show-tooltip="false"
              @input="handleVolumeChange" />
            <span class="volume-value">{{ volumePercent }}%</span>
          </div>
        </el-popover>
      </div>


      <!-- 进度条 -->
      <div class="progress-bar">
        <span class="time-text">{{ formatDuration(playerStore.currentTime) }}</span>
        <el-slider v-model="localProgress" :show-tooltip="false" class="progress-slider" @input="onSliderInput"
          @change="onSliderChange" />
        <span class="time-text">{{ formatDuration(playerStore.duration) }}</span>
      </div>
    </div>

    <!-- 右侧功能按钮 -->
    <div class="player-right">
      <!-- 歌词按钮 -->
      <el-icon class="func-btn" :class="{ active: playerStore.showLyrics }" @click="toggleLyrics">
        <Reading />
      </el-icon>

      <!-- 播放队列 -->
      <el-popover trigger="click" placement="top-end" :width="350">
        <template #reference>
          <el-icon class="func-btn">
            <List />
          </el-icon>
        </template>
        <div class="queue-panel">
          <div class="queue-header">
            <span>播放队列 ({{ playerStore.queueLength }})</span>
            <el-button text size="small" @click="playerStore.clearQueue">清空</el-button>
          </div>
          <div class="queue-list">
            <div v-for="(song, index) in playerStore.queue" :key="song.id" class="queue-item"
              :class="{ active: playerStore.currentSong?.id === song.id }" @click="playerStore.play(song, false)">
              <span class="queue-index">{{ index + 1 }}</span>
              <div class="queue-info">
                <div class="queue-title truncate" :title="song.title">{{ song.title }}</div>
                <div class="queue-artist truncate" :title="song.artist">{{ song.artist }}</div>
              </div>
              <span class="queue-duration">{{ formatDuration(song.duration) }}</span>
              <el-icon class="queue-remove" @click.stop="playerStore.removeFromQueue(song.id)">
                <Close />
              </el-icon>
            </div>
            <div v-if="playerStore.queueLength === 0" class="queue-empty">
              播放队列为空
            </div>
          </div>
        </div>
      </el-popover>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { VolumeHigh, VolumeLow, VolumeMedium, VolumeMute } from '@/components/Icons/VolumeIcons'
import { useAudio } from '@/hooks/useAudio'
import { useLibraryStore } from '@/store/library.store'
import { usePlayerStore } from '@/store/player.store'
import { useSettingsStore } from '@/store/settings.store'
import { formatDuration } from '@/utils/format'
import {
  CaretLeft,
  CaretRight,
  Close,
  Expand,
  Headset,
  List,
  Reading,
  Refresh,
  RefreshRight,
  Sort,
  Star,
  StarFilled,
  Switch,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

const playerStore = usePlayerStore()
const libraryStore = useLibraryStore()
const settingsStore = useSettingsStore() // 需要引入 settingsStore

// 初始化音频（标记为主播放器，设置全局 watchers）
const { seek, setVolume, analyser } = useAudio(true)

// ============ 进度条逻辑 ============
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
  // 1. 安全检查：如果总时长无效，直接归零
  if (!playerStore.duration || !isFinite(playerStore.duration)) {
    localProgress.value = 0
    return
  }

  // 2. 标记正在交互，防止 Watcher 干扰
  isDragging.value = true

  // 3. 计算目标时间（秒）- 基于 Store 的准确时长
  const targetTime = (val / 100) * playerStore.duration

  // 4. 乐观更新：直接修改 Store 中的时间，UI 立刻响应
  playerStore.setCurrentTime(targetTime)

  // 5. 【核心修复】直接跳转到具体秒数
  // 不使用 seekPercent(val)，因为它内部依赖可能不准确的 audio.duration
  // seek 直接设置 audio.currentTime = targetTime，绕过 NaN * Percent 的计算陷阱
  seek(targetTime)

  // 6. 延迟释放锁，防止旧的 timeupdate 事件把进度条拉回去
  setTimeout(() => {
    isDragging.value = false
  }, 200)
}

// 音量百分比
const volumePercent = computed({
  get: () => Math.round(playerStore.volume * 100),
  set: () => { }
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

// 音量图标
const volumeIcon = computed(() => {
  const vol = playerStore.volume * 100
  if (vol === 0 || playerStore.isMuted) return VolumeMute
  if (vol < 30) return VolumeLow
  if (vol < 70) return VolumeMedium
  return VolumeHigh
})

// 处理音量变化
const handleVolumeChange = (value: number) => {
  setVolume(value / 100)
}

// 切换收藏
const handleToggleFavorite = async () => {
  if (!playerStore.currentSong) return

  const success = await libraryStore.toggleFavorite(playerStore.currentSong.id)
  if (success) {
    playerStore.updateCurrentSongFavorite(!playerStore.isFavorite)
  }
}

// 切换歌词显示
const toggleLyrics = () => {
  playerStore.toggleLyrics()
}


// ============ 可视化逻辑 ============
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number

const drawVisualizer = () => {
  if (!canvasRef.value || !analyser.value || !playerStore.isPlaying || !settingsStore.visualizerEnabled) {
    return
  }

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const bufferLength = analyser.value.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const FPS = 30
  const INTERVAL = 1000 / FPS
  let lastTime = 0

  const draw = (timestamp: number) => {
    if (!playerStore.isPlaying || !settingsStore.visualizerEnabled) {
      cancelAnimationFrame(animationId)
      return
    }

    animationId = requestAnimationFrame(draw)

    const elapsed = timestamp - lastTime
    if (elapsed < INTERVAL) return

    lastTime = timestamp - (elapsed % INTERVAL)

    if (analyser.value) {
      analyser.value.getByteFrequencyData(dataArray)
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 只绘制低频到中频部分，视觉效果更好
    const barsToDraw = Math.floor(bufferLength * 0.6)
    const barWidth = (canvas.width / barsToDraw)
    let barHeight
    let x = 0

    for (let i = 0; i < barsToDraw; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height

      // 渐变色 (使用实际颜色值，Canvas 不支持 CSS 变量)
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)')  // 主紫色透明
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.6)')  // 主紫清晰

      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)

      x += barWidth
    }
  }

  requestAnimationFrame(draw)
}

// 监听播放状态和设置
watch([() => playerStore.isPlaying, () => settingsStore.visualizerEnabled], ([playing, enabled]) => {
  if (playing && enabled) {
    nextTick(() => {
      if (canvasRef.value) {
        canvasRef.value.width = canvasRef.value.offsetWidth
        canvasRef.value.height = canvasRef.value.offsetHeight
        drawVisualizer()
      }
    })
  } else {
    cancelAnimationFrame(animationId)
    // 清空画布
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
  }
})

// 窗口大小改变时重置画布尺寸
window.addEventListener('resize', () => {
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.offsetWidth
    canvasRef.value.height = canvasRef.value.offsetHeight
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<style lang="scss" scoped>
.footer-player {
  display: flex;
  align-items: center;
  height: $player-height;
  padding: 0 $spacing-lg;
  border-top: 1px solid $border-color;
  z-index: $z-sticky;
}

.player-left {
  width: 280px;
  min-width: 280px;
}

.song-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.song-cover {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: $border-radius-md;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;

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
    font-size: 24px;
  }

  .cover-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity $transition-fast;
    color: white;
    font-size: 20px;
  }

  &:hover .cover-overlay {
    opacity: 1;
  }
}

.song-detail {
  flex: 1;
  min-width: 0;

  .song-title-row {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: 4px;
  }

  .song-title {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .favorite-btn {
    font-size: 18px;
    color: $text-muted;
    cursor: pointer;
    padding: 2px;
    border-radius: 50%;
    transition: all $transition-fast;
    flex-shrink: 0;

    &:hover {
      color: $text-primary;
      transform: scale(1.1);
    }

    &.active {
      color: #FFD700;
    }
  }

  .song-artist {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.no-song {
  display: flex;
  align-items: center;
  height: 56px;
}

.player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-sm;
}

.control-btn {
  font-size: 40px;
  color: $text-secondary;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all $transition-fast;

  &:hover {
    color: $text-primary;
    transform: scale(1.1);
  }

  &.small {
    font-size: 32px;
  }

  &.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
}

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
  cursor: pointer;
  transition: all $transition-fast;
  box-shadow: $shadow-glow;

  &:hover {
    transform: scale(1.05);
    box-shadow: $shadow-glow-strong;
  }

  &:active {
    transform: scale(0.98);
  }

  &.playing {
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: $shadow-glow;
  }

  50% {
    box-shadow: $shadow-glow-strong;
  }
}

.progress-bar {
  display: flex;
  align-items: center;
  width: 100%;
  gap: $spacing-sm;

  .time-text {
    font-size: 14px;
    color: $text-muted;
    min-width: 45px;
    text-align: center;
  }

  .progress-slider {
    flex: 1;

    :deep(.el-slider__runway) {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
    }

    :deep(.el-slider__bar) {
      height: 6px;
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
        width: 16px;
        height: 16px;
        border: 2px solid $primary-color;
        background: white;
      }
    }
  }
}

.player-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  width: 200px;
  justify-content: flex-end;
}

.func-btn {
  font-size: 32px;
  color: $text-muted;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all $transition-fast;

  &:hover {
    color: $text-primary;
    background: $bg-hover;
  }

  &.active {
    color: $primary-color;
  }
}

.volume-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-sm;

  .volume-value {
    margin-top: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.queue-panel {
  .queue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-color;
    margin-bottom: $spacing-sm;
  }

  .queue-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .queue-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: background $transition-fast;

    &:hover {
      background: $bg-hover;

      .queue-remove {
        opacity: 1;
      }
    }

    &.active {
      background: $gradient-card;

      .queue-title {
        color: $primary-color;
      }
    }
  }

  .queue-index {
    width: 24px;
    font-size: $font-size-xs;
    color: $text-muted;
    text-align: center;
  }

  .queue-info {
    flex: 1;
    min-width: 0;
  }

  .queue-title {
    font-size: $font-size-sm;
    color: $text-primary;
  }

  .queue-artist {
    font-size: $font-size-xs;
    color: $text-muted;
  }

  .queue-duration {
    font-size: $font-size-xs;
    color: $text-muted;
  }

  .queue-remove {
    font-size: 14px;
    color: $text-muted;
    opacity: 0;
    transition: opacity $transition-fast;

    &:hover {
      color: $error-color;
    }
  }

  .queue-empty {
    padding: $spacing-lg;
    text-align: center;
    color: $text-muted;
  }
}

.visualizer-canvas {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  opacity: 0.3;
}
</style>
