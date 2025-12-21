<template>
  <Transition name="brass-fade">
    <div v-if="visible" class="brass-era-splash" ref="splashContainer">
      <!-- 第0层 - 巨型主轴与蓝图 -->
      <div class="blueprint-bg">
        <div class="leather-gradient"></div>
        <!-- 褪色蓝图纹理 -->
        <div class="blueprint-overlay"></div>
        <!-- 金色光晕边框 -->
        <div class="golden-vignette"></div>
        <!-- 主传动齿轮剪影 -->
        <div class="master-gears">
          <div class="gear master-gear-1"></div>
          <div class="gear master-gear-2"></div>
          <div class="gear master-gear-3"></div>
          <div class="gear master-gear-4"></div>
          <div class="gear master-gear-5"></div>
        </div>
      </div>

      <!-- 第1层 - Canvas 粒子系统：飞溅火星与尘埃 -->
      <canvas ref="sparkCanvas" class="spark-canvas"></canvas>

      <!-- 蒸汽管道网络 -->
      <div class="pipe-network">
        <div class="pipe pipe-horizontal pipe-top"></div>
        <div class="pipe pipe-horizontal pipe-bottom"></div>
        <div class="pipe pipe-vertical pipe-left"></div>
        <div class="pipe pipe-vertical pipe-right"></div>
        <div class="pipe-joint joint-tl"></div>
        <div class="pipe-joint joint-tr"></div>
        <div class="pipe-joint joint-bl"></div>
        <div class="pipe-joint joint-br"></div>
        <!-- 管道蒸汽喷射 -->
        <div class="pipe-steam pipe-steam-1"></div>
        <div class="pipe-steam pipe-steam-2"></div>
        <div class="pipe-steam pipe-steam-3"></div>
      </div>

      <!-- 浮动装饰齿轮链 -->
      <div class="floating-gear-chain">
        <div v-for="n in 12" :key="n" class="floating-gear" :style="getFloatingGearStyle(n)"></div>
      </div>

      <!-- 第2层 - 蒸汽迷雾 -->
      <div class="steam-layer">
        <div class="steam-burst steam-1"></div>
        <div class="steam-burst steam-2"></div>
        <div class="steam-burst steam-3"></div>
        <div class="steam-burst steam-4"></div>
        <div class="steam-burst steam-5"></div>
        <div class="steam-burst steam-6"></div>
      </div>

      <!-- 第3层 - 动态机械组件 -->
      <div class="active-mechanisms" ref="mechanismsContainer">
        <!-- 左侧活塞组 -->
        <div class="piston-assembly left-piston">
          <div class="piston-cylinder"></div>
          <div class="piston-rod"></div>
          <div class="piston-head"></div>
          <div class="piston-steam"></div>
        </div>
        <!-- 右侧活塞组 -->
        <div class="piston-assembly right-piston">
          <div class="piston-cylinder"></div>
          <div class="piston-rod"></div>
          <div class="piston-head"></div>
          <div class="piston-steam"></div>
        </div>
        <!-- 顶部连杆机构 -->
        <div class="linkage-system">
          <div class="linkage-arm arm-1"></div>
          <div class="linkage-arm arm-2"></div>
          <div class="linkage-arm arm-3"></div>
          <div class="linkage-joint joint-1"></div>
          <div class="linkage-joint joint-2"></div>
        </div>
        <!-- 飞轮装饰 -->
        <div class="flywheel flywheel-left"></div>
        <div class="flywheel flywheel-right"></div>
      </div>

      <!-- 第4层 - 装饰性机械 -->
      <div class="decorative-machinery" ref="decorContainer">
        <!-- 精密时计 - 右下角（增强版） -->
        <div class="chronometer">
          <div class="chrono-outer-ring"></div>
          <div class="chrono-frame"></div>
          <div class="chrono-face">
            <div class="chrono-gear gear-inner-1"></div>
            <div class="chrono-gear gear-inner-2"></div>
            <div class="chrono-gear gear-inner-3"></div>
            <div class="chrono-gear gear-inner-4"></div>
            <div class="chrono-hand hour-hand"></div>
            <div class="chrono-hand minute-hand"></div>
            <div class="chrono-hand second-hand"></div>
            <div class="chrono-center"></div>
          </div>
          <div class="chrono-glass"></div>
          <div class="chrono-glow"></div>
        </div>
        <!-- 辉光管组 - 左上角（增强版） -->
        <div class="nixie-cluster">
          <div v-for="n in 6" :key="n" class="nixie-tube" :style="{ '--tube-index': n }">
            <div class="nixie-glow"></div>
            <div class="nixie-digit">{{ nixieDigits[n - 1] || '0' }}</div>
            <div class="nixie-cage"></div>
            <div class="nixie-reflection"></div>
          </div>
        </div>
        <!-- 气压表（增强版） -->
        <div class="pressure-gauge gauge-main">
          <div class="gauge-frame"></div>
          <div class="gauge-face">
            <div class="gauge-markings"></div>
            <div class="gauge-labels"></div>
            <div class="gauge-needle" ref="pressureNeedle"></div>
            <div class="gauge-center"></div>
          </div>
          <div class="gauge-glass"></div>
        </div>
        <!-- 额外的小仪表 -->
        <div class="pressure-gauge gauge-secondary gauge-top-right">
          <div class="gauge-frame"></div>
          <div class="gauge-face">
            <div class="gauge-needle needle-2"></div>
          </div>
        </div>
        <!-- 温度计 -->
        <div class="thermometer">
          <div class="thermo-tube"></div>
          <div class="thermo-mercury"></div>
          <div class="thermo-bulb"></div>
        </div>
        <!-- 铜制望远镜 -->
        <div class="telescope">
          <div class="telescope-body"></div>
          <div class="telescope-lens"></div>
          <div class="telescope-rings"></div>
        </div>
        <!-- 飞艇剪影 -->
        <div class="airship-silhouette"></div>
      </div>

      <!-- 主内容 - 铆接仪表盘面板 -->
      <div class="control-panel" :class="{ 'overdrive-shake': isOverdriving }" ref="controlPanel">
        <!-- 外发光装饰 -->
        <div class="panel-outer-glow"></div>
        <!-- 铜边框与铆钉 -->
        <div class="panel-frame">
          <div class="rivet" v-for="n in 20" :key="n" :style="getRivetPosition(n)"></div>
          <div class="corner-gear corner-tl"></div>
          <div class="corner-gear corner-tr"></div>
          <div class="corner-gear corner-bl"></div>
          <div class="corner-gear corner-br"></div>
          <!-- 装饰边框条纹 -->
          <div class="frame-stripe stripe-top"></div>
          <div class="frame-stripe stripe-bottom"></div>
          <!-- 小指示灯 -->
          <div class="indicator-light light-1"></div>
          <div class="indicator-light light-2"></div>
          <div class="indicator-light light-3"></div>
        </div>
        <div class="panel-surface">
          <div class="metal-texture"></div>
          <div class="panel-inner-border"></div>
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-outer-ring"></div>
            <div class="logo-icon">
              <svg viewBox="0 0 100 100" class="brass-icon">
                <defs>
                  <linearGradient id="brassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#d4a849;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#b5a642;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8b7355;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#8b7355;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#ffd700;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8b7355;stop-opacity:1" />
                  </linearGradient>
                  <filter id="brassEmboss">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
                    <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
                    <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
                  </filter>
                  <filter id="glowFilter">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <!-- 外圈装饰 -->
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#brassGradient)" stroke-width="1"
                  stroke-dasharray="5,3" class="outer-deco-ring" />
                <!-- 音符与齿轮结合的图标 -->
                <circle cx="50" cy="50" r="38" fill="none" stroke="url(#brassGradient)" stroke-width="3"
                  filter="url(#brassEmboss)" class="outer-ring" />
                <circle cx="25" cy="70" r="10" fill="url(#brassGradient)" filter="url(#brassEmboss)"
                  class="note-circle" />
                <circle cx="60" cy="62" r="10" fill="url(#brassGradient)" filter="url(#brassEmboss)"
                  class="note-circle delay" />
                <rect x="33" y="25" width="3" height="45" fill="url(#brassGradient)" filter="url(#brassEmboss)"
                  class="note-stem" />
                <rect x="68" y="20" width="3" height="42" fill="url(#brassGradient)" filter="url(#brassEmboss)"
                  class="note-stem delay" />
                <path d="M 36 25 Q 52 15 71 20" stroke="url(#brassGradient)" stroke-width="3" fill="none"
                  filter="url(#brassEmboss)" class="note-beam" />
                <!-- 小齿轮装饰 -->
                <g class="logo-gear" transform="translate(75, 35)">
                  <circle r="8" fill="url(#brassGradient)" />
                  <path v-for="i in 8" :key="i" :d="`M 0 -6 L 0 -10 L 2 -10 L 2 -6 Z`" :transform="`rotate(${i * 45})`"
                    fill="url(#brassGradient)" />
                </g>
                <!-- 第二个小齿轮 -->
                <g class="logo-gear gear-2" transform="translate(20, 40)">
                  <circle r="6" fill="url(#brassGradient)" />
                  <path v-for="i in 6" :key="i" :d="`M 0 -4 L 0 -7 L 1.5 -7 L 1.5 -4 Z`"
                    :transform="`rotate(${i * 60})`" fill="url(#brassGradient)" />
                </g>
              </svg>
            </div>
            <div class="logo-glow"></div>
            <div class="logo-sparkle"></div>
          </div>

          <!-- 应用名称 - 金属浮雕效果 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.12}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 副标题装饰 -->
          <div class="subtitle-decoration">
            <span class="deco-line"></span>
            <span class="deco-gear"></span>
            <span class="deco-line"></span>
          </div>

          <!-- 加载指示器 - 机械仪表风格 -->
          <div class="loading-indicator">
            <div class="loading-gauge">
              <div class="gauge-track">
                <div class="gauge-fill"></div>
                <div class="gauge-markers">
                  <span v-for="n in 10" :key="n" class="marker"></span>
                </div>
                <div class="gauge-glow"></div>
              </div>
              <div class="gauge-pointer"></div>
            </div>
            <p class="loading-text">{{ loadingText }}</p>
          </div>
        </div>

        <!-- 边缘蒸汽效果 -->
        <div class="panel-steam" :class="{ active: isOverdriving }"></div>
      </div>

      <!-- 过载充能特效层 -->
      <div class="overdrive-layer" :class="{ active: isOverdriving }" ref="overdriveLayer">
        <div class="aperture-iris">
          <div class="iris-blade" v-for="n in 8" :key="n" :style="{ '--blade-index': n }"></div>
        </div>
        <div class="tunnel-vortex"></div>
        <div class="thermal-flash"></div>
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
const isOverdriving = ref(false)
const sparkCanvas = ref<HTMLCanvasElement | null>(null)
const splashContainer = ref<HTMLElement | null>(null)
const mechanismsContainer = ref<HTMLElement | null>(null)
const decorContainer = ref<HTMLElement | null>(null)
const controlPanel = ref<HTMLElement | null>(null)
const pressureNeedle = ref<HTMLElement | null>(null)

