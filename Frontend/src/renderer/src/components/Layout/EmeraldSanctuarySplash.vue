<template>
  <Transition name="forest-fade">
    <div v-if="visible" class="emerald-splash" ref="splashContainer">
      <!-- 第0层 - 迷雾深林与树冠 -->
      <div class="deep-forest-bg">
        <div class="forest-gradient"></div>
        <!-- 古树剪影层 -->
        <div class="tree-silhouettes">
          <div class="tree-layer tree-layer-far"></div>
          <div class="tree-layer tree-layer-mid"></div>
          <div class="tree-layer tree-layer-near"></div>
        </div>
        <!-- 体积雾 -->
        <div class="volumetric-fog fog-layer-1"></div>
        <div class="volumetric-fog fog-layer-2"></div>
        <div class="volumetric-fog fog-layer-3"></div>
      </div>

      <!-- 第1层 - Canvas 粒子系统：森林之灵 -->
      <canvas ref="spiritCanvas" class="spirit-canvas"></canvas>

      <!-- 第2层 - 静态光柱 God Rays -->
      <div class="god-rays">
        <div class="light-beam beam-1"></div>
        <div class="light-beam beam-2"></div>
        <div class="light-beam beam-3"></div>
        <div class="light-beam beam-4"></div>
      </div>

      <!-- 第3层 - 落叶与飞羽 -->
      <div class="falling-foliage">
        <div v-for="leaf in foliageParticles" :key="leaf.id" class="foliage-particle" :class="leaf.type"
          :style="leaf.style">
        </div>
      </div>

      <!-- 第4层 - 装饰性植被 -->
      <div class="botanical-elements" ref="botanicalContainer">
        <!-- 右下角巨大蕨类植物 -->
        <div class="fern-plant">
          <div class="fern-leaf fern-leaf-1"></div>
          <div class="fern-leaf fern-leaf-2"></div>
          <div class="fern-leaf fern-leaf-3"></div>
          <div class="fern-glow"></div>
        </div>
        <!-- 左上角藤蔓 -->
        <div class="hanging-vines">
          <div class="vine vine-1"></div>
          <div class="vine vine-2"></div>
          <div class="vine vine-3"></div>
          <div class="vine-flower vine-flower-1"></div>
          <div class="vine-flower vine-flower-2"></div>
        </div>
        <!-- 发光蘑菇 -->
        <div class="glowing-mushrooms">
          <div class="mushroom mushroom-1">
            <div class="mushroom-cap"></div>
            <div class="mushroom-stem"></div>
            <div class="mushroom-glow"></div>
          </div>
          <div class="mushroom mushroom-2">
            <div class="mushroom-cap"></div>
            <div class="mushroom-stem"></div>
            <div class="mushroom-glow"></div>
          </div>
          <div class="mushroom mushroom-3">
            <div class="mushroom-cap"></div>
            <div class="mushroom-stem"></div>
            <div class="mushroom-glow"></div>
          </div>
        </div>
        <!-- 苔藓石 -->
        <div class="moss-rocks">
          <div class="rock rock-1"></div>
          <div class="rock rock-2"></div>
        </div>
      </div>

      <!-- 露水滴落效果 -->
      <div class="dewdrop-container">
        <div v-for="drop in dewdrops" :key="drop.id" class="dewdrop" :style="drop.style">
        </div>
      </div>

      <!-- 主内容 - 凝露晶体面板 -->
      <div class="crystal-panel" :class="{ 'wind-shake': isLaunching }" ref="crystalPanel">
        <div class="panel-veins"></div>
        <div class="panel-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 100 100" class="nature-icon">
                <defs>
                  <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#88cc00;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <!-- 音符与树叶结合的图标 -->
                <circle cx="25" cy="72" r="10" fill="url(#leafGradient)" class="note-base" />
                <circle cx="62" cy="65" r="10" fill="url(#leafGradient)" class="note-base delay" />
                <rect x="33" y="22" width="3" height="50" fill="url(#leafGradient)" class="note-stem" />
                <rect x="70" y="18" width="3" height="47" fill="url(#leafGradient)" class="note-stem delay" />
                <path d="M 36 22 Q 53 12 73 18" stroke="url(#leafGradient)" stroke-width="3" fill="none"
                  class="note-beam" />
                <!-- 装饰叶子 -->
                <ellipse cx="42" cy="35" rx="8" ry="4" fill="url(#leafGradient)" transform="rotate(-30 42 35)"
                  opacity="0.7" />
                <ellipse cx="58" cy="28" rx="6" ry="3" fill="url(#leafGradient)" transform="rotate(20 58 28)"
                  opacity="0.6" />
              </svg>
            </div>
            <div class="logo-aura"></div>
            <div class="logo-particles">
              <span v-for="n in 8" :key="n" class="particle" :style="{ '--i': n }"></span>
            </div>
          </div>

          <!-- 应用名称 - 流光渐变 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.1}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 -->
          <div class="loading-indicator">
            <div class="loading-bar">
              <div class="loading-progress"></div>
              <div class="loading-sparkle"></div>
            </div>
            <p class="loading-text">{{ loadingText }}</p>
          </div>
        </div>

        <!-- 晶体边缘光晕 -->
        <div class="crystal-glow" :class="{ active: isLaunching }"></div>
      </div>

      <!-- 底部信息 -->
      <div class="splash-footer">

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
const isLaunching = ref(false)
const spiritCanvas = ref<HTMLCanvasElement | null>(null)
const splashContainer = ref<HTMLElement | null>(null)
const botanicalContainer = ref<HTMLElement | null>(null)
const crystalPanel = ref<HTMLElement | null>(null)

