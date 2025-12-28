# 自定义音乐源功能说明

## 功能概述

Guli Music Attendant 支持自定义音乐源功能，允许用户导入第三方脚本来实现在线音乐搜索和播放。

## 架构设计

### Ghost Runner Architecture（隐形沙盒架构）

```
┌─────────────────────────────────────────────────────────────────┐
│                          Electron 应用                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     IPC      ┌─────────────────────────────┐  │
│  │  渲染进程    │ ◄─────────► │        主进程              │  │
│  │  (Vue UI)   │              │  - online.service.ts       │  │
│  │             │              │  - source.ipc.ts           │  │
│  └─────────────┘              │  - api-runner.service.ts   │  │
│                               └─────────────┬───────────────┘  │
│                                             │                   │
│                               ┌─────────────▼───────────────┐  │
│                               │    Ghost Window (隐形窗口)   │  │
│                               │  - api-runner.ts (preload) │  │
│                               │  - 用户导入的源脚本          │  │
│                               └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 文件结构

### 后端（主进程）

```
src/main/
├── db/repositories/
│   └── source.repo.ts          # 源数据持久化
├── ipc/
│   ├── source.ipc.ts           # 源管理 IPC 处理器
│   └── online.ipc.ts           # 在线音乐 IPC 处理器
├── services/
│   ├── api-runner.service.ts   # Ghost Window 管理
│   └── online.service.ts       # 在线音乐服务
└── types/
    └── source.ts               # 源类型定义
```

### 预加载脚本

```
src/preload/
├── index.ts                    # 主窗口预加载
└── api-runner.ts               # Ghost Window 预加载（提供加密和网络能力）
```

### 前端

```
src/renderer/src/
├── store/
│   ├── source.store.ts         # 源状态管理
│   └── online.store.ts         # 在线搜索状态管理
├── types/
│   ├── source.ts               # 源类型定义
│   └── online.ts               # 在线音乐类型定义
└── views/
    ├── OnlineSearch.vue        # 在线搜索页面
    └── Settings.vue            # 设置页面（含源管理）
```

## 支持的源脚本格式

### 1. 原生格式（推荐）

使用 `GULI_SOURCE_META` 对象定义元信息：

```javascript
const GULI_SOURCE_META = {
  id: 'my-source',
  name: '我的音乐源',
  version: '1.0.0',
  description: '描述',
  icon: '🎵',
  author: '作者',
  supports: {
    search: true,
    getPlayUrl: true,
    getLyrics: false
  }
};

const guliSource = {
  async search(params) {
    // 返回 { list: [...], total: number }
  },
  
  async getPlayUrl(params) {
    // 返回 { url: string }
  }
};
```

### 2. 外部脚本格式

使用 JSDoc 注释定义元信息：

```javascript
/**
 * @name 源名称
 * @version 1
 * @author 作者
 * @description 描述
 */
```

外部脚本使用事件驱动方式通信。

## 可用的 API

源脚本可以使用 `window.guli_api` 访问以下功能：

### 网络请求

```javascript
// Promise 格式
const response = await window.guli_api.request(url, {
  method: 'GET',
  headers: { 'User-Agent': '...' },
  timeout: 30000
});
console.log(response.body, response.status);
```

### 加密工具

```javascript
window.guli_api.crypto.md5(str)        // MD5 哈希
window.guli_api.crypto.sha1(str)       // SHA1 哈希
window.guli_api.crypto.sha256(str)     // SHA256 哈希
window.guli_api.crypto.aesEncrypt()    // AES 加密
window.guli_api.crypto.aesDecrypt()    // AES 解密
window.guli_api.crypto.rsaEncrypt()    // RSA 加密
window.guli_api.crypto.base64Encode()  // Base64 编码
window.guli_api.crypto.base64Decode()  // Base64 解码
```

### 调试

```javascript
window.guli_api.log()    // 日志输出
window.guli_api.warn()   // 警告输出
window.guli_api.error()  // 错误输出
```

## 使用流程

1. **导入源脚本**
   - 打开设置 → 下载设置 → 自定义源管理
   - 选择"在线导入"或"本地导入"
   - 导入符合规范的 JavaScript 文件

2. **在线搜索**
   - 进入"在线搜索"页面
   - 输入关键词并搜索
   - 选择歌曲进行试听或下载

3. **下载音乐**
   - 点击歌曲列表中的下载按钮
   - 音乐将被下载到指定目录

## 安全提示

⚠️ **警告**：虽然源脚本在隔离的环境中运行，但导入包含恶意代码的脚本仍可能影响您的系统。请仅从可信来源导入脚本。

## 示例源脚本

项目根目录下的 `example-source.js` 是一个完整的源脚本模板。
