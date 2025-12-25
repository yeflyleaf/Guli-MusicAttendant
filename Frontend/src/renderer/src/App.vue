<template>
  <!-- 星际巡航动态背景 -->
  <InterstellarCruiseBackground v-if="showInterstellarBackground" />

  <!-- 暗夜哥特动态背景 -->
  <GothicSanctuaryBackground v-if="showGothicBackground" />

  <!-- 剪纸戏梦动态背景 -->
  <PapercutTheatreBackground v-if="showPapercutBackground" />

  <!-- 量子泡沫动态背景 -->
  <QuantumFoamBackground v-if="showQuantumBackground" />

  <!-- 糖果乐园动态背景 -->
  <SugarLandBackground v-if="showSugarLandBackground" />

  <!-- 废土余晖动态背景 -->
  <WastelandAfterglowBackground v-if="showWastelandBackground" />

  <!-- 启动屏幕 - 等待设置加载完成后再渲染，避免使用默认主题值导致闪烁 -->
  <!-- 窗口在设置加载完成后才显示，确保用户看到的第一帧就是正确的过场动画 -->
  <!-- 星际穿梭主题 -->
  <SplashScreen v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'cosmic'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 翡翠圣域主题 -->
  <EmeraldSanctuarySplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'emerald'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 炼狱熔炉主题 -->
  <MoltenForgeSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'molten'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 深蓝幽光主题 -->
  <BioluminescentAbyssSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'abyss'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 黄铜纪元主题 -->
  <BrassEraSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'brass'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 零度棱镜主题 -->
  <SubzeroPrismSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'prism'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 真理殿堂主题 -->
  <SanctumOfTruthSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'sanctum'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 硅基秩序主题 -->
  <SiliconOrderSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'silicon'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 幻象几何主题 -->
  <EtherealGeometrySplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'ethereal'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 未来都市主题 -->
  <CyberCityscapeSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'cyber'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 和风落樱主题 -->
  <ZenCherryBlossomSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'sakura'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />
  <!-- 时空裂隙主题 -->
  <ChronosRiftSplash v-if="showSplash && settingsStore.isLoaded && settingsStore.splashTheme === 'chronos'"
    :disabled="isStartup && settingsStore.disableSplashScreen" @finished="handleSplashFinish" />

  <!-- 迷你播放器模式 -->
  <MiniPlayer v-if="isMiniPlayerMode && !showSplash" />

  <!-- 完整播放器模式 -->
  <div v-show="!isMiniPlayerMode" class="app-container" :style="{ opacity: isStartup ? 0 : 1 }">
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
        <!-- 歌词页面的星际巡航背景 -->
        <InterstellarCruiseBackground v-if="settingsStore.theme === 'interstellar'" :embedded="true" />
        <!-- 歌词页面的暗夜哥特背景 -->
        <GothicSanctuaryBackground v-if="settingsStore.theme === 'gothic'" :embedded="true" />
        <!-- 歌词页面的剪纸戏梦背景 -->
        <PapercutTheatreBackground v-if="settingsStore.theme === 'papercut'" :embedded="true" />
        <!-- 歌词页面的量子泡沫背景 -->
        <QuantumFoamBackground v-if="settingsStore.theme === 'quantum'" :embedded="true" />
        <!-- 歌词页面的糖果乐园背景 -->
        <SugarLandBackground v-if="settingsStore.theme === 'sugarland'" :embedded="true" />
        <!-- 歌词页面的废土余晖背景 -->
        <WastelandAfterglowBackground v-if="settingsStore.theme === 'wasteland'" :embedded="true" />

        <Lyrics />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import BioluminescentAbyssSplash from '@/components/Layout/BioluminescentAbyssSplash.vue'
