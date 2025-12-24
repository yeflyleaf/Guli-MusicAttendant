<template>
  <div class="lyrics-view">
    <div class="lyrics-container" v-if="playerStore.currentSong">
      <!-- 背景 -->
      <!-- 背景 -->
      <div v-if="showBlurBackground" class="lyrics-bg" :style="coverBgStyle"></div>

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
      <div class="lyrics-content" ref="lyricsContainerRef" @scroll="handleScroll">
        <div v-if="lyrics.length > 0" class="lyrics-scroll">
          <div v-for="(line, index) in lyrics" :key="index" class="lyric-line" :ref="(el) => setLyricLineRef(el, index)"
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
import { useSettingsStore } from '@/store/settings.store'
import { parseLrc, type LyricLine } from '@/utils/lrc-parser'
import { Document, Headset } from '@element-plus/icons-vue'
import { computed, ref, watch, type ComponentPublicInstance } from 'vue'

const playerStore = usePlayerStore()
const settingsStore = useSettingsStore()
const { seekPercent } = useAudio()

// 是否显示模糊背景：只有在使用默认主题（dark/light）时才显示
// 使用动态主题时隐藏模糊背景，以避免性能问题并展示动态背景
const showBlurBackground = computed(() => {
  return ['dark', 'light'].includes(settingsStore.theme)
})

const lyricsContainerRef = ref<HTMLElement | null>(null)
const lyrics = ref<LyricLine[]>([])
const currentLineIndex = ref(-1)

const lyricLineRefs = ref<HTMLElement[]>([])
const isUserScrolling = ref(false)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let isAutoScrolling = false

// 设置歌词行 ref
const setLyricLineRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) {
    lyricLineRefs.value[index] = el as HTMLElement
  }
}

// 滚动到当前行
const scrollToCurrentLine = () => {
  if (isUserScrolling.value || !lyricsContainerRef.value || currentLineIndex.value < 0) return

  const activeLine = lyricLineRefs.value[currentLineIndex.value]
  if (activeLine) {
    const container = lyricsContainerRef.value
    const containerHeight = container.clientHeight
    const lineTop = activeLine.offsetTop
    const lineHeight = activeLine.clientHeight

    // 计算目标滚动位置，使当前行居中
    const targetScrollTop = lineTop - containerHeight / 2 + lineHeight / 2

    isAutoScrolling = true
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })

    // 滚动结束后重置自动滚动标志
    setTimeout(() => {
      isAutoScrolling = false
    }, 500)
  }
}

// 处理滚动事件
const handleScroll = () => {
  if (isAutoScrolling) return

  isUserScrolling.value = true
  if (scrollTimeout) clearTimeout(scrollTimeout)

  scrollTimeout = setTimeout(() => {
    isUserScrolling.value = false
  }, 2000) // 停止滚动 2 秒后恢复自动滚动
}

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
  lyricLineRefs.value = []

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
    scrollToCurrentLine()
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
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
  mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 15%,
      black 85%,
      transparent 100%);

  /* 隐藏滚动条但保留功能 */
  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
}

.lyrics-scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 50vh 0;
  /* 上下留白，确保第一行和最后一行能居中 */
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
