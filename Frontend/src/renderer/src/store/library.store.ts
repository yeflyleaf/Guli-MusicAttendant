/**
 * 音乐库状态管理
 * 缓存音乐数据，减少频繁请求主进程
 */
import type { Music, MusicQueryParams } from '@/types/music'
import type { Playlist } from '@/types/playlist'
import { defineStore } from 'pinia'

interface LibraryState {
  // 所有歌曲
  allMusic: Music[]
  // 歌单列表
  playlists: Playlist[]
  // 收藏歌曲
  favorites: Music[]
  // 最近播放
  recentlyPlayed: Music[]
  // 是否已加载
  isLoaded: boolean
  // 加载中状态
  isLoading: boolean
  // 搜索关键词
  searchKeyword: string
  // 筛选后的歌曲
  filteredMusic: Music[]
}

export const useLibraryStore = defineStore('library', {
  state: (): LibraryState => ({
    allMusic: [],
    playlists: [],
    favorites: [],
    recentlyPlayed: [],
    isLoaded: false,
    isLoading: false,
    searchKeyword: '',
    filteredMusic: []
  }),

  getters: {
    // 歌曲总数
    musicCount: (state): number => state.allMusic.length,

    // 歌单总数
    playlistCount: (state): number => state.playlists.length,

    // 收藏数量
    favoriteCount: (state): number => state.favorites.length,

    // 显示的歌曲列表（搜索筛选后）
    displayMusic: (state): Music[] => {
      if (!state.searchKeyword.trim()) {
        return state.allMusic
      }
      return state.filteredMusic
    }
  },

  actions: {
    /**
     * 初始化加载所有数据
     */
    async loadAll() {
      if (this.isLoading) return

      this.isLoading = true
      console.time('[Library] loadAll')

      try {
        // 并行加载所有数据
        console.time('[Library] IPC calls')
        const [allMusic, playlists, favorites, recentlyPlayed] = await Promise.all([
          window.electron.music.getAll(),
          window.electron.playlist.getAll(),
          window.electron.music.getFavorites(),
          window.electron.music.getRecentlyPlayed(50)
        ])
        console.timeEnd('[Library] IPC calls')

        this.allMusic = allMusic
        this.playlists = playlists
        this.favorites = favorites
        this.recentlyPlayed = recentlyPlayed
        this.isLoaded = true

        console.log(`[Library] Loaded ${allMusic.length} songs`)

      } catch (error) {
        console.error('[Library] 加载数据失败:', error)
      } finally {
        this.isLoading = false
        console.timeEnd('[Library] loadAll')
      }
    },

    /**
     * 刷新歌曲列表
     */
    async refreshMusic() {
      try {
        this.allMusic = await window.electron.music.getAll()
        this.favorites = await window.electron.music.getFavorites()
      } catch (error) {
        console.error('[Library] 刷新歌曲失败:', error)
      }
    },

    /**
     * 刷新歌单列表
     */
    async refreshPlaylists() {
      try {
        this.playlists = await window.electron.playlist.getAll()
      } catch (error) {
        console.error('[Library] 刷新歌单失败:', error)
      }
    },

    /**
     * 刷新最近播放
     */
    async refreshRecentlyPlayed() {
      try {
        this.recentlyPlayed = await window.electron.music.getRecentlyPlayed(50)
      } catch (error) {
        console.error('[Library] 刷新最近播放失败:', error)
      }
    },

    /**
     * 搜索歌曲
     */
    async search(keyword: string) {
      this.searchKeyword = keyword

      if (!keyword.trim()) {
        this.filteredMusic = []
        return
      }

      try {
        const params: MusicQueryParams = { keyword }
        this.filteredMusic = await window.electron.music.getAll(params)
      } catch (error) {
        console.error('[Library] 搜索失败:', error)
        this.filteredMusic = []
      }
    },

    /**
     * 清除搜索
     */
    clearSearch() {
      this.searchKeyword = ''
      this.filteredMusic = []
    },

    /**
     * 切换收藏
     */
    async toggleFavorite(musicId: number) {
      try {
        await window.electron.music.toggleFavorite(musicId)

        // 更新本地状态
        const music = this.allMusic.find(m => m.id === musicId)
        if (music) {
          music.is_favorite = music.is_favorite === 1 ? 0 : 1

          // 更新收藏列表
          if (music.is_favorite === 1) {
            if (!this.favorites.find(m => m.id === musicId)) {
              this.favorites.unshift(music)
            }
          } else {
            this.favorites = this.favorites.filter(m => m.id !== musicId)
          }
        }

        // 同步更新播放器中的状态
        import('@/store/player.store').then(({ usePlayerStore }) => {
          const playerStore = usePlayerStore()
          const isFav = music?.is_favorite === 1
          playerStore.updateSongFavorite(musicId, isFav)
        })

        return true
      } catch (error) {
        console.error('[Library] 切换收藏失败:', error)
        return false
      }
    },

    /**
     * 删除歌曲
     */
    async deleteMusic(musicId: number) {
      try {
        await window.electron.music.delete(musicId)

        // 更新本地状态
        this.allMusic = this.allMusic.filter(m => m.id !== musicId)
        this.favorites = this.favorites.filter(m => m.id !== musicId)
        this.recentlyPlayed = this.recentlyPlayed.filter(m => m.id !== musicId)
        this.filteredMusic = this.filteredMusic.filter(m => m.id !== musicId)

        return true
      } catch (error) {
        console.error('[Library] 删除歌曲失败:', error)
        return false
      }
    },

    /**
     * 批量删除歌曲
     */
    async deleteMusicBatch(musicIds: number[]) {
      try {
        await window.electron.music.deleteBatch(musicIds)

        const idSet = new Set(musicIds)
        this.allMusic = this.allMusic.filter(m => !idSet.has(m.id))
        this.favorites = this.favorites.filter(m => !idSet.has(m.id))
        this.recentlyPlayed = this.recentlyPlayed.filter(m => !idSet.has(m.id))
        this.filteredMusic = this.filteredMusic.filter(m => !idSet.has(m.id))

        return true
      } catch (error) {
        console.error('[Library] 批量删除失败:', error)
        return false
      }
    },

    /**
     * 移除最近播放记录
     */
    async removeRecentlyPlayed(musicIds: number[]) {
      try {
        await window.electron.music.removeRecentlyPlayed(musicIds)

        const idSet = new Set(musicIds)
        this.recentlyPlayed = this.recentlyPlayed.filter(m => !idSet.has(m.id))

        return true
      } catch (error) {
        console.error('[Library] 移除最近播放失败:', error)
        return false
      }
    },

    /**
     * 清空最近播放记录
     */
    async clearRecentlyPlayed() {
      try {
        await window.electron.music.clearRecentlyPlayed()
        this.recentlyPlayed = []
        return true
      } catch (error) {
        console.error('[Library] 清空最近播放失败:', error)
        return false
      }
    },

    /**
     * 创建歌单
     */
    async createPlaylist(name: string, description?: string) {
      try {
        const id = await window.electron.playlist.create({ name, description })

        // 刷新歌单列表
        await this.refreshPlaylists()

        return id
      } catch (error) {
        console.error('[Library] 创建歌单失败:', error)
        return null
      }
    },

    /**
     * 删除歌单
     */
    async deletePlaylist(playlistId: number) {
      try {
        await window.electron.playlist.delete(playlistId)
        this.playlists = this.playlists.filter(p => p.id !== playlistId)
        return true
      } catch (error) {
        console.error('[Library] 删除歌单失败:', error)
        return false
      }
    },

    /**
     * 添加歌曲到歌单
     */
    async addToPlaylist(playlistId: number, musicId: number) {
      try {
        await window.electron.playlist.addMusic(playlistId, musicId)
        await this.refreshPlaylists()
        return true
      } catch (error) {
        console.error('[Library] 添加到歌单失败:', error)
        return false
      }
    }
  }
})
