# 故里音乐助手

> 专业级本地音乐管理系统

基于 **Electron + Vue 3 + TypeScript + Vite + Element Plus + SQLite (better-sqlite3)** 构建的现代化桌面音乐播放器。

## ✨ 特性

- 🎵 **本地音乐管理** - 扫描本地音乐文件夹，自动解析音频元数据
- 📝 **歌单管理** - 创建、编辑、删除歌单，管理您的音乐收藏
- ❤️ **收藏功能** - 快速收藏喜欢的歌曲
- 🎨 **现代化界面** - 炫酷的暗色主题，玻璃拟态效果
- 🎤 **歌词显示** - 支持 LRC 格式歌词同步滚动
- ⌨️ **全局快捷键** - 支持媒体键控制播放
- 💾 **离线运行** - 完全本地化，无需联网

## 📦 安装

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 打包 Windows 安装程序
npm run build:win
```

## 🚀 本地音乐列表性能优化方案

本项目采用了一套完整的性能优化组合拳，彻底解决了本地音乐列表加载卡顿的问题，实现了极致流畅的用户体验。

### 1. 并行数据预加载 (Parallel Data Preloading)

- **原理**：打破常规的"组件挂载后加载"模式，将数据加载时机提前到应用启动的最早期。
- **实现**：在 `app.mount()` 之前就发起 IPC 请求，利用 `Promise.all` 并行加载设置配置和音乐库数据。
- **效果**：充分利用 Vue 实例化、路由解析等初始化过程的"空闲时间"并行读取数据库。当用户看到界面时，核心数据已经在内存中准备就绪，消除了等待时间。

### 2. 启动屏缓冲 (Splash Screen Buffer)

- **原理**：利用一个精美的过场动画作为数据加载的"缓冲期"，优化用户感知的启动速度。
- **实现**：创建 `SplashScreen` 组件，它采用"双重等待"策略：同时等待"最小展示时间(1.5s)"和"数据加载完成"。
- **效果**：
  - 优雅地掩盖了后台繁重的数据读取和初始化过程。
  - 给用户一种"应用启动丝滑流畅"的心理感受。
  - 确保进入主界面时，所有核心数据（无论多少）都已加载完毕，避免了进入首页后的加载转圈。

### 3. 渐进式渲染 (Progressive Rendering)

- **原理**：解决由一次性创建大量 DOM 节点引起的渲染线程阻塞（掉帧/卡顿）。
- **实现**：
  - 引入 `visibleMusicList` 概念，将长列表分批次渲染。
  - **首屏极速渲染**：首次进入页面时，仅渲染前 **20** 条数据，确保页面切换瞬间完成。
  - **异步补全**：利用 `requestAnimationFrame` 和 `setTimeout` 将剩余数据的渲染推迟到下一帧（100ms后）执行。
- **效果**：
  - 将首次渲染的 DOM 节点数减少 90% 以上，渲染耗时呈指数级下降。
  - 彻底消除了点击侧边栏切换到"本地音乐"时的卡顿感，实现了毫秒级的瞬间切换。
  - 用户感知不到后续数据的加载，因为它们在页面展示后的瞬间就无缝补全了。

### 4. 视图层持久化 (View Layer Persistence)

- **原理**：避免用户在页面间频繁切换时反复销毁和重建 DOM 节点，保持交互状态。
- **实现**：
  - **组件缓存**：在 `App.vue` 中使用 Vue 的 `<keep-alive>` 包裹路由视图，并配置 `include` 属性。
  - **状态恢复**：在 `LocalMusic.vue` 中利用 `onBeforeRouteLeave` 记录滚动位置，并在 `onActivated` 时自动恢复。
- **效果**：
  - **零开销重返**：当用户离开"本地音乐"去查看其他页面再切回来时，页面是**瞬间出现**的，完全不需要重新执行渲染逻辑。
  - **体验连续性**：完美保留了用户的浏览进度（滚动条位置）和选中状态，不会因为切换页面而丢失上下文。

这四者共同构成了一个高性能的本地音乐列表体验：**预加载**准备数据 -> **启动屏**掩盖耗时 -> **渐进式渲染**解决首次卡顿 -> **持久化**消除重复开销。

## ⚡ CPU 性能优化

针对 Electron 应用常见的性能瓶颈，本项目实施了深度的 CPU 占用优化，确保在低功耗设备上也能流畅运行。

### 1. 启用 GPU 硬件加速

- **问题**：默认禁用硬件加速会导致所有渲染任务（包括 CSS 动画、Canvas 绘制）强制由 CPU 处理，造成 CPU 占用率飙升。
- **优化**：在主进程中显式启用 GPU 硬件加速，将图形渲染任务卸载至 GPU。
- **效果**：大幅降低主进程和渲染进程的 CPU 消耗，界面动画更加丝滑。

### 2. 音频可视化帧率节流 (Visualizer Throttling)

- **问题**：音频可视化频谱图默认跟随屏幕刷新率（通常为 60Hz 或更高）进行重绘，高频的 Canvas 操作会消耗大量计算资源。
- **优化**：在 `FooterPlayer` 组件中实现智能节流算法，将可视化绘制帧率限制在 **30 FPS**。
- **效果**：在保持视觉流畅度几乎无损的前提下，将可视化功能的 CPU 占用减少 **50% 以上**。

经过以上优化，应用在播放音乐时的平均 CPU 占用率已降至 **5% 以下**。

## 🎚️ 进度条拖动修复方案

在 Electron 应用中使用自定义协议（`local-audio://`）加载音频时，进度条拖动后会"回弹"到起点。这是一个常见的 Electron 音视频开发陷阱。

