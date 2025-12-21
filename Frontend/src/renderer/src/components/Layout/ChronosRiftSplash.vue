<template>
  <Transition name="chronos-fade">
    <div v-if="visible" class="chronos-splash">
      <!-- 第0层 - 色彩奇点涡流 -->
      <canvas ref="vortexCanvas" class="vortex-canvas"></canvas>

      <!-- 第1层 - Canvas 粒子系统：时间碎片 -->
      <canvas ref="shardCanvas" class="shard-canvas"></canvas>

      <!-- 第2层 - 熔化时钟 -->
      <div class="melting-clocks">
        <div class="melting-clock clock-1" :class="{ frozen: isTimeFrozen }">
          <canvas ref="clock1Canvas" class="clock-face"></canvas>
        </div>
        <div class="melting-clock clock-2" :class="{ frozen: isTimeFrozen }">
          <canvas ref="clock2Canvas" class="clock-face"></canvas>
        </div>
        <div class="melting-clock clock-3" :class="{ frozen: isTimeFrozen }">
          <canvas ref="clock3Canvas" class="clock-face"></canvas>
        </div>
      </div>

      <!-- 第3层 - 光谱纽带 -->
      <div class="spectral-ribbons">
        <div v-for="i in 5" :key="i" class="ribbon" :style="{ '--i': i }"></div>
      </div>

      <!-- 第4层 - 装饰性元素：摆锤和齿轮 -->
      <div class="decorations">
        <div class="pendulum" :class="{ frozen: isTimeFrozen }">
          <div class="pendulum-arm"></div>
          <div class="pendulum-bob"></div>
          <div class="pendulum-trail"></div>
        </div>
        <div class="gear gear-1" :class="{ frozen: isTimeFrozen }"></div>
        <div class="gear gear-2" :class="{ frozen: isTimeFrozen }"></div>
      </div>

      <!-- 故障干扰效果 -->
      <div class="glitch-overlay" :class="{ active: glitchActive }"></div>

      <!-- RGB分离故障波 -->
      <div class="glitch-wave" :class="{ active: glitchWaveActive }"></div>

      <!-- 破碎镜面主容器 -->
      <div class="shattered-mirror" :class="{ shattering: isShattering }" ref="mirrorPanel">
        <!-- 色差位移效果 -->
        <div class="chromatic-aberration"></div>

        <!-- 光束裂纹边框 -->
        <div class="fracture-border">
          <div class="fracture-line" v-for="i in 8" :key="i" :style="{ '--i': i }"></div>
        </div>

        <!-- 像素剥落效果 -->
        <div class="pixel-sorting">
          <div class="pixel-block" v-for="i in 12" :key="i" :style="{ '--i': i }"></div>
        </div>

        <!-- 时空涟漪波动 -->
        <div class="wave-distortion"></div>

        <!-- 面板内容 -->
        <div class="panel-content">
          <!-- Logo - 扭曲的时钟图标 -->
          <div class="logo-container">
            <div class="logo-clock">
              <div class="clock-ring ring-1"></div>
              <div class="clock-ring ring-2"></div>
              <div class="clock-ring ring-3"></div>
              <div class="clock-hand hour-hand"></div>
              <div class="clock-hand minute-hand"></div>
              <div class="clock-center"></div>
            </div>
            <!-- 虹彩光晕 -->
            <div class="logo-aura"></div>
          </div>

          <!-- 应用名称 - 扭曲字体效果 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.08}s`, '--distort': getDistortion(index) }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 - 噪点波动线条 -->
          <div class="loading-indicator">
            <div class="loading-line">
              <div class="loading-progress"></div>
              <div class="loading-noise"></div>
            </div>
            <div class="loading-text">{{ loadingText }}</div>
          </div>
        </div>
      </div>

      <!-- 高潮动画层 -->
      <div class="climax-layer" :class="{ active: isClimaxActive }">
        <!-- 时间静止去色 -->
        <div class="time-freeze-filter"></div>

        <!-- 镜面粉碎碎片 -->
        <div class="shatter-fragments">
          <div class="fragment" v-for="i in 50" :key="i" :style="getFragmentStyle(i)"></div>
        </div>

        <!-- 涡流吞噬 -->
        <div class="vortex-consumption">
          <div class="singularity"></div>
        </div>

        <!-- 万花筒隧道 -->
        <div class="kaleidoscope-tunnel">
          <div class="tunnel-ring" v-for="i in 12" :key="i" :style="{ '--i': i }"></div>
        </div>

      </div>

      <!-- 底部信息 -->
      <div class="splash-footer"></div>
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
const isTimeFrozen = ref(false)
const isShattering = ref(false)
const isClimaxActive = ref(false)
const glitchActive = ref(false)
const glitchWaveActive = ref(false)
// mirrorPanel ref removed - not needed for current implementation

// Canvas refs
const vortexCanvas = ref<HTMLCanvasElement | null>(null)
const shardCanvas = ref<HTMLCanvasElement | null>(null)
const clock1Canvas = ref<HTMLCanvasElement | null>(null)
const clock2Canvas = ref<HTMLCanvasElement | null>(null)
const clock3Canvas = ref<HTMLCanvasElement | null>(null)

const appNameChars = '故里音乐助手'.split('')

const loadingTexts = ['Fragmenting time...', 'Bending reality...', 'Crossing the rift...', 'Emerging...']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

let loadingTextInterval: number | null = null
let glitchInterval: number | null = null
let animationFrameId: number | null = null

// 字符扭曲程度
const getDistortion = (index: number) => {
  return Math.sin(index * 0.5) * 10
}

// 碎片样式生成
const getFragmentStyle = (index: number) => {
  const angle = (index / 50) * Math.PI * 2
  const distance = 100 + Math.random() * 400
  const size = 5 + Math.random() * 20
  const delay = Math.random() * 0.3

  return {
    '--angle': `${angle}rad`,
    '--distance': `${distance}px`,
    '--size': `${size}px`,
    '--delay': `${delay}s`,
    '--rotate': `${Math.random() * 720 - 360}deg`
  }
}

// ==================== 色彩奇点涡流系统 ====================
const initVortexSystem = () => {
  const canvas = vortexCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  let time = 0
  let frozen = false

  const render = () => {
    if (frozen) return

    time += 0.008
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // 创建螺旋涡流
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height) * 0.7)
    gradient.addColorStop(0, '#000000')
    gradient.addColorStop(0.2, '#190033')
    gradient.addColorStop(0.4, `hsla(${330 + Math.sin(time) * 20}, 100%, 30%, 0.8)`)
    gradient.addColorStop(0.6, `hsla(${180 + Math.cos(time * 0.7) * 30}, 100%, 40%, 0.6)`)
    gradient.addColorStop(0.8, `hsla(${280 + Math.sin(time * 1.3) * 25}, 100%, 35%, 0.4)`)
    gradient.addColorStop(1, '#000000')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制螺旋臂
    const arms = 5
    for (let arm = 0; arm < arms; arm++) {
      const armAngle = (arm / arms) * Math.PI * 2 + time * 0.3

      ctx.beginPath()
      ctx.strokeStyle = `hsla(${(arm * 72 + time * 50) % 360}, 80%, 60%, 0.3)`
      ctx.lineWidth = 3

      for (let r = 10; r < Math.max(canvas.width, canvas.height) * 0.6; r += 5) {
        const spiralAngle = armAngle + r * 0.008 + Math.sin(r * 0.02 + time) * 0.3
        const x = cx + Math.cos(spiralAngle) * r
        const y = cy + Math.sin(spiralAngle) * r

        if (r === 10) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }

    // 中心奇点光晕
    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80)
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
    coreGradient.addColorStop(0.2, 'rgba(191, 0, 255, 0.6)')
    coreGradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.3)')
    coreGradient.addColorStop(1, 'transparent')

    ctx.fillStyle = coreGradient
    ctx.beginPath()
    ctx.arc(cx, cy, 80 + Math.sin(time * 3) * 10, 0, Math.PI * 2)
    ctx.fill()
  }

  return {
    render,
    freeze: () => { frozen = true },
    unfreeze: () => { frozen = false }
  }
}

// ==================== 时间碎片粒子系统 ====================
interface TimeShard {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  type: 'numeral' | 'glass'
  value: string
  size: number
  opacity: number
  color: string
  speedMultiplier: number
  reverseTime: boolean
}

let timeShards: TimeShard[] = []
let shardsFrozen = false

const initShardSystem = () => {
  const canvas = shardCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  const colors = ['#ff0055', '#00f0ff', '#bf00ff', '#ffd700', '#ffffff']

  const createShard = (): TimeShard => {
    const isNumeral = Math.random() > 0.4
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      type: isNumeral ? 'numeral' : 'glass',
      value: isNumeral ? numerals[Math.floor(Math.random() * numerals.length)] : '',
      size: isNumeral ? 20 + Math.random() * 30 : 10 + Math.random() * 25,
      opacity: 0.3 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedMultiplier: 0.3 + Math.random() * 1.5,
      reverseTime: false
    }
  }

  timeShards = Array.from({ length: 60 }, createShard)

  let mouseX = canvas.width / 2
  let mouseY = canvas.height / 2

  const handleMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY

    // 触发时间倒流
    timeShards.forEach(shard => {
      const dx = mouseX - shard.x
      const dy = mouseY - shard.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150) {
        shard.reverseTime = true
        setTimeout(() => { shard.reverseTime = false }, 500)
      }
    })
  }
  window.addEventListener('mousemove', handleMouseMove)

  const render = () => {
    if (shardsFrozen) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    timeShards.forEach(shard => {
      // 非线性运动 - 时间停顿与跳跃
      const speedFactor = shard.reverseTime ? -2 : 1
      const easeMultiplier = Math.sin(Date.now() * 0.001 * shard.speedMultiplier) * 0.5 + 1

      shard.x += shard.vx * speedFactor * easeMultiplier
      shard.y += shard.vy * speedFactor * easeMultiplier
      shard.rotation += shard.rotationSpeed * speedFactor

      // 磁场影响 - 非重力运动
      shard.vx += Math.sin(shard.y * 0.01 + Date.now() * 0.001) * 0.01
      shard.vy += Math.cos(shard.x * 0.01 + Date.now() * 0.001) * 0.01

      // 边界处理
      if (shard.x < -50) shard.x = canvas.width + 50
      if (shard.x > canvas.width + 50) shard.x = -50
      if (shard.y < -50) shard.y = canvas.height + 50
      if (shard.y > canvas.height + 50) shard.y = -50

      // 绘制
      ctx.save()
      ctx.translate(shard.x, shard.y)
      ctx.rotate(shard.rotation)
      ctx.globalAlpha = shard.opacity

      if (shard.type === 'numeral') {
        ctx.font = `bold ${shard.size}px "Playfair Display", serif`
        ctx.fillStyle = shard.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = shard.color
        ctx.shadowBlur = 15
        ctx.fillText(shard.value, 0, 0)
      } else {
        // 玻璃碎片
        ctx.beginPath()
        const points = 3 + Math.floor(Math.random() * 3)
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2
          const r = shard.size * (0.6 + Math.random() * 0.4)
          const x = Math.cos(angle) * r
          const y = Math.sin(angle) * r
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fillStyle = shard.color
        ctx.shadowColor = shard.color
        ctx.shadowBlur = 10
        ctx.fill()

        // 高光
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      ctx.restore()
    })
  }

  return {
    render,
    freeze: () => { shardsFrozen = true },
    convergeToCenter: () => {
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      timeShards.forEach(shard => {
        const dx = cx - shard.x
        const dy = cy - shard.y
        shard.vx = dx * 0.05
        shard.vy = dy * 0.05
        shard.rotationSpeed *= 3
      })
    }
  }
}

// ==================== 熔化时钟系统 ====================
const initClockSystem = (canvas: HTMLCanvasElement | null, speed: number, direction: number) => {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 200
  canvas.height = 200

  let angle = Math.random() * Math.PI * 2
  let frozen = false

  const render = () => {
    if (frozen) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cx = 100
    const cy = 100
    const radius = 80

    // 表盘
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'
    ctx.lineWidth = 3
    ctx.stroke()

    // 刻度
    for (let i = 0; i < 12; i++) {
      const tickAngle = (i / 12) * Math.PI * 2 - Math.PI / 2
      const innerR = radius - 15
      const outerR = radius - 5
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(tickAngle) * innerR, cy + Math.sin(tickAngle) * innerR)
      ctx.lineTo(cx + Math.cos(tickAngle) * outerR, cy + Math.sin(tickAngle) * outerR)
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // 疯狂旋转的指针
    angle += speed * direction * 0.05

    // 时针
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -radius * 0.5)
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 10
    ctx.stroke()
    ctx.restore()

    // 分针
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle * 3)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -radius * 0.7)
    ctx.strokeStyle = '#c0c0c0'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.shadowColor = '#c0c0c0'
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.restore()

    // 中心点
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#ffd700'
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 15
    ctx.fill()
  }

  return {
    render,
    freeze: () => { frozen = true }
  }
}

// ==================== 动画控制 ====================
let vortexControls: { render: () => void; freeze: () => void } | undefined
let shardControls: { render: () => void; freeze: () => void; convergeToCenter: () => void } | undefined
let clock1Controls: { render: () => void; freeze: () => void } | undefined
let clock2Controls: { render: () => void; freeze: () => void } | undefined
let clock3Controls: { render: () => void; freeze: () => void } | undefined

const mainLoop = () => {
  vortexControls?.render()
  shardControls?.render()
  clock1Controls?.render()
  clock2Controls?.render()
  clock3Controls?.render()
  animationFrameId = requestAnimationFrame(mainLoop)
}

// 触发故障效果
const triggerGlitch = () => {
  glitchActive.value = true
  setTimeout(() => { glitchActive.value = false }, 100)
}

// 触发故障波
const triggerGlitchWave = () => {
  glitchWaveActive.value = true
  setTimeout(() => { glitchWaveActive.value = false }, 300)
}

// 触发高潮动画 - 视界跨越
const triggerEventHorizon = () => {
  // 阶段1: 时间静止 (0-500ms)
  isTimeFrozen.value = true
  vortexControls?.freeze()
  shardControls?.freeze()
  clock1Controls?.freeze()
  clock2Controls?.freeze()
  clock3Controls?.freeze()
  isClimaxActive.value = true

  // 阶段2: 镜面粉碎 (500-1000ms)
  setTimeout(() => {
    isShattering.value = true
  }, 500)

  // 阶段3: 涡流吞噬 + 粒子向心 (800-1800ms)
  setTimeout(() => {
    shardsFrozen = false
    shardControls?.convergeToCenter()
  }, 800)

  // 阶段4: 万花筒隧道穿梭 (1500-2500ms)
  // CSS动画自动处理

  // 阶段5: 最终白光 (2200ms+)
  // CSS动画自动处理
}

onMounted(async () => {
  // 初始化所有系统
  vortexControls = initVortexSystem()
  shardControls = initShardSystem()
  clock1Controls = initClockSystem(clock1Canvas.value, 1.5, 1)
  clock2Controls = initClockSystem(clock2Canvas.value, 2.0, -1)
  clock3Controls = initClockSystem(clock3Canvas.value, 1.0, 1)

  // 启动主渲染循环
  mainLoop()

  // 定期故障效果
  glitchInterval = window.setInterval(() => {
    if (Math.random() > 0.7) {
      triggerGlitch()
    }
    if (Math.random() > 0.85) {
      triggerGlitchWave()
    }
  }, 2000)

  // 文字切换
  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 600)

  const minDisplayTime = 2300
  const startTime = Date.now()

  // 等待预加载
  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[ChronosRiftSplash] Data preload finished')
    } catch (error) {
      console.error('[ChronosRiftSplash] Preload error:', error)
    }
  }

  if (props.disabled) {
    visible.value = false
    setTimeout(() => emit('finished'), 500)
    return
  }

  const elapsed = Date.now() - startTime
  const remaining = Math.max(0, minDisplayTime - elapsed)

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining))
  }

  // 触发高潮动画
  triggerEventHorizon()
  await new Promise((resolve) => setTimeout(resolve, 2700))

  visible.value = false
  console.log('[ChronosRiftSplash] Hidden after', Date.now() - startTime, 'ms')
  setTimeout(() => emit('finished'), 500)
})

onUnmounted(() => {
  if (loadingTextInterval) clearInterval(loadingTextInterval)
  if (glitchInterval) clearInterval(glitchInterval)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
@use "sass:color";

// ==================== 颜色变量 ====================
$void-black: #000000;
$abyss-purple: #190033;
$aurora-red: #ff0055;
$electric-cyan: #00f0ff;
$ultraviolet: #bf00ff;
$quicksand-gold: #ffd700;
$chrome-silver: #c0c0c0;

// ==================== 主容器 ====================
.chronos-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: $void-black;
  font-family: 'Playfair Display', 'Georgia', serif;
}

// ==================== Canvas 层 ====================
.vortex-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.shard-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

// ==================== 熔化时钟 ====================
.melting-clocks {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.melting-clock {
  position: absolute;
  filter: url(#melt-filter);

  &.clock-1 {
    top: 10%;
    left: 15%;
    transform: rotate(-15deg) skewY(10deg);
    animation: meltDrip 4s ease-in-out infinite;
  }

  &.clock-2 {
    top: 15%;
    right: 10%;
    transform: rotate(20deg) skewX(-15deg);
    animation: meltDrip 5s ease-in-out infinite 1s;
  }

  &.clock-3 {
    bottom: 20%;
    left: 5%;
    transform: rotate(-25deg) skewY(20deg) scale(0.8);
    animation: meltDrip 3.5s ease-in-out infinite 0.5s;
  }

  &.frozen {
    animation-play-state: paused !important;
    filter: grayscale(1) brightness(0.5);
  }

  .clock-face {
    width: 200px;
    height: 200px;
  }
}

@keyframes meltDrip {

  0%,
  100% {
    transform: rotate(-15deg) skewY(10deg) translateY(0);
  }

  50% {
    transform: rotate(-15deg) skewY(15deg) translateY(10px);
  }
}

// ==================== 光谱纽带 ====================
.spectral-ribbons {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.ribbon {
  position: absolute;
  width: 200%;
  height: 8px;
  background: linear-gradient(90deg,
      transparent,
      $aurora-red,
      $ultraviolet,
      $electric-cyan,
      $quicksand-gold,
      transparent);
  opacity: 0.4;
  filter: blur(2px);
  animation: ribbonFlow 8s ease-in-out infinite;

  &:nth-child(1) {
    top: 20%;
    left: -50%;
    animation-delay: 0s;
    transform: rotate(-5deg);
  }

  &:nth-child(2) {
    top: 40%;
    left: -60%;
    animation-delay: 1.5s;
    transform: rotate(8deg);
  }

  &:nth-child(3) {
    top: 60%;
    left: -40%;
    animation-delay: 3s;
    transform: rotate(-12deg);
  }

  &:nth-child(4) {
    top: 75%;
    left: -70%;
    animation-delay: 4.5s;
    transform: rotate(6deg);
  }

  &:nth-child(5) {
    top: 85%;
    left: -30%;
    animation-delay: 6s;
    transform: rotate(-8deg);
  }
}

@keyframes ribbonFlow {
  0% {
    transform: translateX(-20%) rotate(var(--rotation, 0deg));
  }

  50% {
    transform: translateX(20%) rotate(var(--rotation, 0deg));
  }

  100% {
    transform: translateX(-20%) rotate(var(--rotation, 0deg));
  }
}

// ==================== 装饰元素 ====================
.decorations {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.pendulum {
  position: absolute;
  bottom: 30%;
  right: 10%;
  transform-origin: top center;
  animation: pendulumSwing 2s ease-in-out infinite;

  &.frozen {
    animation-play-state: paused !important;
    filter: grayscale(1) brightness(0.5);
  }

  .pendulum-arm {
    width: 4px;
    height: 200px;
    background: linear-gradient(to bottom, $quicksand-gold, $chrome-silver);
    margin: 0 auto;
  }

  .pendulum-bob {
    width: 40px;
    height: 40px;
    background: radial-gradient(circle at 30% 30%, $quicksand-gold, #8B6914);
    border-radius: 50%;
    margin: 0 auto;
    box-shadow: 0 0 30px $quicksand-gold, 0 0 60px rgba($quicksand-gold, 0.5);
  }

  .pendulum-trail {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 200px;
    height: 4px;
    background: linear-gradient(90deg,
        transparent,
        rgba($quicksand-gold, 0.8),
        transparent);
    transform: translateX(-50%);
    opacity: 0.6;
    animation: trailGlow 2s ease-in-out infinite;
  }
}

@keyframes pendulumSwing {

  0%,
  100% {
    transform: rotate(-30deg);
  }

  50% {
    transform: rotate(30deg);
  }
}

@keyframes trailGlow {

  0%,
  100% {
    opacity: 0.3;
    width: 100px;
  }

  50% {
    opacity: 0.8;
    width: 200px;
  }
}

.gear {
  position: absolute;
  border-radius: 50%;
  border: 8px solid $chrome-silver;
  opacity: 0.3;

  &::before {
    content: '';
    position: absolute;
    inset: 15%;
    border: 4px solid $chrome-silver;
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20%;
    height: 20%;
    background: $chrome-silver;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  &.gear-1 {
    bottom: 5%;
    left: -5%;
    width: 300px;
    height: 300px;
    animation: gearSpin 20s linear infinite;
  }

  &.gear-2 {
    top: -10%;
    right: -8%;
    width: 400px;
    height: 400px;
    animation: gearSpin 30s linear infinite reverse;
  }

  &.frozen {
    animation-play-state: paused !important;
    filter: grayscale(1) brightness(0.5);
  }
}

@keyframes gearSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ==================== 故障效果 ====================
.glitch-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  background: repeating-linear-gradient(0deg,
      rgba($aurora-red, 0.03) 0px,
      rgba($aurora-red, 0.03) 1px,
      transparent 1px,
      transparent 3px);

  &.active {
    opacity: 1;
    animation: glitchFlicker 0.1s steps(3) infinite;
  }
}

@keyframes glitchFlicker {
  0% {
    transform: translateX(-2px);
    filter: hue-rotate(90deg);
  }

  33% {
    transform: translateX(2px);
    filter: hue-rotate(180deg);
  }

  66% {
    transform: translateX(-1px);
    filter: hue-rotate(270deg);
  }

  100% {
    transform: translateX(1px);
    filter: hue-rotate(0deg);
  }
}

.glitch-wave {
  position: absolute;
  inset: 0;
  z-index: 11;
  pointer-events: none;
  opacity: 0;

  &.active {
    opacity: 1;
    animation: glitchWaveScan 0.3s ease-out;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &::before {
    background: linear-gradient(180deg,
        transparent 0%,
        rgba($aurora-red, 0.3) 45%,
        rgba($electric-cyan, 0.3) 50%,
        rgba($ultraviolet, 0.3) 55%,
        transparent 100%);
    animation: scanLine 0.3s linear;
  }
}

@keyframes glitchWaveScan {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes scanLine {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(100%);
  }
}

// ==================== 破碎镜面容器 ====================
.shattered-mirror {
  position: relative;
  z-index: 20;
  width: 400px;
  padding: 50px 40px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  clip-path: polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%);
  animation: wavePulse 3s ease-in-out infinite;

  &.shattering {
    animation: shatterExplosion 0.5s ease-out forwards;
  }
}

@keyframes wavePulse {

  0%,
  100% {
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
    filter: brightness(1);
  }

  25% {
    transform: perspective(1000px) rotateX(2deg) rotateY(-1deg);
    filter: brightness(1.05);
  }

  50% {
    transform: perspective(1000px) rotateX(-1deg) rotateY(2deg);
    filter: brightness(0.95);
  }

  75% {
    transform: perspective(1000px) rotateX(1deg) rotateY(-2deg);
    filter: brightness(1.02);
  }
}

@keyframes shatterExplosion {
  0% {
    transform: scale(1);
    opacity: 1;
    filter: brightness(1);
  }

  30% {
    transform: scale(1.05);
    filter: brightness(3);
  }

  100% {
    transform: scale(1.5);
    opacity: 0;
    filter: brightness(5);
  }
}

.chromatic-aberration {
  position: absolute;
  inset: -5px;
  background: inherit;
  z-index: -1;
  opacity: 0.5;
  animation: chromaticShift 4s ease-in-out infinite;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &::before {
    background: rgba($aurora-red, 0.1);
    transform: translate(-3px, 0);
  }

  &::after {
    background: rgba($electric-cyan, 0.1);
    transform: translate(3px, 0);
  }
}

@keyframes chromaticShift {

  0%,
  100% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(-2px, 1px);
  }

  50% {
    transform: translate(2px, -1px);
  }

  75% {
    transform: translate(-1px, -2px);
  }
}

.fracture-border {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.fracture-line {
  position: absolute;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.8),
      $electric-cyan,
      rgba(255, 255, 255, 0.8),
      transparent);
  animation: fracturePulse 2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.25s);

  &:nth-child(1) {
    top: 0;
    left: 10%;
    width: 30%;
    height: 2px;
  }

  &:nth-child(2) {
    top: 0;
    right: 5%;
    width: 20%;
    height: 2px;
  }

  &:nth-child(3) {
    bottom: 0;
    left: 15%;
    width: 25%;
    height: 2px;
  }

  &:nth-child(4) {
    bottom: 0;
    right: 10%;
    width: 35%;
    height: 2px;
  }

  &:nth-child(5) {
    top: 10%;
    left: 0;
    width: 2px;
    height: 20%;
  }

  &:nth-child(6) {
    bottom: 15%;
    left: 0;
    width: 2px;
    height: 25%;
  }

  &:nth-child(7) {
    top: 5%;
    right: 0;
    width: 2px;
    height: 30%;
  }

  &:nth-child(8) {
    bottom: 10%;
    right: 0;
    width: 2px;
    height: 20%;
  }
}

@keyframes fracturePulse {

  0%,
  100% {
    opacity: 0.3;
    filter: blur(0px);
  }

  50% {
    opacity: 1;
    filter: blur(1px);
  }
}

.pixel-sorting {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.pixel-block {
  position: absolute;
  width: 20px;
  height: 3px;
  background: linear-gradient(90deg, $electric-cyan, $ultraviolet, $aurora-red);
  opacity: 0;
  animation: pixelDrift 3s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.3s);

  &:nth-child(1) {
    top: 15%;
    left: 85%;
  }

  &:nth-child(2) {
    top: 42%;
    left: 12%;
  }

  &:nth-child(3) {
    top: 78%;
    left: 65%;
  }

  &:nth-child(4) {
    top: 23%;
    left: 34%;
  }

  &:nth-child(5) {
    top: 91%;
    left: 8%;
  }

  &:nth-child(6) {
    top: 56%;
    left: 92%;
  }

  &:nth-child(7) {
    top: 5%;
    left: 45%;
  }

  &:nth-child(8) {
    top: 67%;
    left: 23%;
  }

  &:nth-child(9) {
    top: 88%;
    left: 78%;
  }

  &:nth-child(10) {
    top: 34%;
    left: 56%;
  }

  &:nth-child(11) {
    top: 12%;
    left: 67%;
  }

  &:nth-child(12) {
    top: 45%;
    left: 3%;
  }
}

@keyframes pixelDrift {

  0%,
  80%,
  100% {
    opacity: 0;
    transform: translateX(0);
  }

  85%,
  95% {
    opacity: 1;
    transform: translateX(15px);
  }
}

.wave-distortion {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center,
      transparent 30%,
      rgba($ultraviolet, 0.05) 60%,
      rgba($electric-cyan, 0.05) 80%,
      transparent 100%);
  animation: waveRipple 3s ease-in-out infinite;
}

@keyframes waveRipple {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.05);
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
  margin: 0 auto 30px;
}

.logo-clock {
  position: relative;
  width: 100%;
  height: 100%;
  animation: logoDistort 4s ease-in-out infinite;
}

@keyframes logoDistort {

  0%,
  100% {
    transform: skewX(0deg) skewY(0deg);
  }

  25% {
    transform: skewX(3deg) skewY(-2deg);
  }

  50% {
    transform: skewX(-2deg) skewY(3deg);
  }

  75% {
    transform: skewX(2deg) skewY(-1deg);
  }
}

.clock-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;

  &.ring-1 {
    inset: 0;
    border-color: $quicksand-gold;
    animation: ringPulse 2s ease-in-out infinite;
  }

  &.ring-2 {
    inset: 15%;
    border-color: $electric-cyan;
    animation: ringPulse 2s ease-in-out infinite 0.3s;
  }

  &.ring-3 {
    inset: 30%;
    border-color: $ultraviolet;
    animation: ringPulse 2s ease-in-out infinite 0.6s;
  }
}

@keyframes ringPulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.clock-hand {
  position: absolute;
  left: 50%;
  bottom: 50%;
  transform-origin: bottom center;
  background: $quicksand-gold;
  border-radius: 2px;

  &.hour-hand {
    width: 4px;
    height: 25px;
    animation: handSpin 3s linear infinite;
  }

  &.minute-hand {
    width: 2px;
    height: 35px;
    animation: handSpin 1s linear infinite reverse;
  }
}

@keyframes handSpin {
  from {
    transform: translateX(-50%) rotate(0deg);
  }

  to {
    transform: translateX(-50%) rotate(360deg);
  }
}

.clock-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: $quicksand-gold;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 15px $quicksand-gold;
}

.logo-aura {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle,
      rgba($ultraviolet, 0.3) 0%,
      rgba($electric-cyan, 0.2) 40%,
      transparent 70%);
  animation: auraGlow 3s ease-in-out infinite;
}

@keyframes auraGlow {

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
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 30px;
  letter-spacing: 0.1em;
  display: flex;
  justify-content: center;
  gap: 2px;

  .char {
    display: inline-block;
    background: linear-gradient(180deg,
        #ffffff 0%,
        $quicksand-gold 50%,
        $chrome-silver 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: charFlicker 3s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba($quicksand-gold, 0.5));
    transform: rotate(calc(var(--distort) * 0.3deg)) translateY(calc(var(--distort) * 0.2px));
  }
}

@keyframes charFlicker {

  0%,
  90%,
  100% {
    opacity: 1;
  }

  92% {
    opacity: 0.6;
  }

  94% {
    opacity: 1;
  }

  96% {
    opacity: 0.7;
  }
}

.loading-indicator {
  margin-top: 20px;
}

.loading-line {
  position: relative;
  width: 200px;
  height: 2px;
  margin: 0 auto 15px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.loading-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg,
      transparent,
      $electric-cyan,
      $ultraviolet,
      $aurora-red,
      transparent);
  animation: loadingScan 1.5s ease-in-out infinite;
}

@keyframes loadingScan {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.loading-noise {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg,
      transparent 0px,
      transparent 2px,
      rgba(255, 255, 255, 0.3) 2px,
      rgba(255, 255, 255, 0.3) 3px);
  animation: noiseShift 0.5s steps(5) infinite;
}

@keyframes noiseShift {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(10px);
  }
}

.loading-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

// ==================== 高潮动画层 ====================
.climax-layer {
  position: absolute;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0;

  &.active {
    opacity: 1;

    .time-freeze-filter {
      animation: freezeIn 0.5s ease-out forwards;
    }

    .shatter-fragments .fragment {
      animation: fragmentExplode 1s ease-out forwards;
      animation-delay: calc(0.5s + var(--delay));
    }

    .vortex-consumption {
      animation: vortexGrow 1.5s ease-in forwards;
      animation-delay: 0.8s;
    }

    .singularity {
      animation: singularityPulse 1.5s ease-in-out infinite;
      animation-delay: 0.8s;
    }

    .kaleidoscope-tunnel {
      animation: tunnelZoom 1.2s ease-in forwards;
      animation-delay: 1.5s;
    }

    .tunnel-ring {
      animation: ringSpiral 1.2s ease-in forwards;
      animation-delay: calc(1.5s + var(--i) * 0.05s);
    }

  }
}

.time-freeze-filter {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
}

@keyframes freezeIn {
  0% {
    opacity: 0;
    filter: grayscale(0) saturate(1);
  }

  100% {
    opacity: 1;
    filter: grayscale(0.8) saturate(0.3);
  }
}

.shatter-fragments {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fragment {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.9),
      rgba($electric-cyan, 0.7),
      rgba($ultraviolet, 0.5));
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  opacity: 0;
}

@keyframes fragmentExplode {
  0% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg) scale(1);
  }

  100% {
    opacity: 0;
    transform:
      translate(calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))) rotate(var(--rotate)) scale(0.5);
  }
}

.vortex-consumption {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

@keyframes vortexGrow {
  0% {
    opacity: 0;
    transform: scale(0);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 1;
    transform: scale(3);
  }
}

.singularity {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle,
      $void-black 0%,
      $abyss-purple 30%,
      rgba($ultraviolet, 0.5) 60%,
      transparent 100%);
  border-radius: 50%;
  box-shadow:
    0 0 50px $ultraviolet,
    0 0 100px rgba($electric-cyan, 0.5),
    inset 0 0 30px $void-black;
}

@keyframes singularityPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}

.kaleidoscope-tunnel {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  opacity: 0;
}

@keyframes tunnelZoom {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    opacity: 1;
  }
}

.tunnel-ring {
  position: absolute;
  border: 3px solid;
  border-radius: 50%;
  opacity: 0;

  &:nth-child(1) {
    width: 130px;
    height: 130px;
    border-color: hsl(30, 80%, 60%);
  }

  &:nth-child(2) {
    width: 210px;
    height: 210px;
    border-color: hsl(60, 80%, 60%);
  }

  &:nth-child(3) {
    width: 290px;
    height: 290px;
    border-color: hsl(90, 80%, 60%);
  }

  &:nth-child(4) {
    width: 370px;
    height: 370px;
    border-color: hsl(120, 80%, 60%);
  }

  &:nth-child(5) {
    width: 450px;
    height: 450px;
    border-color: hsl(150, 80%, 60%);
  }

  &:nth-child(6) {
    width: 530px;
    height: 530px;
    border-color: hsl(180, 80%, 60%);
  }

  &:nth-child(7) {
    width: 610px;
    height: 610px;
    border-color: hsl(210, 80%, 60%);
  }

  &:nth-child(8) {
    width: 690px;
    height: 690px;
    border-color: hsl(240, 80%, 60%);
  }

  &:nth-child(9) {
    width: 770px;
    height: 770px;
    border-color: hsl(270, 80%, 60%);
  }

  &:nth-child(10) {
    width: 850px;
    height: 850px;
    border-color: hsl(300, 80%, 60%);
  }

  &:nth-child(11) {
    width: 930px;
    height: 930px;
    border-color: hsl(330, 80%, 60%);
  }

  &:nth-child(12) {
    width: 1010px;
    height: 1010px;
    border-color: hsl(360, 80%, 60%);
  }
}

@keyframes ringSpiral {
  0% {
    opacity: 0;
    transform: translateZ(-500px) rotate(0deg) scale(0.5);
  }

  30% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateZ(500px) rotate(180deg) scale(2);
  }
}


// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
}

// ==================== 过渡动画 ====================
.chronos-fade-enter-active,
.chronos-fade-leave-active {
  transition: opacity 0.5s ease;
}

.chronos-fade-enter-from,
.chronos-fade-leave-to {
  opacity: 0;
}
</style>
