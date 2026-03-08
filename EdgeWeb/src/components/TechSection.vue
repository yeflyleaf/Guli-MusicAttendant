<script setup lang="ts">
import { ref } from 'vue'

const techStack = [
  {
    name: 'Electron',
    version: '39',
    icon: '⚛️',
    color: '#47848F',
    description: '跨平台桌面应用框架',
    url: 'https://www.electronjs.org/',
  },
  {
    name: 'Vue 3',
    version: '3.5',
    icon: '💚',
    color: '#4FC08D',
    description: '渐进式 JavaScript 框架',
    url: 'https://vuejs.org/',
  },
  {
    name: 'TypeScript',
    version: '5.9',
    icon: '🔷',
    color: '#3178C6',
    description: '类型安全的超集语言',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'Vite',
    version: '6',
    icon: '⚡',
    color: '#646CFF',
    description: '下一代前端构建工具',
    url: 'https://vite.dev/',
  },
  {
    name: 'Element Plus',
    version: '2.13',
    icon: '🎨',
    color: '#409EFF',
    description: 'Vue 3 的组件库',
    url: 'https://element-plus.org/',
  },
  {
    name: 'SQLite',
    version: '',
    icon: '🗃️',
    color: '#003B57',
    description: '轻量级嵌入式数据库',
    url: 'https://www.sqlite.org/',
  },
  {
    name: 'Pinia',
    version: '3',
    icon: '🍍',
    color: '#FFD859',
    description: 'Vue 的直觉化状态管理',
    url: 'https://pinia.vuejs.org/',
  },
  {
    name: 'Vue I18n',
    version: '11',
    icon: '🌐',
    color: '#4FC08D',
    description: '国际化插件',
    url: 'https://vue-i18n.intlify.dev/',
  },
]

const perfItems = [
  { label: '并行数据预加载', detail: '离线音乐库秒级启动，数据瞬间就绪', icon: '🚀', progress: 95 },
  {
    label: '渐进式渲染',
    detail: '首屏 20 条 + requestAnimationFrame 补全',
    icon: '📊',
    progress: 90,
  },
  { label: 'GPU 硬件加速', detail: '图形渲染任务卸载至 GPU', icon: '🖥️', progress: 98 },
  { label: '视图层持久化', detail: 'keep-alive 缓存，零开销页面切回', icon: '💾', progress: 85 },
  { label: '帧率节流', detail: '音频可视化 30 FPS，减少 50% CPU 占用', icon: '🎯', progress: 92 },
  { label: '启动屏缓冲', detail: '精美启动动画优化用户感知速度', icon: '✨', progress: 88 },
]

const hoveredTech = ref<number | null>(null)
const hoveredPerf = ref<number | null>(null)
</script>

<template>
  <section id="tech" class="section tech-section">
    <!-- 背景 -->
    <div class="tech-bg-wrapper">
      <img src="/tech_bg_circuit.png" alt="" class="tech-bg-image" loading="lazy" />
      <div class="tech-bg-overlay"></div>
    </div>

    <div class="tech-glow-orb tech-glow-1"></div>
    <div class="tech-glow-orb tech-glow-2"></div>

    <div class="container relative-z">
      <h2 class="section-title animate-on-scroll">
        <span class="gradient-text-purple">技术</span>架构
      </h2>
      <p class="section-subtitle animate-on-scroll delay-1">
        采用业界前沿技术栈，打造高性能、高可靠的桌面应用
      </p>

      <!-- 技术栈网格 -->
      <div class="tech-grid">
        <a
          v-for="(tech, index) in techStack"
          :key="tech.name"
          :href="tech.url"
          target="_blank"
          rel="noopener noreferrer"
          class="tech-card animate-on-scroll"
          :class="'delay-' + ((index % 4) + 1)"
          :id="'tech-card-' + tech.name.toLowerCase().replace(/\s/g, '-')"
          @mouseenter="hoveredTech = index"
          @mouseleave="hoveredTech = null"
          :style="{
            '--tech-color': tech.color,
            borderColor: hoveredTech === index ? tech.color + '60' : '',
            boxShadow:
              hoveredTech === index ? `0 0 30px ${tech.color}20, 0 10px 30px rgba(0,0,0,0.3)` : '',
          }"
        >
          <div
            class="tech-icon"
            :style="{ filter: hoveredTech === index ? `drop-shadow(0 0 8px ${tech.color})` : '' }"
          >
            {{ tech.icon }}
          </div>
          <div class="tech-info">
            <div class="tech-name">
              {{ tech.name }}
              <span
                v-if="tech.version"
                class="tech-version"
                :style="{
                  background: hoveredTech === index ? tech.color + '20' : '',
                  color: hoveredTech === index ? tech.color : '',
                }"
                >v{{ tech.version }}</span
              >
            </div>
            <div class="tech-desc">{{ tech.description }}</div>
          </div>
          <div class="tech-arrow">→</div>

          <!-- 悬停高亮线条 -->
          <div
            class="tech-card-highlight"
            :style="{
              background: `linear-gradient(90deg, transparent, ${tech.color}40, transparent)`,
            }"
          ></div>
        </a>
      </div>

      <!-- 性能优化部分 -->
      <div class="perf-section animate-on-scroll">
        <h3 class="perf-title">
          <span class="gradient-text">⚡ 性能优化</span>
        </h3>
        <p class="perf-subtitle">针对海量离线音乐库的深度性能优化，打造流畅音乐播放器</p>

        <div class="perf-grid">
          <div
            v-for="(item, index) in perfItems"
            :key="item.label"
            class="perf-item animate-on-scroll"
            :class="'delay-' + ((index % 3) + 1)"
            :id="'perf-item-' + index"
            @mouseenter="hoveredPerf = index"
            @mouseleave="hoveredPerf = null"
          >
            <span class="perf-icon" :class="{ 'perf-icon-active': hoveredPerf === index }">{{
              item.icon
            }}</span>
            <div class="perf-content">
              <strong>{{ item.label }}</strong>
              <span>{{ item.detail }}</span>
              <!-- 动态进度条 -->
              <div class="perf-progress-bar">
                <div
                  class="perf-progress-fill"
                  :style="{
                    width: hoveredPerf === index ? item.progress + '%' : '0%',
                  }"
                >
                  <span class="perf-progress-glow"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tech-section {
  position: relative;
  overflow: hidden;
  padding: 8rem 0;
}