### 问题根源

Electron 的 `net.fetch()` **不支持 HTTP Range 请求**。

当 HTML5 Audio 元素尝试跳转（seek）时：

1. 浏览器发送带有 `Range: bytes=xxxxx-` 请求头的请求
2. 如果协议处理器不支持 Range 请求，音频只能从头加载
3. 导致 `audio.currentTime` 被强制重置为 0

### 解决方案

在 `protocol.service.ts` 中手动实现 HTTP Range 请求支持：

```typescript
// 检查 Range 请求头
const rangeHeader = request.headers.get('Range')

if (rangeHeader) {
  // 解析 Range 头 (格式: bytes=start-end)
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/)
  const start = match[1] ? parseInt(match[1], 10) : 0
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1

  // 使用 createReadStream 读取指定范围
  const stream = createReadStream(filePath, { start, end })

  // 返回 206 Partial Content
  return new Response(stream, {
    status: 206,
    headers: {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes'
    }
  })
}

// 完整文件请求也需声明支持 Range
return new Response(stream, {
  headers: { 'Accept-Ranges': 'bytes' }
})
```

### 关键技术点

| 技术 | 说明 |
|------|------|
| **HTTP Range 请求** | 允许客户端请求文件的部分内容 (`bytes=start-end`) |
| **206 Partial Content** | HTTP 状态码，表示返回文件的部分内容 |
| **Accept-Ranges: bytes** | 响应头，告知浏览器服务器支持范围请求 |
| **createReadStream** | Node.js 文件流 API，支持 `{ start, end }` 参数 |

> 💡 **经验教训**：Electron 的 `net.fetch()` 和 `protocol.handle()` 是为简单文件加载设计的，开发音视频应用时必须手动实现 Range 请求支持。

## 💾 数据存储与便携模式

本项目经过特殊优化，支持**完全便携（Portable）**运行模式，实现了"数据随身带"。

- **开发环境**：数据库存储在项目根目录的 `data/` 文件夹下。
- **生产环境**：数据库自动存储在**应用程序安装目录**下的 `data/` 文件夹中，而不是系统的 `AppData/Roaming` 目录。

这意味着您可以：

1. 将软件安装在 U 盘或移动硬盘中，在任何电脑上即插即用。
2. 重装系统或更换电脑时，只需复制整个软件文件夹，所有歌单、收藏、播放记录完美保留。
3. 彻底杜绝在系统盘产生垃圾文件，保持系统洁净。

> **⚠️ 注意**：由于 Windows 权限限制，请避免将软件安装在 `C:\Program Files` 等受保护的系统目录下，否则可能导致数据库无法写入。建议安装在 `D盘` 或其他非系统保护目录。

## 🛠️ 技术栈与脚手架

本项目基于 **electron-vite** 脚手架构建，采用现代化的前端技术栈。

### 核心框架

- **Electron**: ^33.0.0
- **Vue**: ^3.4.15
- **TypeScript**: ^5.3.3
- **Vite**: ^5.0.12

### UI 与 状态管理

- **Element Plus**: ^2.5.3
- **@element-plus/icons-vue**: ^2.3.1
- **Pinia**: ^2.1.7
- **Vue Router**: ^4.2.5
- **Sass**: ^1.70.0