// 应用名称
const appNameChars = '故里音乐助手'.split('')

// 加载文字
const loadingTexts = ['启动差分机引擎...', '校准计时装置...', '注入蒸汽动力...', '齿轮组准备就绪...']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

// 辉光管数字（6位）
const nixieDigits = ref(['1', '8', '8', '4', '0', '0'])
let nixieInterval: number | null = null

let loadingTextInterval: number | null = null
let animationFrameId: number | null = null
let time = 0

// 浮动齿轮样式计算
const getFloatingGearStyle = (n: number) => {
  const positions = [
    { top: '8%', left: '5%', size: 45, duration: 15, delay: 0 },
    { top: '15%', right: '8%', size: 35, duration: 18, delay: 2 },
    { top: '35%', left: '3%', size: 55, duration: 20, delay: 1 },
    { top: '60%', right: '5%', size: 40, duration: 16, delay: 3 },
    { top: '75%', left: '8%', size: 30, duration: 22, delay: 0.5 },
    { top: '85%', right: '12%', size: 50, duration: 19, delay: 2.5 },
    { top: '25%', left: '92%', size: 38, duration: 17, delay: 1.5 },
    { top: '45%', left: '95%', size: 28, duration: 21, delay: 3.5 },
    { top: '55%', left: '2%', size: 42, duration: 14, delay: 0.8 },
    { top: '20%', left: '15%', size: 25, duration: 23, delay: 4 },
    { top: '70%', right: '3%', size: 48, duration: 18, delay: 1.2 },
    { top: '90%', left: '50%', size: 32, duration: 20, delay: 2.8 },
  ]
  const pos = positions[n - 1] || positions[0]
  return {
    top: pos.top,
    left: pos.left,
    right: pos.right,
    width: `${pos.size}px`,
    height: `${pos.size}px`,
    animationDuration: `${pos.duration}s`,
    animationDelay: `${pos.delay}s`,
  }
}

// 铆钉位置计算
const getRivetPosition = (n: number) => {
  const positions = [
    // 顶部 (6个)
    { top: '8px', left: '8%' }, { top: '8px', left: '22%' },
    { top: '8px', left: '40%' }, { top: '8px', left: '60%' },
    { top: '8px', left: '78%' }, { top: '8px', left: '92%' },
    // 底部 (6个)
    { bottom: '8px', left: '8%' }, { bottom: '8px', left: '22%' },
    { bottom: '8px', left: '40%' }, { bottom: '8px', left: '60%' },
    { bottom: '8px', left: '78%' }, { bottom: '8px', left: '92%' },
    // 左侧 (4个)
    { left: '8px', top: '20%' }, { left: '8px', top: '40%' },
    { left: '8px', top: '60%' }, { left: '8px', top: '80%' },
    // 右侧 (4个)
    { right: '8px', top: '20%' }, { right: '8px', top: '40%' },
    { right: '8px', top: '60%' }, { right: '8px', top: '80%' }
  ]
  return positions[n - 1] || {}
}

// 火星与尘埃粒子
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  brightness: number
  type: 'spark' | 'dust'
  color: string
  life: number
  maxLife: number
  gravity: number
}

let particles: Particle[] = []