// 应用名称
const appNameChars = '故里音乐助手'.split('')

// 加载文字
const loadingTexts = ['正在唤醒森林...', '聆听自然之声...', '连接生命之脉...', '准备启程...']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

let loadingTextInterval: number | null = null
let animationFrameId: number | null = null

// 萤火虫和花粉粒子
interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  brightness: number
  brightnessSpeed: number
  phase: number
  noiseOffsetX: number
  noiseOffsetY: number
  color: string
}

let fireflies: Firefly[] = []
let time = 0

// Perlin 噪声简化实现
const noise2D = (x: number, y: number): number => {
  const sin = Math.sin
  return (sin(x * 1.2 + y * 0.5) + sin(x * 0.7 - y * 1.1) + sin(x * 0.3 + y * 0.8)) / 3
}

// 生成落叶数据
const random = (min: number, max: number) => Math.random() * (max - min) + min
const foliageTypes = ['leaf-green', 'leaf-yellow', 'leaf-pink', 'feather']
const foliageParticles = Array.from({ length: 25 }, (_, i) => {
  const type = foliageTypes[Math.floor(random(0, foliageTypes.length))]
  return {
    id: i,
    type,
    style: {
      left: `${random(0, 100)}%`,
      animationDelay: `${random(0, 8)}s`,
      animationDuration: `${random(8, 15)}s`,
      '--swing-amount': `${random(50, 150)}px`,
      '--rotation': `${random(-30, 30)}deg`,
      '--final-rotation': `${random(180, 720)}deg`
    }
  }
})

// 露水数据
import type { CSSProperties } from 'vue';
const dewdrops = ref<{ id: number; style: CSSProperties }[]>([])
let dewdropId = 0

const createDewdrop = () => {
  if (isLaunching.value) return

  const drop = {
    id: dewdropId++,
    style: {
      left: `${random(15, 35)}%`,
      animationDuration: `${random(2, 3)}s`
    }
  }
  dewdrops.value.push(drop)

  setTimeout(() => {
    dewdrops.value = dewdrops.value.filter(d => d.id !== drop.id)
  }, 3500)
}