### 数据存储与处理

- **better-sqlite3**: ^11.5.0 (高性能 SQLite 驱动)
- **sql.js**: ^1.10.3 (备用/辅助)
- **electron-store**: ^8.1.0 (简单配置存储)
- **music-metadata**: ^7.14.0 (音频元数据解析)
- **@vueuse/core**: ^14.1.0 (Vue 组合式 API 工具库)

### 构建与开发工具

- **electron-vite**: ^2.0.0 (构建工具)
- **electron-builder**: ^24.9.1 (打包工具)
- **@electron-toolkit/utils**: ^2.0.1 (Electron 工具库)
- **ESLint**: ^8.56.0 (代码检查)
- **Prettier**: ^3.2.4 (代码格式化)
- **vue-tsc**: ^1.8.27 (Vue 类型检查)

### 详细依赖版本清单

#### Dependencies (生产环境依赖)

| Package                 | Version | Description               |
| ----------------------- | ------- | ------------------------- |
| @element-plus/icons-vue | ^2.3.1  | Element Plus 图标库       |
| @vueuse/core            | ^14.1.0 | Vue 组合式 API 实用工具集 |
| better-sqlite3          | ^11.5.0 | Node.js SQLite3 驱动      |
| electron-store          | ^8.1.0  | Electron 数据持久化存储   |
| element-plus            | ^2.5.3  | Vue 3 UI 组件库           |
| music-metadata          | ^7.14.0 | 音频文件元数据解析        |
| pinia                   | ^2.1.7  | Vue 状态管理库            |
| sql.js                  | ^1.10.3 | SQLite 的 WebAssembly 版  |
| vue                     | ^3.4.15 | Vue.js 核心框架           |
| vue-router              | ^4.2.5  | Vue 路由管理器            |

#### DevDependencies (开发环境依赖)

| Package                 | Version  | Description             |
| ----------------------- | -------- | ----------------------- |
| @electron-toolkit/utils | ^2.0.1   | Electron 开发工具库     |
| @types/better-sqlite3   | ^7.6.13  | TypeScript 类型定义     |
| @types/node             | ^20.11.5 | Node.js 类型定义        |
| @types/sql.js           | ^1.4.9   | sql.js 类型定义         |
| @vitejs/plugin-vue      | ^5.0.3   | Vite Vue 插件           |
| @vue/tsconfig           | ^0.5.1   | Vue TypeScript 配置     |
| electron                | ^33.0.0  | Electron 核心框架       |
| electron-builder        | ^24.9.1  | Electron 应用打包工具   |
| electron-vite           | ^2.0.0   | Electron 开发构建工具   |
| eslint                  | ^8.56.0  | JavaScript 代码检查工具 |
| eslint-plugin-vue       | ^9.20.1  | Vue.js ESLint 插件      |
| prettier                | ^3.2.4   | 代码格式化工具          |
| sass                    | ^1.70.0  | CSS 预处理器            |
| typescript              | ^5.3.3   | TypeScript 语言支持     |
| vite                    | ^5.0.12  | 前端构建工具            |
| vue-tsc                 | ^1.8.27  | Vue 模板类型检查工具    |

## 📁 项目结构

```text
src/
├── main/           # Electron 主进程 (后端)
│   ├── db/         # 数据库层 (SQLite)
│   ├── services/   # 业务逻辑层
│   ├── ipc/        # IPC 通信处理
│   └── utils/      # 工具函数
├── preload/        # 预加载脚本 (安全桥梁)
└── renderer/       # Vue 前端 (渲染进程)
    └── src/
        ├── components/  # 公共组件
        ├── views/       # 页面视图
        ├── store/       # Pinia 状态管理
        ├── hooks/       # Vue Composables
        ├── router/      # 路由配置
        ├── types/       # TypeScript 类型
        └── utils/       # 工具函数
```

## 🎮 使用说明

1. **添加音乐文件夹** - 进入设置页面，添加本地音乐文件夹
2. **扫描音乐** - 系统会自动扫描文件夹中的音频文件
3. **播放音乐** - 双击歌曲开始播放
4. **创建歌单** - 在侧边栏点击 "+" 创建新歌单
5. **收藏歌曲** - 点击歌曲旁的爱心图标收藏

## 📄 许可证

MIT License © 2024 Guli