import BrassEraSplash from '@/components/Layout/BrassEraSplash.vue'
import ChronosRiftSplash from '@/components/Layout/ChronosRiftSplash.vue'
import CyberCityscapeSplash from '@/components/Layout/CyberCityscapeSplash.vue'
import EmeraldSanctuarySplash from '@/components/Layout/EmeraldSanctuarySplash.vue'
import EtherealGeometrySplash from '@/components/Layout/EtherealGeometrySplash.vue'
import FooterPlayer from '@/components/Layout/FooterPlayer.vue'
import Header from '@/components/Layout/Header.vue'
import MiniPlayer from '@/components/Layout/MiniPlayer.vue'
import MoltenForgeSplash from '@/components/Layout/MoltenForgeSplash.vue'
import PlayQueue from '@/components/Layout/PlayQueue.vue'
import SanctumOfTruthSplash from '@/components/Layout/SanctumOfTruthSplash.vue'
import SiliconOrderSplash from '@/components/Layout/SiliconOrderSplash.vue'
import SplashScreen from '@/components/Layout/SplashScreen.vue'
import SubzeroPrismSplash from '@/components/Layout/SubzeroPrismSplash.vue'
import ZenCherryBlossomSplash from '@/components/Layout/ZenCherryBlossomSplash.vue'
import GothicSanctuaryBackground from '@/components/Theme/GothicSanctuaryBackground.vue'
import InterstellarCruiseBackground from '@/components/Theme/InterstellarCruiseBackground.vue'
import PapercutTheatreBackground from '@/components/Theme/PapercutTheatreBackground.vue'
import QuantumFoamBackground from '@/components/Theme/QuantumFoamBackground.vue'
import SugarLandBackground from '@/components/Theme/SugarLandBackground.vue'
import WastelandAfterglowBackground from '@/components/Theme/WastelandAfterglowBackground.vue'
import { useAudio } from '@/hooks/useAudio'
import { showConfirm } from '@/hooks/useConfirm'
import { useShortcuts } from '@/hooks/useIpc'
import { isLowMemoryMode, useMemoryOptimization } from '@/hooks/useMemoryOptimization'
import { useLibraryStore } from '@/store/library.store'
import { usePlayerStore } from '@/store/player.store'
import { useSettingsStore } from '@/store/settings.store'
import type { Music } from '@/types/music'
import { debounce } from '@/utils/debounce'
import Lyrics from '@/views/Lyrics.vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const route = useRoute()
const playerStore = usePlayerStore()
const settingsStore = useSettingsStore()
const libraryStore = useLibraryStore()
const { t } = useI18n()

// 全局初始化音频系统（确保无论完整模式还是迷你模式，音频控制都能正常工作）
useAudio(true)

// 初始化内存优化系统（仅在窗口最小化或隐藏到托盘时启用）
useMemoryOptimization()

// 启动屏幕控制
const showSplash = ref(true)
const isStartup = ref(true)

// 迷你播放器模式
const isMiniPlayerMode = ref(false)

// 星际巡航动态背景显示控制
const showInterstellarBackground = computed(() => {
  return settingsStore.isLoaded && settingsStore.theme === 'interstellar' && !showSplash.value && !isLowMemoryMode.value
})

// 暗夜哥特动态背景显示控制
const showGothicBackground = computed(() => {
  return settingsStore.isLoaded && settingsStore.theme === 'gothic' && !showSplash.value && !isLowMemoryMode.value
})

// 剪纸戏梦动态背景显示控制
const showPapercutBackground = computed(() => {
  return settingsStore.isLoaded && settingsStore.theme === 'papercut' && !showSplash.value && !isLowMemoryMode.value
})

// 量子泡沫动态背景显示控制
const showQuantumBackground = computed(() => {
  return settingsStore.isLoaded && settingsStore.theme === 'quantum' && !showSplash.value && !isLowMemoryMode.value
})

// 糖果乐园动态背景显示控制
const showSugarLandBackground = computed(() => {
  return settingsStore.isLoaded && settingsStore.theme === 'sugarland' && !showSplash.value && !isLowMemoryMode.value
})

// 废土余晖动态背景显示控制
const showWastelandBackground = computed(() => {
  return settingsStore.isLoaded && settingsStore.theme === 'wasteland' && !showSplash.value && !isLowMemoryMode.value
})

