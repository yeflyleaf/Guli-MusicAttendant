<template>
  <!-- 启动屏幕 -->
  <!-- 星际穿梭主题 -->
  <SplashScreen v-if="showSplash && settingsStore.splashTheme === 'cosmic'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 翡翠圣域主题 -->
  <EmeraldSanctuarySplash v-if="showSplash && settingsStore.splashTheme === 'emerald'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 炼狱熔炉主题 -->
  <MoltenForgeSplash v-if="showSplash && settingsStore.splashTheme === 'molten'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 深蓝幽光主题 -->
  <BioluminescentAbyssSplash v-if="showSplash && settingsStore.splashTheme === 'abyss'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 黄铜纪元主题 -->
  <BrassEraSplash v-if="showSplash && settingsStore.splashTheme === 'brass'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 零度棱镜主题 -->
  <SubzeroPrismSplash v-if="showSplash && settingsStore.splashTheme === 'prism'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 真理殿堂主题 -->
  <SanctumOfTruthSplash v-if="showSplash && settingsStore.splashTheme === 'sanctum'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 硅基秩序主题 -->
  <SiliconOrderSplash v-if="showSplash && settingsStore.splashTheme === 'silicon'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />

  <div class="app-container">
    <!-- 自定义标题栏 -->
    <Header />

    <!-- 主内容区域 -->
    <div class="app-main">
      <!-- 页面内容 -->
      <main class="app-content" :class="{ 'queue-visible': playerStore.showQueue }">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['LocalMusic', 'Favorites', 'RecentlyPlayed', 'PlaylistDetail']" :max="10">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </main>

      <!-- 播放队列侧边栏 -->
      <PlayQueue />
    </div>

    <!-- 底部播放控制栏 -->
    <FooterPlayer />

    <!-- 歌词全屏覆盖层 -->
    <transition name="slide-up">
      <div v-if="playerStore.showLyrics" class="lyrics-overlay">
        <Lyrics />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import BioluminescentAbyssSplash from '@/components/Layout/BioluminescentAbyssSplash.vue'
import BrassEraSplash from '@/components/Layout/BrassEraSplash.vue'
import EmeraldSanctuarySplash from '@/components/Layout/EmeraldSanctuarySplash.vue'
import FooterPlayer from '@/components/Layout/FooterPlayer.vue'
import Header from '@/components/Layout/Header.vue'
import MoltenForgeSplash from '@/components/Layout/MoltenForgeSplash.vue'
import PlayQueue from '@/components/Layout/PlayQueue.vue'
import SanctumOfTruthSplash from '@/components/Layout/SanctumOfTruthSplash.vue'
import SiliconOrderSplash from '@/components/Layout/SiliconOrderSplash.vue'
import SplashScreen from '@/components/Layout/SplashScreen.vue'
import SubzeroPrismSplash from '@/components/Layout/SubzeroPrismSplash.vue'
import { useShortcuts } from '@/hooks/useIpc'
import { usePlayerStore } from '@/store/player.store'
import { useSettingsStore } from '@/store/settings.store'
import { debounce } from '@/utils/debounce'
import Lyrics from '@/views/Lyrics.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const playerStore = usePlayerStore()
const settingsStore = useSettingsStore()

// 启动屏幕控制
const showSplash = ref(true)
const isStartup = ref(true)

const handleSplashFinish = () => {
  showSplash.value = false
  isStartup.value = false
}

// 监听显示启动屏幕事件
window.addEventListener('show-splash-screen', () => {
  showSplash.value = true
})

// 设置全局快捷键监听
useShortcuts()

// 恢复播放状态（需要等待settings加载完成）
onMounted(async () => {
  // 等待预加载完成
  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    await preloadPromise
  }

  // 现在 settingsStore.isLoaded 应该为 true
  if (settingsStore.rememberPlaybackStatus) {
    console.log('[App] Restoring playback status...')
    await playerStore.restorePlaybackStatus()
  }
})

// 自动保存播放状态
const saveStatus = debounce(() => {
  if (settingsStore.rememberPlaybackStatus) {
    console.log('[App] Saving playback status...')
    playerStore.savePlaybackStatus()
  }
}, 2000)

// 监听播放状态变化
watch(
  () => playerStore.queue.length,
  () => {
    saveStatus()
  }
)

watch(
  () => playerStore.currentIndex,
  () => {
    saveStatus()
  }
)

watch(
  () => playerStore.playMode,
  () => {
    saveStatus()
  }
)

// 每30秒保存一次进度（如果在播放）
let progressSaveInterval: number | null = null
watch(
  () => playerStore.isPlaying,
  (isPlaying) => {
    if (isPlaying && settingsStore.rememberPlaybackStatus) {
      progressSaveInterval = window.setInterval(() => {
        playerStore.savePlaybackStatus()
      }, 30000) // 每30秒保存一次
    } else if (progressSaveInterval) {
      clearInterval(progressSaveInterval)
      progressSaveInterval = null
      // 暂停时立即保存一次
      if (settingsStore.rememberPlaybackStatus && playerStore.currentSong) {
        playerStore.savePlaybackStatus()
      }
    }
  }
)

// 窗口关闭时保存播放状态
window.addEventListener('beforeunload', () => {
  if (settingsStore.rememberPlaybackStatus && playerStore.currentSong) {
    console.log('[App] Saving playback status before unload...')
    playerStore.savePlaybackStatus()
  }
})

// 注意：数据预加载已移至 main.ts 中，在应用挂载后立即开始
// 启动屏幕显示 1.5 秒，为数据加载提供缓冲时间
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $bg-primary;
  overflow: hidden;
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: $spacing-lg;
  background: linear-gradient(180deg, $bg-secondary 0%, $bg-primary 100%);
  transition: margin-right 0.3s ease;

  &.queue-visible {
    margin-right: 320px;
  }
}

.lyrics-overlay {
  position: absolute;
  top: $header-height;
  left: 0;
  width: 100%;
  height: calc(100% - $header-height);
  z-index: 1010;
  /* Below FooterPlayer (1020) but above everything else */
  background: $bg-primary;
}

/* 动画效果 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
