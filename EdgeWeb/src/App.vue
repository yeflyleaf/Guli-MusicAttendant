<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import DownloadSection from './components/DownloadSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import FooterSection from './components/FooterSection.vue'
import HeroSection from './components/HeroSection.vue'
import I18nSection from './components/I18nSection.vue'
import NavBar from './components/NavBar.vue'
import PreviewSection from './components/PreviewSection.vue'
import TechSection from './components/TechSection.vue'

let observer: IntersectionObserver | null = null

// 鼠标发光拖尾
const cursorX = ref(0)
const cursorY = ref(0)
const cursorVisible = ref(false)

let isCursorTicking = false
const handleCursorMove = (e: MouseEvent) => {
  if (!isCursorTicking) {
    window.requestAnimationFrame(() => {
      cursorX.value = e.clientX
      cursorY.value = e.clientY
      cursorVisible.value = true
      isCursorTicking = false
    })
    isCursorTicking = true
  }
}

const handleCursorLeave = () => {
  cursorVisible.value = false
}

onMounted(() => {
  // 用于滚动动画的 Intersection Observer
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    },
  )

  // 观察所有需要滚动动画的元素
  const animElements = document.querySelectorAll('.animate-on-scroll')
  animElements.forEach((el) => observer?.observe(el))

  // 鼠标发光效果
  window.addEventListener('mousemove', handleCursorMove)
  document.addEventListener('mouseleave', handleCursorLeave)
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('mousemove', handleCursorMove)
  document.removeEventListener('mouseleave', handleCursorLeave)
})
</script>

<template>
  <div class="app">
    <!-- ========= 全局流光效果 ========= -->
    <!-- 贯穿全页面的对角线流光束 -->
    <div class="flow-light-container">
      <div class="flow-beam flow-beam-1"></div>
      <div class="flow-beam flow-beam-2"></div>
      <div class="flow-beam flow-beam-3"></div>
      <div class="flow-beam flow-beam-4"></div>
      <div class="flow-beam flow-beam-5"></div>
    </div>

    <!-- 水平飘动的极光缎带 -->
    <div class="aurora-container">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
    </div>

    <!-- 鼠标发光效果 -->
    <div
      class="cursor-glow"
      :class="{ visible: cursorVisible }"
      :style="{
        transform: `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`,
      }"
    ></div>

    <NavBar />
    <main>
      <HeroSection />

      <!-- 流光分隔线 1 -->
      <div class="flow-divider">
        <div class="flow-divider-line"></div>
        <div class="flow-divider-dot"></div>
      </div>

      <FeaturesSection />

      <!-- 流光分隔线 2 -->
      <div class="flow-divider flow-divider-purple">
        <div class="flow-divider-line"></div>
        <div class="flow-divider-dot"></div>
      </div>

      <PreviewSection />

      <!-- 流光分隔线 3 -->
      <div class="flow-divider">
        <div class="flow-divider-line"></div>
        <div class="flow-divider-dot"></div>
      </div>

      <TechSection />

      <!-- 流光分隔线 4 -->
      <div class="flow-divider flow-divider-purple">
        <div class="flow-divider-line"></div>
        <div class="flow-divider-dot"></div>
      </div>

      <I18nSection />

      <!-- 流光分隔线 5 -->
      <div class="flow-divider">
        <div class="flow-divider-line"></div>
        <div class="flow-divider-dot"></div>
      </div>

      <DownloadSection />
    </main>
    <FooterSection />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

main {
  position: relative;
}

/* ================================================
   GLOBAL FLOWING LIGHT BEAMS (全局对角线流光)
   ================================================ */
.flow-light-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.flow-beam {
  position: absolute;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 229, 255, 0) 10%,
    rgba(0, 229, 255, 0.15) 50%,
    rgba(0, 229, 255, 0) 90%,
    transparent 100%
  );
  opacity: 0;
  animation: beam-flow linear infinite;
}

/* 每束光具有不同的位置、大小、速度和延迟 */
.flow-beam-1 {
  left: 10%;
  height: 30vh;
  animation-duration: 8s;
  animation-delay: 0s;
  transform: rotate(15deg);
}

.flow-beam-2 {
  left: 35%;
  height: 25vh;
  animation-duration: 12s;
  animation-delay: -3s;
  transform: rotate(-8deg);
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(124, 77, 255, 0) 10%,
    rgba(124, 77, 255, 0.12) 50%,
    rgba(124, 77, 255, 0) 90%,
    transparent 100%
  );
}

