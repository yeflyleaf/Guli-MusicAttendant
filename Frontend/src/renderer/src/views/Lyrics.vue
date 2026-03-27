<template>
  <div class="lyrics-view">
    <div class="lyrics-container" v-if="playerStore.currentSong">
      <!-- 背景 -->
      <!-- 背景 -->
      <div v-if="showBlurBackground" class="lyrics-bg" :style="coverBgStyle" :key="'bg-' + refreshKey"></div>

      <!-- 歌曲信息 -->
      <div class="song-info">
        <div class="song-cover">
          <img v-if="playerStore.currentSong.cover_path && playerStore.currentSong.cover_path.length > 5"
            :key="'cover-' + refreshKey"
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
            :class="{ active: index === currentLineIndex, 'has-translation': !!line.translation }"
            @click="handleSeekToLine(line.time)">
            <!-- 外语主歌词（始终高亮这一行） -->
            <div class="lyric-main">{{ line.text }}</div>
            <!-- 中文翻译（如果存在） -->
            <div v-if="line.translation" class="lyric-translation">{{ line.translation }}</div>
          </div>
        </div>
        <div v-else class="no-lyrics">
          <el-icon>
            <Document />
          </el-icon>
          <p>{{ t('lyrics.noLyrics') }}</p>
        </div>
      </div>


    </div>

    <!-- 无歌曲状态 -->
    <div v-else class="empty-state">
      <el-icon class="empty-icon">
        <Headset />
      </el-icon>
      <p>{{ t('player.noPlaying') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAudio } from '@/hooks/useAudio'
import { usePlayerStore } from '@/store/player.store'
import { useSettingsStore } from '@/store/settings.store'
import { parseLrc, type LyricLine } from '@/utils/lrc-parser'
import { Document, Headset } from '@element-plus/icons-vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'

const playerStore = usePlayerStore()
const settingsStore = useSettingsStore()
const { seekPercent } = useAudio()
const { t } = useI18n()

// 用于强制刷新图片的 key
const refreshKey = ref(0)

// 处理内存优化恢复事件
const handleRestoreUI = async () => {
  console.log('[Lyrics] Memory optimization: restoring UI, refreshing cover image and lyrics')
  // 增加 refreshKey 强制 Vue 重新创建图片元素
  refreshKey.value++
  // 重新加载歌词并立即定位到当前播放位置
  await loadLyrics()
}

onMounted(() => {
  // 监听内存优化恢复事件
  window.addEventListener('memory-optimization:restore-ui', handleRestoreUI)
})

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('memory-optimization:restore-ui', handleRestoreUI)
})

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
const scrollToCurrentLine = (immediate = false) => {
  if (isUserScrolling.value || !lyricsContainerRef.value || currentLineIndex.value < 0) return

  const activeLine = lyricLineRefs.value[currentLineIndex.value]
  if (activeLine) {
    const container = lyricsContainerRef.value

    // 使用 offsetTop 进行更可靠的 content-relative 计算，避免视口坐标干扰
    const targetScrollTop = activeLine.offsetTop - (container.clientHeight / 2) + (activeLine.clientHeight / 2)

    isAutoScrolling = true
    container.scrollTo({
      top: targetScrollTop,
      behavior: immediate ? 'auto' : 'smooth'
    })

    // 滚动结束后重置自动滚动标志
    if (immediate) {
      isAutoScrolling = false
    } else {
      setTimeout(() => {
        isAutoScrolling = false
      }, 500)
    }
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

      // 歌词加载完成后，立即根据当前播放时间定位到正确位置
      // 使用 nextTick 确保 DOM 已更新
      await nextTick()
      // 给 DOM 极短时间完成渲染后立即定位
      requestAnimationFrame(() => {
        updateCurrentLine(playerStore.currentTime, true)
        // 强制触发滚动（即使 index 没变）来确保初始位置正确
        if (currentLineIndex.value >= 0) {
          scrollToCurrentLine(true)
        } else if (lyrics.value.length > 0) {
          currentLineIndex.value = 0
          scrollToCurrentLine(true)
        }
      })
    }
  } catch (error) {
    console.error('加载歌词失败:', error)
  }
}

// 更新当前行
const updateCurrentLine = (time: number, immediate = false) => {
  if (lyrics.value.length === 0) return

  // 特殊处理：如果只有一行歌词（通常是纯音乐），始终高亮这一行
  if (lyrics.value.length === 1) {
    if (currentLineIndex.value !== 0) {
      currentLineIndex.value = 0
      scrollToCurrentLine(immediate)
    }
    return
  }

  // 找到最后一个时间小于等于当前时间的歌词
  let index = -1
  for (let i = 0; i < lyrics.value.length; i++) {
    if (time >= lyrics.value[i].time) {
      index = i
    } else {
      break
    }
  }

  // 如果是在第一行歌词之前，默认定位到第一行
  if (index === -1 && lyrics.value.length > 0) {
    index = 0
  }

  if (index !== currentLineIndex.value) {
    currentLineIndex.value = index
    scrollToCurrentLine(immediate)
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
watch(() => playerStore.currentTime, (time) => updateCurrentLine(time))
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
  gap: 12px;
  /* 调整为更紧凑的间距，原为 $spacing-md (16px) */
}

.lyric-line {
  min-height: 28px;
  /* 单行歌词更紧凑，原为 50px */
  padding: 0 $spacing-xl;
  /* 仅保留左右内边距 */
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* 双行歌词（有翻译）保持原有布局 */
  &.has-translation {
    min-height: 50px;
    margin-bottom: 4px;
    /* 补偿减小的 gap，保持双行歌词的间距感 */
  }

  &:hover {
    .lyric-main {
      color: $text-secondary;
    }
  }

  &.active {
    .lyric-main {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      transform: scale(1.05);
    }

    .lyric-translation {
      color: $text-secondary;
      opacity: 1;
    }
  }

  .lyric-main {
    font-size: $font-size-lg;
    line-height: 1.5;
    color: $text-muted;
    transition: all 0.3s ease;
  }

  .lyric-translation {
    font-size: $font-size-md;
    line-height: 1.4;
    color: $text-muted;
    opacity: 0.7;
    margin-top: $spacing-xs;
    /* 主歌词与翻译间距 4px */
    transition: all 0.3s ease;
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
