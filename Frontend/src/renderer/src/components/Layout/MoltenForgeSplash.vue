<template>
  <Transition name="inferno-fade">
    <div v-if="visible" class="molten-splash" ref="splashContainer">
      <!-- 第0层 - 活火山剪影与岩浆河 -->
      <div class="volcanic-bg">
        <div class="apocalypse-sky"></div>
        <!-- 火山群剪影 -->
        <div class="volcano-silhouettes">
          <div class="volcano volcano-1"></div>
          <div class="volcano volcano-2"></div>
          <div class="volcano volcano-3"></div>
        </div>
        <!-- 岩浆河 -->
        <div class="lava-rivers">
          <div class="lava-river river-1"></div>
          <div class="lava-river river-2"></div>
          <div class="lava-river river-3"></div>
        </div>
        <!-- 火山呼吸闪光 -->
        <div class="volcanic-pulse"></div>
      </div>

      <!-- 第1层 - Canvas 粒子系统：飞溅火星与火山灰 -->
      <canvas ref="emberCanvas" class="ember-canvas"></canvas>

      <!-- 第2层 - 浓烟滚滚 -->
      <div class="rolling-smoke">
        <div class="smoke-cloud smoke-1"></div>
        <div class="smoke-cloud smoke-2"></div>
        <div class="smoke-cloud smoke-3"></div>
        <div class="smoke-cloud smoke-4"></div>
      </div>

      <!-- 第3层 - 陨石雨 -->
      <div class="meteor-shower">
        <div v-for="meteor in meteors" :key="meteor.id" class="meteor" :style="meteor.style">
          <div class="meteor-head"></div>
          <div class="meteor-trail"></div>
        </div>
      </div>

      <!-- 第4层 - 装饰性地貌 -->
      <div class="geological-debris" ref="debrisContainer">
        <!-- 玄武岩柱 -->
        <div class="basalt-columns">
          <div class="column column-1">
            <div class="column-body"></div>
            <div class="column-lava"></div>
          </div>
          <div class="column column-2">
            <div class="column-body"></div>
            <div class="column-lava"></div>
          </div>
          <div class="column column-3">
            <div class="column-body"></div>
          </div>
        </div>
        <!-- 浮空碎石 -->
        <div class="floating-rocks">
          <div class="rock floating-rock-1"></div>
          <div class="rock floating-rock-2"></div>
          <div class="rock floating-rock-3"></div>
        </div>
        <!-- 撞击坑 -->
        <div class="impact-craters">
          <div class="crater crater-1">
            <div class="crater-heat"></div>
          </div>
          <div class="crater crater-2">
            <div class="crater-heat"></div>
          </div>
        </div>
      </div>

      <!-- 主内容 - 裂变黑曜石面板 -->
      <div class="obsidian-panel" :class="{ 'tectonic-shake': isErupting }" ref="obsidianPanel">
        <div class="panel-cracks">
          <div class="crack crack-1"></div>
          <div class="crack crack-2"></div>
          <div class="crack crack-3"></div>
          <div class="crack crack-4"></div>
        </div>
        <div class="panel-texture"></div>
        <div class="panel-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 100 100" class="forge-icon">
                <defs>
                  <linearGradient id="moltenGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style="stop-color:#fef08a;stop-opacity:1" />
                    <stop offset="40%" style="stop-color:#ff8800;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <!-- 音符与熔岩结合的图标 -->
                <circle cx="25" cy="72" r="10" fill="url(#moltenGradient)" filter="url(#glow)" class="note-base" />
                <circle cx="62" cy="65" r="10" fill="url(#moltenGradient)" filter="url(#glow)"
                  class="note-base delay" />
                <rect x="33" y="22" width="3" height="50" fill="url(#moltenGradient)" filter="url(#glow)"
                  class="note-stem" />
                <rect x="70" y="18" width="3" height="47" fill="url(#moltenGradient)" filter="url(#glow)"
                  class="note-stem delay" />
                <path d="M 36 22 Q 53 12 73 18" stroke="url(#moltenGradient)" stroke-width="3" fill="none"
                  filter="url(#glow)" class="note-beam" />
              </svg>
            </div>
            <div class="logo-heat-aura"></div>
            <div class="logo-sparks">
              <span v-for="n in 12" :key="n" class="spark" :style="{ '--i': n }"></span>
            </div>
          </div>

          <!-- 应用名称 - 熔岩金属渐变 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.1}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 -->
          <div class="loading-indicator">
            <div class="loading-bar">
              <div class="loading-lava"></div>
              <div class="loading-glow"></div>
            </div>
            <p class="loading-text">{{ loadingText }}</p>
          </div>
        </div>

        <!-- 裂缝光效边框 -->
        <div class="lava-glow" :class="{ active: isErupting }"></div>
        <!-- 热浪扭曲效果 -->
        <div class="heat-haze"></div>
      </div>

      <!-- 巨型陨石撞击效果（最终动画） -->
      <div class="cataclysmic-impact" :class="{ active: isImpacting }" ref="impactLayer">
        <div class="mega-meteor"></div>
        <div class="shockwave"></div>
        <div class="thermal-engulf"></div>
      </div>

      <!-- 底部信息 -->
      <div class="splash-footer">
        <p class="version">v1.0.0</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'finished'): void
}>()

