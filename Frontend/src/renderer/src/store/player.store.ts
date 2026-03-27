/**
 * 播放器状态管理
 * 管理当前播放状态、播放队列、音量等
 */
import type { Music } from '../types/music'
import { defineStore } from 'pinia'
// 播放模式
export type PlayMode = 'sequence' | 'loop' | 'single' | 'random'

interface PlayerState {
  // 当前播放的歌曲
  currentSong: Music | null
  // 播放状态
  isPlaying: boolean
  // 当前播放时间（秒）
  currentTime: number
  // 总时长（秒）
  duration: number
  // 音量 0-1
  volume: number
  // 是否静音
  isMuted: boolean
  // 播放模式
  playMode: PlayMode
  // 播放队列
  queue: Music[]
  // 当前播放索引
  currentIndex: number
  // 历史播放记录（用于随机播放时回退）
  playHistory: number[]
  // 是否显示歌词
  showLyrics: boolean
  // 是否显示播放队列侧边栏
  showQueue: boolean
  // 低内存模式标志
  isLowMemoryMode: boolean
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    playMode: 'sequence',
    queue: [],
    currentIndex: -1,
    playHistory: [],
    showLyrics: false,
    showQueue: false,
    isLowMemoryMode: false
  }),

  getters: {
    // 播放进度百分比
    progress: (state: PlayerState): number => {
      if (state.duration === 0) return 0
      return (state.currentTime / state.duration) * 100
    },

    // 是否有上一首
    hasPrevious: (state: PlayerState): boolean => {
      if (state.playMode === 'random') {
        return state.playHistory.length > 0
      }
      return state.currentIndex > 0
    },

    // 是否有下一首
    hasNext: (state: PlayerState): boolean => {
      if (state.playMode === 'loop' || state.playMode === 'random') {
        return state.queue.length > 0
      }
      return state.currentIndex < state.queue.length - 1
    },

    // 队列中的歌曲数量
    queueLength: (state: PlayerState): number => state.queue.length,

    // 当前歌曲是否收藏
    isFavorite: (state: PlayerState): boolean => {
      return state.currentSong?.is_favorite === 1
    }
  },

  actions: {
    /**
     * 播放指定歌曲
     * @param song 要播放的歌曲
     * @param addToQueue 是否添加到队列
     * @param skipValidation 是否跳过路径验证（内部使用）
     */
    async play(song: Music, addToQueue = true, skipValidation = false) {
      // 验证歌曲路径：优先检查文件是否存在
      if (!skipValidation && window.electron?.dialog) {
        try {
          // 首先检查文件是否存在
          const fileExists = await window.electron.dialog.checkFileExists(song.file_path)

          if (!fileExists) {
            // 文件不存在，直接触发警告事件
            window.dispatchEvent(new CustomEvent('music-path-validation-failed', {
              detail: {
                song,
                fileExists: false,
                musicFolders: await window.electron.settings.getMusicFolders()
              }
            }))
            return
          }

          // 如果文件存在，再检查是否在有效音乐文件夹中
          if (window.electron.dialog.validateMusicPath) {
            const result = await window.electron.dialog.validateMusicPath(song.file_path)

            if (!result.valid) {
              // 歌曲不在音乐文件夹中，触发警告事件
              window.dispatchEvent(new CustomEvent('music-path-validation-failed', {
                detail: {
                  song,
                  fileExists: result.fileExists,
                  musicFolders: result.musicFolders
                }
              }))
              return
            }
          }
        } catch (error) {
          console.error('[Player] Failed to validate music path:', error)
          // 验证失败时继续播放（容错处理）
        }
      }

      // 如果需要添加到队列
      if (addToQueue && !this.queue.find(s => s.id === song.id)) {
        this.queue.push(song)
        this.currentIndex = this.queue.length - 1
      } else {
        // 找到歌曲在队列中的位置
        const index = this.queue.findIndex(s => s.id === song.id)
        if (index !== -1) {
          this.currentIndex = index
        }
      }

      this.currentSong = song
      this.isPlaying = true
      this.currentTime = 0

      // 记录播放并刷新最近播放列表
      this._recordPlay(song.id)
    },

    /**
     * 立即播放歌曲（用于在线音乐）
     * 跳过路径验证，不记录播放历史，不污染本地数据
     * @param song 要播放的歌曲（可以是临时构造的对象）
     */
    playNow(song: Music) {
      console.log('[Player] Playing online music:', song.title)

      // 直接设置当前歌曲，不添加到队列（保持本地队列干净）
      this.currentSong = song
      this.isPlaying = true
      this.currentTime = 0

      // 不调用 _recordPlay，避免污染播放记录
      // 不添加到 queue，避免与本地音乐混合
    },

    /**
     * 播放/暂停切换
     */
    togglePlay() {
      if (!this.currentSong && this.queue.length > 0) {
        // 没有当前歌曲但队列有歌曲，播放第一首
        this.play(this.queue[0], false)
      } else {
        this.isPlaying = !this.isPlaying
      }
    },

    /**
     * 暂停
     */
    pause() {
      this.isPlaying = false
    },

    /**
     * 继续播放
     */
    resume() {
      if (this.currentSong) {
        this.isPlaying = true
      }
    },

    /**
     * 停止播放
     */
    stop() {
      this.isPlaying = false
      this.currentTime = 0
    },

    /**
     * 上一首
     */
    previous() {
      if (this.queue.length === 0) return

      if (this.playMode === 'random' && this.playHistory.length > 0) {
        // 随机模式下，返回历史记录
        const prevIndex = this.playHistory.pop()!
        this.currentIndex = prevIndex
        this.currentSong = this.queue[prevIndex]
        this.isPlaying = true
        // 记录播放并刷新最近播放
        this._recordPlay(this.currentSong.id)
        return
      }

      if (this.currentIndex > 0) {
        this.currentIndex--
      } else if (this.playMode === 'loop') {
        // 循环模式，跳到最后一首
        this.currentIndex = this.queue.length - 1
      } else {
        return
      }

      this.currentSong = this.queue[this.currentIndex]
      this.isPlaying = true
      this.currentTime = 0
      // 记录播放并刷新最近播放
      this._recordPlay(this.currentSong.id)
    },

    /**
     * 下一首
     */
    next() {
      if (this.queue.length === 0) return

      // 记录当前位置到历史
      if (this.currentIndex >= 0) {
        this.playHistory.push(this.currentIndex)
        // 限制历史记录长度
        if (this.playHistory.length > 50) {
          this.playHistory.shift()
        }
      }

      if (this.playMode === 'random') {
        // 随机播放
        let randomIndex: number
        do {
          randomIndex = Math.floor(Math.random() * this.queue.length)
        } while (randomIndex === this.currentIndex && this.queue.length > 1)

        this.currentIndex = randomIndex
      } else if (this.playMode === 'single') {
        // 单曲循环，保持当前歌曲
        this.currentTime = 0
        this.isPlaying = true
        return
      } else {
        // 顺序播放或列表循环
        if (this.currentIndex < this.queue.length - 1) {
          this.currentIndex++
        } else if (this.playMode === 'loop') {
          this.currentIndex = 0
        } else {
          // 顺序播放完毕
          this.isPlaying = false
          return
        }
      }

      this.currentSong = this.queue[this.currentIndex]
      this.isPlaying = true
      this.currentTime = 0
      // 记录播放并刷新最近播放
      this._recordPlay(this.currentSong.id)
    },

    /**
     * 设置播放队列
     */
    setQueue(songs: Music[], startIndex = 0) {
      this.queue = [...songs]
      this.currentIndex = startIndex
      this.playHistory = []

      if (songs.length > 0 && startIndex < songs.length) {
        this.play(songs[startIndex], false)
      }
    },

    /**
     * 添加到队列
     */
    addToQueue(song: Music) {
      if (!this.queue.find(s => s.id === song.id)) {
        this.queue.push(song)
      }
    },

    /**
     * 批量添加到队列
     */
    addToQueueBatch(songs: Music[]) {
      for (const song of songs) {
        if (!this.queue.find(s => s.id === song.id)) {
          this.queue.push(song)
        }
      }
    },

    /**
     * 从队列中移除
     */
    removeFromQueue(songId: number) {
      const index = this.queue.findIndex(s => s.id === songId)
      if (index === -1) return

      this.queue.splice(index, 1)

      // 更新当前索引
      if (index < this.currentIndex) {
        this.currentIndex--
      } else if (index === this.currentIndex) {
        // 移除的是当前歌曲
        if (this.queue.length === 0) {
          this.currentSong = null
          this.isPlaying = false
          this.currentIndex = -1
        } else if (index >= this.queue.length) {
          this.currentIndex = this.queue.length - 1
          this.currentSong = this.queue[this.currentIndex]
        } else {
          this.currentSong = this.queue[this.currentIndex]
        }
      }
    },

    /**
     * 清空队列
     */
    clearQueue() {
      this.queue = []
      this.currentSong = null
      this.currentIndex = -1
      this.isPlaying = false
      this.currentTime = 0
      this.playHistory = []
    },

    /**
     * 设置播放进度
     */
    setCurrentTime(time: number) {
      this.currentTime = time
    },

    /**
     * 设置总时长
     */
    setDuration(duration: number) {
      this.duration = duration
    },

    /**
     * 设置音量
     */
    setVolume(volume: number) {
      this.volume = Math.max(0, Math.min(1, volume))
      if (this.volume > 0) {
        this.isMuted = false
      }
    },

    /**
     * 切换静音
     */
    toggleMute() {
      this.isMuted = !this.isMuted
    },

    /**
     * 音量增大（蓝牙耳机/媒体键控制）
     */
    volumeUp(step = 0.05) {
      this.setVolume(Math.min(1, this.volume + step))
    },

    /**
     * 音量减小（蓝牙耳机/媒体键控制）
     */
    volumeDown(step = 0.05) {
      this.setVolume(Math.max(0, this.volume - step))
    },

    /**
     * 切换播放模式
     */
    togglePlayMode() {
      const modes: PlayMode[] = ['sequence', 'loop', 'single', 'random']
      const currentIndex = modes.indexOf(this.playMode)
      this.playMode = modes[(currentIndex + 1) % modes.length]
    },

    /**
     * 设置播放模式
     */
    setPlayMode(mode: PlayMode) {
      this.playMode = mode
    },

    /**
     * 切换歌词显示
     */
    toggleLyrics() {
      // 打开歌词时关闭队列
      if (!this.showLyrics) {
        this.showQueue = false
      }
      this.showLyrics = !this.showLyrics
    },

    /**
     * 切换播放队列侧边栏显示
     */
    toggleQueue() {
      // 打开队列时关闭歌词
      if (!this.showQueue) {
        this.showLyrics = false
      }
      this.showQueue = !this.showQueue
    },

    /**
     * 更新歌曲的收藏状态
     */
    updateSongFavorite(musicId: number, isFavorite: boolean) {
      // 1. 更新当前歌曲
      if (this.currentSong && this.currentSong.id === musicId) {
        this.currentSong = {
          ...this.currentSong,
          is_favorite: isFavorite ? 1 : 0
        }
      }

      // 2. 更新队列中的歌曲
      const index = this.queue.findIndex(s => s.id === musicId)
      if (index !== -1) {
        // 创建新对象以触发响应式更新
        const newSong = { ...this.queue[index], is_favorite: isFavorite ? 1 : 0 }
        this.queue.splice(index, 1, newSong)
      }
    },

    /**
     * 更新当前歌曲的收藏状态 (Deprecated: use updateSongFavorite instead)
     */
    updateCurrentSongFavorite(isFavorite: boolean) {
      if (this.currentSong) {
        this.updateSongFavorite(this.currentSong.id, isFavorite)
      }
    },

    /**
     * 记录播放并刷新最近播放列表（内部辅助方法）
     */
    _recordPlay(musicId: number) {
      window.electron?.music?.incrementPlayCount(musicId).then(() => {
        // 延迟导入避免循环依赖
        import('./library.store').then(({ useLibraryStore }) => {
          const libraryStore = useLibraryStore()
          libraryStore.refreshRecentlyPlayed()
        })
      })
    },

    /**
     * 保存播放状态
     */
    savePlaybackStatus() {
      // 限制保存的队列长度，防止 localStorage 溢出
      const queueToSave = this.queue.length > 1000 ? this.queue.slice(0, 1000) : this.queue

      const status = {
        queue: queueToSave,
        currentIndex: this.currentIndex,
        currentTime: this.currentTime,
        playMode: this.playMode,
        volume: this.volume,
        isMuted: this.isMuted
      }
      try {
        localStorage.setItem('player_status', JSON.stringify(status))
        console.log('[Player] Saved playback status:', {
          queueLength: queueToSave.length,
          currentIndex: this.currentIndex,
          currentTime: this.currentTime,
          playMode: this.playMode,
          volume: this.volume,
          isMuted: this.isMuted
        })
      } catch (e) {
        console.error('[Player] Failed to save playback status', e)
      }
    },

    /**
     * 恢复播放状态
     */
    async restorePlaybackStatus() {
      const statusStr = localStorage.getItem('player_status')
      console.log('[Player] Attempting to restore playback status, found:', !!statusStr)

      // 获取 libraryStore 来访问最近播放
      const { useLibraryStore } = await import('./library.store')
      const libraryStore = useLibraryStore()

      if (!statusStr) {
        // 没有保存的状态，尝试使用最近播放的第一首歌
        if (libraryStore.recentlyPlayed.length > 0) {
          const recentSong = libraryStore.recentlyPlayed[0]
          this.currentSong = recentSong
          this.queue = [recentSong]
          this.currentIndex = 0
          this.currentTime = 0
          console.log('[Player] No saved status, using most recent song:', recentSong.title)
        }
        return
      }

      try {
        const status = JSON.parse(statusStr)
        console.log('[Player] Parsed status:', {
          queueLength: status.queue?.length,
          currentIndex: status.currentIndex,
          currentTime: status.currentTime,
          playMode: status.playMode,
          volume: status.volume,
          isMuted: status.isMuted
        })

        if (status.playMode) {
          this.playMode = status.playMode
        }

        // 恢复音量设置
        if (typeof status.volume === 'number') {
          this.volume = status.volume
        }
        if (typeof status.isMuted === 'boolean') {
          this.isMuted = status.isMuted
        }

        if (status.queue && Array.isArray(status.queue) && status.queue.length > 0) {
          // 使用 file_path 匹配歌曲，比 ID 更可靠（ID 可能在重置数据库后改变）
          // 同时使用库中的最新数据替换保存的数据（确保元数据最新）
          const libraryMap = new Map<string, Music>()
          for (const song of libraryStore.allMusic) {
            libraryMap.set(song.file_path, song)
          }

          const queue = status.queue as Music[]
          const validQueue: Music[] = []

          for (const savedSong of queue) {
            const librarySong = libraryMap.get(savedSong.file_path)
            if (librarySong) {
              validQueue.push(librarySong)
            }
          }

          if (validQueue.length > 0) {
            this.queue = validQueue

            // 尝试恢复当前播放位置
            let newIndex = 0
            const savedCurrentSong = queue[status.currentIndex]

            // 如果原来的当前歌曲还在有效队列中
            if (savedCurrentSong) {
              // 通过路径查找新位置
              const foundIndex = validQueue.findIndex(s => s.file_path === savedCurrentSong.file_path)

              if (foundIndex !== -1) {
                newIndex = foundIndex
                this.currentSong = validQueue[newIndex]

                // 恢复进度
                if (typeof status.currentTime === 'number') {
                  this.currentTime = status.currentTime
                }
              } else {
                // 原来的歌曲不在了，重置为第一首
                this.currentSong = validQueue[0]
                this.currentTime = 0
                console.log('[Player] Saved current song no longer exists in library, resetting to start')
              }
            } else {
              // 索引无效，重置
              this.currentSong = validQueue[0]
              this.currentTime = 0
            }

            this.currentIndex = newIndex

            console.log('[Player] Restored playback status successfully:', {
              currentSong: this.currentSong?.title,
              currentTime: this.currentTime,
              queueLength: this.queue.length
            })
            return
          } else {
            console.log('[Player] No valid songs found in saved queue (matched by path)')
          }
        }

        // 保存的状态无效，回退到最近播放
        if (libraryStore.recentlyPlayed.length > 0) {
          const recentSong = libraryStore.recentlyPlayed[0]
          this.currentSong = recentSong
          this.queue = [recentSong]
          this.currentIndex = 0
          this.currentTime = 0
          console.log('[Player] Falling back to most recent song:', recentSong.title)
        }
      } catch (e) {
        console.error('[Player] Failed to restore playback status', e)

        // 出错时也尝试使用最近播放
        if (libraryStore.recentlyPlayed.length > 0) {
          const recentSong = libraryStore.recentlyPlayed[0]
          this.currentSong = recentSong
          this.queue = [recentSong]
          this.currentIndex = 0
          this.currentTime = 0
        }
      }
    },

    /**
     * 进入低内存模式
     * 保留播放队列以支持上一曲/下一曲功能
     * 只设置标志位，不清空核心播放数据
     */
    enterLowMemoryMode() {
      if (this.isLowMemoryMode) return

      console.log('[Player] Entering low memory mode...')
      console.log(`[Player] Queue preserved: ${this.queue.length} songs, history: ${this.playHistory.length}`)

      // 不再备份和清空队列 - 队列是核心播放功能，必须保持完整
      // 以支持托盘模式下的上一曲/下一曲功能
      this.isLowMemoryMode = true
      console.log('[Player] Low memory mode enabled - queue preserved for tray controls')
    },

    /**
     * 退出低内存模式
     * 由于队列未被清空，无需恢复
     */
    exitLowMemoryMode() {
      if (!this.isLowMemoryMode) return

      console.log('[Player] Exiting low memory mode...')
      console.log(`[Player] Queue status: ${this.queue.length} songs`)

      // 队列从未被清空，无需恢复
      this.isLowMemoryMode = false
      console.log('[Player] Low memory mode disabled')
    }
  }
})