.flow-beam-3 {
  left: 60%;
  height: 35vh;
  animation-duration: 10s;
  animation-delay: -1s;
  transform: rotate(5deg);
}

.flow-beam-4 {
  left: 80%;
  height: 20vh;
  animation-duration: 14s;
  animation-delay: -6s;
  transform: rotate(-12deg);
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(29, 233, 182, 0) 10%,
    rgba(29, 233, 182, 0.1) 50%,
    rgba(29, 233, 182, 0) 90%,
    transparent 100%
  );
}

.flow-beam-5 {
  left: 50%;
  height: 28vh;
  animation-duration: 16s;
  animation-delay: -8s;
  transform: rotate(20deg);
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255, 128, 171, 0) 10%,
    rgba(255, 128, 171, 0.08) 50%,
    rgba(255, 128, 171, 0) 90%,
    transparent 100%
  );
}

@keyframes beam-flow {
  0% {
    top: -35vh;
    opacity: 0;
  }

  5% {
    opacity: 1;
  }

  95% {
    opacity: 1;
  }

  100% {
    top: 120vh;
    opacity: 0;
  }
}

/* ================================================
   AURORA RIBBONS (极光飘带)
   ================================================ */
.aurora-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.aurora {
  position: absolute;
  width: 200%;
  height: 2px;
  opacity: 0.5;
  filter: blur(1px);
  animation: aurora-drift ease-in-out infinite alternate;
}

.aurora-1 {
  top: 25%;
  left: -50%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 229, 255, 0),
    rgba(0, 229, 255, 0.25),
    rgba(29, 233, 182, 0.25),
    rgba(29, 233, 182, 0),
    transparent
  );
  animation-duration: 20s;
  background-size: 200% 100%;
  animation-name: aurora-drift, aurora-shimmer;
}

.aurora-2 {
  top: 55%;
  left: -30%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(124, 77, 255, 0),
    rgba(124, 77, 255, 0.2),
    rgba(179, 136, 255, 0.2),
    rgba(179, 136, 255, 0),
    transparent
  );
  animation-duration: 25s;
  animation-delay: -5s;
  background-size: 200% 100%;
  animation-name: aurora-drift-reverse, aurora-shimmer;
}

.aurora-3 {
  top: 80%;
  left: -40%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 229, 255, 0),
    rgba(0, 229, 255, 0.15),
    rgba(255, 128, 171, 0.15),
    rgba(255, 128, 171, 0),
    transparent
  );
  animation-duration: 22s;
  animation-delay: -10s;
  background-size: 200% 100%;
  animation-name: aurora-drift, aurora-shimmer;
}

@keyframes aurora-drift {
  0% {
    transform: translateX(-10%) rotate(-0.5deg);
  }

  100% {
    transform: translateX(10%) rotate(0.5deg);
  }
}

@keyframes aurora-drift-reverse {
  0% {
    transform: translateX(10%) rotate(0.5deg);
  }

  100% {
    transform: translateX(-10%) rotate(-0.5deg);
  }
}

@keyframes aurora-shimmer {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 200% 50%;
  }
}

/* ================================================
   SECTION FLOW DIVIDERS (章节流光分隔器)
   ================================================ */
.flow-divider {
  position: relative;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.flow-divider-line {
  width: 100%;
  max-width: 600px;
  height: 1px;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.flow-divider-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 229, 255, 0.6),
    rgba(29, 233, 182, 0.6),
    transparent
  );
  animation: divider-flow 4s ease-in-out infinite;
}

.flow-divider-purple .flow-divider-line::before {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(124, 77, 255, 0.6),
    rgba(179, 136, 255, 0.6),
    transparent
  );
}

@keyframes divider-flow {
  0% {
    left: -50%;
  }

  100% {
    left: 100%;
  }
}

.flow-divider-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 229, 255, 0.4);
  box-shadow:
    0 0 10px rgba(0, 229, 255, 0.4),
    0 0 20px rgba(0, 229, 255, 0.2);
  animation: dot-pulse 3s ease-in-out infinite;
}

.flow-divider-purple .flow-divider-dot {
  background: rgba(124, 77, 255, 0.4);
  box-shadow:
    0 0 10px rgba(124, 77, 255, 0.4),
    0 0 20px rgba(124, 77, 255, 0.2);
}

@keyframes dot-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.8);
    opacity: 1;
  }
}

/* ================================================
   CURSOR GLOW (鼠标发光效果)
   ================================================ */
.cursor-glow {
  position: fixed;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.04) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.5s ease;
  opacity: 0;
  will-change: transform;
}

.cursor-glow.visible {
  opacity: 1;
}
</style>