const handleSplashFinish = () => {
  showSplash.value = false
  isStartup.value = false
}

// 调试：监听主题变化
watch(
  () => settingsStore.theme,
  (newTheme) => {
    console.log('[App] Theme changed to:', newTheme, 'showSplash:', showSplash.value, 'isLoaded:', settingsStore.isLoaded)
  },
  { immediate: true }
)

// 监听设置加载完成，然后通知主进程显示窗口
// 这样窗口显示时就直接是用户选择的过场动画
watch(
  () => settingsStore.isLoaded,
  async (isLoaded) => {
    if (isLoaded) {
      console.log('[App] Settings loaded, theme:', settingsStore.theme, 'splashTheme:', settingsStore.splashTheme, 'disableSplash:', settingsStore.disableSplashScreen)

      // 等待 DOM 更新，确保过场动画组件已经挂载
      await nextTick()

      // 额外给予一点渲染时间，确保过场动画完全上屏
      // 彻底杜绝"先显示主页再显示过场"的闪烁问题
      setTimeout(() => {
        // 安全调用 show 方法
        if (window.electron?.window?.show) {
          window.electron.window.show()
        }
        console.log('[App] Window shown')
      }, 100)

      // 如果过场动画被禁用，立即显示主界面
      if (settingsStore.disableSplashScreen) {
        console.log('[App] Splash disabled, showing main content immediately')
        handleSplashFinish()
        return
      }

      // 安全超时：如果 6 秒后过场动画仍未完成，强制显示主界面
      // 正常过场动画约 5 秒完成，这是异常情况的后备机制
      setTimeout(() => {
        if (isStartup.value) {
          console.warn('[App] Splash screen timeout, forcing main content display')
          handleSplashFinish()
        }
      }, 6000)
    }
  },
  { immediate: true }
)

// 监听显示启动屏幕事件
window.addEventListener('show-splash-screen', () => {
  showSplash.value = true
})

// 处理音乐路径验证失败事件
const handleMusicPathValidationFailed = async (event: CustomEvent<{
  song: Music
  fileExists?: boolean
  musicFolders?: string[]
}>) => {
  const { song, fileExists, musicFolders } = event.detail

  // 构建 HTML 格式的警告消息
  let message = `<div style="line-height: 1.8;">`

  // 第一行：无法播放歌曲
  message += `<p style="margin: 0 0 12px 0;">${t('player.pathValidationFailed', { title: song.title })}</p>`

  // 第二行：文件路径
  message += `<p style="margin: 0 0 12px 0; word-break: break-all;">${t('player.filePath', { path: song.file_path })}</p>`

  // 第三行：该歌曲不在设置的音乐文件夹中
  message += `<p style="margin: 0 0 12px 0;">${t('player.notInMusicFolder')}</p>`

  // 显示当前设置的音乐文件夹，或者提示没有设置
  if (musicFolders && musicFolders.length > 0) {
    message += `<p style="margin: 0 0 8px 0;">${t('player.currentMusicFolders')}</p>`
    message += `<ul style="margin: 0 0 12px 0; padding-left: 20px;">`
    musicFolders.forEach(folder => {
      message += `<li style="word-break: break-all;">${folder}</li>`
    })
    message += `</ul>`
  } else {
    // 没有设置任何音乐文件夹
    message += `<p style="margin: 0 0 12px 0; color: #e6a23c; font-weight: bold;">${t('player.noMusicFolders')}</p>`
  }

  // 第四行：提示（标红加粗）
  if (fileExists) {
    message += `<p style="margin: 12px 0 0 0; color: #f56c6c; font-weight: bold;">${t('player.fileExistsButNotInFolder')}</p>`
  } else {
    message += `<p style="margin: 12px 0 0 0; color: #f56c6c; font-weight: bold;">${t('player.fileNotFound')}</p>`
  }

  message += `</div>`

  try {
    const confirmed = await showConfirm({
      message,
      title: t('player.pathValidationTitle'),
      type: 'warning',
      confirmText: t('player.removeFromList'),
      cancelText: t('common.cancel')
    })

    if (confirmed) {
      // 用户选择从列表中删除
      await libraryStore.deleteMusic(song.id)
      console.log(`[App] Song "${song.title}" removed from library`)
    } else {
      // 用户取消，不做任何操作
      console.log(`[App] User cancelled removing song "${song.title}"`)
    }
  } catch (error) {
    console.error('[App] Error handling music path validation:', error)
  }
}

