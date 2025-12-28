/**
 * API Runner Preload Script
 * 第三方源脚本运行环境
 * 提供网络请求和加密能力
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

type ScriptRequestCallback = (
  error: Error | null,
  response?: { statusCode: number; body: unknown; headers: Record<string, string> },
  body?: string
) => void

// ==================== 网络请求封装 ====================

/**
 * Promise 格式 HTTP 请求
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
      res.on('data', (chunk) => { body += chunk.toString() })
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
    req.setTimeout(options.timeout || 30000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (options.body) {
      const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
      req.write(bodyStr)
    }
    req.end()
  })
}

/**
 * 回调格式 HTTP 请求（兼容第三方脚本）
 */
function callbackRequest(
  url: string,
  options: { method?: string; headers?: Record<string, string>; timeout?: number } = {},
  callback: ScriptRequestCallback
): void {
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
    const chunks: Buffer[] = []
    res.on('data', (chunk) => { chunks.push(chunk) })
    res.on('end', () => {
      const body = Buffer.concat(chunks).toString()
      let parsedBody: unknown = body
      try { parsedBody = JSON.parse(body) } catch { /* keep string */ }
      callback(null, {
        statusCode: res.statusCode || 0,
        body: parsedBody,
        headers: res.headers as Record<string, string>
      }, body)
    })
  })

  req.on('error', (err) => callback(err))
  req.setTimeout(options.timeout || 30000, () => {
    req.destroy()
    callback(new Error('Request timeout'))
  })
  req.end()
}

// ==================== 加密工具 ====================

const cryptoUtils = {
  md5(data: string | Buffer, digest: BufferEncoding = 'hex'): string {
    const input = typeof data === 'string' ? data : data.toString()
    return crypto.createHash('md5').update(input).digest(digest)
  },

  sha1(data: string): string {
    return crypto.createHash('sha1').update(data).digest('hex')
  },

  sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  },

  aesEncrypt(data: string, key: string, iv: string): string {
    const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv))
    let encrypted = cipher.update(data, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    return encrypted
  },

  aesDecrypt(data: string, key: string, iv: string): string {
    const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv))
    let decrypted = decipher.update(data, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  },

  rsaEncrypt(data: string, publicKey: string): string {
    const buffer = Buffer.from(data)
    const encrypted = crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      buffer
    )
    return encrypted.toString('base64')
  },

  base64Encode(data: string): string {
    return Buffer.from(data).toString('base64')
  },

  base64Decode(data: string): string {
    return Buffer.from(data, 'base64').toString('utf8')
  },

  randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  bufToString(buffer: Buffer, encoding: BufferEncoding = 'hex'): string {
    return buffer.toString(encoding)
  }
}

// Buffer 工具
const bufferUtils = {
  from: (data: string | ArrayBuffer | unknown[], encoding?: BufferEncoding) => {
    if (typeof data === 'string') return Buffer.from(data, encoding)
    if (data instanceof ArrayBuffer) return Buffer.from(data)
    return Buffer.from(data as number[])
  },
  alloc: (size: number) => Buffer.alloc(size),
  concat: (buffers: Buffer[]) => Buffer.concat(buffers),
  bufToString: (buffer: Buffer, encoding: BufferEncoding = 'utf8') => buffer.toString(encoding)
}

// ==================== IPC 通信 ====================

function send(channel: string, data: unknown): void {
  ipcRenderer.send(channel, data)
}

function on(channel: string, callback: (...args: unknown[]) => void): void {
  ipcRenderer.on(channel, (_event, ...args) => callback(...args))
}

async function invoke(channel: string, ...args: unknown[]): Promise<unknown> {
  return ipcRenderer.invoke(channel, ...args)
}

// ==================== 事件系统 ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventHandlers: Map<string, Array<(data: any) => void | Promise<any>>> = new Map()

const EVENT_NAMES = {
  inited: 'inited',
  request: 'request',
  updateAlert: 'updateAlert'
}

// ==================== 暴露 API ====================

// 原生 API
const guliApi = {
  request,
  crypto: cryptoUtils,
  buffer: bufferUtils,
  send,
  on,
  invoke,
  version: '1.0.0',
  log: console.log,
  warn: console.warn,
  error: console.error
}

// 第三方脚本兼容 API
const scriptApi = {
  EVENT_NAMES,

  request: callbackRequest,

  on: (eventName: string, handler: (data: unknown) => void | Promise<unknown>) => {
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, [])
    }
    eventHandlers.get(eventName)!.push(handler)
  },

  send: (eventName: string, data: unknown) => {
    ipcRenderer.send('script:event', { eventName, data })
  },

  env: 'desktop',
  version: '2.8.0',

  currentScriptInfo: {
    version: '1',
    rawScript: '',
    name: ''
  },

  utils: {
    crypto: {
      md5: cryptoUtils.md5,
      bufToString: cryptoUtils.bufToString
    },
    buffer: bufferUtils
  }
}

// 暴露到全局
contextBridge.exposeInMainWorld('guli_api', guliApi)

// 使用中性名称暴露第三方脚本 API
// 注意：第三方脚本可能使用特定的全局变量名
const scriptApiNames = ['lx', 'musicApi', 'sourceApi']
scriptApiNames.forEach(name => {
  try {
    contextBridge.exposeInMainWorld(name, scriptApi)
  } catch {
    // 忽略重复暴露错误
  }
})

// 监听来自主进程的事件触发
ipcRenderer.on('script:triggerEvent', (_event, { eventName, data }) => {
  const handlers = eventHandlers.get(eventName)
  if (handlers) {
    handlers.forEach(handler => {
      try {
        const result = handler(data)
        if (result instanceof Promise) {
          result.then(res => {
            ipcRenderer.send('script:eventResult', { eventName, result: res })
          }).catch(err => {
            console.error('[ScriptAPI] Handler error:', err)
          })
        }
      } catch (err) {
        console.error('[ScriptAPI] Handler error:', err)
      }
    })
  }
})

// 导出类型
export type GuliApi = typeof guliApi
export type ScriptApi = typeof scriptApi
