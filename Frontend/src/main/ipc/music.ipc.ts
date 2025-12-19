/**
 * 歌曲相关 IPC 通信处理
 */
import { ipcMain } from 'electron'
import * as musicRepo from '../db/repositories/music.repo'
import type { MusicQueryParams } from '../types/music'

/**
 * 注册歌曲相关的 IPC 处理器
 */
export function setupMusicIpc(): void {
  // 获取所有歌曲（底层自动使用缓存）
  ipcMain.handle('music:getAll', (_event, params?: MusicQueryParams) => {
    return musicRepo.getAllMusic(params)
  })
  
  // 根据 ID 获取歌曲
  ipcMain.handle('music:getById', (_event, id: number) => {
    return musicRepo.getMusicById(id)
  })
  
  // 根据文件路径获取歌曲
  ipcMain.handle('music:getByPath', (_event, filePath: string) => {
    return musicRepo.getMusicByPath(filePath)
  })
  
  // 删除歌曲
  ipcMain.handle('music:delete', (_event, id: number) => {
    return musicRepo.deleteMusic(id)
  })
  
  // 批量删除歌曲
  ipcMain.handle('music:deleteBatch', (_event, ids: number[]) => {
    return musicRepo.deleteMusicBatch(ids)
  })
  
  // 切换收藏状态
  ipcMain.handle('music:toggleFavorite', (_event, id: number) => {
    return musicRepo.toggleFavorite(id)
  })
  
  // 增加播放次数
  ipcMain.handle('music:incrementPlayCount', (_event, id: number) => {
    return musicRepo.incrementPlayCount(id)
  })
  
  // 获取歌曲总数
  ipcMain.handle('music:getCount', () => {
    return musicRepo.getMusicCount()
  })
  
  // 获取收藏歌曲
  ipcMain.handle('music:getFavorites', () => {
    return musicRepo.getFavoriteMusic()
  })
  
  // 获取最近播放
  ipcMain.handle('music:getRecentlyPlayed', (_event, limit?: number) => {
    return musicRepo.getRecentlyPlayed(limit)
  })
  
  // 获取最常播放
  ipcMain.handle('music:getMostPlayed', (_event, limit?: number) => {
    return musicRepo.getMostPlayed(limit)
  })
  
  // 更新歌曲信息
  ipcMain.handle('music:update', (_event, id: number, data: Partial<{
    title: string
    artist: string
    album: string
    coverPath: string
    lyricsPath: string
  }>) => {
    return musicRepo.updateMusic(id, data)
  })
  
  console.log('[IPC] Music handler registered')
}