.tech-bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: var(--z-background);
}

.tech-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  mix-blend-mode: screen;
}

.tech-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    var(--color-bg-primary) 0%,
    rgba(10, 14, 26, 0.4) 25%,
    rgba(10, 14, 26, 0.4) 75%,
    var(--color-bg-primary) 100%
  );
}

.tech-glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}

.tech-glow-1 {
  width: 600px;
  height: 600px;
  background: rgba(124, 77, 255, 0.1);
  top: -10%;
  right: -5%;
  animation: float 15s ease-in-out infinite;
}

.tech-glow-2 {
  width: 500px;
  height: 500px;
  background: rgba(0, 229, 255, 0.08);
  bottom: -10%;
  left: -10%;
  animation: float 12s ease-in-out infinite reverse;
}

.relative-z {
  position: relative;
  z-index: var(--z-base);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-16);
}

.tech-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5);
  background: rgba(15, 20, 40, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  color: var(--color-text-primary) !important;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.tech-card:hover {
  transform: translateY(-5px);
}

.tech-card-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tech-card:hover .tech-card-highlight {
  opacity: 1;
}

.tech-icon {
  font-size: 2rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.tech-info {
  flex: 1;
  min-width: 0;
}

.tech-name {
  font-size: var(--text-base);
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.tech-version {
  font-size: var(--text-xs);
  color: var(--color-accent-teal);
  font-weight: 600;
  padding: 2px 8px;
  background: rgba(29, 233, 182, 0.1);
  border-radius: var(--radius-full);
  transition: all 0.3s ease;
}

.tech-desc {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: 3px;
}

.tech-arrow {
  font-size: var(--text-lg);
  color: var(--color-text-tertiary);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  flex-shrink: 0;
  opacity: 0;
}

.tech-card:hover .tech-arrow {
  color: var(--color-accent-cyan);
  transform: translateX(6px);
  opacity: 1;
}

/* 性能优化 */
.perf-section {
  padding: var(--space-12);
  background: rgba(15, 20, 40, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-2xl);
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
}

.perf-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 229, 255, 0.3),
    rgba(124, 77, 255, 0.3),
    transparent
  );
}

.perf-title {
  font-size: var(--text-3xl);
  font-weight: 900;
  text-align: center;
  margin-bottom: var(--space-2);
}

.perf-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-tertiary);
  text-align: center;
  margin-bottom: var(--space-10);
}

.perf-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.perf-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-lg);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: default;
}

.perf-item:hover {
  background: rgba(0, 229, 255, 0.04);
  border-color: rgba(0, 229, 255, 0.15);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.perf-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.3s ease;
}

.perf-icon-active {
  transform: scale(1.2);
  filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.4));
}

.perf-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.perf-content strong {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text-primary);
}

.perf-content span {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: 1.5;
}

.perf-progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.perf-progress-fill {
  height: 100%;
  background: var(--gradient-accent);
  border-radius: 2px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.perf-progress-glow {
  position: absolute;
  right: 0;
  top: -2px;
  width: 6px;
  height: 7px;
  background: var(--color-accent-cyan);
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--color-accent-cyan),
    0 0 20px rgba(0, 229, 255, 0.3);
}

@media (max-width: 1024px) {
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .perf-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }

  .perf-section {
    padding: var(--space-6);
  }
}
</style>