// 初始化Canvas粒子系统
const initSparkSystem = () => {
  const canvas = sparkCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 粒子颜色
  const sparkColors = ['#ffaa33', '#ff8800', '#ffd700', '#d4a849', '#b5a642', '#e6c35c', '#c9a227']
  const dustColors = ['#5a4a3a', '#4a3a2a', '#3a2a1a', '#6a5a4a']
  const particleCount = 150

  const createParticle = (): Particle => {
    const isSpark = Math.random() > 0.4
    return {
      x: isSpark
        ? canvas.width * (0.3 + Math.random() * 0.4) // 火星从中下部喷出
        : Math.random() * canvas.width,
      y: isSpark ? canvas.height + 20 : Math.random() * canvas.height,
      vx: isSpark ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 0.3,
      vy: isSpark ? -(Math.random() * 6 + 3) : (Math.random() - 0.5) * 0.2,
      size: isSpark ? Math.random() * 2 + 1 : Math.random() * 3 + 1,
      brightness: Math.random(),
      type: isSpark ? 'spark' : 'dust',
      color: isSpark
        ? sparkColors[Math.floor(Math.random() * sparkColors.length)]
        : dustColors[Math.floor(Math.random() * dustColors.length)],
      life: 0,
      maxLife: isSpark ? Math.random() * 80 + 40 : Math.random() * 300 + 200,
      gravity: isSpark ? 0.15 : 0
    }
  }

  particles = Array.from({ length: particleCount }, createParticle)

  let speedMultiplier = 1
  let intensityMultiplier = 1

  const render = () => {
    time += 0.016

    // 半透明清除
    ctx.fillStyle = 'rgba(15, 15, 15, 0.12)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    particles.forEach((particle, index) => {
      particle.life++

      if (particle.type === 'spark') {
        // 火星：抛物线运动 + 重力
        particle.vy += particle.gravity * speedMultiplier
        particle.vx *= 0.99
        particle.x += particle.vx * speedMultiplier
        particle.y += particle.vy * speedMultiplier

        // 呼吸效果
        particle.brightness = 0.6 + Math.sin(time * 10 + index) * 0.4

        // 重置
        if (particle.y < -50 || particle.y > canvas.height + 50 || particle.life > particle.maxLife) {
          Object.assign(particle, createParticle())
          particle.type = 'spark'
        }
      } else {
        // 尘埃：缓慢无序漂浮
        particle.vx += Math.sin(time + index * 0.1) * 0.01
        particle.vy += Math.cos(time + index * 0.15) * 0.01
        particle.x += particle.vx
        particle.y += particle.vy

        // 边界循环
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        particle.brightness = 0.3 + Math.sin(time * 2 + index) * 0.15
      }

      // 高速模式 - 火星拉长成流线
      if (speedMultiplier > 5 && particle.type === 'spark') {
        const lineLength = speedMultiplier * 3
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y + lineLength * 3)
        ctx.lineTo(particle.x, particle.y)
        const gradient = ctx.createLinearGradient(particle.x, particle.y + lineLength * 3, particle.x, particle.y)
        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.5, particle.color)
        gradient.addColorStop(1, '#ffeebb')
        ctx.strokeStyle = gradient
        ctx.lineWidth = particle.size
        ctx.globalAlpha = particle.brightness * intensityMultiplier
        ctx.stroke()
      } else {
        // 常规模式 - 发光点
        const glowSize = particle.type === 'spark' ? particle.size * 4 : particle.size * 2
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, glowSize)

        if (particle.type === 'spark') {
          gradient.addColorStop(0, '#ffe4a0')
          gradient.addColorStop(0.3, particle.color)
          gradient.addColorStop(1, 'transparent')
        } else {
          gradient.addColorStop(0, particle.color)
          gradient.addColorStop(1, 'transparent')
        }

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.globalAlpha = particle.brightness * intensityMultiplier * (particle.type === 'spark' ? 1 : 0.4)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  return {
    setSpeed: (speed: number) => { speedMultiplier = speed },
    setIntensity: (intensity: number) => { intensityMultiplier = intensity }
  }
}

let sparkControls: { setSpeed: (speed: number) => void; setIntensity: (intensity: number) => void } | null = null

// 更新辉光管数字
const updateNixieDigits = () => {
  nixieDigits.value = nixieDigits.value.map(() =>
    Math.floor(Math.random() * 10).toString()
  )
}

// 气压表针抖动
const jitterNeedle = () => {
  if (pressureNeedle.value) {
    const baseAngle = -45
    const jitter = (Math.random() - 0.5) * 10
    pressureNeedle.value.style.transform = `rotate(${baseAngle + jitter}deg)`
  }
}

// 触发过载充能动画
const triggerOverdrive = () => {
  isOverdriving.value = true
  const overdriveDuration = 2000 // 2秒过载

  // 1. 火星加速
  const startTime = Date.now()
  const accelerate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / overdriveDuration, 1)
    const easeProgress = progress === 0 ? 0 : Math.pow(2, 10 * progress - 10)
    const speed = 1 + easeProgress * 25
    const intensity = 1 + easeProgress * 1.5
    sparkControls?.setSpeed(speed)
    sparkControls?.setIntensity(intensity)

    if (progress < 1) {
      requestAnimationFrame(accelerate)
    }
  }
  accelerate()

  // 2. 蒸汽爆发
  const steamBursts = splashContainer.value?.querySelectorAll('.steam-burst')
  steamBursts?.forEach((steam, i) => {
    const el = steam as HTMLElement
    el.style.transition = `all ${overdriveDuration / 1000}s ease-out`
    el.style.opacity = '0.9'
    el.style.transform = `scale(${2 + i * 0.3}) translateY(-${100 + i * 30}px)`
  })

  // 3. 仪表爆表
  if (pressureNeedle.value) {
    pressureNeedle.value.style.transition = `transform ${overdriveDuration / 1000}s cubic-bezier(0.68,-0.55,0.265,1.55)`
    pressureNeedle.value.style.transform = 'rotate(85deg)'
  }

  // 4. 辉光管闪烁
  const nixieFlicker = setInterval(() => {
    updateNixieDigits()
  }, 50)
  setTimeout(() => clearInterval(nixieFlicker), overdriveDuration)

  // 5. 齿轮加速
  const masterGears = splashContainer.value?.querySelectorAll('.master-gear-1, .master-gear-2, .master-gear-3')
  masterGears?.forEach((gear) => {
    const el = gear as HTMLElement
    el.style.animationDuration = '0.3s'
  })

  // 6. 机构飞散
  const mechanisms = mechanismsContainer.value?.querySelectorAll('.piston-assembly, .linkage-system')
  mechanisms?.forEach((item, index) => {
    const el = item as HTMLElement
    el.style.transition = `all ${overdriveDuration / 1000}s ease-in`
    setTimeout(() => {
      const angle = (index * 90) % 360
      const distance = 400 + Math.random() * 200
      const dx = Math.cos((angle * Math.PI) / 180) * distance
      const dy = Math.sin((angle * Math.PI) / 180) * distance
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 180}deg) scale(0.3)`
      el.style.opacity = '0'
    }, 100)
  })

  // 7. 装饰器件飞散
  const decorItems = decorContainer.value?.querySelectorAll('.chronometer, .nixie-cluster, .pressure-gauge')
  decorItems?.forEach((item, index) => {
    const el = item as HTMLElement
    el.style.transition = `all ${overdriveDuration / 1000}s ease-in`
    setTimeout(() => {
      const angle = (index * 120 + 45) % 360
      const distance = 500 + Math.random() * 300
      const dx = Math.cos((angle * Math.PI) / 180) * distance
      const dy = Math.sin((angle * Math.PI) / 180) * distance
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg) scale(0.2)`
      el.style.opacity = '0'
    }, 200)
  })

  // 8. 控制面板消失
  setTimeout(() => {
    if (controlPanel.value) {
      controlPanel.value.style.transition = 'all 0.5s ease-out'
      controlPanel.value.style.transform = 'scale(0.8) rotateY(180deg)'
      controlPanel.value.style.opacity = '0'
    }
  }, overdriveDuration - 600)
}

