import { contextBridge, ipcRenderer } from 'electron'

console.log('[Preload] API Runner starting...')

let axios: any
let crypto: any
let iconv: any
let BufferPolyfill: any

try {
  // 使用 require 动态加载，避免 import 静态分析导致的加载失败
  // 注意：这需要 sandbox: false
  axios = require('axios')
  crypto = require('crypto')
  iconv = require('iconv-lite')
  // 尝试加载 buffer 模块，如果失败则尝试使用全局 Buffer
  try {
    BufferPolyfill = require('buffer').Buffer
  } catch (e) {
    console.warn('[Preload] Failed to require buffer module, trying global Buffer')
    BufferPolyfill = Buffer
  }

  console.log('[Preload] Modules loaded successfully')
} catch (e: any) {
  console.error('[Preload] Failed to load modules:', e)
  ipcRenderer.send('source-runner-log', { type: 'error', args: ['Module Load Failed', e.message] })
}

try {
  // 1. 模拟 Buffer
  if (!BufferPolyfill) {
      console.warn('[Preload] Buffer not found, using global Buffer')
      BufferPolyfill = Buffer
  }

  // 存储外部脚本注册的事件处理器
  const scriptEventHandlers: Map<string, Function> = new Map()

  // LX Music 事件名称常量
  const EVENT_NAMES = {
    request: 'request',
    inited: 'inited',
    updateAlert: 'updateAlert'
  }

  // 2. 构建 LX 核心对象 (API 仿真)
  const lxHandler = {
    version: '2.0.0',
    env: 'desktop',

    // 事件名称常量（LX 脚本需要这个）
    EVENT_NAMES: EVENT_NAMES,

    // 当前脚本信息（外部脚本会读取这个）
    currentScriptInfo: {
      version: '1',
      name: 'Unknown'
    },

    // --- 网络请求核心 (模拟 lx.request) ---
    // 支持两种调用方式：
    //   1. Promise: const res = await lx.request(url, options)
    //   2. Callback: lx.request(url, options, (err, res, body) => {})
    request: (url: string, options: any = {}, callback?: Function) => {
      // 如果 options 是回调函数（有时脚本会省略 options）
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      const { method = 'get', headers = {}, body, binary = false, form, timeout = 30000 } = options

      console.log(`[Request] ${method.toUpperCase()} ${url}`)

      // 执行 HTTP 请求
      const requestPromise = axios({
        url,
        method,
        headers,
        data: form || body,
        // 重要：使用 'json' 来自动解析 JSON，如果是二进制则用 'arraybuffer'
        responseType: binary ? 'arraybuffer' : 'json',
        timeout,
        validateStatus: () => true
      }).then((response: any) => {
        console.log(`[Request] Response ${response.status} from ${url}`)

        // 构造响应对象
        const resObj = {
          statusCode: response.status,
          body: response.data,
          headers: response.headers,
          // 兼容一些脚本使用 rawBody
          rawBody: response.data
        }

        // 关键：如果有回调，必须执行回调
        if (callback) {
          // 回调参数：(error, response, body)
          callback(null, resObj, response.data)
        }

        return resObj
      }).catch((err: any) => {
        console.error(`[Request] Error for ${url}:`, err.message)

        const errObj = {
          statusCode: err.response?.status || 0,
          body: err.message || 'Network Error',
          headers: err.response?.headers || {},
          error: err.message
        }

        // 如果有回调，传递错误
        if (callback) {
          callback(err, errObj, null)
        }

        // 同时返回 Promise（便于 await 调用方式）
        return errObj
      })

      return requestPromise
    },

    // --- 加密工具箱 (模拟 lx.utils) ---
    utils: {
      buffer: {
        from: (...args: any[]) => BufferPolyfill.from.apply(BufferPolyfill, args),
        concat: (list: any[]) => BufferPolyfill.concat(list),
        alloc: (size: number) => BufferPolyfill.alloc(size),
        allocUnsafe: (size: number) => BufferPolyfill.allocUnsafe(size),
        isBuffer: (obj: any) => BufferPolyfill.isBuffer(obj)
      },
      crypto: {
        // MD5 哈希
        md5: (str: string) => crypto.createHash('md5').update(str).digest('hex'),

        // AES 加密 - 支持多种模式
        aesEncrypt: (buffer: any, mode: string, key: any, iv: any) => {
          const modeStr = `aes-128-${mode.toLowerCase()}`
          // ECB 模式不需要 IV
          if (mode.toLowerCase() === 'ecb') {
            const cipher = crypto.createCipheriv(modeStr, key, null)
            return BufferPolyfill.concat([cipher.update(buffer), cipher.final()])
          }
          const cipher = crypto.createCipheriv(modeStr, key, iv)
          return BufferPolyfill.concat([cipher.update(buffer), cipher.final()])
        },

        // AES 解密
        aesDecrypt: (buffer: any, mode: string, key: any, iv: any) => {
          const modeStr = `aes-128-${mode.toLowerCase()}`
          if (mode.toLowerCase() === 'ecb') {
            const decipher = crypto.createDecipheriv(modeStr, key, null)
            return BufferPolyfill.concat([decipher.update(buffer), decipher.final()])
          }
          const decipher = crypto.createDecipheriv(modeStr, key, iv)
          return BufferPolyfill.concat([decipher.update(buffer), decipher.final()])
        },

        // RSA 加密
        rsaEncrypt: (buffer: any, key: string, padding?: string) => {
          let paddingType = crypto.constants.RSA_PKCS1_PADDING
          if (padding === 'RSA_NO_PADDING') {
            paddingType = crypto.constants.RSA_NO_PADDING
          } else if (padding === 'RSA_PKCS1_OAEP_PADDING') {
            paddingType = crypto.constants.RSA_PKCS1_OAEP_PADDING
          }
          return crypto.publicEncrypt(
            { key, padding: paddingType },
            BufferPolyfill.from(buffer)
          )
        },

        // 随机字符串
        randomString: (len: number) => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
          let result = ''
          const bytes = crypto.randomBytes(len)
          for (let i = 0; i < len; i++) {
            result += chars[bytes[i] % chars.length]
          }
          return result
        },

        // 随机字节
        randomBytes: (len: number) => crypto.randomBytes(len),

        // Base64 编解码
        base64: {
          encode: (str: string | Buffer) => {
            if (BufferPolyfill.isBuffer(str)) {
              return str.toString('base64')
            }
            return BufferPolyfill.from(str).toString('base64')
          },
          decode: (str: string) => BufferPolyfill.from(str, 'base64').toString()
        },

        // SHA1 哈希
        sha1: (str: string) => crypto.createHash('sha1').update(str).digest('hex'),

        // SHA256 哈希
        sha256: (str: string) => crypto.createHash('sha256').update(str).digest('hex'),

        // HMAC
        hmac: (algorithm: string, key: string | Buffer, data: string | Buffer) => {
          return crypto.createHmac(algorithm, key).update(data).digest()
        },

        // HMAC SHA256
        hmacSha256: (key: string | Buffer, data: string | Buffer) => {
          return crypto.createHmac('sha256', key).update(data).digest('hex')
        },

        // Buffer 转字符串（LX 脚本使用）
        bufToString: (buffer: any, encoding?: string) => {
          if (BufferPolyfill.isBuffer(buffer)) {
            return buffer.toString(encoding || 'utf8')
          }
          if (buffer instanceof Uint8Array) {
            return BufferPolyfill.from(buffer).toString(encoding || 'utf8')
          }
          return String(buffer)
        }
      },

      // 字符编码转换
      iconv: {
        encode: (str: string, encoding: string) => iconv.encode(str, encoding),
        decode: (buffer: Buffer, encoding: string) => iconv.decode(buffer, encoding)
      },

      // 字符串工具
      string: {
        // URL 编码
        encodeURIComponent: (str: string) => encodeURIComponent(str),
        decodeURIComponent: (str: string) => decodeURIComponent(str),
        encodeURI: (str: string) => encodeURI(str),
        decodeURI: (str: string) => decodeURI(str)
      }
    },

    // --- 事件系统 (关键！支持 LX 脚本的 lx.on('request', handler)) ---
    on: (eventName: string, handler: Function) => {
      console.log(`[Preload] Registering handler for event: ${eventName}`)
      scriptEventHandlers.set(eventName, handler)

      // 同时监听来自主进程的事件触发
      ipcRenderer.on(`source-runner-reply-${eventName}`, (_, data) => {
        try {
          handler(data)
        } catch (e) {
          console.error(`[Preload] Script event handler error for ${eventName}:`, e)
        }
      })
    },

    // 移除事件监听
    off: (eventName: string) => {
      scriptEventHandlers.delete(eventName)
      ipcRenderer.removeAllListeners(`source-runner-reply-${eventName}`)
    },

    // --- 发送事件 ---
    send: (channel: string, data: any) => {
      ipcRenderer.send('source-runner-event', { channel, data })
    },

    // --- 脚本初始化完成调用 ---
    onInited: (info: any) => {
      console.log('[Preload] Source initialized:', info)
      ipcRenderer.send('script:event', { eventName: 'inited', data: info })
    }
  }

  // 3. 监听主进程触发事件
  // 主进程会发送 'script:triggerEvent' 来触发脚本注册的处理器
  ipcRenderer.on('script:triggerEvent', async (_, { eventName, data }) => {
    console.log(`[Preload] Received triggerEvent: ${eventName}`, data)

    const handler = scriptEventHandlers.get(eventName)
    if (!handler) {
      console.warn(`[Preload] No handler registered for event: ${eventName}`)
      // 发送错误结果回主进程
      if (data.requestId) {
        ipcRenderer.send('script:eventResult', {
          requestId: data.requestId,
          result: null,
          error: `No handler registered for event: ${eventName}`
        })
      }
      return
    }

    try {
      // 调用脚本注册的处理器
      // LX 脚本的 handler 通常返回 Promise
      const result = await handler(data)

      console.log(`[Preload] Handler result for ${eventName}:`, result)

      // 将结果发送回主进程
      if (data.requestId) {
        ipcRenderer.send('script:eventResult', {
          requestId: data.requestId,
          result: result,
          error: null
        })
      }
    } catch (err: any) {
      console.error(`[Preload] Handler error for ${eventName}:`, err)
      if (data.requestId) {
        ipcRenderer.send('script:eventResult', {
          requestId: data.requestId,
          result: null,
          error: err.message || 'Handler execution failed'
        })
      }
    }
  })

  // 4. 暴露 lx 对象到全局 window
  contextBridge.exposeInMainWorld('lx', lxHandler)
  // 兼容 global.lx
  contextBridge.exposeInMainWorld('global', { lx: lxHandler })

  // 5. 暴露 guli_api (用于原生脚本通信)
  const guliApi = {
    send: (channel: string, data: any) => {
      ipcRenderer.send(channel, data)
    },
    on: (channel: string, func: Function) => {
      ipcRenderer.on(channel, (_, ...args) => func(...args))
    }
  }
  contextBridge.exposeInMainWorld('guli_api', guliApi)

  // 6. 暴露全局 Buffer
  contextBridge.exposeInMainWorld('Buffer', {
    from: (...args: any[]) => BufferPolyfill.from.apply(BufferPolyfill, args),
    alloc: (size: number) => BufferPolyfill.alloc(size),
    allocUnsafe: (size: number) => BufferPolyfill.allocUnsafe(size),
    concat: (list: any[]) => BufferPolyfill.concat(list),
    isBuffer: (obj: any) => BufferPolyfill.isBuffer(obj)
  })

  // 7. 劫持控制台日志（用于调试）
  const sendLog = (type: string, args: any[]) => {
    ipcRenderer.send('source-runner-log', { type, args })
  }
  /* eslint-disable no-console */
  const originalConsoleLog = console.log
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  console.log = (...args) => {
    originalConsoleLog.apply(console, args)
    sendLog('log', args)
  }
  console.error = (...args) => {
    originalConsoleError.apply(console, args)
    sendLog('error', args)
  }
  console.warn = (...args) => {
    originalConsoleWarn.apply(console, args)
    sendLog('warn', args)
  }

  console.log('[Preload] API Runner initialization complete')

} catch (err: any) {
  console.error('[Preload] Initialization failed:', err)
  ipcRenderer.send('source-runner-log', { type: 'error', args: ['Preload Init Failed', err.message] })
}