// 初始化Canvas萤火虫系统
const initFireflySystem = () => {
  const canvas = spiritCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 创建萤火虫和花粉
  const fireflyColors = ['#a3e635', '#fde047', '#38bdf8', '#4ade80']
  const fireflyCount = 80

  fireflies = Array.from({ length: fireflyCount }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: 0,
    vy: 0,
    size: Math.random() * 3 + 1,
    brightness: Math.random(),
    brightnessSpeed: Math.random() * 0.02 + 0.01,
    phase: Math.random() * Math.PI * 2,
    noiseOffsetX: Math.random() * 1000,
    noiseOffsetY: Math.random() * 1000,
    color: fireflyColors[Math.floor(Math.random() * fireflyColors.length)]
  }))

  let speedMultiplier = 1

  const render = () => {
    time += 0.005

    // 半透明清除，产生拖尾效果
    ctx.fillStyle = 'rgba(15, 32, 21, 0.15)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    fireflies.forEach((fly) => {
      // Perlin 噪声驱动的布朗运动
      const noiseX = noise2D(fly.noiseOffsetX + time, fly.noiseOffsetY)
      const noiseY = noise2D(fly.noiseOffsetX, fly.noiseOffsetY + time)

      fly.vx = noiseX * 2 * speedMultiplier
      fly.vy = noiseY * 2 * speedMultiplier

      fly.x += fly.vx
      fly.y += fly.vy

      // 边界处理
      if (fly.x < 0) fly.x = canvas.width
      if (fly.x > canvas.width) fly.x = 0
      if (fly.y < 0) fly.y = canvas.height
      if (fly.y > canvas.height) fly.y = 0

      // 呼吸灯效果
      fly.phase += fly.brightnessSpeed
      fly.brightness = 0.3 + Math.sin(fly.phase) * 0.7 * 0.5 + 0.5

      // 高速模式 - 拉长成风线
      if (speedMultiplier > 5) {
        const lineLength = speedMultiplier * 3
        ctx.beginPath()
        ctx.moveTo(fly.x - fly.vx * lineLength, fly.y - fly.vy * lineLength)
        ctx.lineTo(fly.x, fly.y)
        ctx.strokeStyle = fly.color
        ctx.lineWidth = fly.size * 0.5
        ctx.globalAlpha = fly.brightness * 0.8
        ctx.stroke()
      } else {
        // 常规模式 - 绘制发光圆点
        const gradient = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 3)
        gradient.addColorStop(0, fly.color)
        gradient.addColorStop(0.5, fly.color.replace(')', ', 0.5)').replace('rgb', 'rgba'))
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(fly.x, fly.y, fly.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.globalAlpha = fly.brightness
        ctx.fill()
      }
      ctx.globalAlpha = 1
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  // 返回速度控制函数
  return (speed: number) => {
    speedMultiplier = speed
  }
}

let setFireflySpeed: ((speed: number) => void) | null = null

// 触发御风而行动画
const triggerWindRider = () => {
  isLaunching.value = true
  const launchDuration = 2500

  // 1. 萤火虫加速
  const startTime = Date.now()
  const accelerate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / launchDuration, 1)
    const easeProgress = progress === 0 ? 0 : Math.pow(2, 10 * progress - 10)
    const speed = 1 + easeProgress * 40
    setFireflySpeed?.(speed)

    if (progress < 1) {
      requestAnimationFrame(accelerate)
    }
  }
  accelerate()

  // 2. 雾气消散
  const fogLayers = splashContainer.value?.querySelectorAll('.volumetric-fog')
  fogLayers?.forEach((fog, i) => {
    const el = fog as HTMLElement
    el.style.transition = `all ${launchDuration / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`
    el.style.opacity = '0'
    el.style.transform = `translateY(${-100 - i * 50}px) scale(1.5)`
  })

  // 3. 植物退让
  const botanicals = botanicalContainer.value?.querySelectorAll('.fern-plant, .hanging-vines, .glowing-mushrooms, .moss-rocks')
  botanicals?.forEach((plant, index) => {
    const el = plant as HTMLElement
    el.style.transition = `all ${launchDuration / 1000}s cubic-bezier(0.55, 0.055, 0.675, 0.19)`

    const directions = [
      { x: 200, y: 200 },   // 右下蕨类
      { x: -200, y: -100 }, // 左上藤蔓
      { x: 0, y: 200 },     // 蘑菇
      { x: 150, y: 100 }    // 苔藓石
    ]
    const dir = directions[index] || { x: 0, y: 0 }
    el.style.transform = `translate(${dir.x}px, ${dir.y}px) scale(2)`
    el.style.opacity = '0'
  })

  // 4. 落叶狂舞
  const leaves = splashContainer.value?.querySelectorAll('.foliage-particle')
  leaves?.forEach((leaf) => {
    const el = leaf as HTMLElement
    el.style.transition = 'all 1s ease-out'
    el.style.animationPlayState = 'paused'
    el.style.transform = `translateY(-200vh) rotate(${Math.random() * 720}deg)`
    el.style.opacity = '0'
  })

  // 5. 光柱增强然后消散
  const beams = splashContainer.value?.querySelectorAll('.light-beam')
  beams?.forEach((beam) => {
    const el = beam as HTMLElement
    el.style.transition = `all ${launchDuration / 1000}s ease-in-out`
    el.style.opacity = '1'
    setTimeout(() => {
      el.style.opacity = '0'
      el.style.transform = 'scaleY(2) translateY(-50%)'
    }, 500)
  })

  // 6. 晶体面板消失
  if (crystalPanel.value) {
    crystalPanel.value.style.transition = `opacity 0.5s ease-out ${launchDuration - 500}ms, transform ${launchDuration / 1000}s ease-in`
    crystalPanel.value.style.opacity = '0'
    crystalPanel.value.style.transform = 'scale(0.9) translateY(-20px)'
  }

  // 7. 树木层消散
  const treeLayers = splashContainer.value?.querySelectorAll('.tree-layer')
  treeLayers?.forEach((layer, i) => {
    const el = layer as HTMLElement
    el.style.transition = `all ${launchDuration / 1000}s ease-in`
    el.style.opacity = '0'
    el.style.transform = `translateY(${-50 - i * 30}px) scale(1.1)`
  })
}