onMounted(async () => {
  // 初始化粒子系统
  sparkControls = initSparkSystem() || null

  // 辉光管更新
  nixieInterval = window.setInterval(updateNixieDigits, 800)

  // 气压表抖动
  const needleInterval = setInterval(jitterNeedle, 150)

  // 加载文字轮换
  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 900)

  const minDisplayTime = 1800 // 最小显示1.8秒
  const startTime = Date.now()

  // 等待数据预加载
  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[BrassEraSplash] Data preload finished')
    } catch (error) {
      console.error('[BrassEraSplash] Preload error:', error)
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

  // 触发过载充能
  triggerOverdrive()

  // 等待动画完成
  await new Promise((resolve) => setTimeout(resolve, 2000))

  clearInterval(needleInterval)
  visible.value = false
  console.log('[BrassEraSplash] Hidden after', Date.now() - startTime, 'ms')

  setTimeout(() => {
    emit('finished')
  }, 500)
})

onUnmounted(() => {
  if (loadingTextInterval) {
    clearInterval(loadingTextInterval)
  }
  if (nixieInterval) {
    clearInterval(nixieInterval)
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$leather-brown: #2e1e13;
$oil-black: #0f0f0f;
$oxidized-brass: #b5a642;
$copper: #b87333;
$aged-bronze: #4b5d46;
$tungsten-warm: #ffaa33;
$gauge-green: #00ff00;
$ivory: #fffef0;

.brass-era-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: $oil-black;
}

// ==================== 第0层 - 蓝图背景 ====================
.blueprint-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .leather-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 60%, $leather-brown 0%, $oil-black 70%);
  }

  .blueprint-overlay {
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(0deg,
        transparent 0px,
        transparent 40px,
        rgba(60, 80, 120, 0.03) 40px,
        rgba(60, 80, 120, 0.03) 41px),
      repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 40px,
        rgba(60, 80, 120, 0.03) 40px,
        rgba(60, 80, 120, 0.03) 41px);
    opacity: 0.6;
  }
}

// 主传动齿轮
.master-gears {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gear {
  position: absolute;
  border-radius: 50%;
  background: rgba($oxidized-brass, 0.1);
  border: 2px solid rgba($oxidized-brass, 0.2);

  &::before {
    content: '';
    position: absolute;
    inset: 15%;
    border-radius: 50%;
    border: 2px solid rgba($oxidized-brass, 0.15);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 15%;
    height: 15%;
    background: rgba($oxidized-brass, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}

.master-gear-1 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  left: -100px;
  animation: gearRotateSlow 30s linear infinite;
}

.master-gear-2 {
  width: 300px;
  height: 300px;
  top: -80px;
  right: -50px;
  animation: gearRotateSlow 25s linear infinite reverse;
}

.master-gear-3 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  right: 10%;
  animation: gearRotateSlow 20s linear infinite;
}

@keyframes gearRotateSlow {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ==================== 第1层 - Canvas 粒子 ====================
.spark-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

// ==================== 第2层 - 蒸汽 ====================
.steam-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.steam-burst {
  position: absolute;
  width: 200px;
  height: 150px;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%);
  filter: blur(30px);
  opacity: 0;
  animation: steamPuff 6s ease-in-out infinite;

  &.steam-1 {
    left: -50px;
    bottom: 30%;
    animation-delay: 0s;
  }

  &.steam-2 {
    right: -60px;
    bottom: 40%;
    animation-delay: 1.5s;
  }

  &.steam-3 {
    left: 10%;
    top: 10%;
    width: 150px;
    height: 100px;
    animation-delay: 3s;
  }

  &.steam-4 {
    right: 15%;
    bottom: 20%;
    width: 180px;
    height: 120px;
    animation-delay: 4.5s;
  }
}

@keyframes steamPuff {

  0%,
  100% {
    opacity: 0;
    transform: scale(0.5) translateY(0);
  }

  20% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.3;
    transform: scale(1.2) translateY(-30px);
  }

  80% {
    opacity: 0;
    transform: scale(1.5) translateY(-60px);
  }
}

