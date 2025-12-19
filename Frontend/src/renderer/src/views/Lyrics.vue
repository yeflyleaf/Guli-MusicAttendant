<template>
  <div class="lyrics-view">
    <div class="lyrics-container" v-if="playerStore.currentSong">
      <!-- 背景 -->
      <div class="lyrics-bg" :style="coverBgStyle"></div>

      <!-- 歌曲信息 -->
      <div class="song-info">
        <div class="song-cover">
          <img v-if="playerStore.currentSong.cover_path && playerStore.currentSong.cover_path.length > 5"
            :src="`local-image://${playerStore.currentSong.cover_path.replace(/\\\\/g, '/')}`" alt="封面" />
          <el-icon v-else>
            <Headset />
          </el-icon>
        </div>
        <div class="song-detail">
          <h2 class="song-title">{{ playerStore.currentSong.title }}</h2>
          <p class="song-artist">{{ playerStore.currentSong.artist }}</p>
        </div>
      </div>

      <!-- 歌词显示 -->
      <div class="lyrics-content" ref="lyricsContainerRef">
        <div v-if="lyrics.length > 0" class="lyrics-scroll" :style="{ transform: `translateY(${scrollOffset}px)` }">
          <div v-for="(line, index) in lyrics" :key="index" class="lyric-line"
            :class="{ active: index === currentLineIndex }" @click="handleSeekToLine(line.time)">
            {{ line.text }}
          </div>
        </div>
        <div v-else class="no-lyrics">
          <el-icon>
            <Document />
          </el-icon>
          <p>暂无歌词</p>
        </div>
      </div>

      <!-- 返回按钮 -->
      <el-button class="back-btn" circle @click="handleClose">
        <el-icon>
          <ArrowDown />
        </el-icon>
      </el-button>
    </div>

    <!-- 无歌曲状态 -->
    <div v-else class="empty-state">
      <el-icon class="empty-icon">
        <Headset />
      </el-icon>
      <p>暂无播放</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAudio } from '@/hooks/useAudio'
import { usePlayerStore } from '@/store/player.store'
import { parseLrc, type LyricLine } from '@/utils/lrc-parser'
import { ArrowDown, Document, Headset } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'

const playerStore = usePlayerStore()
const { seekPercent } = useAudio()

const lyricsContainerRef = ref<HTMLElement | null>(null)
const lyrics = ref<LyricLine[]>([])
const currentLineIndex = ref(-1)

// 歌词滚动偏移
const scrollOffset = computed(() => {
  if (currentLineIndex.value < 0 || !lyricsContainerRef.value) return 0

  // 每行高度约 50px (根据 CSS 调整)，让当前行居中
  // 容器高度的一半
  const containerHeight = lyricsContainerRef.value.clientHeight

  // 列表顶部的内边距 (CSS 中定义的 padding-top: 200px)
  const paddingTop = 200

  // 目标位置：paddingTop + 当前行索引 * 行高 + 行高的一半
  const targetPos = paddingTop + currentLineIndex.value * 50 + 25

  // 偏移量 = 容器中心 - 目标位置
  return (containerHeight / 2) - targetPos
})

// 封面背景样式
const coverBgStyle = computed(() => {
  const coverPath = playerStore.currentSong?.cover_path
  if (coverPath && coverPath.length > 5) {
    return {
      backgroundImage: `url('local-image://${coverPath.replace(/\\\\/g, '/')}')`
    }
  }
  return {}
})

// 加载歌词
const loadLyrics = async () => {
  lyrics.value = []
  currentLineIndex.value = -1

  if (!playerStore.currentSong?.lyrics_path) {
    return
  }

  try {
    // 使用 IPC 读取文件
    const content = await window.electron.dialog.readFile(playerStore.currentSong.lyrics_path)
    if (content) {
      lyrics.value = parseLrc(content)
    }
  } catch (error) {
    console.error('加载歌词失败:', error)
  }
}

// 更新当前行
const updateCurrentLine = (time: number) => {
  if (lyrics.value.length === 0) return

  // 找到最后一个时间小于等于当前时间的歌词
  let index = -1
  for (let i = 0; i < lyrics.value.length; i++) {
    if (time >= lyrics.value[i].time) {
      index = i
    } else {
      break
    }
  }

  if (index !== currentLineIndex.value) {
    currentLineIndex.value = index
  }
}

// 点击歌词跳转
const handleSeekToLine = (time: number) => {
  // 计算百分比
  if (playerStore.duration > 0) {
    const percent = (time / playerStore.duration) * 100
    seekPercent(percent)
  }
}

// 关闭歌词页
const handleClose = () => {
  playerStore.showLyrics = false
}

// 监听歌曲变化
watch(() => playerStore.currentSong, loadLyrics, { immediate: true })

// 监听播放时间变化
watch(() => playerStore.currentTime, updateCurrentLine)
</script>

<style lang="scss" scoped>
.lyrics-view {
  height: 100%;
  position: relative;
  padding-bottom: var(--player-height);
  box-sizing: border-box;
}

.lyrics-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.lyrics-bg {
  position: absolute;
  inset: -50px;
  background-size: cover;
  background-position: center;
  filter: blur(50px) brightness(0.3);
  z-index: 0;
}

.song-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl;
  position: relative;
  z-index: 1;

  .song-cover {
    width: 200px;
    height: 200px;
    border-radius: $border-radius-xl;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gradient-card;
    color: $text-muted;
    font-size: 64px;
    margin-bottom: $spacing-lg;
    box-shadow: $shadow-lg;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .song-detail {
    text-align: center;
  }

  .song-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-sm;
  }

  .song-artist {
    color: $text-secondary;
  }
}

.lyrics-content {
  flex: 1;
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 1;
  mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 20%,
      black 80%,
      transparent 100%);
}

.lyrics-scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease-out;
  padding: 200px 0;
}

.lyric-line {
  height: 50px;
  line-height: 50px;
  padding: 0 $spacing-xl;
  font-size: $font-size-lg;
  color: $text-muted;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: $text-secondary;
  }

  &.active {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    transform: scale(1.05);
  }
}

.no-lyrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $text-muted;

  .el-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }
}

.back-btn {
  position: absolute;
  left: $spacing-lg;
  bottom: $spacing-lg;
  z-index: 2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $text-muted;

  .empty-icon {
    font-size: 64px;
    margin-bottom: $spacing-md;
    opacity: 0.5;
  }
}
</style>
