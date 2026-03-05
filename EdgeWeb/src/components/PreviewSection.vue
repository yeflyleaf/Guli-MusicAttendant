<script setup lang="ts">
import { ref } from 'vue'

const frameRef = ref<HTMLElement | null>(null)
const isHovering = ref(false)
const rotateX = ref(0)
const rotateY = ref(0)

const handleFrameMouseMove = (e: MouseEvent) => {
  if (!frameRef.value) return
  const rect = frameRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  rotateX.value = ((y - centerY) / centerY) * -4
  rotateY.value = ((x - centerX) / centerX) * 4
  isHovering.value = true
}

const handleFrameMouseLeave = () => {
  rotateX.value = 0
  rotateY.value = 0
  isHovering.value = false
}

// 悬浮高亮指示器
const highlightItems = [
  { icon: '🔍', title: '智能扫描', desc: '自动解析音频元数据，一键导入音乐库', id: 'smart-scan' },
  {
    icon: '🎤',
    title: '沉浸歌词',
    desc: 'LRC 歌词同步滚动，视觉化音乐享受',
    id: 'immersive-lyrics',
  },
  { icon: '🖥️', title: '迷你模式', desc: '小窗播放器，轻量化使用不占空间', id: 'mini-player' },
]
</script>

<template>
  <section id="preview" class="section preview-section">
    <!-- 背景 -->
    <div class="preview-bg-wrapper">
      <img src="/preview_bg_gradient.png" alt="" class="preview-bg-image" loading="lazy" />
      <div class="preview-bg-overlay"></div>
    </div>

    <!-- 动态发光球 -->
    <div class="preview-orb preview-orb-1"></div>
    <div class="preview-orb preview-orb-2"></div>

    <div class="container relative-z">
      <h2 class="section-title animate-on-scroll">应用<span class="gradient-text">预览</span></h2>
      <p class="section-subtitle animate-on-scroll delay-1">
        沉浸式暗色界面，玻璃拟态设计，感受次世代桌面音乐体验
      </p>

      <div class="preview-showcase animate-on-scroll delay-2">
        <div class="preview-frame" ref="frameRef" @mousemove="handleFrameMouseMove" @mouseleave="handleFrameMouseLeave"
          :style="{
            transform: `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovering ? 1.02 : 1})`,
          }">
          <!-- 窗口标题栏 -->
          <div class="preview-titlebar">
            <div class="titlebar-dots">
              <span class="dot dot-close"></span>
              <span class="dot dot-minimize"></span>
              <span class="dot dot-maximize"></span>
            </div>
            <span class="titlebar-title">故里音乐助手</span>
            <div class="titlebar-spacer"></div>
          </div>
          <!-- 截图展示 -->
          <div class="preview-image-wrapper">
            <img src="/screenshot-home.png" alt="故里音乐助手主界面 - 展示主页、最近播放、播放控制栏" class="preview-image" loading="lazy" />
            <div class="image-shine" :class="{ active: isHovering }"></div>
          </div>
        </div>
        <!-- 边框背后的发光效果 -->
        <div class="preview-glow" :class="{ intensified: isHovering }"></div>


      </div>

      <!-- 截图下方的功能亮点 -->
      <div class="preview-highlights">
        <div v-for="(item, index) in highlightItems" :key="item.id" class="highlight-item animate-on-scroll"
          :class="'delay-' + (index + 3)" :id="'highlight-' + item.id">
          <div class="highlight-icon-wrapper">
            <div class="highlight-icon">{{ item.icon }}</div>
            <div class="highlight-ring"></div>
          </div>
          <div class="highlight-content">
            <h4>{{ item.title }}</h4>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.preview-section {
  position: relative;
  overflow: hidden;
  padding: 8rem 0;
}

.preview-bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: var(--z-background);
}

.preview-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  mix-blend-mode: screen;
}

