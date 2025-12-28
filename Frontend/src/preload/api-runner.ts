/**
 * API Runner Preload Script
 * 这是第三方源脚本的运行环境
 * 为源脚本提供网络请求和加密能力
 */
import crypto from 'crypto'
import { contextBridge, ipcRenderer } from 'electron'
import http from 'http'
import https from 'https'

// ==================== 类型定义 ====================

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string | Record<string, unknown>
  timeout?: number
}

interface HttpResponse {
  status: number
  statusText: string
  headers: Record<string, string | string[] | undefined>
  body: string
}

// ==================== 网络请求封装 ====================

/**
 * 发送 HTTP/HTTPS 请求
 * 绕过 CORS 限制，支持自定义 Headers
 */
async function request(url: string, options: RequestOptions = {}): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const protocol = urlObj.protocol === 'https:' ? https : http

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      }
    }

    const req = protocol.request(reqOptions, (res) => {
      let body = ''

      res.on('data', (chunk) => {
        body += chunk.toString()
      })

      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          statusText: res.statusMessage || '',
          headers: res.headers as Record<string, string | string[] | undefined>,
          body
        })
      })
    })

    req.on('error', reject)

    // 设置超时
    req.setTimeout(options.timeout || 30000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    // 发送请求体
    if (options.body) {
      const bodyStr = typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)
      req.write(bodyStr)
    }

    req.end()
  })
}

// ==================== 加密工具 ====================

const cryptoUtils = {
  /**
   * MD5 哈希
   */
  md5(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex')
  },

  /**
   * SHA1 哈希
   */
  sha1(data: string): string {
    return crypto.createHash('sha1').update(data).digest('hex')
  },

  /**
   * SHA256 哈希
   */
  sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  },

  /**
   * AES-128-CBC 加密
   */
  aesEncrypt(data: string, key: string, iv: string): string {
    const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv))
    let encrypted = cipher.update(data, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    return encrypted
  },

  /**
   * AES-128-CBC 解密
   */
  aesDecrypt(data: string, key: string, iv: string): string {
    const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv))
    let decrypted = decipher.update(data, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  },

  /**
   * RSA 公钥加密
   */
  rsaEncrypt(data: string, publicKey: string): string {
    const buffer = Buffer.from(data)
    const encrypted = crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      buffer
    )
    return encrypted.toString('base64')
  },

  /**
   * Base64 编码
   */
  base64Encode(data: string): string {
    return Buffer.from(data).toString('base64')
  },

  /**
   * Base64 解码
   */
  base64Decode(data: string): string {
    return Buffer.from(data, 'base64').toString('utf8')
  },

  /**
   * 生成随机字符串
   */
  randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

// ==================== IPC 通信 ====================

/**
 * 发送消息到主进程
 */
function send(channel: string, data: unknown): void {
  ipcRenderer.send(channel, data)
}

/**
 * 监听主进程消息
 */
function on(channel: string, callback: (...args: unknown[]) => void): void {
  ipcRenderer.on(channel, (_event, ...args) => callback(...args))
}

/**
 * 调用主进程方法
 */
async function invoke(channel: string, ...args: unknown[]): Promise<unknown> {
  return ipcRenderer.invoke(channel, ...args)
}

// ==================== 暴露 API ====================

/**
 * 暴露给源脚本的 API
 * 源脚本可通过 window.guli_api 访问这些方法
 */
const guliApi = {
  // 网络请求
  request,

  // 加密工具
  crypto: cryptoUtils,

  // IPC 通信
  send,
  on,
  invoke,

  // 版本信息
  version: '1.0.0',

  // 调试日志
  log: console.log,
  warn: console.warn,
  error: console.error
}

// 暴露到全局
contextBridge.exposeInMainWorld('guli_api', guliApi)

// 导出类型
export type GuliApi = typeof guliApi

