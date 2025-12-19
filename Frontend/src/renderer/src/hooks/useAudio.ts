/**
 * 音频播放 Hook
 * 封装 HTML5 Audio API，提供播放控制功能
 * 使用单例模式确保全局只有一个 Audio 实例
 */
import { usePlayerStore } from '@/store/player.store'
import { useSettingsStore } from '@/store/settings.store'
import { storeToRefs } from 'pinia'
import { ref, watch, type Ref } from 'vue'

// ============ 全局单例 ============
let globalAudio: HTMLAudioElement | null = null
let globalAudioContext: AudioContext | null = null
let globalAnalyser: AnalyserNode | null = null
let globalSource: MediaElementAudioSourceNode | null = null
let isInitialized = false
let watchersSetUp = false

// 共享的 ref，用于让多个组件访问 analyser
const sharedAnalyser: Ref<AnalyserNode | null> = ref(null)

/**
 * 初始化全局 Audio 实例（只执行一次）
 */
function initGlobalAudio(playerStore: ReturnType<typeof usePlayerStore>) {
  if (isInitialized) return
  isInitialized = true

  globalAudio = new Audio()
  globalAudio.crossOrigin = "anonymous"
  globalAudio.volume = playerStore.volume

  // 初始化 Web Audio API (用于可视化)
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      globalAudioContext = new AudioContextClass()
      globalAnalyser = globalAudioContext.createAnalyser()
      globalAnalyser.fftSize = 512

      globalSource = globalAudioContext.createMediaElementSource(globalAudio)
      globalSource.connect(globalAnalyser)
      globalAnalyser.connect(globalAudioContext.destination)

      sharedAnalyser.value = globalAnalyser
    }
  } catch (e) {
    console.error('Web Audio API initialization failed:', e)
  }

  // 监听事件
  globalAudio.addEventListener('timeupdate', () => {
    if (globalAudio) {
      playerStore.setCurrentTime(globalAudio.currentTime)
    }
  })

  globalAudio.addEventListener('durationchange', () => {
    if (globalAudio) {
      playerStore.setDuration(globalAudio.duration)
    }
  })

  globalAudio.addEventListener('ended', () => {
    if (playerStore.playMode === 'single') {
      if (globalAudio) {
        globalAudio.currentTime = 0
        globalAudio.play()
      }
    } else {
      playerStore.next()
    }
  })

  globalAudio.addEventListener('error', (e: Event) => {
    console.error('[Audio] 播放错误:', e)
    playerStore.pause()
  })

  globalAudio.addEventListener('canplay', () => {
    if (playerStore.isPlaying && globalAudio) {
      globalAudio.play()
    }
  })

  console.log('[Audio] Global audio instance initialized')
}

/**
 * 设置状态监听器（只在主播放组件中调用一次）
 */
function setupWatchers(
  playerStore: ReturnType<typeof usePlayerStore>,
  settingsStore: ReturnType<typeof useSettingsStore>
) {
  if (watchersSetUp) return
  watchersSetUp = true

  const { currentSong, isPlaying, volume, isMuted } = storeToRefs(playerStore)

  // 监听当前歌曲变化
  watch(currentSong, (newSong) => {
    if (newSong && globalAudio) {
      const normalizedPath = newSong.file_path.replace(/\\/g, '/')
      globalAudio.src = `local-audio://${normalizedPath}`
      globalAudio.load()
    }
  }, { immediate: true })

  // 监听播放状态变化
  watch(isPlaying, (playing) => {
    if (globalAudio) {
      if (playing) {
        globalAudio.play().catch(console.error)
      } else {
        globalAudio.pause()
      }
    }
  })

  // 监听音量变化
  watch(volume, (vol) => {
    if (globalAudio) {
      globalAudio.volume = isMuted.value ? 0 : vol
    }
  })

  // 监听静音变化
  watch(isMuted, (muted) => {
    if (globalAudio) {
      globalAudio.volume = muted ? 0 : volume.value
    }
  })

  console.log('[Audio] Watchers set up')
}

/**
 * 音频播放 Hook
 * @param isPrimary 是否为主播放器（只有主播放器会设置 watchers）
 */
export function useAudio(isPrimary = false) {
  const playerStore = usePlayerStore()
  const settingsStore = useSettingsStore()

  // 确保全局 Audio 已初始化
  initGlobalAudio(playerStore)

  // 仅主播放器设置 watchers
  if (isPrimary) {
    setupWatchers(playerStore, settingsStore)
  }

  // 跳转到指定时间
  const seek = (time: number) => {
    if (globalAudio) {
      globalAudio.currentTime = time
    }
  }

  // 跳转到指定百分比
  const seekPercent = (percent: number) => {
    if (globalAudio && globalAudio.duration) {
      globalAudio.currentTime = (percent / 100) * globalAudio.duration
    }
  }

  // 设置音量
  const setVolume = (vol: number) => {
    if (globalAudio) {
      globalAudio.volume = vol
    }
    playerStore.setVolume(vol)
    settingsStore.setVolume(vol)
  }

  // 播放
  const play = () => {
    if (globalAudio) {
      globalAudio.play().catch(console.error)
    }
  }

  // 暂停
  const pause = () => {
    if (globalAudio) {
      globalAudio.pause()
    }
  }

  // 加载歌曲
  const loadSong = (filePath: string) => {
    if (globalAudio) {
      const normalizedPath = filePath.replace(/\\/g, '/')
      globalAudio.src = `local-audio://${normalizedPath}`
      globalAudio.load()
    }
  }

  return {
    audio: ref(globalAudio),
    play,
    pause,
    seek,
    seekPercent,
    setVolume,
    loadSong,
    analyser: sharedAnalyser
  }
}
