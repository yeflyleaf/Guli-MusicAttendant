/**
 * 歌单相关 IPC 通信处理
 */
import { ipcMain } from 'electron'
import * as playlistRepo from '../db/repositories/playlist.repo'
import type { PlaylistCreateDTO } from '../types/playlist'

/**
 * 注册歌单相关的 IPC 处理器
 */
export function setupPlaylistIpc(): void {
  // 获取所有歌单（包含第一首歌封面）
  ipcMain.handle('playlist:getAll', () => {
    return playlistRepo.getAllPlaylistsWithCovers()
  })

  // 根据 ID 获取歌单
  ipcMain.handle('playlist:getById', (_event, id: number) => {
    return playlistRepo.getPlaylistById(id)
  })

  // 创建歌单
  ipcMain.handle('playlist:create', (_event, data: PlaylistCreateDTO) => {
    return playlistRepo.createPlaylist(data)
  })

  // 更新歌单
  ipcMain.handle('playlist:update', (_event, id: number, data: Partial<PlaylistCreateDTO>) => {
    return playlistRepo.updatePlaylist(id, data)
  })

  // 删除歌单
  ipcMain.handle('playlist:delete', (_event, id: number) => {
    return playlistRepo.deletePlaylist(id)
  })

  // 获取歌单中的歌曲
  ipcMain.handle('playlist:getMusic', (_event, playlistId: number) => {
    return playlistRepo.getPlaylistMusic(playlistId)
  })

  // 添加歌曲到歌单
  ipcMain.handle('playlist:addMusic', (_event, playlistId: number, musicId: number) => {
    return playlistRepo.addMusicToPlaylist(playlistId, musicId)
  })

  // 批量添加歌曲到歌单
  ipcMain.handle('playlist:addMusicBatch', (_event, playlistId: number, musicIds: number[]) => {
    return playlistRepo.addMusicBatchToPlaylist(playlistId, musicIds)
  })

  // 从歌单移除歌曲
  ipcMain.handle('playlist:removeMusic', (_event, playlistId: number, musicId: number) => {
    return playlistRepo.removeMusicFromPlaylist(playlistId, musicId)
  })

  // 清空歌单
  ipcMain.handle('playlist:clear', (_event, playlistId: number) => {
    return playlistRepo.clearPlaylist(playlistId)
  })

  // 更新歌单顺序
  ipcMain.handle('playlist:updateOrder', (_event, playlistId: number, musicIds: number[]) => {
    return playlistRepo.updatePlaylistOrder(playlistId, musicIds)
  })

  // 检查歌曲是否在歌单中
  ipcMain.handle('playlist:hasMusic', (_event, playlistId: number, musicId: number) => {
    return playlistRepo.isMusicInPlaylist(playlistId, musicId)
  })

  console.log('[IPC] Playlist handler registered')
}
