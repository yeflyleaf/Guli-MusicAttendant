<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const particles = ref<
  { id: number; x: number; y: number; size: number; duration: number; delay: number }[]
>([])
const mouseX = ref(0)
const mouseY = ref(0)
let isTicking = false

const handleMouseMove = (e: MouseEvent) => {
  if (!isTicking) {
    window.requestAnimationFrame(() => {
      mouseX.value = (e.clientX / window.innerWidth) * 2 - 1
      mouseY.value = (e.clientY / window.innerHeight) * 2 - 1
      isTicking = false
    })
    isTicking = true
  }
}

onMounted(() => {
  const arr = []
  for (let i = 0; i < 60; i++) {
    arr.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    })
  }
  particles.value = arr

  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <section id="hero" class="hero">
    <!-- 背景图层 -->
    <div class="hero-bg" :style="{ transform: `translate(${mouseX * -10}px, ${mouseY * -10}px) scale(1.05)` }">
      <img src="/hero_bg_dynamic.png" alt="" class="hero-bg-image" loading="eager" />
      <div class="hero-bg-overlay"></div>
    </div>

    <!-- 悬浮光球 -->
    <div class="orb orb-1" :style="{ transform: `translate(${mouseX * 30}px, ${mouseY * 30}px)` }"></div>
    <div class="orb orb-2" :style="{ transform: `translate(${mouseX * -40}px, ${mouseY * -40}px)` }"></div>
    <div class="orb orb-3" :style="{ transform: `translate(${mouseX * 50}px, ${mouseY * -20}px)` }"></div>
    <div class="orb orb-4" :style="{ transform: `translate(${mouseX * -20}px, ${mouseY * 50}px)` }"></div>

    <!-- 星光粒子 -->
    <div class="particles-container" :style="{ transform: `translate(${mouseX * 20}px, ${mouseY * 20}px)` }">
      <span v-for="p in particles" :key="p.id" class="particle" :style="{
        left: p.x + '%',
        top: p.y + '%',
        width: p.size + 'px',
        height: p.size + 'px',
        animationDuration: p.duration + 's',
        animationDelay: p.delay + 's',
      }"></span>
    </div>

    <!-- 内容区域 -->
    <div class="hero-content container" :style="{ transform: `translate(${mouseX * -5}px, ${mouseY * -5}px)` }">
      <h1 class="hero-title animate-on-scroll delay-1">
        <span class="hero-title-line">故里</span>
        <span class="hero-title-accent gradient-text">音乐助手</span>
      </h1>

      <p class="hero-description animate-on-scroll delay-2">
        基于 Electron + Vue 3 构建的现代化本地离线音乐播放器<br />
        优雅管理本地库，支持离线音乐播放，为您提供沉浸式聆听体验
      </p>

      <div class="hero-actions animate-on-scroll delay-3">
        <a href="https://github.com/yeflyleaf/Guli-MusicAttendant/releases/latest/download/GL_Music.Setup.exe"
          class="btn btn-primary btn-lg btn-glow" id="hero-download-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          立即下载
        </a>
        <a href="https://github.com/yeflyleaf/Guli-MusicAttendant" target="_blank" rel="noopener noreferrer"
          class="btn btn-secondary btn-lg btn-glow-subtle" id="hero-github-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          查看源码
        </a>
      </div>

      <div class="hero-stats animate-on-scroll delay-4">
        <div class="stat-item">
          <span class="stat-value gradient-text">6</span>
          <span class="stat-label">支持语言</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value gradient-text">3</span>
          <span class="stat-label">运行平台</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value gradient-text">100%</span>
          <span class="stat-label">离线运行</span>
        </div>
      </div>
    </div>

    <!-- 滚动指示器 -->
    <div class="scroll-indicator">
      <div class="scroll-line"></div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding-top: var(--nav-height);
}

/* 背景 */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: var(--z-background);
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  mix-blend-mode: screen;
}

.hero-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      rgba(10, 14, 26, 0.1) 0%,
      rgba(10, 14, 26, 0.4) 50%,
      var(--color-bg-primary) 100%);
}

/* 悬浮光球 */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: float 8s ease-in-out infinite;
  z-index: 0;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: rgba(0, 229, 255, 0.15);
  top: 5%;
  right: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: rgba(124, 77, 255, 0.15);
  bottom: 15%;
  left: 5%;
  animation-delay: -2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: rgba(29, 233, 182, 0.12);
  top: 45%;
  left: 25%;
  animation-delay: -4s;
}

.orb-4 {
  width: 300px;
  height: 300px;
  background: rgba(255, 128, 171, 0.1);
  bottom: 25%;
  right: 20%;
  animation-delay: -1s;
}

/* 粒子效果 */
.particles-container {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.particle {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.3);
  animation: pulse-glow ease-in-out infinite;
}

/* 内容区域 */
.hero-content {
  position: relative;
  z-index: var(--z-base);
  text-align: center;
  padding: var(--space-16) 0;
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.hero-badge:hover {
  background: var(--color-bg-glass-hover);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 229, 255, 0.2);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent-teal);
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
  box-shadow: 0 0 10px var(--color-accent-teal);
}

.hero-title {
  font-size: var(--text-7xl);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: var(--space-6);
  letter-spacing: -0.03em;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.hero-title-line {
  display: block;
  color: var(--color-text-primary);
}

.hero-title-accent {
  display: block;
  font-size: 1.15em;
  filter: drop-shadow(0 0 15px rgba(0, 229, 255, 0.3));
}

.hero-description {
  font-size: var(--text-xl);
  color: var(--color-text-secondary);
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto var(--space-10);
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.hero-actions {
  display: flex;
  gap: var(--space-6);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-16);
}

.btn-glow {
  position: relative;
  overflow: hidden;
}

.btn-glow::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.5s ease-out;
}

.btn-glow:hover::after {
  opacity: 1;
  transform: scale(1);
  transition: all 0.1s ease-out;
}

.btn-glow-subtle:hover {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

/* 统计数据 */
.hero-stats {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-5) var(--space-10);
  background: rgba(15, 20, 40, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.hero-stats:hover {
  background: rgba(15, 20, 40, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
  box-shadow: 0 15px 50px rgba(0, 229, 255, 0.15);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: scale(1.05);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 800;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
}

/* 滚动指示器 */
.scroll-indicator {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.scroll-line {
  width: 1px;
  height: 60px;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.scroll-line::after {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom,
      transparent,
      var(--color-accent-cyan),
      var(--color-accent-teal));
  animation: scroll-down 2s ease-in-out infinite;
}

@keyframes scroll-down {
  0% {
    top: -50%;
  }

  100% {
    top: 100%;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-5xl);
  }

  .hero-description {
    font-size: var(--text-base);
    padding: 0 var(--space-4);
  }

  .hero-stats {
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-6);
  }

  .stat-divider {
    width: 60px;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .orb {
    display: none;
  }
}
</style>