.preview-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      var(--color-bg-primary) 0%,
      rgba(10, 14, 26, 0.3) 30%,
      rgba(10, 14, 26, 0.3) 70%,
      var(--color-bg-primary) 100%);
}

.preview-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  pointer-events: none;
}

.preview-orb-1 {
  width: 500px;
  height: 500px;
  background: rgba(124, 77, 255, 0.12);
  top: 10%;
  left: -5%;
  animation: float 12s ease-in-out infinite;
}

.preview-orb-2 {
  width: 400px;
  height: 400px;
  background: rgba(0, 229, 255, 0.1);
  bottom: 10%;
  right: -5%;
  animation: float 10s ease-in-out infinite reverse;
}

.relative-z {
  position: relative;
  z-index: var(--z-base);
}

.preview-showcase {
  position: relative;
  max-width: 960px;
  margin: 0 auto var(--space-16);
}

.preview-frame {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--color-bg-secondary);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  z-index: var(--z-base);
  transition:
    transform 0.15s ease,
    box-shadow 0.3s ease;
  will-change: transform;
}

.preview-frame:hover {
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(0, 229, 255, 0.1);
}

.preview-titlebar {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: rgba(15, 20, 40, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.titlebar-dots {
  display: flex;
  gap: var(--space-2);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.dot:hover {
  transform: scale(1.2);
}

.dot-close {
  background: #ff5f57;
  box-shadow: 0 0 6px rgba(255, 95, 87, 0.4);
}

.dot-minimize {
  background: #febc2e;
  box-shadow: 0 0 6px rgba(254, 188, 46, 0.4);
}

.dot-maximize {
  background: #28c840;
  box-shadow: 0 0 6px rgba(40, 200, 64, 0.4);
}

.titlebar-title {
  flex: 1;
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.titlebar-spacer {
  width: 52px;
}

.preview-image-wrapper {
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  display: block;
  transition: transform 0.5s ease;
}

.preview-frame:hover .preview-image {
  transform: scale(1.01);
}

.image-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  transform: skewX(-15deg);
  transition: left 0.6s ease;
  pointer-events: none;
}

.image-shine.active {
  left: 150%;
}

.preview-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110%;
  height: 110%;
  background: radial-gradient(ellipse at center,
      rgba(0, 229, 255, 0.1) 0%,
      rgba(124, 77, 255, 0.08) 40%,
      transparent 70%);
  z-index: 0;
  pointer-events: none;
  filter: blur(60px);
  transition: all 0.5s ease;
}

.preview-glow.intensified {
  filter: blur(40px);
  background: radial-gradient(ellipse at center,
      rgba(0, 229, 255, 0.18) 0%,
      rgba(124, 77, 255, 0.12) 40%,
      transparent 70%);
}



/* 功能亮点 */
.preview-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-6);
  background: rgba(15, 20, 40, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.highlight-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.highlight-item:hover::before {
  opacity: 1;
}

.highlight-item:hover {
  background: rgba(15, 20, 40, 0.7);
  border-color: rgba(0, 229, 255, 0.15);
  transform: translateY(-5px);
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 229, 255, 0.05);
}

.highlight-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.highlight-icon {
  font-size: 1.75rem;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 229, 255, 0.08);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 229, 255, 0.15);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.highlight-item:hover .highlight-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
}

.highlight-ring {
  position: absolute;
  inset: -4px;
  border-radius: var(--radius-lg);
  border: 2px solid rgba(0, 229, 255, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
  animation: ring-pulse 2s ease-in-out infinite;
}

.highlight-item:hover .highlight-ring {
  opacity: 1;
}

@keyframes ring-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.1);
    opacity: 0;
  }
}

.highlight-content h4 {
  font-size: var(--text-lg);
  font-weight: 800;
  margin-bottom: var(--space-1);
  color: var(--color-text-primary);
}

.highlight-content p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .preview-highlights {
    grid-template-columns: 1fr;
  }


}
</style>