const visible = ref(true)
const isErupting = ref(false)
const isImpacting = ref(false)
const emberCanvas = ref<HTMLCanvasElement | null>(null)
const splashContainer = ref<HTMLElement | null>(null)
const debrisContainer = ref<HTMLElement | null>(null)
const obsidianPanel = ref<HTMLElement | null>(null)

// 应用名称
const appNameChars = '故里音乐助手'.split('')

// 加载文字
const loadingTexts = ['锻造核心引擎...', '熔炼音频模块...', '释放熔岩能量...', '准备毁灭重生...']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

let loadingTextInterval: number | null = null
let animationFrameId: number | null = null

// 火星与灰烬粒子
interface Ember {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  brightness: number
  brightnessSpeed: number
  type: 'ember' | 'ash'
  color: string
  life: number
  maxLife: number
}

let embers: Ember[] = []
let time = 0

// 生成陨石数据
const random = (min: number, max: number) => Math.random() * (max - min) + min
const meteors = Array.from({ length: 8 }, (_, i) => {
  return {
    id: i,
    style: {
      left: `${random(0, 100)}%`,
      top: `${random(-20, -5)}%`,
      animationDelay: `${random(0, 5)}s`,
      animationDuration: `${random(1.5, 3)}s`,
      '--meteor-angle': `${random(40, 60)}deg`,
      '--meteor-length': `${random(80, 200)}px`
    }
  }
})