// ==================== 第3层 - 机械组件 ====================
.active-mechanisms {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.piston-assembly {
  position: absolute;
  width: 60px;

  .piston-cylinder {
    position: absolute;
    width: 100%;
    height: 150px;
    background: linear-gradient(90deg,
        rgba($aged-bronze, 0.3) 0%,
        rgba($copper, 0.5) 30%,
        rgba($copper, 0.5) 70%,
        rgba($aged-bronze, 0.3) 100%);
    border-radius: 8px;
    border: 2px solid rgba($oxidized-brass, 0.4);
  }

  .piston-rod {
    position: absolute;
    left: 50%;
    width: 12px;
    height: 100px;
    background: linear-gradient(90deg, rgba($oxidized-brass, 0.6) 0%, rgba($oxidized-brass, 0.9) 50%, rgba($oxidized-brass, 0.6) 100%);
    transform: translateX(-50%);
    animation: pistonPump 2s ease-in-out infinite;
  }

  .piston-head {
    position: absolute;
    left: 50%;
    top: -30px;
    width: 50px;
    height: 30px;
    background: linear-gradient(180deg, rgba($copper, 0.8) 0%, rgba($oxidized-brass, 0.9) 100%);
    border-radius: 8px 8px 0 0;
    transform: translateX(-50%);
    animation: pistonPump 2s ease-in-out infinite;
    box-shadow: 0 -5px 20px rgba($tungsten-warm, 0.3);
  }

  &.left-piston {
    left: 30px;
    bottom: 50px;

    .piston-rod,
    .piston-head {
      animation-delay: 0s;
    }
  }

  &.right-piston {
    right: 30px;
    bottom: 50px;

    .piston-rod,
    .piston-head {
      animation-delay: 1s;
    }
  }
}

@keyframes pistonPump {

  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  50% {
    transform: translateX(-50%) translateY(40px);
  }
}

.linkage-system {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 60px;

  .linkage-arm {
    position: absolute;
    height: 8px;
    background: linear-gradient(90deg, rgba($copper, 0.7) 0%, rgba($oxidized-brass, 0.9) 50%, rgba($copper, 0.7) 100%);
    border-radius: 4px;
    transform-origin: left center;

    &.arm-1 {
      width: 120px;
      left: 20%;
      top: 50%;
      animation: linkageSwing 3s ease-in-out infinite;
    }

    &.arm-2 {
      width: 100px;
      right: 20%;
      top: 50%;
      transform-origin: right center;
      animation: linkageSwing 3s ease-in-out infinite reverse;
    }
  }

  .linkage-joint {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, $oxidized-brass 0%, $copper 100%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 15px rgba($tungsten-warm, 0.4);
    animation: jointPulse 1.5s ease-in-out infinite;
  }
}

@keyframes linkageSwing {

  0%,
  100% {
    transform: rotate(-10deg);
  }

  50% {
    transform: rotate(10deg);
  }
}

@keyframes jointPulse {

  0%,
  100% {
    box-shadow: 0 0 15px rgba($tungsten-warm, 0.4);
  }

  50% {
    box-shadow: 0 0 25px rgba($tungsten-warm, 0.7);
  }
}

// ==================== 第4层 - 装饰性机械 ====================
.decorative-machinery {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

// 精密时计
.chronometer {
  position: absolute;
  right: 40px;
  bottom: 100px;
  width: 140px;
  height: 140px;

  .chrono-frame {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, $copper 0%, $oxidized-brass 50%, $aged-bronze 100%);
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.2),
      inset 0 -2px 4px rgba(0, 0, 0, 0.4),
      0 5px 20px rgba(0, 0, 0, 0.5);
  }

  .chrono-face {
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    background: radial-gradient(circle, #1a1512 0%, #0a0908 100%);
    overflow: hidden;
  }

  .chrono-gear {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba($oxidized-brass, 0.4);
    background: rgba($oxidized-brass, 0.1);

    &.gear-inner-1 {
      width: 40px;
      height: 40px;
      top: 20px;
      left: 15px;
      animation: gearRotateSlow 4s linear infinite;
    }

    &.gear-inner-2 {
      width: 30px;
      height: 30px;
      bottom: 25px;
      right: 20px;
      animation: gearRotateSlow 3s linear infinite reverse;
    }

    &.gear-inner-3 {
      width: 25px;
      height: 25px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: gearRotateSlow 5s linear infinite;
    }
  }

  .chrono-hand {
    position: absolute;
    left: 50%;
    bottom: 50%;
    transform-origin: bottom center;
    background: $oxidized-brass;

    &.hour-hand {
      width: 3px;
      height: 25px;
      transform: translateX(-50%) rotate(45deg);
      animation: hourHand 43200s linear infinite;
    }

    &.minute-hand {
      width: 2px;
      height: 35px;
      transform: translateX(-50%) rotate(120deg);
      animation: minuteHand 3600s linear infinite;
    }

    &.second-hand {
      width: 1px;
      height: 40px;
      background: $tungsten-warm;
      transform: translateX(-50%);
      animation: secondHand 60s linear infinite;
      box-shadow: 0 0 5px $tungsten-warm;
    }
  }

  .chrono-glass {
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

@keyframes secondHand {
  from {
    transform: translateX(-50%) rotate(0deg);
  }

  to {
    transform: translateX(-50%) rotate(360deg);
  }
}

@keyframes minuteHand {
  from {
    transform: translateX(-50%) rotate(0deg);
  }

  to {
    transform: translateX(-50%) rotate(360deg);
  }
}

@keyframes hourHand {
  from {
    transform: translateX(-50%) rotate(0deg);
  }

  to {
    transform: translateX(-50%) rotate(360deg);
  }
}

// 辉光管
.nixie-cluster {
  position: absolute;
  left: 40px;
  top: 80px;
  display: flex;
  gap: 8px;
}

.nixie-tube {
  width: 35px;
  height: 55px;
  position: relative;
  background: linear-gradient(180deg, #1a1510 0%, #0a0805 100%);
  border: 2px solid rgba($copper, 0.6);
  border-radius: 8px 8px 4px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.8),
    0 2px 10px rgba(0, 0, 0, 0.5);

  .nixie-glow {
    position: absolute;
    inset: 5px;
    background: radial-gradient(ellipse at center, rgba($tungsten-warm, 0.2) 0%, transparent 70%);
    animation: nixieFlicker 0.1s ease-in-out infinite;
  }

  .nixie-digit {
    font-family: 'Courier New', monospace;
    font-size: 28px;
    font-weight: bold;
    color: $tungsten-warm;
    text-shadow: 0 0 10px $tungsten-warm, 0 0 20px rgba($tungsten-warm, 0.5);
    z-index: 1;
  }

  .nixie-cage {
    position: absolute;
    inset: 3px;
    border: 1px solid rgba($oxidized-brass, 0.2);
    border-radius: 6px 6px 2px 2px;
    background: repeating-linear-gradient(0deg,
        transparent 0px,
        transparent 3px,
        rgba($oxidized-brass, 0.05) 3px,
        rgba($oxidized-brass, 0.05) 4px);
  }
}

@keyframes nixieFlicker {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

// 气压表
.pressure-gauge {
  position: absolute;
  left: 50px;
  bottom: 150px;
  width: 80px;
  height: 80px;

  .gauge-frame {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, $copper 0%, $aged-bronze 100%);
    box-shadow:
      inset 0 1px 3px rgba(255, 255, 255, 0.2),
      0 3px 10px rgba(0, 0, 0, 0.4);
  }

  .gauge-face {
    position: absolute;
    inset: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, $ivory 0%, #e8e4d8 100%);
    overflow: hidden;
  }

  .gauge-markings {
    position: absolute;
    inset: 0;
    background:
      repeating-conic-gradient(from -135deg,
        transparent 0deg,
        transparent 13.5deg,
        rgba(0, 0, 0, 0.6) 13.5deg,
        rgba(0, 0, 0, 0.6) 14.5deg);
    clip-path: polygon(50% 50%, 0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }

  .gauge-needle {
    position: absolute;
    left: 50%;
    bottom: 50%;
    width: 3px;
    height: 28px;
    background: linear-gradient(to top, #1a1a1a 0%, #333 50%, #c00 100%);
    transform-origin: bottom center;
    transform: translateX(-50%) rotate(-45deg);
    transition: transform 0.15s ease-out;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      width: 8px;
      height: 8px;
      background: #333;
      border-radius: 50%;
      transform: translateX(-50%);
    }
  }
}

// ==================== 控制面板 ====================
.control-panel {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 50px 60px;
  background: linear-gradient(135deg,
      rgba(30, 25, 20, 0.95) 0%,
      rgba(20, 15, 10, 0.98) 50%,
      rgba(25, 20, 15, 0.95) 100%);
  border-radius: 12px;
  box-shadow:
    0 0 0 4px rgba($copper, 0.6),
    0 0 0 8px rgba($oxidized-brass, 0.3),
    0 20px 60px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  &.overdrive-shake {
    animation: overdriveShake 0.08s ease-in-out infinite;
  }
}

@keyframes overdriveShake {

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

.panel-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .rivet {
    position: absolute;
    width: 10px;
    height: 10px;
    background: radial-gradient(circle at 30% 30%, $oxidized-brass 0%, $copper 50%, $aged-bronze 100%);
    border-radius: 50%;
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.3),
      0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .corner-gear {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: radial-gradient(circle, $oxidized-brass 0%, $copper 60%, $aged-bronze 100%);
    box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.2);

    &::before {
      content: '';
      position: absolute;
      inset: 5px;
      border-radius: 50%;
      border: 2px solid rgba($aged-bronze, 0.5);
    }

    &.corner-tl {
      top: -15px;
      left: -15px;
      animation: gearRotateSlow 8s linear infinite;
    }

    &.corner-tr {
      top: -15px;
      right: -15px;
      animation: gearRotateSlow 8s linear infinite reverse;
    }

    &.corner-bl {
      bottom: -15px;
      left: -15px;
      animation: gearRotateSlow 8s linear infinite reverse;
    }

    &.corner-br {
      bottom: -15px;
      right: -15px;
      animation: gearRotateSlow 8s linear infinite;
    }
  }
}

.panel-surface {
  position: relative;
  z-index: 1;

  .metal-texture {
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;

  .logo-icon {
    width: 90px;
    height: 90px;
    position: relative;
    z-index: 1;
  }

  .brass-icon {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 10px rgba($tungsten-warm, 0.5));

    .outer-ring {
      animation: ringPulse 3s ease-in-out infinite;
    }

    .note-circle {
      animation: noteBounce 2s ease-in-out infinite;

      &.delay {
        animation-delay: 0.5s;
      }
    }

    .logo-gear {
      animation: gearRotateSlow 6s linear infinite;
    }
  }

  .logo-glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle, rgba($tungsten-warm, 0.3) 0%, transparent 60%);
    animation: logoGlowPulse 2s ease-in-out infinite;
  }
}

@keyframes ringPulse {

  0%,
  100% {
    stroke-width: 3;
    opacity: 1;
  }

  50% {
    stroke-width: 4;
    opacity: 0.8;
  }
}

@keyframes noteBounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

@keyframes logoGlowPulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.app-name {
  text-align: center;
  font-family: 'Courier New', 'SimHei', monospace;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 28px;
  letter-spacing: 4px;

  .char {
    display: inline-block;
    background: linear-gradient(135deg, $oxidized-brass 0%, $tungsten-warm 50%, $copper 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    animation: charEmboss 0.8s ease-out forwards;
    opacity: 0;
    transform: translateY(10px) rotateX(45deg);
    filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.5)) drop-shadow(-1px -1px 0 rgba(255, 255, 255, 0.1));
  }
}