// 露水定时器
let dewdropInterval: number | null = null

onMounted(async () => {
  // 初始化萤火虫系统
  setFireflySpeed = initFireflySystem() || null

  // 加载文字轮换
  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 1000)

  // 露水效果
  dewdropInterval = window.setInterval(createDewdrop, 3000)
  setTimeout(createDewdrop, 1000)

  const minDisplayTime = 2000
  const startTime = Date.now()

  // 等待数据预加载
  const preloadPromise = window.__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[EmeraldSplash] Data preload finished')
    } catch (error) {
      console.error('[EmeraldSplash] Preload error:', error)
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

  // 触发御风而行
  triggerWindRider()

  // 等待动画完成
  await new Promise((resolve) => setTimeout(resolve, 2500))

  visible.value = false
  console.log('[EmeraldSplash] Hidden after', Date.now() - startTime, 'ms')

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
  if (dewdropInterval) {
    clearInterval(dewdropInterval)
  }
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$forest-dark: #0f2015;
$soil-brown: #1e1b15;
$sprout-green: #88cc00;
$dawn-gold: #ffd700;
$bio-blue: #7dd3fc;
$ghost-white: #f8fafc;
$crystal-green: rgba(20, 50, 30, 0.5);

.emerald-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: $forest-dark;
}

// ==================== 第0层 - 深林背景 ====================
.deep-forest-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .forest-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 30%, #1a3020 0%, $forest-dark 50%, $soil-brown 100%);
    animation: sunlightBreathing 8s ease-in-out infinite;
  }
}

@keyframes sunlightBreathing {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

// 树木剪影
.tree-silhouettes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tree-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-repeat: repeat-x;
  background-position: bottom center;

  &.tree-layer-far {
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Cpath d='M100 0 L130 100 L110 95 L140 180 L90 170 L100 300 L80 300 L90 170 L40 180 L70 95 L50 100 Z' fill='%230a150d'/%3E%3C/svg%3E") repeat-x bottom center;
    background-size: 200px 300px;
    opacity: 0.4;
    transform: scale(1.2);
  }

  &.tree-layer-mid {
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 350'%3E%3Cpath d='M75 0 L110 80 L90 75 L125 160 L85 150 L120 250 L85 240 L90 350 L60 350 L65 240 L30 250 L65 150 L25 160 L60 75 L40 80 Z' fill='%230d1a10'/%3E%3C/svg%3E") repeat-x bottom center;
    background-size: 150px 350px;
    opacity: 0.6;
    transform: translateX(-10%);
  }

  &.tree-layer-near {
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 400'%3E%3Cpath d='M90 0 L130 70 L105 65 L145 140 L110 130 L155 220 L100 205 L105 400 L75 400 L80 205 L25 220 L70 130 L35 140 L75 65 L50 70 Z' fill='%23101f14'/%3E%3C/svg%3E") repeat-x bottom center;
    background-size: 180px 400px;
    opacity: 0.8;
    transform: translateX(5%);
  }
}