// 初始化Canvas火星系统
const initEmberSystem = () => {
  const canvas = emberCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 创建火星和灰烬
  const emberColors = ['#ff3300', '#ff6600', '#ff8800', '#ffaa00', '#ffd700', '#ffffff']
  const ashColors = ['#4a4a4a', '#3d3d3d', '#2e2e2e', '#1f1f1f']
  const particleCount = 120

  const createParticle = (): Ember => {
    const isEmber = Math.random() > 0.3
    return {
      x: Math.random() * canvas.width,
      y: isEmber ? canvas.height + 50 : -50,
      vx: (Math.random() - 0.5) * 2,
      vy: isEmber ? -(Math.random() * 3 + 1) : Math.random() * 0.5 + 0.2,
      size: isEmber ? Math.random() * 3 + 1 : Math.random() * 5 + 3,
      brightness: Math.random(),
      brightnessSpeed: Math.random() * 0.05 + 0.02,
      type: isEmber ? 'ember' : 'ash',
      color: isEmber
        ? emberColors[Math.floor(Math.random() * emberColors.length)]
        : ashColors[Math.floor(Math.random() * ashColors.length)],
      life: 0,
      maxLife: Math.random() * 200 + 100
    }
  }

  embers = Array.from({ length: particleCount }, createParticle)

  let speedMultiplier = 1
  let intensityMultiplier = 1

  const render = () => {
    time += 0.01

    // 半透明清除，产生拖尾效果
    ctx.fillStyle = 'rgba(16, 5, 5, 0.15)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    embers.forEach((particle, index) => {
      particle.life++

      // 火星：向上升腾并左右摇摆
      if (particle.type === 'ember') {
        particle.vx += Math.sin(time + index) * 0.1
        particle.vy -= 0.02 * speedMultiplier
        particle.x += particle.vx * speedMultiplier
        particle.y += particle.vy * speedMultiplier

        // 呼吸灯效果
        particle.brightness = 0.5 + Math.sin(time * particle.brightnessSpeed * 10 + index) * 0.5

        // 边缘熄灭
        if (particle.y < 0 || particle.life > particle.maxLife) {
          Object.assign(particle, createParticle())
          particle.type = 'ember'
          particle.y = canvas.height + 50
        }
      } else {
        // 灰烬：缓慢飘落
        particle.vx += Math.sin(time * 0.5 + index) * 0.02
        particle.x += particle.vx
        particle.y += particle.vy * speedMultiplier

        if (particle.y > canvas.height || particle.life > particle.maxLife) {
          Object.assign(particle, createParticle())
          particle.type = 'ash'
          particle.y = -50
        }
      }

      // 边界循环
      if (particle.x < 0) particle.x = canvas.width
      if (particle.x > canvas.width) particle.x = 0

      // 绘制粒子
      if (speedMultiplier > 5 && particle.type === 'ember') {
        // 高速模式 - 拉长成火焰线
        const lineLength = speedMultiplier * 2
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y + lineLength * 5)
        ctx.lineTo(particle.x, particle.y)
        const gradient = ctx.createLinearGradient(particle.x, particle.y + lineLength * 5, particle.x, particle.y)
        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.3, particle.color)
        gradient.addColorStop(1, '#fff')
        ctx.strokeStyle = gradient
        ctx.lineWidth = particle.size * 0.8
        ctx.globalAlpha = particle.brightness * intensityMultiplier
        ctx.stroke()
      } else {
        // 常规模式 - 绘制发光点
        const glowSize = particle.type === 'ember' ? particle.size * 4 : particle.size
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, glowSize)

        if (particle.type === 'ember') {
          gradient.addColorStop(0, '#ffffff')
          gradient.addColorStop(0.2, particle.color)
          gradient.addColorStop(1, 'transparent')
        } else {
          gradient.addColorStop(0, particle.color)
          gradient.addColorStop(1, 'transparent')
        }

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.globalAlpha = particle.type === 'ember' ? particle.brightness * intensityMultiplier : 0.3
        ctx.fill()
      }
      ctx.globalAlpha = 1
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  // 返回控制函数
  return {
    setSpeed: (speed: number) => { speedMultiplier = speed },
    setIntensity: (intensity: number) => { intensityMultiplier = intensity }
  }
}

let emberControls: { setSpeed: (speed: number) => void; setIntensity: (intensity: number) => void } | null = null

