<h1 align="center">🎵 故里音乐助手</h1>

<p align="center">
  <img src="./Frontend/build/icons/icon.ico" width="256" alt="Logo">
</p>

**本地音乐管理系统**

基于 Electron + Vue 3 + TypeScript + Vite + Element Plus + SQLite 构建的现代化桌面音乐播放器

[![Electron](https://img.shields.io/badge/Electron-39.0.0-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5.0-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

[功能特性](#功能特性) • [快速开始](#快速开始) • [技术架构](#技术架构) • [项目结构](#项目结构) • [使用说明](#使用说明) • [贡献指南](#贡献指南)

---

## 📋 目录

- [功能特性](#功能特性)
  - [核心功能](#核心功能)
  - [界面与体验](#界面与体验)
  - [性能与效率](#性能与效率)
- [快速开始](#快速开始)
  - [环境要求](#环境要求)
  - [安装与运行](#安装与运行)
  - [其他命令](#其他命令)
- [技术架构](#技术架构)
  - [技术栈概览](#技术栈概览)
  - [核心依赖](#核心依赖)
- [项目结构](#项目结构)
- [使用说明](#使用说明)
  - [基础操作](#基础操作)
  - [快捷键](#快捷键)
  - [迷你播放器](#迷你播放器)
- [性能优化](#性能优化)
- [数据存储](#数据存储)
- [技术亮点](#技术亮点)
- [国际化](#国际化)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 功能特性

### 核心功能

| 功能 | 描述 |
| :--- | :--- |
| **本地音乐管理** | 扫描本地音乐文件夹，自动解析音频元数据（标题、艺术家、专辑、封面等） |
| **歌单管理** | 创建、编辑、删除歌单，自由管理您的音乐收藏 |
| **收藏功能** | 快速收藏喜欢的歌曲，一键访问我喜欢 |
| **歌词显示** | 支持 LRC 格式歌词同步滚动，沉浸式歌词页面 |
| **最近播放** | 智能记录播放历史，快速回顾听歌记录 |

### 界面与体验

| 功能 | 描述 |
| :--- | :--- |
| **多主题切换** | 炫酷的暗色主题、玻璃拟态效果，多种动态背景可选 |
| **快捷主题切换** | 标题栏一键切换两款预设主题 |
| **迷你播放器** | 小窗口模式，支持拖拽移动，轻量化使用 |
| **多语言支持** | 支持中文、英文、法语、俄语、西班牙语、阿拉伯语 |
| **播放队列** | 可视化播放队列，支持拖拽排序 |

### 性能与效率

| 功能 | 描述 |
| :--- | :--- |
| **全局快捷键** | 支持媒体键控制播放（上一曲/下一曲/播放暂停） |
| **离线运行** | 完全本地化，无需联网，隐私安全 |
| **便携模式** | 数据存储于应用目录，U盘即装即用 |
| **高性能渲染** | 大型音乐库毫秒级加载，渐进式渲染技术 |

[⬆️ 返回目录](#目录)

---

## 快速开始

### 环境要求

| 依赖 | 版本要求 |
| :--- | :--- |
| **Node.js** | >= 20.0.0 |
| **npm** | >= 10.0.0 |
| **操作系统** | Windows 10+, macOS 10.15+, Linux |

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/yeflyleaf/Guli_MusicAttendant.git
cd Guli_MusicAttendant/Frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 打包安装程序
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

### 其他命令

```bash
# 代码检查与修复
npm run lint

# 代码格式化
npm run format

# 预览构建结果
npm run preview
```

[⬆️ 返回目录](#目录)

---

## 技术架构

### 技术栈概览

```text
┌─────────────────────────────────────────────────────────────────┐
│                       Electron 39.0.0                           │
├─────────────────────────────────────────────────────────────────┤
│  渲染进程 (Renderer)          │  主进程 (Main)                   │
│  ┌─────────────────────────┐  │  ┌─────────────────────────────┐│
│  │ Vue 3.2 + Vite 6.0    │  │  │ Node.js + SQLite           ││
│  │ ┌─────────────────────┐ │  │  │ ┌─────────────────────────┐││
│  │ │ Element Plus 2.13.0 │ │  │  │ │ better-sqlite3 12.5.0  │││
│  │ │ Pinia 3.0.0         │ │  │  │ │ music-metadata 7.14.0  │││
│  │ │ Vue Router 4.6.0    │ │  │  │ │ electron-store 8.2.0   │││
│  │ │ Vue I18n 11.0.0     │ │  │  │ └─────────────────────────┘││
│  │ └─────────────────────┘ │  │  └─────────────────────────────┘│
│  └─────────────────────────┘  │                                  │
├───────────────────────────────┴──────────────────────────────────┤
│                     Preload Script (安全桥梁)                     │
│                     IPC 通信 + Context Bridge                    │
└─────────────────────────────────────────────────────────────────┘
```

### 核心依赖

#### 📦 生产依赖 (Dependencies)

| Package | Version | Description |
| :--- | :---: | :--- |
| `vue` | ^3.2 | 渐进式 JavaScript 框架 |
| `vue-router` | ^4.6.0 | Vue.js 官方路由管理器 |
| `vue-i18n` | ^11.0.0 | Vue.js 国际化插件 |
| `pinia` | ^3.0.0 | Vue 状态管理库 |
| `element-plus` | ^2.13.0 | Vue 3 UI 组件库 |
| `@element-plus/icons-vue` | ^2.3.1 | Element Plus 图标库 |
| `@vueuse/core` | ^14.1.0 | Vue 组合式 API 实用工具集 |
| `better-sqlite3` | ^12.5.0 | 高性能 Node.js SQLite3 驱动 |
| `electron-store` | ^8.2.0 | Electron 简单数据持久化 |
| `music-metadata` | ^7.14.0 | 音频文件元数据解析 |
| `sortablejs` | ^1.15.6 | 拖拽排序库 |
| `sql.js` | ^1.12.0 | SQLite WebAssembly 版本 |

#### 🔧 开发依赖 (DevDependencies)

| Package | Version | Description |
| :--- | :---: | :--- |
| `electron` | ^39.0.0 | 跨平台桌面应用框架 |
| `electron-vite` | ^5.0.0 | Electron 开发构建工具 |
| `electron-builder` | ^26.0.0 | Electron 应用打包工具 |
| `@electron-toolkit/utils` | ^4.0.0 | Electron 工具库 |
| `vite` | ^6.0.0 | 下一代前端构建工具 |
| `@vitejs/plugin-vue` | ^5.2.0 | Vite Vue 插件 |
| `typescript` | ^5.9.0 | JavaScript 超集语言 |
| `vue-tsc` | ^2.2.0 | Vue 模板类型检查工具 |
| `sass` | ^1.87.0 | CSS 预处理器 |
| `eslint` | ^9.0.0 | JavaScript 代码检查工具 |
| `eslint-plugin-vue` | ^9.33.0 | Vue.js ESLint 插件 |
| `prettier` | ^3.5.0 | 代码格式化工具 |
| `@intlify/unplugin-vue-i18n` | ^11.0.3 | Vue I18n Vite 插件 |

[⬆️ 返回目录](#目录)

---

## 项目结构

```text
Guli_MusicAttendant/
├── Frontend/                          # 前端 Electron 应用
│   ├── src/
│   │   ├── main/                      # 🖥️ Electron 主进程
│   │   │   ├── index.ts               # 主进程入口
│   │   │   ├── db/                    # 数据库层
│   │   │   │   ├── database.ts        # SQLite 连接管理
│   │   │   │   ├── library.db.ts      # 音乐库数据操作
│   │   │   │   ├── playlist.db.ts     # 歌单数据操作
│   │   │   │   └── ...
│   │   │   ├── ipc/                   # IPC 通信处理
│   │   │   │   ├── library.ipc.ts     # 音乐库 IPC
│   │   │   │   ├── playlist.ipc.ts    # 歌单 IPC
│   │   │   │   ├── window.ipc.ts      # 窗口控制 IPC
│   │   │   │   └── ...
│   │   │   ├── services/              # 业务服务层
│   │   │   │   ├── protocol.service.ts # 自定义协议
│   │   │   │   ├── lyrics.service.ts  # 歌词解析
│   │   │   │   └── ...
│   │   │   ├── types/                 # 类型定义
│   │   │   └── utils/                 # 工具函数
│   │   │
│   │   ├── preload/                   # 🔐 预加载脚本
│   │   │   ├── index.ts               # Context Bridge API
│   │   │   └── index.d.ts             # 类型声明
│   │   │
│   │   └── renderer/                  # 🎨 Vue 渲染进程
│   │       ├── index.html             # HTML 入口
│   │       └── src/
│   │           ├── main.ts            # Vue 应用入口
│   │           ├── App.vue            # 根组件
│   │           ├── components/        # 公共组件
│   │           │   ├── Header.vue     # 标题栏
│   │           │   ├── Sidebar.vue    # 侧边栏
│   │           │   ├── FooterPlayer.vue # 底部播放器
│   │           │   ├── MiniPlayer.vue # 迷你播放器
│   │           │   └── ...
│   │           ├── views/             # 页面视图
│   │           │   ├── LocalMusic.vue # 本地音乐
│   │           │   ├── FavoriteMusic.vue # 我喜欢
│   │           │   ├── RecentlyPlayed.vue # 最近播放
│   │           │   ├── PlaylistDetail.vue # 歌单详情
│   │           │   ├── Settings.vue   # 设置页面
│   │           │   └── ...
│   │           ├── store/             # Pinia 状态管理
│   │           │   ├── library.store.ts # 音乐库状态
│   │           │   ├── player.store.ts  # 播放器状态
│   │           │   └── settings.store.ts # 设置状态
│   │           ├── router/            # Vue Router 配置
│   │           ├── hooks/             # Vue Composables
│   │           ├── locales/           # 国际化语言包
│   │           │   ├── zh-CN.ts       # 中文
│   │           │   ├── en-US.ts       # 英文
│   │           │   ├── fr-FR.ts       # 法语
│   │           │   ├── ru-RU.ts       # 俄语
│   │           │   ├── es-ES.ts       # 西班牙语
│   │           │   └── ar-SA.ts       # 阿拉伯语
│   │           ├── types/             # TypeScript 类型
│   │           ├── utils/             # 工具函数
│   │           └── assets/            # 静态资源
│   │
│   ├── build/                         # 构建资源 (图标等)
│   ├── e2e/                           # 端到端测试
│   ├── electron-builder.yml           # 打包配置
│   ├── electron.vite.config.ts        # Vite 配置
│   ├── tsconfig.json                  # TypeScript 配置
│   └── package.json                   # 项目依赖
│
├── .gitignore                         # Git 忽略配置
├── LICENSE                            # AGPL v3 许可证
└── README.md                          # 项目说明
```

[⬆️ 返回目录](#目录)

---

## 使用说明

### 基础操作

#### 1. 添加音乐文件夹

1. 进入 `设置` → `音乐文件夹管理`
2. 点击 `添加文件夹` 选择本地音乐目录
3. 系统将自动扫描并导入音频文件

#### 2. 播放音乐

1. 双击歌曲开始播放
2. 使用底部播放栏控制播放/暂停、上一曲/下一曲
3. 点击进度条跳转到指定位置

#### 3. 歌单管理

1. 侧边栏点击 `+` 创建新歌单
2. 右键歌曲选择 `添加到歌单`
3. 歌单内支持拖拽排序

#### 4. 收藏歌曲

1. 点击歌曲旁的 ❤️ 图标收藏
2. 在 `我喜欢` 页面查看所有收藏

#### 5. 查看歌词

1. 点击底部播放栏的封面进入歌词页面
2. 自动匹配同目录下的 `.lrc` 歌词文件

### 快捷键

| 快捷键 | 功能 |
| :--- | :--- |
| `Space` | 播放/暂停 |
| `MediaPlayPause` | 播放/暂停 (媒体键) |
| `MediaNextTrack` | 下一曲 (媒体键) |
| `MediaPreviousTrack` | 上一曲 (媒体键) |

### 迷你播放器

- 点击标题栏按钮切换到迷你模式
- 迷你窗口可自由拖拽移动
- 悬停显示控制按钮

[⬆️ 返回目录](#目录)

---

## 性能优化

本项目针对大型音乐库场景进行了深度性能优化，确保在管理数千首歌曲时依然保持流畅体验：

| 优化策略 | 描述 |
| :--- | :--- |
| **并行数据预加载** | 在应用启动前并行加载设置和音乐库数据，充分利用初始化阶段的空闲时间 |
| **启动屏缓冲** | 精美的启动动画作为数据加载缓冲期，优化用户感知的启动速度 |
| **渐进式渲染** | 首屏仅渲染 20 条数据，利用 `requestAnimationFrame` 异步补全剩余数据 |
| **视图层持久化** | 使用 `<keep-alive>` 缓存页面组件，实现零开销的页面切回 |
| **GPU 硬件加速** | 显式启用 GPU 加速，将图形渲染任务卸载至 GPU |
| **帧率节流** | 音频可视化限制在 30 FPS，在保持流畅度的同时减少 50% CPU 占用 |

### 1. 并行数据预加载

在 Vue 应用挂载之前，通过 `Promise.all()` 同时发起设置加载和音乐库加载请求：

```typescript
// main.ts - 立即开始加载数据（不等待）
const preloadPromise = Promise.all([
  settingsStore.loadSettings(),
  libraryStore.loadAll()
])
window.__preloadPromise = preloadPromise
app.mount('#app') // 与数据加载并行执行
```

此策略将原本串行的「挂载 → 加载数据」流程改为并行执行，有效利用框架初始化阶段的 CPU 空闲时间，减少用户可感知的等待时间。

### 2. 启动屏缓冲

启动屏（Splash Screen）不仅提供视觉反馈，更作为数据预加载的缓冲层。启动动画会等待 `__preloadPromise` 完成后才触发退场动画：

```typescript
// SplashScreen.vue
const preloadPromise = window.__preloadPromise
if (preloadPromise) {
  await preloadPromise // 等待数据加载完成
}
startExitAnimation() // 播放退场动画
```

这种设计确保用户看到主界面时，所有必要数据已就绪，实现"数据加载零感知"的用户体验。

### 3. 渐进式渲染

对于大型列表（如本地音乐列表），采用渐进式渲染策略避免首屏渲染阻塞：

```typescript
// LocalMusic.vue
const renderLimit = ref(20) // 首屏仅渲染 20 条
const visibleMusicList = computed(() => musicList.value.slice(0, renderLimit.value))

const renderNextBatch = () => {
  if (renderLimit.value < musicList.value.length) {
    renderLimit.value = Math.min(renderLimit.value + 40, musicList.value.length)
    requestAnimationFrame(renderNextBatch) // 利用浏览器空闲时间渲染
  }
}
```

结合 CSS `content-visibility: auto` 属性进一步优化：

```scss
.list-item {
  content-visibility: auto;        // 跳过视口外内容的渲染
  contain-intrinsic-size: 0 56px;  // 预设占位高度避免布局抖动
}
```

### 4. 视图层持久化

使用 Vue 的 `<keep-alive>` 组件缓存高频访问的页面，避免重复渲染开销：

```vue
<keep-alive :include="['LocalMusic', 'Favorites', 'RecentlyPlayed', 'PlaylistDetail']" :max="10">
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</keep-alive>
```

配合 `onActivated` 生命周期钩子恢复滚动位置，实现无缝的页面切换体验：

```typescript
onActivated(() => {
  nextTick(() => {
    scrollContainer.value.scrollTop = savedScrollTop.value
  })
})
```

### 5. GPU 硬件加速

通过 CSS `will-change` 属性显式声明动画元素，触发浏览器 GPU 加速层（Composite Layer）：

```scss
.list-header {
  will-change: transform;  // 提示浏览器优化滚动性能
  transform: translateZ(0); // 强制创建独立的 GPU 图层
}
```

动态背景组件同样采用 Canvas 2D 渲染结合 GPU 合成，确保复杂动画不阻塞主线程。

### 6. 帧率节流

音频可视化和动态背景支持用户自定义帧率（默认 30-240 FPS），在视觉流畅度和资源占用间取得平衡：

```typescript
// FooterPlayer.vue - 音频可视化
const FPS = settingsStore.visualizationFrameRate || 30
const frameInterval = 1000 / FPS
const draw = () => {
  const now = performance.now()
  if (now - lastFrame >= frameInterval) {
    // 执行绘制...
    lastFrame = now
  }
  animationId = requestAnimationFrame(draw)
}
```

用户可在「设置 → 外观 → 帧率」中调整此值，较低帧率（30 FPS）可降低约 50% 的 CPU/GPU 负载，适合性能较弱的设备。

[⬆️ 返回目录](#目录)

---

## 技术亮点

### 自定义协议 Range 请求支持

解决 Electron 音频进度条拖动"回弹"问题：

```typescript
// 支持 HTTP Range 请求，实现音频 seek 功能
if (rangeHeader) {
  const [start, end] = parseRange(rangeHeader, fileSize)
  const stream = createReadStream(filePath, { start, end })
  return new Response(stream, {
    status: 206, // Partial Content
    headers: { 'Content-Range': `bytes ${start}-${end}/${fileSize}` }
  })
}
```

| 关键技术 | 说明 |
| :--- | :--- |
| **HTTP Range 请求** | 允许请求文件部分内容 |
| **206 Partial Content** | 标识返回部分内容 |
| **Accept-Ranges: bytes** | 声明支持范围请求 |

[⬆️ 返回目录](#目录)

---

## 国际化

支持以下语言：

| 语言 | 代码 | 状态 |
| :--- | :---: | :---: |
| 简体中文 | `zh-CN` | ✅ 完整 |
| English | `en-US` | ✅ 完整 |
| Français | `fr-FR` | ✅ 完整 |
| Русский | `ru-RU` | ✅ 完整 |
| Español | `es-ES` | ✅ 完整 |
| العربية | `ar-SA` | ✅ 完整 |

[⬆️ 返回目录](#目录)

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

```bash
# 1. Fork 本仓库

# 2. 创建特性分支
git checkout -b feature/AmazingFeature

# 3. 提交更改
git commit -m 'Add some AmazingFeature'

# 4. 推送到分支
git push origin feature/AmazingFeature

# 5. 提交 Pull Request
```

[⬆️ 返回目录](#目录)

---

## 许可证

本项目基于 [GNU Affero General Public License v3.0](LICENSE) 许可证开源。

---

Made with ❤️ by [yeflyleaf](https://github.com/yeflyleaf)

⭐ 如果这个项目对你有帮助，请给一个 Star！
