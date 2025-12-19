/**
 * 日志工具
 * 简单的控制台日志封装
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_COLORS = {
  debug: '\x1b[36m',  // 青色
  info: '\x1b[32m',   // 绿色
  warn: '\x1b[33m',   // 黄色
  error: '\x1b[31m',  // 红色
  reset: '\x1b[0m'    // 重置
}

/**
 * 格式化日志消息
 */
function formatMessage(level: LogLevel, tag: string, message: string): string {
  const timestamp = new Date().toLocaleTimeString('zh-CN')
  const color = LOG_COLORS[level]
  const reset = LOG_COLORS.reset
  return `${color}[${timestamp}] [${level.toUpperCase()}] [${tag}]${reset} ${message}`
}

/**
 * 日志记录器
 */
export function createLogger(tag: string) {
  return {
    debug: (message: string, ...args: unknown[]) => {
      console.log(formatMessage('debug', tag, message), ...args)
    },
    
    info: (message: string, ...args: unknown[]) => {
      console.log(formatMessage('info', tag, message), ...args)
    },
    
    warn: (message: string, ...args: unknown[]) => {
      console.warn(formatMessage('warn', tag, message), ...args)
    },
    
    error: (message: string, ...args: unknown[]) => {
      console.error(formatMessage('error', tag, message), ...args)
    }
  }
}

// 默认日志器
export const logger = createLogger('主进程')

export default logger