@keyframes charEmboss {
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

.loading-indicator {
  text-align: center;
}

.loading-gauge {
  position: relative;
  width: 280px;
  height: 20px;
  margin: 0 auto 16px;

  .gauge-track {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, #0a0805 0%, #1a1510 50%, #0a0805 100%);
    border: 2px solid rgba($copper, 0.5);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8);
  }

  .gauge-fill {
    position: absolute;
    top: 2px;
    left: 2px;
    bottom: 2px;
    width: 0%;
    background: linear-gradient(90deg,
        rgba($aged-bronze, 0.8) 0%,
        rgba($oxidized-brass, 0.9) 40%,
        rgba($tungsten-warm, 1) 60%,
        rgba($tungsten-warm, 1) 100%);
    border-radius: 8px;
    animation: gaugeFill 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    box-shadow: 0 0 15px rgba($tungsten-warm, 0.6);
  }

  .gauge-markers {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;

    .marker {
      width: 2px;
      height: 100%;
      background: rgba($oxidized-brass, 0.3);
    }
  }

  .gauge-pointer {
    position: absolute;
    top: -8px;
    left: 0%;
    width: 12px;
    height: 36px;
    background: linear-gradient(180deg, $oxidized-brass 0%, $copper 100%);
    clip-path: polygon(50% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%);
    animation: pointerMove 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }
}

@keyframes gaugeFill {
  from {
    width: 0%;
  }

  to {
    width: calc(100% - 4px);
  }
}

@keyframes pointerMove {
  from {
    left: 0%;
  }

  to {
    left: calc(100% - 12px);
  }
}

.loading-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: rgba($oxidized-brass, 0.8);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.panel-steam {
  position: absolute;
  inset: -10px;
  border-radius: 20px;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(255, 255, 255, 0.1) 100%);
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
    animation: panelSteamBurst 0.5s ease-out infinite;
  }
}

@keyframes panelSteamBurst {

  0%,
  100% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  }

  50% {
    box-shadow: 0 0 60px rgba(255, 255, 255, 0.5);
  }
}

// ==================== 过载特效层 ====================
.overdrive-layer {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
  }

  .aperture-iris {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    transform: translate(-50%, -50%);

    .active & {
      animation: irisOpen 1.5s ease-out 0.5s forwards;
    }
  }

  .iris-blade {
    position: absolute;
    width: 100px;
    height: 200px;
    background: linear-gradient(to bottom, transparent 0%, rgba($tungsten-warm, 0.3) 50%, transparent 100%);
    transform-origin: center bottom;
    transform: rotate(calc(var(--blade-index) * 45deg));
    opacity: 0;

    .active & {
      animation: bladeAppear 0.5s ease-out calc(var(--blade-index) * 0.05s + 0.5s) forwards;
    }
  }

  .tunnel-vortex {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center,
        rgba($tungsten-warm, 0.4) 0%,
        rgba($copper, 0.2) 30%,
        transparent 60%);
    opacity: 0;

    .active & {
      animation: vortexPulse 0.3s ease-in-out 1s infinite;
    }
  }

  .thermal-flash {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba($tungsten-warm, 0.8) 0%, transparent 70%);
    opacity: 0;

    .active & {
      animation: thermalFlash 0.8s ease-out 1.6s forwards;
    }
  }
}

@keyframes irisOpen {
  from {
    width: 0;
    height: 0;
  }

  to {
    width: 600px;
    height: 600px;
  }
}

@keyframes bladeAppear {
  from {
    opacity: 0;
    transform: rotate(calc(var(--blade-index) * 45deg)) scaleY(0);
  }

  to {
    opacity: 1;
    transform: rotate(calc(var(--blade-index) * 45deg)) scaleY(1);
  }
}

@keyframes vortexPulse {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes thermalFlash {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, rgba($tungsten-warm, 0.5) 50%, transparent 80%);
  }
}

// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  .version {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: rgba($oxidized-brass, 0.5);
    letter-spacing: 2px;
  }
}

// ==================== 过渡动画 ====================
.brass-fade-enter-active {
  animation: brassFadeIn 0.5s ease-out;
}

.brass-fade-leave-active {
  animation: brassFadeOut 0.5s ease-in;
}

@keyframes brassFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes brassFadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

// ==================== 新增华丽元素 ====================

// 金色光晕边框
.golden-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba($oxidized-brass, 0.08) 70%, rgba($tungsten-warm, 0.15) 100%);
  pointer-events: none;
  animation: vignetteGlow 4s ease-in-out infinite;
}