// 处理迷你播放器模式变化
const handleMiniPlayerModeChange = (isMini: boolean) => {
  isMiniPlayerMode.value = isMini
  console.log('[App] Mini player mode:', isMini)
}

// 处理进入低内存模式
const handleEnterLowMemory = () => {
  console.log('[App] Entering low memory mode - clearing store data...')
  libraryStore.enterLowMemoryMode()
}

// 处理退出低内存模式
const handleExitLowMemory = () => {
  console.log('[App] Exiting low memory mode - restoring store data...')
  libraryStore.exitLowMemoryMode()
}

// 添加路径验证失败事件监听
onMounted(() => {
  // 使用类型断言处理 CustomEvent 监听器
  const handler = handleMusicPathValidationFailed as unknown as (event: Event) => void
  window.addEventListener('music-path-validation-failed', handler)

  // 监听迷你播放器模式变化
  window.electron?.on('window:miniPlayerMode', handleMiniPlayerModeChange as (...args: unknown[]) => void)

  // 监听内存优化事件
  window.addEventListener('memory-optimization:enter-low-memory', handleEnterLowMemory)
  window.addEventListener('memory-optimization:exit-low-memory', handleExitLowMemory)
})

onUnmounted(() => {
  const handler = handleMusicPathValidationFailed as unknown as (event: Event) => void
  window.removeEventListener('music-path-validation-failed', handler)

  // 移除内存优化事件监听
  window.removeEventListener('memory-optimization:enter-low-memory', handleEnterLowMemory)
  window.removeEventListener('memory-optimization:exit-low-memory', handleExitLowMemory)
})

// 设置全局快捷键监听
useShortcuts()

// 恢复播放状态（需要等待settings加载完成）
onMounted(async () => {
  // 等待预加载完成
  const preloadPromise = (window as Window & { __preloadPromise?: Promise<void> }).__preloadPromise
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

watch(
  () => playerStore.volume,
  () => {
    saveStatus()
  }
)

watch(
  () => playerStore.isMuted,
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

<style lang="scss">
// 全局样式
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  transition: opacity 0.5s ease;
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
  overflow: hidden;

  // 歌词页面内的星际巡航背景
  .lyrics-interstellar-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  // 确保歌词组件在背景之上
  :deep(.lyrics-container) {
    position: relative;
    z-index: 1;
  }
}

// 星际巡航主题下歌词页面使用深空背景色（背景组件会覆盖）
:global(html.interstellar) .lyrics-overlay {
  background: #090a0f;
}

// 暗夜哥特主题下歌词页面使用黑曜石背景色（背景组件会覆盖）
:global(html.gothic) .lyrics-overlay {
  background: #050505;
}

// 剪纸戏梦主题下歌词页面使用暮山紫背景色（背景组件会覆盖）
:global(html.papercut) .lyrics-overlay {
  background: #1a1c29;
}

// 量子泡沫主题下歌词页面使用深邃虚空背景色（背景组件会覆盖）
:global(html.quantum) .lyrics-overlay {
  background: #020c1b;
}

// 糖果乐园主题下歌词页面使用草莓奶昔粉背景色（背景组件会覆盖）
:global(html.sugarland) .lyrics-overlay {
  background: #fff0f5;
}

// 废土余晖主题下歌词页面使用油烟黑背景色（背景组件会覆盖）
:global(html.wasteland) .lyrics-overlay {
  background: #1a0f0f;
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