// 体积雾
.volumetric-fog {
  position: absolute;
  bottom: 0;
  left: -10%;
  width: 120%;
  pointer-events: none;

  &.fog-layer-1 {
    height: 40%;
    background: linear-gradient(to top, rgba(20, 40, 25, 0.9) 0%, transparent 100%);
    animation: fogDrift 20s ease-in-out infinite;
  }

  &.fog-layer-2 {
    height: 30%;
    background: linear-gradient(to top, rgba(25, 45, 30, 0.7) 0%, transparent 100%);
    animation: fogDrift 25s ease-in-out infinite reverse;
    animation-delay: -5s;
  }

  &.fog-layer-3 {
    height: 20%;
    background: linear-gradient(to top, rgba(30, 50, 35, 0.5) 0%, transparent 100%);
    animation: fogDrift 18s ease-in-out infinite;
    animation-delay: -10s;
  }
}

@keyframes fogDrift {

  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(5%);
  }
}

// ==================== 第1层 - Canvas 粒子 ====================
.spirit-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

// ==================== 第2层 - 光柱 God Rays ====================
.god-rays {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.light-beam {
  position: absolute;
  background: linear-gradient(180deg,
      rgba(255, 215, 0, 0.3) 0%,
      rgba(255, 215, 0, 0.1) 50%,
      transparent 100%);
  transform-origin: top center;
  animation: beamSway 8s ease-in-out infinite;

  &.beam-1 {
    top: -20%;
    left: 10%;
    width: 150px;
    height: 120%;
    transform: rotate(15deg);
    opacity: 0.6;
    animation-delay: 0s;
  }

  &.beam-2 {
    top: -20%;
    left: 25%;
    width: 100px;
    height: 100%;
    transform: rotate(12deg);
    opacity: 0.4;
    animation-delay: -2s;
  }

  &.beam-3 {
    top: -20%;
    left: 5%;
    width: 80px;
    height: 110%;
    transform: rotate(20deg);
    opacity: 0.5;
    animation-delay: -4s;
  }

  &.beam-4 {
    top: -20%;
    left: 35%;
    width: 60px;
    height: 90%;
    transform: rotate(8deg);
    opacity: 0.3;
    animation-delay: -6s;
  }
}

@keyframes beamSway {

  0%,
  100% {
    transform: rotate(var(--rotation, 15deg)) translateX(0);
  }

  50% {
    transform: rotate(var(--rotation, 15deg)) translateX(20px);
  }
}

// ==================== 第3层 - 落叶与飞羽 ====================
.falling-foliage {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.foliage-particle {
  position: absolute;
  top: -50px;
  animation: leafFall linear infinite;

  &.leaf-green {
    width: 20px;
    height: 12px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-radius: 50% 0 50% 0;
    box-shadow: inset -2px -2px 4px rgba(0, 0, 0, 0.2);
  }

  &.leaf-yellow {
    width: 18px;
    height: 10px;
    background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
    border-radius: 50% 0 50% 0;
    box-shadow: inset -2px -2px 4px rgba(0, 0, 0, 0.2);
  }

  &.leaf-pink {
    width: 14px;
    height: 14px;
    background: radial-gradient(ellipse, #fda4af 30%, #f472b6 100%);
    border-radius: 50%;
    opacity: 0.8;
  }

  &.feather {
    width: 25px;
    height: 8px;
    background: linear-gradient(90deg, transparent 0%, white 20%, white 80%, transparent 100%);
    border-radius: 0 50% 50% 0;
    opacity: 0.7;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
}

@keyframes leafFall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(calc(100vh + 100px)) translateX(calc(sin(var(--swing-amount, 100px)))) rotate(var(--final-rotation, 360deg));
    opacity: 0;
  }
}

// ==================== 第4层 - 装饰性植被 ====================
.botanical-elements {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

// 蕨类植物
.fern-plant {
  position: absolute;
  right: -5%;
  bottom: -10%;
  width: 400px;
  height: 450px;
}

.fern-leaf {
  position: absolute;
  bottom: 50px;
  background: linear-gradient(90deg, #166534 0%, #22c55e 50%, #4ade80 100%);
  clip-path: polygon(0% 50%, 10% 30%, 30% 20%, 50% 15%, 70% 20%, 90% 35%, 100% 50%, 90% 65%, 70% 80%, 50% 85%, 30% 80%, 10% 70%);
  animation: fernSway 4s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(74, 222, 128, 0.3));

  &.fern-leaf-1 {
    left: 50%;
    width: 250px;
    height: 100px;
    transform-origin: left center;
    transform: rotate(-40deg);
    animation-delay: 0s;
  }

  &.fern-leaf-2 {
    left: 40%;
    width: 200px;
    height: 80px;
    transform-origin: left center;
    transform: rotate(-20deg);
    animation-delay: -1s;
  }

  &.fern-leaf-3 {
    left: 45%;
    width: 180px;
    height: 70px;
    transform-origin: left center;
    transform: rotate(-60deg);
    animation-delay: -2s;
  }
}

.fern-glow {
  position: absolute;
  bottom: 0;
  left: 30%;
  width: 200px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(74, 222, 128, 0.4) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes fernSway {

  0%,
  100% {
    transform: rotate(var(--base-rotation, -40deg));
  }

  50% {
    transform: rotate(calc(var(--base-rotation, -40deg) + 5deg));
  }
}

@keyframes glowPulse {

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

// 藤蔓
.hanging-vines {
  position: absolute;
  top: -10%;
  left: 5%;
  width: 200px;
  height: 350px;
}

.vine {
  position: absolute;
  width: 4px;
  background: linear-gradient(180deg, #14532d 0%, #166534 50%, #22c55e 100%);
  border-radius: 2px;
  animation: vineSway 5s ease-in-out infinite;

  &.vine-1 {
    left: 20%;
    height: 280px;
    animation-delay: 0s;
  }

  &.vine-2 {
    left: 50%;
    height: 320px;
    animation-delay: -1.5s;
  }

  &.vine-3 {
    left: 75%;
    height: 250px;
    animation-delay: -3s;
  }
}

.vine-flower {
  position: absolute;
  width: 16px;
  height: 16px;
  background: radial-gradient(ellipse, #fda4af 30%, #f472b6 100%);
  border-radius: 50% 0 50% 50%;
  animation: flowerBob 3s ease-in-out infinite;

  &.vine-flower-1 {
    top: 250px;
    left: 15%;
  }

  &.vine-flower-2 {
    top: 300px;
    left: 45%;
    animation-delay: -1s;
  }
}

@keyframes vineSway {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(3deg);
  }

  75% {
    transform: rotate(-3deg);
  }
}

@keyframes flowerBob {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(5px) rotate(5deg);
  }
}

// 发光蘑菇
.glowing-mushrooms {
  position: absolute;
  bottom: 5%;
  left: 10%;
  width: 200px;
  height: 100px;
}

.mushroom {
  position: absolute;

  .mushroom-cap {
    background: linear-gradient(180deg, #7dd3fc 0%, #38bdf8 100%);
    border-radius: 50% 50% 20% 20%;
    box-shadow: 0 0 20px rgba(125, 211, 252, 0.5);
  }

  .mushroom-stem {
    background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
    border-radius: 0 0 30% 30%;
  }

  .mushroom-glow {
    position: absolute;
    background: radial-gradient(ellipse, rgba(125, 211, 252, 0.6) 0%, transparent 70%);
    animation: mushroomGlow 2s ease-in-out infinite;
  }

  &.mushroom-1 {
    left: 0;
    bottom: 0;

    .mushroom-cap {
      width: 40px;
      height: 25px;
    }

    .mushroom-stem {
      width: 15px;
      height: 20px;
      margin-left: 12px;
    }

    .mushroom-glow {
      width: 60px;
      height: 60px;
      top: -10px;
      left: -10px;
    }
  }

  &.mushroom-2 {
    left: 60px;
    bottom: 0;

    .mushroom-cap {
      width: 30px;
      height: 18px;
    }

    .mushroom-stem {
      width: 10px;
      height: 15px;
      margin-left: 10px;
    }

    .mushroom-glow {
      width: 45px;
      height: 45px;
      top: -8px;
      left: -8px;
      animation-delay: -0.5s;
    }
  }

  &.mushroom-3 {
    left: 100px;
    bottom: 0;

    .mushroom-cap {
      width: 25px;
      height: 15px;
    }

    .mushroom-stem {
      width: 8px;
      height: 12px;
      margin-left: 8px;
    }

    .mushroom-glow {
      width: 35px;
      height: 35px;
      top: -5px;
      left: -5px;
      animation-delay: -1s;
    }
  }
}

@keyframes mushroomGlow {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

// 苔藓石
.moss-rocks {
  position: absolute;
  bottom: 3%;
  right: 25%;
  width: 250px;
  height: 80px;
}

.rock {
  position: absolute;
  bottom: 0;
  background: linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%);
  border-radius: 40% 50% 45% 55%;
  box-shadow: inset -5px -5px 15px rgba(0, 0, 0, 0.4), 0 3px 10px rgba(0, 0, 0, 0.5);

  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: 10%;
    right: 10%;
    height: 15px;
    background: linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #22c55e 100%);
    border-radius: 50%;
    filter: blur(2px);
  }

  &.rock-1 {
    left: 0;
    width: 100px;
    height: 50px;
  }

  &.rock-2 {
    left: 80px;
    width: 70px;
    height: 35px;
  }
}

// ==================== 露水效果 ====================
.dewdrop-container {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;
}

.dewdrop {
  position: absolute;
  top: 0;
  width: 6px;
  height: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(125, 211, 252, 0.6) 100%);
  border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
  animation: dewFall ease-in forwards;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);

  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    opacity: 0;
    animation: ripple 1s ease-out 2s forwards;
  }
}

@keyframes dewFall {
  0% {
    transform: translateY(100px);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(calc(100vh - 100px));
    opacity: 0;
  }
}

@keyframes ripple {
  0% {
    transform: translateX(-50%) scale(0);
    opacity: 1;
  }

  100% {
    transform: translateX(-50%) scale(3);
    opacity: 0;
  }
}

// ==================== 凝露晶体面板 ====================
.crystal-panel {
  position: relative;
  z-index: 10;
  padding: 56px 72px;
  background: rgba(20, 50, 30, 0.4);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 30px 60px -12px rgba(0, 0, 0, 0.7),
    0 0 100px rgba(136, 204, 0, 0.15),
    inset 0 0 40px rgba(255, 255, 255, 0.05);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
    z-index: 0;
  }

  &.wind-shake {
    animation: windShake 0.1s ease-in-out infinite;
  }
}

.panel-veins {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background:
    linear-gradient(135deg, transparent 48%, rgba(136, 204, 0, 0.05) 50%, transparent 52%),
    linear-gradient(45deg, transparent 48%, rgba(255, 215, 0, 0.03) 50%, transparent 52%);
  background-size: 20px 20px;
  pointer-events: none;
}

.crystal-glow {
  position: absolute;
  inset: -4px;
  border-radius: 28px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  box-shadow:
    0 0 30px rgba(136, 204, 0, 0.5),
    0 0 60px rgba(255, 215, 0, 0.3),
    0 0 90px rgba(136, 204, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.1);

  &.active {
    opacity: 1;
    animation: crystalPulse 0.2s ease-in-out infinite;
  }
}

@keyframes windShake {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  25% {
    transform: translate(-2px, 1px) rotate(-0.3deg);
  }

  50% {
    transform: translate(2px, -1px) rotate(0.3deg);
  }

  75% {
    transform: translate(-1px, -1px) rotate(-0.2deg);
  }
}

@keyframes crystalPulse {

  0%,
  100% {
    box-shadow:
      0 0 30px rgba(136, 204, 0, 0.5),
      0 0 60px rgba(255, 215, 0, 0.3),
      0 0 90px rgba(136, 204, 0, 0.2),
      inset 0 0 30px rgba(255, 215, 0, 0.1);
  }

  50% {
    box-shadow:
      0 0 50px rgba(136, 204, 0, 0.7),
      0 0 100px rgba(255, 215, 0, 0.5),
      0 0 150px rgba(136, 204, 0, 0.3),
      inset 0 0 50px rgba(255, 215, 0, 0.2);
  }
}

.panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

// ==================== Logo ====================
.logo-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 32px;
}

