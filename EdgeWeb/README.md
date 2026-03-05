# EdgeWeb - 故里音乐助手官网

> 故里音乐助手的产品介绍/展示网站，基于 Vue 3 + Vite 构建，部署在 Cloudflare Pages 上。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite 7** - 下一代前端构建工具
- **TypeScript** - 类型安全
- **Vanilla CSS** - 自定义设计系统（暗色宇宙主题 / 玻璃拟态）

## 页面结构

| 区块       | 描述                                              |
| :--------- | :------------------------------------------------ |
| **Hero**   | 全屏首屏，星空粒子动画，版本标签，下载/GitHub CTA |
| **功能**   | 6 张玻璃拟态卡片展示核心特性                      |
| **预览**   | macOS 风格窗口框展示桌面应用截图                  |
| **技术栈** | 8 项技术栈卡片 + 6 项性能优化展示                 |
| **国际化** | 6 国语言支持展示                                  |
| **下载**   | 三平台下载卡片 + 终端安装命令                     |
| **底部**   | 项目链接、资源链接、版权信息                      |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build-only
```

## 部署到 Cloudflare Pages

### 方式一：通过 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 选择 GitHub 仓库 `yeflyleaf/Guli_MusicAttendant`
5. 配置构建设置：
   - **Build command**: `npm run build-only`
   - **Build output directory**: `dist`
   - **Root directory**: `EdgeWeb`
   - **Node.js version**: `22`
6. 点击 **Save and Deploy**

### 方式二：通过 Wrangler CLI

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建
npm run build-only

# 部署
wrangler pages deploy dist --project-name=guli-music
```

## 项目结构

```text
EdgeWeb/
├── public/                    # 静态资源
│   ├── favicon.ico            # 网站图标
│   ├── screenshot-home.png    # 应用首页截图
│   ├── hero_bg_dynamic.png    # Hero 动态背景
│   ├── features_bg_particles.png # 功能区粒子背景
│   ├── preview_bg_gradient.png   # 预览区渐变背景
│   ├── tech_bg_circuit.png    # 技术栈电路背景
│   └── footer_bg_holo.png     # 底部光影背景
├── src/
│   ├── main.ts                # Vue 应用入口
│   ├── App.vue                # 根组件（汇总所有页面区块）
│   ├── styles/
│   │   └── index.css          # 完整 CSS 设计系统
│   └── components/
│       ├── NavBar.vue          # 导航栏（玻璃模糊 + 移动端菜单）
│       ├── HeroSection.vue     # 首屏（星空粒子 + CTA）
│       ├── FeaturesSection.vue # 功能展示
│       ├── PreviewSection.vue  # 应用预览截图
│       ├── TechSection.vue     # 技术栈 + 性能优化
│       ├── I18nSection.vue     # 国际化支持
│       ├── DownloadSection.vue # 下载安装
│       └── FooterSection.vue   # 页脚
├── index.html                  # HTML 模板（SEO 优化）
├── vite.config.ts              # Vite 配置
└── package.json
```

---

## 📄 许可证 (License)

本项目采用 [AGPL-3.0](LICENSE) 许可证。

Copyright © 2026-Present [yeflyleaf](https://github.com/yeflyleaf). All Rights Reserved.