// 触发末日撞击动画
const triggerCataclysm = () => {
  isErupting.value = true
  const eruptionDuration = 1500  // 1.5秒撞击动画

  // 1. 火星加速喷发
  const startTime = Date.now()
  const accelerate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / eruptionDuration, 1)
    const easeProgress = progress === 0 ? 0 : Math.pow(2, 10 * progress - 10)
    const speed = 1 + easeProgress * 30
    const intensity = 1 + easeProgress * 2
    emberControls?.setSpeed(speed)
    emberControls?.setIntensity(intensity)

    if (progress < 1) {
      requestAnimationFrame(accelerate)
    }
  }
  accelerate()

  // 2. 浓烟消散
  const smokeClouds = splashContainer.value?.querySelectorAll('.smoke-cloud')
  smokeClouds?.forEach((smoke, i) => {
    const el = smoke as HTMLElement
    el.style.transition = `all ${eruptionDuration / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`
    el.style.opacity = '0'
    el.style.transform = `translateY(${-200 - i * 50}px) scale(2)`
  })

  // 3. 地貌碎石飞散
  const debris = debrisContainer.value?.querySelectorAll('.column, .rock, .crater')
  debris?.forEach((item, index) => {
    const el = item as HTMLElement
    el.style.transition = `all ${eruptionDuration / 1000}s cubic-bezier(0.55, 0.055, 0.675, 0.19)`

    const angle = (index * 60) % 360
    const distance = 300 + Math.random() * 200
    const dx = Math.cos((angle * Math.PI) / 180) * distance
    const dy = Math.sin((angle * Math.PI) / 180) * distance - 200

    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg) scale(0.5)`
    el.style.opacity = '0'
  })

  // 4. 陨石加速
  const meteorElements = splashContainer.value?.querySelectorAll('.meteor')
  meteorElements?.forEach((meteor) => {
    const el = meteor as HTMLElement
    el.style.animationDuration = '0.3s'
  })

  // 5. 火山背景增强
  const volcanicPulse = splashContainer.value?.querySelector('.volcanic-pulse') as HTMLElement
  if (volcanicPulse) {
    volcanicPulse.style.opacity = '0.8'
    volcanicPulse.style.animation = 'volcanicBreathing 0.2s ease-in-out infinite'
  }

  // 6. 黑曜石面板裂解
  if (obsidianPanel.value) {
    obsidianPanel.value.style.transition = `transform ${eruptionDuration / 1000}s ease-in`
    setTimeout(() => {
      if (obsidianPanel.value) {
        obsidianPanel.value.style.transform = 'scale(1.1)'
      }
    }, 100)
  }

  // 7. 最终撞击
  setTimeout(() => {
    isImpacting.value = true

    // 屏幕震动
    if (splashContainer.value) {
      splashContainer.value.style.animation = 'massiveShake 0.1s ease-in-out infinite'
    }

    // 黑曜石面板炸裂
    if (obsidianPanel.value) {
      obsidianPanel.value.style.transition = 'all 0.5s ease-out'
      obsidianPanel.value.style.transform = 'scale(3)'
      obsidianPanel.value.style.opacity = '0'
      obsidianPanel.value.style.filter = 'blur(20px)'
    }
  }, eruptionDuration - 500)
}

onMounted(async () => {
  // 初始化火星系统
  emberControls = initEmberSystem() || null

  // 加载文字轮换
  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 1000)

  const minDisplayTime = 1500  // 最小显示1.5秒
  const startTime = Date.now()

  // 等待数据预加载
  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[MoltenForgeSplash] Data preload finished')
    } catch (error) {
      console.error('[MoltenForgeSplash] Preload error:', error)
    }
  }

  // 如果禁用了动画，直接退出
  if (props.disabled) {
    visible.value = false
    setTimeout(() => {
      emit('finished')
    }, 500)
    return
  }

  // 确保最小显示时间
  const elapsed = Date.now() - startTime
  const remaining = Math.max(0, minDisplayTime - elapsed)

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining))
  }

  // 触发末日撞击
  triggerCataclysm()

  // 等待动画完成 (1.5秒)
  await new Promise((resolve) => setTimeout(resolve, 1500))

  visible.value = false
  console.log('[MoltenForgeSplash] Hidden after', Date.now() - startTime, 'ms')

  setTimeout(() => {
    emit('finished')
  }, 500)
})

onUnmounted(() => {
  if (loadingTextInterval) {
    clearInterval(loadingTextInterval)
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$charcoal-black: #100505;
$basalt-gray: #1a1a1a;
$lava-red: #ff3300;
$ember-orange: #ff8800;
$core-white: #fffaf0;
$sulfur-yellow: #ffd700;
$obsidian: rgba(10, 5, 5, 0.85);

.molten-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: $charcoal-black;
}

// ==================== 第0层 - 火山背景 ====================
.volcanic-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .apocalypse-sky {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 100%, #2d0a0a 0%, #1a0505 30%, $charcoal-black 70%);
    animation: skyPulse 4s ease-in-out infinite;
  }
}

@keyframes skyPulse {

  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.3);
  }
}

// 火山剪影
.volcano-silhouettes {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  pointer-events: none;
}

.volcano {
  position: absolute;
  bottom: 0;
  background: linear-gradient(to top, #0a0505 0%, #1a0a0a 100%);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 45%;
    width: 10%;
    height: 30%;
    background: radial-gradient(ellipse at center, rgba($lava-red, 0.8) 0%, transparent 70%);
    filter: blur(10px);
    animation: volcanoGlow 2s ease-in-out infinite;
  }

  &.volcano-1 {
    left: -5%;
    width: 40%;
    height: 70%;
    z-index: 1;
  }

  &.volcano-2 {
    left: 25%;
    width: 35%;
    height: 55%;
    z-index: 2;
  }

  &.volcano-3 {
    right: -10%;
    width: 50%;
    height: 80%;
    z-index: 1;
  }
}

@keyframes volcanoGlow {

  0%,
  100% {
    opacity: 0.5;
    transform: scaleY(1);
  }

  50% {
    opacity: 1;
    transform: scaleY(1.5);
  }
}

// 岩浆河
.lava-rivers {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15%;
  z-index: 3;
}

.lava-river {
  position: absolute;
  bottom: 0;
  height: 100%;
  background: linear-gradient(to top,
      rgba($lava-red, 0.9) 0%,
      rgba($ember-orange, 0.7) 30%,
      rgba($sulfur-yellow, 0.5) 60%,
      transparent 100%);
  filter: blur(2px);
  animation: lavaFlow 8s ease-in-out infinite;

  &.river-1 {
    left: 5%;
    width: 25%;
    animation-delay: 0s;
  }

  &.river-2 {
    left: 40%;
    width: 20%;
    animation-delay: 2s;
  }

  &.river-3 {
    right: 5%;
    width: 30%;
    animation-delay: 4s;
  }
}

@keyframes lavaFlow {

  0%,
  100% {
    background-position: 0% 0%;
    opacity: 0.7;
  }

  50% {
    background-position: 100% 0%;
    opacity: 1;
  }
}

// 火山呼吸脉动
.volcanic-pulse {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 100%, rgba($lava-red, 0.3) 0%, transparent 50%);
  animation: volcanicBreathing 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes volcanicBreathing {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.6;
  }
}

// ==================== 第1层 - Canvas 粒子 ====================
.ember-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

// ==================== 第2层 - 浓烟 ====================
.rolling-smoke {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.smoke-cloud {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(30, 30, 30, 0.8) 0%, transparent 70%);
  filter: blur(40px);
  animation: smokeRoll 15s ease-in-out infinite;

  &.smoke-1 {
    bottom: -10%;
    left: -10%;
    width: 500px;
    height: 300px;
    animation-delay: 0s;
  }

  &.smoke-2 {
    bottom: -5%;
    right: -15%;
    width: 600px;
    height: 350px;
    animation-delay: 3s;
  }

  &.smoke-3 {
    bottom: 5%;
    left: 20%;
    width: 400px;
    height: 250px;
    animation-delay: 6s;
  }

  &.smoke-4 {
    bottom: 0%;
    right: 10%;
    width: 450px;
    height: 280px;
    animation-delay: 9s;
  }
}

@keyframes smokeRoll {

  0%,
  100% {
    transform: translateX(0) scale(1);
    opacity: 0.6;
  }

  50% {
    transform: translateX(30px) scale(1.1);
    opacity: 0.8;
  }
}

// ==================== 第3层 - 陨石雨 ====================
.meteor-shower {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.meteor {
  position: absolute;
  transform: rotate(calc(var(--meteor-angle, 45deg)));
  animation: meteorFall 2s linear infinite;

  .meteor-head {
    width: 8px;
    height: 8px;
    background: radial-gradient(circle, $core-white 0%, $sulfur-yellow 50%, $ember-orange 100%);
    border-radius: 50%;
    box-shadow: 0 0 20px $sulfur-yellow, 0 0 40px $ember-orange;
  }

  .meteor-trail {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: var(--meteor-length, 100px);
    background: linear-gradient(to bottom, $ember-orange 0%, $lava-red 40%, rgba(20, 5, 5, 0.5) 80%, transparent 100%);
    border-radius: 0 0 2px 2px;
  }
}

@keyframes meteorFall {
  0% {
    transform: rotate(calc(var(--meteor-angle, 45deg))) translateY(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: rotate(calc(var(--meteor-angle, 45deg))) translateY(calc(100vh + 300px));
    opacity: 0;
  }
}

// ==================== 第4层 - 装饰性地貌 ====================
.geological-debris {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

// 玄武岩柱
.basalt-columns {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.column {
  position: absolute;
  bottom: 0;

  .column-body {
    background: linear-gradient(to right, #1a1a1a 0%, #2a2a2a 30%, #1a1a1a 70%, #0a0a0a 100%);
    clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);
  }

  .column-lava {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 30%;
    background: linear-gradient(to bottom, $ember-orange 0%, $lava-red 50%, transparent 100%);
    filter: blur(5px);
    animation: lavaGlow 2s ease-in-out infinite;
  }

  &.column-1 {
    left: 5%;

    .column-body {
      width: 60px;
      height: 200px;
    }
  }

  &.column-2 {
    left: 10%;

    .column-body {
      width: 50px;
      height: 150px;
    }
  }

  &.column-3 {
    right: 8%;

    .column-body {
      width: 70px;
      height: 180px;
    }
  }
}

@keyframes lavaGlow {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

// 浮空碎石
.floating-rocks {
  position: absolute;
  inset: 0;
}

.rock {
  position: absolute;
  background: linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 50%, #0a0a0a 100%);
  border-radius: 30% 70% 50% 50%;
  box-shadow: inset -5px -5px 15px rgba(0, 0, 0, 0.5), inset 2px 2px 5px rgba(100, 50, 30, 0.3);
  animation: floatRock 6s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 60%, rgba($ember-orange, 0.3) 100%);
    border-radius: inherit;
  }

  &.floating-rock-1 {
    top: 20%;
    right: 15%;
    width: 80px;
    height: 60px;
    animation-delay: 0s;
  }

  &.floating-rock-2 {
    top: 35%;
    left: 10%;
    width: 60px;
    height: 45px;
    animation-delay: 2s;
  }

  &.floating-rock-3 {
    bottom: 30%;
    right: 25%;
    width: 50px;
    height: 40px;
    animation-delay: 4s;
  }
}

@keyframes floatRock {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

// 撞击坑
.impact-craters {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.crater {
  position: absolute;
  bottom: 10%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, #0a0505 0%, #1a0a0a 50%, transparent 70%);
  transform: rotateX(70deg);

  .crater-heat {
    position: absolute;
    inset: 20%;
    border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba($lava-red, 0.8) 0%, rgba($ember-orange, 0.4) 50%, transparent 70%);
    animation: craterGlow 3s ease-in-out infinite;
  }

  &.crater-1 {
    left: 20%;
    width: 120px;
    height: 40px;
  }

  &.crater-2 {
    right: 30%;
    width: 80px;
    height: 30px;
    animation-delay: 1.5s;
  }
}

@keyframes craterGlow {

  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

// ==================== 裂变黑曜石面板 ====================
.obsidian-panel {
  position: relative;
  z-index: 10;
  padding: 48px 64px;
  background: $obsidian;
  border-radius: 16px;
  overflow: hidden;

  &.tectonic-shake {
    animation: tectonicShake 0.15s ease-in-out infinite;
  }
}

.panel-texture {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(45deg,
      transparent 0,
      transparent 20px,
      rgba(0, 0, 0, 0.1) 20px,
      rgba(0, 0, 0, 0.1) 40px);
  pointer-events: none;
}

.panel-cracks {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.crack {
  position: absolute;
  background: linear-gradient(90deg, transparent 0%, $ember-orange 50%, transparent 100%);
  filter: blur(2px);
  animation: crackPulse 2s ease-in-out infinite;

  &.crack-1 {
    top: 20%;
    left: -10%;
    width: 40%;
    height: 2px;
    transform: rotate(-15deg);
    animation-delay: 0s;
  }

  &.crack-2 {
    top: 60%;
    right: -5%;
    width: 35%;
    height: 2px;
    transform: rotate(10deg);
    animation-delay: 0.5s;
  }

  &.crack-3 {
    bottom: 25%;
    left: 10%;
    width: 30%;
    height: 2px;
    transform: rotate(-8deg);
    animation-delay: 1s;
  }

  &.crack-4 {
    top: 40%;
    right: 15%;
    width: 25%;
    height: 2px;
    transform: rotate(20deg);
    animation-delay: 1.5s;
  }
}

@keyframes crackPulse {

  0%,
  100% {
    opacity: 0.3;
    box-shadow: 0 0 10px $lava-red;
  }

  50% {
    opacity: 0.8;
    box-shadow: 0 0 20px $ember-orange, 0 0 40px $lava-red;
  }
}

@keyframes tectonicShake {

  0%,
  100% {
    transform: translateX(0) translateY(0);
  }

  25% {
    transform: translateX(-3px) translateY(1px);
  }

  50% {
    transform: translateX(3px) translateY(-1px);
  }

  75% {
    transform: translateX(-2px) translateY(2px);
  }
}

.lava-glow {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  opacity: 0.6;
  pointer-events: none;
  background: transparent;
  box-shadow:
    0 0 20px rgba($lava-red, 0.5),
    0 0 40px rgba($ember-orange, 0.3),
    inset 0 0 20px rgba($lava-red, 0.2);
  animation: lavaGlowPulse 1.5s ease-in-out infinite;

  &.active {
    opacity: 1;
    animation: lavaGlowPulse 0.3s ease-in-out infinite;
  }
}

@keyframes lavaGlowPulse {

  0%,
  100% {
    box-shadow:
      0 0 20px rgba($lava-red, 0.5),
      0 0 40px rgba($ember-orange, 0.3),
      inset 0 0 20px rgba($lava-red, 0.2);
  }

  50% {
    box-shadow:
      0 0 30px rgba($lava-red, 0.7),
      0 0 60px rgba($ember-orange, 0.5),
      0 0 90px rgba($sulfur-yellow, 0.3),
      inset 0 0 30px rgba($lava-red, 0.3);
  }
}

.heat-haze {
  position: absolute;
  bottom: -20px;
  left: -20px;
  right: -20px;
  height: 60px;
  background: linear-gradient(to top, rgba($ember-orange, 0.1) 0%, transparent 100%);
  filter: blur(10px);
  animation: heatWave 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes heatWave {

  0%,
  100% {
    transform: scaleY(1) translateY(0);
    opacity: 0.5;
  }

  50% {
    transform: scaleY(1.2) translateY(-5px);
    opacity: 0.8;
  }
}

// ==================== 面板内容 ====================
.panel-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.logo-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
}

.logo-icon {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;

  .forge-icon {
    width: 100%;
    height: 100%;

    .note-base,
    .note-stem,
    .note-beam {
      animation: forgeGlow 2s ease-in-out infinite;
    }

    .delay {
      animation-delay: 0.3s;
    }
  }
}

@keyframes forgeGlow {

  0%,
  100% {
    filter: url(#glow) brightness(1);
  }

  50% {
    filter: url(#glow) brightness(1.3);
  }
}

.logo-heat-aura {
  position: absolute;
  inset: -30%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba($ember-orange, 0.4) 0%, transparent 70%);
  animation: auraBreath 2s ease-in-out infinite;
}

@keyframes auraBreath {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.9;
  }
}

.logo-sparks {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .spark {
    position: absolute;
    width: 4px;
    height: 4px;
    background: $sulfur-yellow;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform-origin: center;
    animation: sparkFloat 3s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.25s);

    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      background: radial-gradient(circle, $ember-orange 0%, transparent 70%);
      border-radius: 50%;
    }
  }
}

@keyframes sparkFloat {

  0%,
  100% {
    transform: translate(-50%, -50%) translateX(calc(cos(calc(var(--i) * 30deg)) * 50px)) translateY(calc(sin(calc(var(--i) * 30deg)) * 50px));
    opacity: 0;
  }

  50% {
    transform: translate(-50%, -50%) translateX(calc(cos(calc(var(--i) * 30deg)) * 70px)) translateY(calc(sin(calc(var(--i) * 30deg)) * 70px - 20px));
    opacity: 1;
  }
}

// 应用名称
.app-name {
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 4px;
  margin-bottom: 24px;
  text-transform: uppercase;

  .char {
    display: inline-block;
    background: linear-gradient(to top, $sulfur-yellow 0%, $ember-orange 40%, #991b1b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: charFlicker 2s ease-in-out infinite;
    text-shadow: 0 0 20px rgba($ember-orange, 0.5);
    filter: drop-shadow(0 0 10px rgba($ember-orange, 0.5));
  }
}

@keyframes charFlicker {

  0%,
  100% {
    filter: drop-shadow(0 0 10px rgba($ember-orange, 0.5)) brightness(1);
  }

  50% {
    filter: drop-shadow(0 0 20px rgba($ember-orange, 0.8)) brightness(1.2);
  }
}

// 加载指示器
.loading-indicator {
  text-align: center;
}

.loading-bar {
  position: relative;
  width: 200px;
  height: 6px;
  margin: 0 auto 12px;
  background: rgba(30, 20, 20, 0.8);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba($lava-red, 0.3);
}

.loading-lava {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, $lava-red 0%, $ember-orange 50%, $sulfur-yellow 100%);
  border-radius: 3px;
  animation: lavaProgress 2s ease-in-out infinite;
  box-shadow: 0 0 10px $ember-orange;
}

@keyframes lavaProgress {
  0% {
    left: -30%;
  }

  100% {
    left: 100%;
  }
}

.loading-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba($ember-orange, 0.3) 50%, transparent 100%);
  animation: glowSweep 1.5s ease-in-out infinite;
}

@keyframes glowSweep {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.loading-text {
  color: rgba($core-white, 0.8);
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba($ember-orange, 0.5);
}

// ==================== 末日撞击效果 ====================
.cataclysmic-impact {
  position: absolute;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;

  &.active {
    opacity: 1;

    .mega-meteor {
      animation: meteorImpact 1s ease-in forwards;
    }

    .shockwave {
      animation: shockwaveExpand 0.8s ease-out 0.5s forwards;
    }

    .thermal-engulf {
      animation: thermalEngulf 1s ease-in 0.8s forwards;
    }
  }
}

.mega-meteor {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  transform: translate(-50%, -50%) scale(0.1);
  background: radial-gradient(circle, rgba(255, 235, 210, 0.95) 0%, rgba($sulfur-yellow, 0.9) 20%, rgba($ember-orange, 0.85) 50%, rgba($lava-red, 0.8) 80%, rgba(26, 5, 5, 0.9) 100%);
  border-radius: 50%;
  box-shadow:
    0 0 30px rgba($sulfur-yellow, 0.7),
    0 0 60px rgba($ember-orange, 0.5),
    0 0 120px rgba($lava-red, 0.4);
}

@keyframes meteorImpact {
  0% {
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 0.9;
  }

  100% {
    transform: translate(-50%, -50%) scale(50);
    opacity: 0.95;
  }
}

.shockwave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%) scale(0);
  border: 4px solid rgba(255, 220, 180, 0.6);
  border-radius: 50%;
  opacity: 0;
}

@keyframes shockwaveExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
    border-width: 4px;
  }

  100% {
    transform: translate(-50%, -50%) scale(30);
    opacity: 0;
    border-width: 1px;
  }
}

.thermal-engulf {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 220, 180, 0.9) 0%, rgba($ember-orange, 0.8) 40%, rgba($lava-red, 0.7) 70%, rgba($charcoal-black, 0.9) 100%);
  opacity: 0;
}

@keyframes thermalEngulf {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 0.85;
    background: radial-gradient(circle at center, rgba(255, 220, 180, 0.9) 0%, rgba($ember-orange, 0.8) 40%, rgba($lava-red, 0.7) 70%, rgba($charcoal-black, 0.9) 100%);
  }

  100% {
    opacity: 0.95;
    background: radial-gradient(circle at center, rgba(255, 235, 210, 0.85) 0%, rgba(255, 200, 150, 0.8) 50%, rgba($charcoal-black, 0.6) 100%);
  }
}

@keyframes massiveShake {

  0%,
  100% {
    transform: translateX(0) translateY(0);
  }

  10% {
    transform: translateX(-10px) translateY(5px);
  }

  20% {
    transform: translateX(10px) translateY(-5px);
  }

  30% {
    transform: translateX(-8px) translateY(3px);
  }

  40% {
    transform: translateX(8px) translateY(-3px);
  }

  50% {
    transform: translateX(-5px) translateY(2px);
  }

  60% {
    transform: translateX(5px) translateY(-2px);
  }

  70% {
    transform: translateX(-3px) translateY(1px);
  }

  80% {
    transform: translateX(3px) translateY(-1px);
  }

  90% {
    transform: translateX(-1px) translateY(0);
  }
}

// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.version {
  color: rgba($core-white, 0.4);
  font-size: 0.75rem;
  letter-spacing: 1px;
}

// ==================== 过渡动画 ====================
.inferno-fade-enter-active {
  transition: opacity 0.5s ease;
}

.inferno-fade-leave-active {
  transition: opacity 0.8s ease;
}

.inferno-fade-enter-from,
.inferno-fade-leave-to {
  opacity: 0;
}
</style>
