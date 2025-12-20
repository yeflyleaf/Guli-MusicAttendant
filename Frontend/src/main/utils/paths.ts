/**
 * 路径工具
 * 获取各种系统路径
 */
import { app } from 'electron'
import os from 'os'
import path from 'path'

/**
 * 获取用户数据目录
 */
export function getUserDataPath(): string {
  return app.getPath('userData')
}

/**
 * 获取用户音乐目录
 */
export function getMusicPath(): string {
  return app.getPath('music')
}

/**
 * 获取用户桌面目录
 */
export function getDesktopPath(): string {
  return app.getPath('desktop')
}

/**
 * 获取用户家目录
 */
export function getHomePath(): string {
  return os.homedir()
}

/**
 * 获取应用目录
 */
export function getAppPath(): string {
  return app.getAppPath()
}

/**
 * 获取资源目录
 */
export function getResourcesPath(): string {
  return process.resourcesPath
}

/**
 * 获取数据库文件路径
 */
export function getDatabasePath(): string {
  if (isDev()) {
    return path.join(getAppPath(), 'data', 'music.db')
  }
  return path.join(getUserDataPath(), 'data', 'music.db')
}

/**
 * 获取封面缓存目录
 */
export function getCoverCachePath(): string {
  if (isDev()) {
    return path.join(getAppPath(), 'data', 'covers')
  }
  return path.join(getUserDataPath(), 'covers')
}

/**
 * 获取日志目录
 */
export function getLogPath(): string {
  return path.join(getUserDataPath(), 'logs')
}

/**
 * 判断是否为开发环境
 */
export function isDev(): boolean {
  return !app.isPackaged
}