@keyframes vignetteGlow {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

// 额外的主齿轮
.master-gear-4 {
  width: 250px;
  height: 250px;
  top: 40%;
  left: -80px;
  animation: gearRotateSlow 22s linear infinite reverse;
}

.master-gear-5 {
  width: 180px;
  height: 180px;
  top: 10%;
  left: 45%;
  animation: gearRotateSlow 28s linear infinite;
}

// 蒸汽管道网络
.pipe-network {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.pipe {
  position: absolute;
  background: linear-gradient(90deg,
      rgba($aged-bronze, 0.4) 0%,
      rgba($copper, 0.6) 20%,
      rgba($copper, 0.6) 80%,
      rgba($aged-bronze, 0.4) 100%);
  border: 1px solid rgba($oxidized-brass, 0.3);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);

  &.pipe-horizontal {
    height: 12px;
    width: 35%;
    border-radius: 6px;

    &.pipe-top {
      top: 60px;
      left: 0;
    }

    &.pipe-bottom {
      bottom: 80px;
      right: 0;
    }
  }

  &.pipe-vertical {
    width: 12px;
    height: 30%;
    border-radius: 6px;

    &.pipe-left {
      left: 50px;
      top: 0;
    }

    &.pipe-right {
      right: 60px;
      bottom: 0;
    }
  }
}

.pipe-joint {
  position: absolute;
  width: 28px;
  height: 28px;
  background: radial-gradient(circle, $copper 0%, $aged-bronze 100%);
  border-radius: 50%;
  border: 2px solid rgba($oxidized-brass, 0.5);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 3px 8px rgba(0, 0, 0, 0.3);

  &::before {
    content: '';
    position: absolute;
    inset: 6px;
    background: rgba($aged-bronze, 0.8);
    border-radius: 50%;
  }

  &.joint-tl {
    top: 54px;
    left: 44px;
  }

  &.joint-tr {
    top: 54px;
    right: 54px;
  }

  &.joint-bl {
    bottom: 74px;
    left: 44px;
  }

  &.joint-br {
    bottom: 74px;
    right: 54px;
  }
}

.pipe-steam {
  position: absolute;
  width: 40px;
  height: 60px;
  background: radial-gradient(ellipse at bottom, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
  filter: blur(8px);
  animation: pipeSteam 3s ease-in-out infinite;

  &.pipe-steam-1 {
    top: 40px;
    left: 80px;
    animation-delay: 0s;
  }

  &.pipe-steam-2 {
    bottom: 60px;
    right: 100px;
    animation-delay: 1s;
  }

  &.pipe-steam-3 {
    top: 50%;
    left: 40px;
    animation-delay: 2s;
  }
}

@keyframes pipeSteam {

  0%,
  100% {
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }

  50% {
    opacity: 0.7;
    transform: translateY(-20px) scale(1.2);
  }
}

// 浮动齿轮链
.floating-gear-chain {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.floating-gear {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($oxidized-brass, 0.3) 0%, rgba($copper, 0.2) 60%, transparent 100%);
  border: 1px solid rgba($oxidized-brass, 0.25);
  animation: floatAndRotate 15s linear infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 20%;
    border-radius: 50%;
    border: 1px dashed rgba($oxidized-brass, 0.3);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20%;
    height: 20%;
    background: rgba($oxidized-brass, 0.4);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}

@keyframes floatAndRotate {
  0% {
    transform: rotate(0deg) translateY(0);
    opacity: 0.4;
  }

  25% {
    transform: rotate(90deg) translateY(-5px);
    opacity: 0.7;
  }

  50% {
    transform: rotate(180deg) translateY(0);
    opacity: 0.5;
  }

  75% {
    transform: rotate(270deg) translateY(5px);
    opacity: 0.6;
  }

  100% {
    transform: rotate(360deg) translateY(0);
    opacity: 0.4;
  }
}

// 额外蒸汽
.steam-5 {
  left: 50%;
  top: 5%;
  width: 250px;
  height: 180px;
  animation-delay: 2s;
}

.steam-6 {
  right: 30%;
  bottom: 10%;
  width: 220px;
  height: 160px;
  animation-delay: 5s;
}

// 活塞蒸汽喷射
.piston-steam {
  position: absolute;
  top: -40px;
  left: 50%;
  width: 30px;
  height: 40px;
  background: radial-gradient(ellipse at bottom, rgba(255, 255, 255, 0.6) 0%, transparent 80%);
  filter: blur(6px);
  transform: translateX(-50%);
  animation: pistonSteamPuff 2s ease-out infinite;
}

@keyframes pistonSteamPuff {

  0%,
  60% {
    opacity: 0;
    transform: translateX(-50%) translateY(0) scale(0.5);
  }

  70% {
    opacity: 0.8;
    transform: translateX(-50%) translateY(-15px) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-35px) scale(1.3);
  }
}

// 飞轮装饰
.flywheel {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background:
    radial-gradient(circle, transparent 30%, rgba($copper, 0.3) 35%, transparent 40%),
    radial-gradient(circle, rgba($oxidized-brass, 0.2) 0%, transparent 70%);
  border: 3px solid rgba($oxidized-brass, 0.4);
  animation: flywheelSpin 4s linear infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 15px;
    border-radius: 50%;
    border: 2px solid rgba($copper, 0.5);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 15px;
    height: 15px;
    background: $oxidized-brass;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 10px rgba($tungsten-warm, 0.5);
  }

  &.flywheel-left {
    left: 80px;
    top: 40%;
    animation-direction: normal;
  }

  &.flywheel-right {
    right: 80px;
    top: 45%;
    animation-direction: reverse;
    animation-duration: 3.5s;
  }
}

@keyframes flywheelSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 增强版时计
.chrono-outer-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba($oxidized-brass, 0.4);
  animation: chronoRingPulse 3s ease-in-out infinite;
}

@keyframes chronoRingPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.chrono-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, $tungsten-warm 0%, $copper 100%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px $tungsten-warm;
}

.chrono-glow {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($tungsten-warm, 0.2) 0%, transparent 70%);
  animation: chronoGlow 2s ease-in-out infinite;
}