.logo-icon {
  position: absolute;
  inset: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  .nature-icon {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 15px rgba(136, 204, 0, 0.5));
  }

  .note-base {
    animation: notePulse 1.5s ease-in-out infinite;

    &.delay {
      animation-delay: 0.3s;
    }
  }

  .note-stem,
  .note-beam {
    animation: stemGlow 2s ease-in-out infinite;

    &.delay {
      animation-delay: 0.5s;
    }
  }
}

@keyframes notePulse {

  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
  }

  50% {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
}

@keyframes stemGlow {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

.logo-aura {
  position: absolute;
  inset: -20px;
  background: radial-gradient(ellipse, rgba(136, 204, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 50%, transparent 70%);
  animation: auraPulse 3s ease-in-out infinite;
  border-radius: 50%;
}

@keyframes auraPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.logo-particles {
  position: absolute;
  inset: 0;

  .particle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    background: $dawn-gold;
    border-radius: 50%;
    box-shadow: 0 0 8px $dawn-gold;
    animation: particleOrbit 4s linear infinite;
    --angle: calc(var(--i) * 45deg);
    transform-origin: center center;

    @for $i from 1 through 8 {
      &:nth-child(#{$i}) {
        animation-delay: calc(-#{$i} * 0.5s);
      }
    }
  }
}

@keyframes particleOrbit {
  0% {
    transform: rotate(var(--angle)) translateX(50px) scale(0.5);
    opacity: 0;
  }

  50% {
    transform: rotate(calc(var(--angle) + 180deg)) translateX(60px) scale(1);
    opacity: 1;
  }

  100% {
    transform: rotate(calc(var(--angle) + 360deg)) translateX(50px) scale(0.5);
    opacity: 0;
  }
}

// ==================== 应用名称 ====================
.app-name {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 40px;
  display: flex;
  gap: 4px;
  font-family: 'Noto Serif SC', 'Merriweather', serif;
  perspective: 1000px;

  .char {
    display: inline-block;
    background: linear-gradient(120deg, $dawn-gold 0%, $sprout-green 25%, #4ade80 50%, $sprout-green 75%, $dawn-gold 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: charReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, shimmer 3s linear infinite;
    opacity: 0;
    transform: translateY(30px) rotateX(20deg);
    filter: drop-shadow(0 2px 15px rgba(136, 204, 0, 0.5));
  }
}

@keyframes charReveal {
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

@keyframes shimmer {
  to {
    background-position: 200% center;
  }
}

// ==================== 加载指示器 ====================
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.loading-bar {
  position: relative;
  width: 240px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.loading-progress {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #4ade80 0%, #facc15 50%, #4ade80 100%);
  background-size: 200% 100%;
  border-radius: 3px;
  animation: loadingFill 2.5s ease-in-out forwards, gradientFlow 2s linear infinite;
  box-shadow: 0 0 15px rgba(74, 222, 128, 0.6);
}

@keyframes gradientFlow {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

.loading-sparkle {
  position: absolute;
  top: -5px;
  height: 16px;
  width: 50px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
  animation: sparkleMove 2.5s ease-in-out infinite;
  mix-blend-mode: overlay;
  filter: blur(2px);
}

@keyframes loadingFill {
  0% {
    width: 0%;
  }

  30% {
    width: 35%;
  }

  60% {
    width: 75%;
  }

  100% {
    width: 100%;
  }
}

@keyframes sparkleMove {
  0% {
    left: -50px;
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    left: 240px;
    opacity: 0;
  }
}

.loading-text {
  font-size: 1rem;
  color: rgba(220, 252, 231, 0.9);
  animation: textBreath 2s ease-in-out infinite;
  letter-spacing: 3px;
  font-family: 'Noto Serif SC', serif;
  text-shadow: 0 0 10px rgba(136, 204, 0, 0.3);
}

@keyframes textBreath {

  0%,
  100% {
    opacity: 0.7;
    text-shadow: 0 0 10px rgba(136, 204, 0, 0.3);
  }

  50% {
    opacity: 1;
    text-shadow: 0 0 20px rgba(136, 204, 0, 0.6);
  }
}

// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 24px;

  .version {
    font-size: 0.857rem;
    color: rgba(136, 204, 0, 0.4);
  }
}

// ==================== 淡出过渡 ====================
.forest-fade-leave-active {
  transition: opacity 0.5s ease-out;
}

.forest-fade-leave-to {
  opacity: 0;
}
</style>
