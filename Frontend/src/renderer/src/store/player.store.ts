/**
 * 播放器状态管理
 * 管理当前播放状态、播放队列、音量等
 */
import type { Music } from '@/types/music'
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
    showQueue: false
  }),

  getters: {
    // 播放进度百分比
    progress: (state): number => {
      if (state.duration === 0) return 0
      return (state.currentTime / state.duration) * 100
    },

    // 是否有上一首
    hasPrevious: (state): boolean => {
      if (state.playMode === 'random') {
        return state.playHistory.length > 0
      }
      return state.currentIndex > 0
    },

    // 是否有下一首
    hasNext: (state): boolean => {
      if (state.playMode === 'loop' || state.playMode === 'random') {
        return state.queue.length > 0
      }
      return state.currentIndex < state.queue.length - 1
    },

    // 队列中的歌曲数量
    queueLength: (state): number => state.queue.length,

    // 当前歌曲是否收藏
    isFavorite: (state): boolean => {
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
      // 验证歌曲路径是否在音乐文件夹中
      if (!skipValidation && window.electron?.dialog?.validateMusicPath) {
        try {
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
     * 更新当前歌曲的收藏状态
     */
    updateCurrentSongFavorite(isFavorite: boolean) {
      if (this.currentSong) {
        this.currentSong = {
          ...this.currentSong,
          is_favorite: isFavorite ? 1 : 0
        }

        // 同步更新队列中的歌曲
        const index = this.queue.findIndex(s => s.id === this.currentSong?.id)
        if (index !== -1) {
          this.queue[index] = { ...this.queue[index], is_favorite: isFavorite ? 1 : 0 }
        }
      }
    },

    /**
     * 记录播放并刷新最近播放列表（内部辅助方法）
     */
    _recordPlay(musicId: number) {
      window.electron?.music?.incrementPlayCount(musicId).then(() => {
        // 延迟导入避免循环依赖
        import('@/store/library.store').then(({ useLibraryStore }) => {
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
        playMode: this.playMode
      }
      try {
        localStorage.setItem('player_status', JSON.stringify(status))
        console.log('[Player] Saved playback status:', {
          queueLength: queueToSave.length,
          currentIndex: this.currentIndex,
          currentTime: this.currentTime,
          playMode: this.playMode
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
      const { useLibraryStore } = await import('@/store/library.store')
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
          playMode: status.playMode
        })

        if (status.playMode) {
          this.playMode = status.playMode
        }

        if (status.queue && Array.isArray(status.queue) && status.queue.length > 0) {
          // 验证当前歌曲是否仍然存在于音乐库中
          const currentSongFromQueue = status.queue[status.currentIndex]
          if (currentSongFromQueue) {
            // 检查这首歌是否还在音乐库中（通过 ID 查找）
            const songExists = libraryStore.allMusic.some(m => m.id === currentSongFromQueue.id)

            if (songExists) {
              this.queue = status.queue
              this.currentIndex = status.currentIndex
              this.currentSong = currentSongFromQueue

              // 恢复进度
              if (typeof status.currentTime === 'number') {
                this.currentTime = status.currentTime
              }

              console.log('[Player] Restored playback status successfully:', {
                currentSong: this.currentSong?.title,
                currentTime: this.currentTime
              })
              return
            } else {
              console.log('[Player] Saved song no longer exists in library')
            }
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
    }
  }
})