@keyframes chronoGlow {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

.chrono-gear.gear-inner-4 {
  width: 20px;
  height: 20px;
  top: 60%;
  left: 25%;
  animation: gearRotateSlow 2.5s linear infinite reverse;
}

// 辉光管反光
.nixie-reflection {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 80%;
  height: 30%;
  background: linear-gradient(to top, rgba($tungsten-warm, 0.15) 0%, transparent 100%);
  transform: translateX(-50%);
  border-radius: 0 0 4px 4px;
}

// 增强版气压表
.gauge-main {
  width: 100px !important;
  height: 100px !important;
}

.gauge-secondary {
  width: 50px !important;
  height: 50px !important;

  &.gauge-top-right {
    position: absolute;
    right: 120px;
    top: 100px;
  }

  .gauge-needle.needle-2 {
    height: 18px;
    animation: needleWobble 2s ease-in-out infinite;
  }
}

@keyframes needleWobble {

  0%,
  100% {
    transform: translateX(-50%) rotate(-30deg);
  }

  50% {
    transform: translateX(-50%) rotate(30deg);
  }
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, #333 0%, #111 100%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.gauge-glass {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

.gauge-labels {
  position: absolute;
  inset: 0;
  font-size: 6px;
  color: rgba(0, 0, 0, 0.5);
}

// 温度计
.thermometer {
  position: absolute;
  left: 140px;
  bottom: 120px;
  width: 20px;
  height: 80px;

  .thermo-tube {
    position: absolute;
    top: 0;
    left: 50%;
    width: 10px;
    height: 60px;
    background: linear-gradient(90deg, rgba(200, 200, 200, 0.3) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(200, 200, 200, 0.3) 100%);
    border: 1px solid rgba($copper, 0.5);
    border-radius: 5px 5px 0 0;
    transform: translateX(-50%);
  }

  .thermo-mercury {
    position: absolute;
    bottom: 25px;
    left: 50%;
    width: 6px;
    height: 0%;
    background: linear-gradient(to top, #c00 0%, #f44 100%);
    border-radius: 3px;
    transform: translateX(-50%);
    animation: mercuryRise 3s ease-in-out infinite;
  }

  .thermo-bulb {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 18px;
    height: 18px;
    background: radial-gradient(circle at 30% 30%, #f66 0%, #c00 100%);
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
  }
}

@keyframes mercuryRise {

  0%,
  100% {
    height: 30%;
  }

  50% {
    height: 70%;
  }
}

// 铜制望远镜
.telescope {
  position: absolute;
  right: 50px;
  top: 180px;
  width: 120px;
  height: 25px;
  transform: rotate(-25deg);

  .telescope-body {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
        rgba($copper, 0.8) 0%,
        rgba($oxidized-brass, 0.9) 30%,
        rgba($copper, 0.8) 70%,
        rgba($aged-bronze, 0.7) 100%);
    border-radius: 12px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
  }

  .telescope-lens {
    position: absolute;
    left: -8px;
    top: 50%;
    width: 20px;
    height: 30px;
    background: linear-gradient(180deg,
        rgba($copper, 0.9) 0%,
        rgba($oxidized-brass, 1) 50%,
        rgba($copper, 0.9) 100%);
    border-radius: 10px;
    transform: translateY(-50%);

    &::before {
      content: '';
      position: absolute;
      left: 3px;
      top: 50%;
      width: 12px;
      height: 12px;
      background: radial-gradient(circle, rgba(150, 200, 255, 0.6) 0%, rgba(100, 150, 200, 0.3) 100%);
      border-radius: 50%;
      transform: translateY(-50%);
    }
  }

  .telescope-rings {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 20px,
        rgba($aged-bronze, 0.5) 20px,
        rgba($aged-bronze, 0.5) 24px);
    border-radius: 12px;
  }
}

// 飞艇剪影
.airship-silhouette {
  position: absolute;
  top: 60px;
  right: 180px;
  width: 80px;
  height: 35px;
  background: rgba($oxidized-brass, 0.15);
  border-radius: 50% 50% 30% 30%;
  animation: airshipFloat 8s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    width: 30px;
    height: 18px;
    background: rgba($oxidized-brass, 0.12);
    border-radius: 0 0 8px 8px;
    transform: translateX(-50%);
  }

  &::after {
    content: '';
    position: absolute;
    right: -20px;
    top: 40%;
    width: 25px;
    height: 8px;
    background: rgba($oxidized-brass, 0.1);
    border-radius: 4px;
  }
}

@keyframes airshipFloat {

  0%,
  100% {
    transform: translateX(0) translateY(0);
  }

  25% {
    transform: translateX(10px) translateY(-5px);
  }

  50% {
    transform: translateX(5px) translateY(3px);
  }

  75% {
    transform: translateX(-5px) translateY(-2px);
  }
}

// 连杆机构增强
.linkage-arm.arm-3 {
  width: 80px;
  left: 50%;
  top: 70%;
  transform-origin: center center;
  animation: linkageSwing 3s ease-in-out infinite;
  animation-delay: 0.5s;
}

.linkage-joint.joint-1 {
  left: 35%;
  animation: jointPulse 1.5s ease-in-out infinite;
}

.linkage-joint.joint-2 {
  left: 65%;
  animation: jointPulse 1.5s ease-in-out infinite;
  animation-delay: 0.75s;
}

// ==================== 控制面板增强 ====================

// 面板外发光
.panel-outer-glow {
  position: absolute;
  inset: -20px;
  border-radius: 32px;
  background: radial-gradient(ellipse at center, rgba($tungsten-warm, 0.15) 0%, transparent 70%);
  animation: panelGlowPulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes panelGlowPulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

// 装饰边框条纹
.frame-stripe {
  position: absolute;
  left: 15%;
  right: 15%;
  height: 3px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba($oxidized-brass, 0.3) 20%,
      rgba($oxidized-brass, 0.5) 50%,
      rgba($oxidized-brass, 0.3) 80%,
      transparent 100%);

  &.stripe-top {
    top: 20px;
  }

  &.stripe-bottom {
    bottom: 20px;
  }
}

// 指示灯
.indicator-light {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4a4a4a 0%, #2a2a2a 100%);
  border: 1px solid rgba($copper, 0.5);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);

  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 50%;
    animation: lightBlink 2s ease-in-out infinite;
  }

  &.light-1 {
    top: 12px;
    right: 40px;

    &::before {
      background: radial-gradient(circle, #00ff00 0%, #00aa00 100%);
      animation-delay: 0s;
    }
  }

  &.light-2 {
    top: 12px;
    right: 55px;

    &::before {
      background: radial-gradient(circle, $tungsten-warm 0%, #ff8800 100%);
      animation-delay: 0.7s;
    }
  }

  &.light-3 {
    top: 12px;
    right: 70px;

    &::before {
      background: radial-gradient(circle, #ff4444 0%, #cc0000 100%);
      animation-delay: 1.4s;
    }
  }
}

@keyframes lightBlink {

  0%,
  40%,
  100% {
    opacity: 0.3;
    box-shadow: none;
  }

  50%,
  90% {
    opacity: 1;
    box-shadow: 0 0 8px currentColor;
  }
}

// 面板内边框
.panel-inner-border {
  position: absolute;
  inset: 12px;
  border: 1px solid rgba($oxidized-brass, 0.2);
  border-radius: 8px;
  pointer-events: none;
}

// Logo外圈装饰
.logo-outer-ring {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  border: 2px dashed rgba($oxidized-brass, 0.3);
  animation: logoOuterRingSpin 20s linear infinite;
}

@keyframes logoOuterRingSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// Logo闪光效果
.logo-sparkle {
  position: absolute;
  top: 10%;
  right: 20%;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
  box-shadow: 0 0 10px white, 0 0 20px $tungsten-warm;
}

@keyframes sparkle {

  0%,
  100% {
    opacity: 0;
    transform: scale(0.5);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

// SVG外圈装饰动画
.outer-deco-ring {
  animation: decoRingRotate 30s linear infinite reverse;
  transform-origin: center;
}

@keyframes decoRingRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 第二个Logo齿轮
.logo-gear.gear-2 {
  animation: gearRotateSlow 5s linear infinite reverse;
}

// 副标题装饰
.subtitle-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;

  .deco-line {
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba($oxidized-brass, 0.5) 50%, transparent 100%);
  }

  .deco-gear {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle, $oxidized-brass 0%, $copper 100%);
    border: 1px solid rgba($oxidized-brass, 0.5);
    animation: gearRotateSlow 8s linear infinite;

    &::before {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

// 加载条发光效果
.gauge-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba($tungsten-warm, 0.8) 100%);
  border-radius: 8px;
  animation: gaugeGlowMove 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  filter: blur(4px);
}

@keyframes gaugeGlowMove {
  from {
    width: 0%;
  }

  to {
    width: 100%;
  }
}
</style>
