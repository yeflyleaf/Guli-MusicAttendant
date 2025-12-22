<template>
  <Transition name="cyber-fade">
    <div v-if="visible" class="cyber-splash">
      <!-- 第0层 - 巨型建筑群剪影 (视差滚动) -->
      <div class="megastructures">
        <!-- 极远景建筑层 - 最慢 -->
        <div class="building-layer layer-ultra-far">
          <div class="building ultra-far" v-for="n in 100" :key="'ultrafar-' + n" :style="getUltraFarBuildingStyle(n)">
          </div>
        </div>
        <!-- 远景建筑层 - 慢速 -->
        <div class="building-layer layer-far">
          <div class="building far" v-for="n in 80" :key="'far-' + n" :style="getFarBuildingStyle(n)"></div>
        </div>
        <!-- 中景建筑层 - 中速 -->
        <div class="building-layer layer-mid">
          <div class="building mid" v-for="n in 60" :key="'mid-' + n" :style="getMidBuildingStyle(n)">
            <div class="led-ad" v-if="n % 4 === 0">
              <span>{{ getRandomAdText() }}</span>
            </div>
          </div>
        </div>
        <!-- 近景建筑层 - 快速 -->
        <div class="building-layer layer-near">
          <div class="building near" v-for="n in 40" :key="'near-' + n" :style="getNearBuildingStyle(n)"></div>
        </div>
      </div>

      <!-- 浮动光粒子层 -->
      <div class="floating-particles">
        <div class="particle" v-for="n in 30" :key="'particle-' + n" :style="getParticleStyle(n)"></div>
      </div>

      <!-- 第1层 - Canvas 酸雨粒子系统 -->
      <canvas ref="rainCanvas" class="rain-canvas"></canvas>

      <!-- 第2层 - 空中交通流 -->
      <canvas ref="trafficCanvas" class="traffic-canvas"></canvas>

      <!-- 第3层 - 全息广告投影 -->
      <div class="holographic-ads">
        <div class="holo-ad geisha" :class="{ active: holoAdsActive }">
          <div class="holo-ring" v-for="r in 5" :key="r" :style="{ '--i': r }"></div>
          <div class="holo-figure"></div>
          <div class="scanline-overlay"></div>
        </div>
        <div class="holo-ad breach-warning" :class="{ active: holoAdsActive }">
          <div class="warning-text">SYSTEM<br />BREACH</div>
          <div class="warning-glitch"></div>
        </div>
      </div>

      <!-- 第4层 - 装饰性元素 -->
      <div class="cyberware">
        <!-- 警用无人机 -->
        <div class="drone" v-for="d in 2" :key="d" :class="`drone-${d}`" :style="{ '--delay': `${d * 8}s` }">
          <div class="drone-body"></div>
          <div class="drone-lights">
            <div class="police-light red"></div>
            <div class="police-light blue"></div>
          </div>
          <div class="scan-wave"></div>
        </div>
        <!-- 工业蒸汽 -->
        <div class="steam-layer">
          <div class="steam" v-for="s in 8" :key="s" :style="{ '--i': s }"></div>
        </div>
      </div>

      <!-- 霓虹灯光效果 (视差滚动) -->
      <div class="neon-glow-layer">
        <div class="neon-glow pink"></div>
        <div class="neon-glow cyan"></div>
        <div class="neon-glow green"></div>
        <div class="neon-glow magenta"></div>
      </div>

      <!-- 路灰地面反光 -->
      <div class="road-reflection"></div>

      <!-- 主内容 - 湿润全息终端面板 -->
      <div class="holographic-terminal" :class="{ glitching: isGlitching, imploding: isImploding }" ref="terminalPanel">
        <!-- 扫描线纹理 -->
        <div class="scanlines"></div>
        <!-- RGB色彩分离 -->
        <div class="chromatic-aberration"></div>
        <!-- 故障边框 -->
        <div class="glitch-border">
          <div class="border-segment" v-for="n in 8" :key="n" :style="{ '--i': n }"></div>
        </div>
        <!-- 水珠效果 -->
        <div class="water-droplets">
          <div class="droplet" v-for="n in 15" :key="n" :style="getDropletStyle(n)"></div>
        </div>

        <!-- 面板内容 -->
        <div class="terminal-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="cyber-logo">
              <div class="hex-ring" v-for="n in 3" :key="n" :style="{ '--i': n }"></div>
              <div class="logo-core">
                <div class="core-pulse"></div>
              </div>
            </div>
            <div class="logo-glow"></div>
          </div>

          <!-- 应用名称 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.08}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 -->
          <div class="loading-indicator">
            <div class="loading-bar">
              <div class="loading-progress"></div>
              <div class="loading-glitch"></div>
            </div>
            <div class="loading-text">INITIALIZING NEURAL LINK<span class="loading-dots"></span></div>
          </div>
        </div>

        <!-- ACCESS GRANTED 文字 -->
        <div class="access-granted" :class="{ active: showAccessGranted }">
          <span>ACCESS GRANTED</span>
        </div>
      </div>

      <!-- 极速狂飙效果层 -->
      <div class="highway-dive-layer" :class="{ active: isHighwayDiving }">
        <!-- 雨幕拉丝 -->
        <canvas ref="warpRainCanvas" class="warp-rain-canvas"></canvas>
        <!-- 光轨隧道 -->
        <div class="light-tunnel">
          <div class="tunnel-ring" v-for="n in 12" :key="n" :style="{ '--i': n }"></div>
        </div>
        <!-- 数据隧道 -->
        <div class="cyberspace-tunnel">
          <div class="data-stream" v-for="n in 20" :key="n" :style="{ '--i': n }">
            {{ getRandomBinary() }}
          </div>
        </div>
        <!-- 警报红色闪烁 -->
        <div class="alert-flash"></div>
        <!-- 最终白光 -->
        <div class="final-flash"></div>
      </div>

      <!-- 底部信息 -->
      <div class="splash-footer"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'finished'): void
}>()

const visible = ref(true)
const isGlitching = ref(false)
const isImploding = ref(false)
const isHighwayDiving = ref(false)
const showAccessGranted = ref(false)
const holoAdsActive = ref(true)
const terminalPanel = ref<HTMLElement | null>(null)

// Canvas refs
const rainCanvas = ref<HTMLCanvasElement | null>(null)
const trafficCanvas = ref<HTMLCanvasElement | null>(null)
const warpRainCanvas = ref<HTMLCanvasElement | null>(null)

const appNameChars = '故里音乐助手'.split('')
const adTexts = ['ネオン', '未来', 'システム', 'データ', '電脳', '接続', 'CYBER', 'NEON', 'FUTURE']

let animationFrameId: number | null = null
let glitchInterval: number | null = null

// 随机广告文字
const getRandomAdText = () => adTexts[Math.floor(Math.random() * adTexts.length)]

// 随机二进制
const getRandomBinary = () => {
  let str = ''
  for (let i = 0; i < 30; i++) {
    str += Math.random() > 0.5 ? '1' : '0'
  }
  return str
}

// 极远景建筑样式 (最慢层) - 非常瘦高
const getUltraFarBuildingStyle = (n: number) => {
  const baseLeft = (n - 1) * 2 // 密集排列
  const height = 15 + Math.random() * 30
  const width = 0.3 + Math.random() * 0.8 // 极细
  return {
    left: `${baseLeft}%`,
    height: `${height}%`,
    width: `${width}%`
  }
}

// 远景建筑样式 (慢速层) - 瘦高
const getFarBuildingStyle = (n: number) => {
  const baseLeft = (n - 1) * 2.5
  const height = 25 + Math.random() * 45 // 更高
  const width = 0.5 + Math.random() * 1.2 // 更细
  return {
    left: `${baseLeft}%`,
    height: `${height}%`,
    width: `${width}%`
  }
}

// 中景建筑样式 (中速层) - 瘦高
const getMidBuildingStyle = (n: number) => {
  const baseLeft = (n - 1) * 3.4
  const height = 40 + Math.random() * 50 // 更高
  const width = 0.8 + Math.random() * 1.8 // 更细
  return {
    left: `${baseLeft}%`,
    height: `${height}%`,
    width: `${width}%`
  }
}

// 近景建筑样式 (快速层) - 瘦高
const getNearBuildingStyle = (n: number) => {
  const baseLeft = (n - 1) * 5
  const height = 55 + Math.random() * 40 // 更高
  const width = 1.2 + Math.random() * 2.5 // 更细
  return {
    left: `${baseLeft}%`,
    height: `${height}%`,
    width: `${width}%`
  }
}

// 浮动光粒子样式
const getParticleStyle = (_n: number) => {
  const hue = Math.random() > 0.5 ? 330 : 180 // 粉色或青色
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 70}%`,
    '--hue': hue,
    '--size': `${2 + Math.random() * 4}px`,
    '--duration': `${3 + Math.random() * 4}s`,
    '--delay': `${Math.random() * 5}s`
  }
}

// 水滴样式
const getDropletStyle = (_n: number) => ({
  left: `${5 + Math.random() * 90}%`,
  top: `${Math.random() * 30}%`,
  '--delay': `${Math.random() * 3}s`,
  '--size': `${2 + Math.random() * 4}px`
})

// ==================== 酸雨粒子系统 ====================
interface Raindrop {
  x: number
  y: number
  length: number
  speed: number
  color: string
  opacity: number
}

let raindrops: Raindrop[] = []
let rainMode: 'falling' | 'warp' | 'stopped' = 'falling'

const initRainSystem = () => {
  const canvas = rainCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const colors = ['#ff0055', '#00e0ff', '#ccff00', '#ff00ff']

  const createRaindrop = (): Raindrop => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    length: 15 + Math.random() * 25,
    speed: 12 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 0.3 + Math.random() * 0.5
  })

  raindrops = Array.from({ length: 200 }, createRaindrop)

  // 涟漪效果
  interface Ripple {
    x: number
    y: number
    radius: number
    maxRadius: number
    opacity: number
  }
  const ripples: Ripple[] = []

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (rainMode === 'falling') {
      // 正常下落模式
      raindrops.forEach(drop => {
        drop.y += drop.speed

        // 运动模糊效果
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y - drop.length)
        gradient.addColorStop(0, drop.color)
        gradient.addColorStop(1, 'transparent')

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.globalAlpha = drop.opacity
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x, drop.y - drop.length)
        ctx.stroke()
        ctx.globalAlpha = 1

        // 底部碰撞产生涟漪
        if (drop.y > canvas.height) {
          if (Math.random() > 0.7) {
            ripples.push({
              x: drop.x,
              y: canvas.height - 5,
              radius: 0,
              maxRadius: 10 + Math.random() * 15,
              opacity: 0.5
            })
          }
          drop.y = -drop.length
          drop.x = Math.random() * canvas.width
        }
      })

      // 绘制涟漪
      ripples.forEach((ripple, index) => {
        ripple.radius += 0.8
        ripple.opacity -= 0.02

        if (ripple.opacity <= 0) {
          ripples.splice(index, 1)
          return
        }

        ctx.strokeStyle = `rgba(0, 224, 255, ${ripple.opacity})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI)
        ctx.stroke()
      })
    } else if (rainMode === 'warp') {
      // 水平拉丝模式
      ctx.globalAlpha = 0.8
      raindrops.forEach(drop => {
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x + 200, drop.y)
        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.5, drop.color)
        gradient.addColorStop(1, 'transparent')

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x + 200, drop.y)
        ctx.stroke()

        drop.x += 30
        if (drop.x > canvas.width + 200) {
          drop.x = -200
        }
      })
      ctx.globalAlpha = 1
    }
  }

  return render
}

// ==================== 空中交通流系统 ====================
interface Spinner {
  x: number
  y: number
  z: number
  speed: number
  direction: 'left' | 'right'
  size: number
}

let spinners: Spinner[] = []

const initTrafficSystem = () => {
  const canvas = trafficCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const createSpinner = (): Spinner => ({
    x: Math.random() > 0.5 ? -50 : canvas.width + 50,
    y: 50 + Math.random() * (canvas.height * 0.4),
    z: 0.3 + Math.random() * 0.7,
    speed: 1 + Math.random() * 3,
    direction: Math.random() > 0.5 ? 'left' : 'right',
    size: 3 + Math.random() * 5
  })

  spinners = Array.from({ length: 30 }, createSpinner)

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制隐形高速公路轨迹
    spinners.forEach(spinner => {
      const speed = spinner.speed * (spinner.direction === 'right' ? 1 : -1)
      spinner.x += speed

      // 前灯（白色）和尾灯（红色）
      const frontColor = spinner.direction === 'right' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 50, 50, 0.9)'
      const tailColor = spinner.direction === 'right' ? 'rgba(255, 50, 50, 0.7)' : 'rgba(255, 255, 255, 0.7)'

      // 光晕效果
      const glowRadius = spinner.size * spinner.z * 3
      const coreRadius = spinner.size * spinner.z

      // 主光点
      const gradient = ctx.createRadialGradient(
        spinner.x, spinner.y, 0,
        spinner.x, spinner.y, glowRadius
      )
      gradient.addColorStop(0, frontColor)
      gradient.addColorStop(0.4, frontColor.replace('0.9', '0.4'))
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(spinner.x, spinner.y, glowRadius, 0, Math.PI * 2)
      ctx.fill()

      // 拖尾效果
      ctx.strokeStyle = tailColor
      ctx.lineWidth = coreRadius * 0.5
      ctx.globalAlpha = spinner.z * 0.5
      ctx.beginPath()
      ctx.moveTo(spinner.x, spinner.y)
      ctx.lineTo(spinner.x - speed * 10, spinner.y)
      ctx.stroke()
      ctx.globalAlpha = 1

      // 边界重置
      if (spinner.direction === 'right' && spinner.x > canvas.width + 100) {
        spinner.x = -100
        spinner.y = 50 + Math.random() * (canvas.height * 0.4)
      } else if (spinner.direction === 'left' && spinner.x < -100) {
        spinner.x = canvas.width + 100
        spinner.y = 50 + Math.random() * (canvas.height * 0.4)
      }
    })
  }

  return render
}

// ==================== 雨幕拉丝系统 ====================
const initWarpRainSystem = () => {
  const canvas = warpRainCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  interface WarpLine {
    y: number
    length: number
    speed: number
    opacity: number
    hue: number
  }

  const lines: WarpLine[] = Array.from({ length: 100 }, () => ({
    y: Math.random() * canvas.height,
    length: 100 + Math.random() * 300,
    speed: 20 + Math.random() * 30,
    opacity: 0.3 + Math.random() * 0.7,
    hue: Math.random() > 0.5 ? 330 : 180
  }))

  let progress = 0

  const render = () => {
    progress += 0.02
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 中心聚焦效果 - 保留用于未来扩展
    void canvas.width
    void canvas.height

    lines.forEach(line => {
      // 边界计算 - 保留用于未来扩展
      void line.length

      // 向右加速移动
      line.speed *= 1.01

      ctx.strokeStyle = `hsla(${line.hue}, 100%, 60%, ${line.opacity})`
      ctx.lineWidth = 2
      ctx.beginPath()

      // 速度线从左到右
      const x = (progress * line.speed * 50) % (canvas.width + line.length * 2) - line.length
      ctx.moveTo(x, line.y)
      ctx.lineTo(x + line.length, line.y)
      ctx.stroke()
    })
  }

  return render
}

// ==================== 环境反射效果 ====================
const triggerLightingPass = () => {
  const panel = terminalPanel.value
  if (!panel) return

  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(0, 224, 255, 0.15), transparent);
    animation: lightPass 0.8s ease-out forwards;
    pointer-events: none;
  `
  panel.appendChild(overlay)
  setTimeout(() => overlay.remove(), 800)
}

// ==================== 信号干扰效果 ====================
const startGlitchEffects = () => {
  glitchInterval = window.setInterval(() => {
    if (Math.random() > 0.7 && !isHighwayDiving.value) {
      isGlitching.value = true
      setTimeout(() => {
        isGlitching.value = false
      }, 100 + Math.random() * 200)
    }
  }, 2000)
}

// ==================== 动画控制 ====================
let rainRender: (() => void) | undefined
let trafficRender: (() => void) | undefined
let warpRainRender: (() => void) | undefined

const mainLoop = () => {
  rainRender?.()
  trafficRender?.()
  if (isHighwayDiving.value) {
    warpRainRender?.()
  }
  animationFrameId = requestAnimationFrame(mainLoop)
}

// 触发极速狂飙动画
const triggerHighwayDive = () => {
  // ACCESS GRANTED显示
  showAccessGranted.value = true

  setTimeout(() => {
    // 面板炸裂
    isImploding.value = true
    holoAdsActive.value = false

    setTimeout(() => {
      // 雨幕拉丝模式
      rainMode = 'warp'
      isHighwayDiving.value = true
      warpRainRender = initWarpRainSystem()
    }, 300)
  }, 500)
}

onMounted(async () => {
  // 初始化所有系统
  rainRender = initRainSystem()
  trafficRender = initTrafficSystem()

  // 启动主渲染循环
  mainLoop()

  // 启动干扰效果
  startGlitchEffects()

  // 随机触发环境反射
  setInterval(() => {
    if (Math.random() > 0.8 && !isHighwayDiving.value) {
      triggerLightingPass()
    }
  }, 3000)

  const minDisplayTime = 2500
  const startTime = Date.now()

  // 等待预加载
  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[CyberCityscapeSplash] Data preload finished')
    } catch (error) {
      console.error('[CyberCityscapeSplash] Preload error:', error)
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
  triggerHighwayDive()
  await new Promise((resolve) => setTimeout(resolve, 2500))

  visible.value = false
  console.log('[CyberCityscapeSplash] Hidden after', Date.now() - startTime, 'ms')
  setTimeout(() => emit('finished'), 500)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (glitchInterval) clearInterval(glitchInterval)
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
@use "sass:color";

// ==================== 颜色变量 ====================
$asphalt-black: #0a0a12;
$midnight-purple: #1a0b2e;
$cyber-pink: #ff0055;
$acid-green: #ccff00;
$laser-cyan: #00e0ff;
$signal-white: #ffffff;
$warning-orange: #ff6600;
$neon-magenta: #ff00ff;

.cyber-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(180deg, $midnight-purple 0%, $asphalt-black 50%, color.adjust($asphalt-black, $lightness: -3%) 100%);
  font-family: 'Orbitron', 'Rajdhani', 'Michroma', sans-serif;
}

// ==================== 巨型建筑群 (视差滚动) ====================
.megastructures {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

// 建筑层容器 - 包含循环滚动
.building-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: flex-end;
  will-change: transform;

  // 极远景层 - 最慢滚动
  &.layer-ultra-far {
    width: 200%;
    animation: scrollLayerUltraFar 60s linear infinite;
    opacity: 0.25;

    .building {
      background: linear-gradient(180deg,
          rgba(20, 20, 40, 0.5) 0%,
          rgba(10, 10, 25, 0.6) 100%);
      border-top: 1px solid rgba($cyber-pink, 0.08);
    }
  }

  // 远景层 - 慢速滚动
  &.layer-far {
    width: 200%;
    animation: scrollLayerFar 40s linear infinite;
    opacity: 0.45;

    .building {
      background: linear-gradient(180deg,
          rgba(25, 25, 45, 0.7) 0%,
          rgba(15, 15, 30, 0.8) 100%);
      border-top: 1px solid rgba($cyber-pink, 0.15);

      // 偶尔的屋顶灯
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        width: 2px;
        height: 2px;
        background: $cyber-pink;
        box-shadow: 0 0 8px $cyber-pink, 0 0 15px $cyber-pink;
        border-radius: 50%;
        animation: blink 2s ease-in-out infinite;
        animation-delay: var(--delay, 0s);
      }
    }
  }

  // 中景层 - 中速滚动
  &.layer-mid {
    width: 200%;
    animation: scrollLayerMid 25s linear infinite;
    opacity: 0.75;

    .building {
      background: linear-gradient(180deg,
          rgba(30, 30, 55, 0.85) 0%,
          rgba(18, 18, 35, 0.9) 100%);
      border-top: 2px solid rgba($laser-cyan, 0.3);
      box-shadow:
        0 0 30px rgba($cyber-pink, 0.08),
        0 0 15px rgba($laser-cyan, 0.08),
        inset 0 0 20px rgba(0, 0, 0, 0.4);

      // 窗户条纹
      &::before {
        content: '';
        position: absolute;
        inset: 5% 15% 10% 15%;
        background: repeating-linear-gradient(0deg,
            transparent 0px,
            transparent 4px,
            rgba($signal-white, 0.08) 4px,
            rgba($signal-white, 0.08) 5px);
      }
    }
  }

  // 近景层 - 快速滚动
  &.layer-near {
    width: 200%;
    animation: scrollLayerNear 15s linear infinite;
    opacity: 0.95;

    .building {
      background: linear-gradient(180deg,
          rgba(35, 35, 60, 0.95) 0%,
          rgba(20, 20, 40, 1) 100%);
      border-top: 2px solid rgba($laser-cyan, 0.5);
      box-shadow:
        0 0 40px rgba($cyber-pink, 0.12),
        0 0 20px rgba($laser-cyan, 0.12),
        inset 0 0 30px rgba(0, 0, 0, 0.3);

      // 明亮窗户
      &::before {
        content: '';
        position: absolute;
        inset: 3% 10% 8% 10%;
        background:
          repeating-linear-gradient(0deg,
            transparent 0px,
            transparent 6px,
            rgba($signal-white, 0.1) 6px,
            rgba($signal-white, 0.1) 8px),
          repeating-linear-gradient(90deg,
            transparent 0px,
            transparent 3px,
            rgba($signal-white, 0.05) 3px,
            rgba($signal-white, 0.05) 4px);
      }

      // 霓虹招牌
      &::after {
        content: '';
        position: absolute;
        top: 20%;
        left: 10%;
        right: 10%;
        height: 8%;
        background: linear-gradient(90deg, rgba($cyber-pink, 0.6), rgba($laser-cyan, 0.4));
        box-shadow: 0 0 15px rgba($cyber-pink, 0.5);
        animation: neonFlicker 3s ease-in-out infinite;
      }
    }
  }
}

.building {
  position: relative;
  flex-shrink: 0;

  // 窗户网格 (用伪元素生成)
  &::before {
    content: '';
    position: absolute;
    inset: 5% 10% 20% 10%;
    background:
      repeating-linear-gradient(0deg,
        transparent 0px,
        transparent 6px,
        rgba($signal-white, 0.1) 6px,
        rgba($signal-white, 0.1) 8px),
      repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 8px,
        rgba($signal-white, 0.1) 8px,
        rgba($signal-white, 0.1) 10px);
    opacity: 0.7;
  }

  // 随机亮灯窗户
  &::after {
    content: '';
    position: absolute;
    inset: 10% 15% 25% 15%;
    background: radial-gradient(ellipse 3px 4px at var(--window-x, 30%) var(--window-y, 40%),
        rgba($acid-green, 0.8) 0%,
        transparent 100%);
    animation: randomWindow 3s ease-in-out infinite;
    animation-delay: var(--delay, 0s);
  }

  &.mid::after {
    --window-x: 60%;
    --window-y: 50%;
  }

  &.near::after {
    --window-x: 25%;
    --window-y: 35%;
  }

  .led-ad {
    position: absolute;
    top: 15%;
    left: 0;
    right: 0;
    height: 12%;
    background: linear-gradient(90deg, $cyber-pink, $neon-magenta, $cyber-pink);
    background-size: 200% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ledGlow 2s ease-in-out infinite;
    overflow: hidden;

    span {
      color: $signal-white;
      font-size: 10px;
      font-weight: bold;
      text-shadow: 0 0 15px $cyber-pink, 0 0 30px $neon-magenta;
      white-space: nowrap;
      animation: textGlow 1.5s ease-in-out infinite alternate;
    }
  }
}

// 平滑的视差滚动动画
@keyframes scrollLayerUltraFar {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@keyframes scrollLayerFar {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@keyframes scrollLayerMid {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@keyframes scrollLayerNear {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@keyframes randomWindow {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.9;
  }
}

@keyframes ledGlow {

  0%,
  100% {
    background-position: 0% 50%;
    filter: brightness(1);
  }

  50% {
    background-position: 100% 50%;
    filter: brightness(1.3);
  }
}

@keyframes textGlow {
  0% {
    text-shadow: 0 0 10px $cyber-pink, 0 0 20px $neon-magenta;
  }

  100% {
    text-shadow: 0 0 20px $cyber-pink, 0 0 40px $neon-magenta, 0 0 60px rgba($signal-white, 0.5);
  }
}

@keyframes blink {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }
}

@keyframes neonFlicker {

  0%,
  100% {
    opacity: 0.6;
  }

  5% {
    opacity: 0.3;
  }

  10% {
    opacity: 0.8;
  }

  15% {
    opacity: 0.4;
  }

  20% {
    opacity: 0.9;
  }

  50% {
    opacity: 0.7;
  }
}

// ==================== 浮动光粒子 ====================
.floating-particles {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: var(--size, 3px);
  height: var(--size, 3px);
  background: radial-gradient(circle,
      hsla(var(--hue, 180), 100%, 70%, 0.9) 0%,
      hsla(var(--hue, 180), 100%, 50%, 0) 70%);
  border-radius: 50%;
  animation: floatParticle var(--duration, 5s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  filter: blur(1px);
}

@keyframes floatParticle {

  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.6;
  }

  25% {
    transform: translateY(-20px) translateX(10px) scale(1.2);
    opacity: 0.9;
  }

  50% {
    transform: translateY(-10px) translateX(-5px) scale(0.8);
    opacity: 0.7;
  }

  75% {
    transform: translateY(-30px) translateX(15px) scale(1.1);
    opacity: 0.5;
  }
}

// ==================== Canvas 层 ====================
.rain-canvas,
.traffic-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.traffic-canvas {
  z-index: 2;
}

// ==================== 全息广告 ====================
.holographic-ads {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.holo-ad {
  position: absolute;
  opacity: 0;
  transition: opacity 0.5s ease;

  &.active {
    opacity: 0.7;
  }

  &.geisha {
    right: 10%;
    top: 15%;
    width: 120px;
    height: 180px;

    .holo-ring {
      position: absolute;
      inset: 0;
      border: 2px solid rgba($laser-cyan, 0.3);
      border-radius: 50%;
      animation: holoRingSpin 4s linear infinite;
      animation-delay: calc(var(--i) * 0.2s);
      transform: scale(calc(0.5 + var(--i) * 0.2));
    }

    .holo-figure {
      position: absolute;
      inset: 20%;
      background: linear-gradient(180deg,
          rgba($cyber-pink, 0.5) 0%,
          rgba($laser-cyan, 0.3) 50%,
          rgba($cyber-pink, 0.5) 100%);
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      animation: holoPulse 2s ease-in-out infinite;
    }

    .scanline-overlay {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(0deg,
          transparent 0px,
          transparent 2px,
          rgba(0, 0, 0, 0.3) 2px,
          rgba(0, 0, 0, 0.3) 4px);
      animation: scanlineMove 0.1s linear infinite;
    }
  }

  &.breach-warning {
    left: 8%;
    top: 25%;
    width: 100px;
    height: 80px;

    .warning-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      color: $warning-orange;
      text-shadow: 0 0 20px $warning-orange;
      animation: warningPulse 0.5s ease-in-out infinite;
    }

    .warning-glitch {
      position: absolute;
      inset: 0;
      border: 2px solid $warning-orange;
      animation: glitchBorder 0.15s infinite;
    }
  }
}

@keyframes holoRingSpin {
  from {
    transform: scale(calc(0.5 + var(--i) * 0.2)) rotate(0deg);
  }

  to {
    transform: scale(calc(0.5 + var(--i) * 0.2)) rotate(360deg);
  }
}

@keyframes holoPulse {

  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

@keyframes scanlineMove {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 0 4px;
  }
}

@keyframes warningPulse {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

@keyframes glitchBorder {

  0%,
  100% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(2px, -1px);
  }

  50% {
    transform: translate(-2px, 1px);
  }

  75% {
    transform: translate(1px, 2px);
  }
}

// ==================== 装饰性元素 ====================
.cyberware {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.drone {
  position: absolute;
  animation: droneFly 12s linear infinite;
  animation-delay: var(--delay);
  opacity: 0;

  &.drone-1 {
    top: 20%;
  }

  &.drone-2 {
    top: 35%;
  }

  .drone-body {
    width: 30px;
    height: 15px;
    background: rgba(40, 40, 60, 0.9);
    border-radius: 5px;
    box-shadow: 0 0 15px rgba($laser-cyan, 0.5);
  }

  .drone-lights {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 10px;
  }

  .police-light {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.red {
      background: #ff0000;
      animation: policeFlash 0.3s infinite;
      box-shadow: 0 0 20px #ff0000;
    }

    &.blue {
      background: #0066ff;
      animation: policeFlash 0.3s infinite 0.15s;
      box-shadow: 0 0 20px #0066ff;
    }
  }

  .scan-wave {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 100px;
    height: 150px;
    transform: translateX(-50%);
    background: linear-gradient(180deg, rgba($laser-cyan, 0.3), transparent);
    clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
    animation: scanPulse 1s ease-in-out infinite;
  }
}

@keyframes droneFly {
  0% {
    left: -100px;
    opacity: 0;
  }

  5% {
    opacity: 1;
  }

  95% {
    opacity: 1;
  }

  100% {
    left: calc(100% + 100px);
    opacity: 0;
  }
}

@keyframes policeFlash {

  0%,
  49% {
    opacity: 1;
  }

  50%,
  100% {
    opacity: 0.3;
  }
}

@keyframes scanPulse {

  0%,
  100% {
    opacity: 0.3;
    transform: translateX(-50%) scaleY(0.8);
  }

  50% {
    opacity: 0.6;
    transform: translateX(-50%) scaleY(1);
  }
}

// 工业蒸汽
.steam-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
}

.steam {
  position: absolute;
  bottom: 0;
  left: calc(var(--i) * 12%);
  width: 80px;
  height: 150px;
  background: radial-gradient(ellipse at bottom,
      rgba($cyber-pink, 0.15) 0%,
      rgba($laser-cyan, 0.1) 30%,
      transparent 70%);
  animation: steamRise 4s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.5s);
}

@keyframes steamRise {

  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.5;
  }

  50% {
    transform: translateY(-30px) scale(1.2);
    opacity: 0.8;
  }
}

// ==================== 霓虹光效 (视差滚动) ====================
.neon-glow-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  overflow: hidden;
}

.neon-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
  will-change: transform;

  &.pink {
    background: radial-gradient(circle, $cyber-pink 0%, transparent 70%);
    top: 5%;
    animation: neonScrollFast 20s linear infinite;
  }

  &.cyan {
    background: radial-gradient(circle, $laser-cyan 0%, transparent 70%);
    top: 40%;
    animation: neonScrollMid 30s linear infinite;
  }

  &.green {
    background: radial-gradient(circle, $acid-green 0%, transparent 70%);
    top: 60%;
    animation: neonScrollSlow 45s linear infinite;
    opacity: 0.3;
  }

  &.magenta {
    background: radial-gradient(circle, $neon-magenta 0%, transparent 70%);
    top: 20%;
    animation: neonScrollFast 25s linear infinite reverse;
    opacity: 0.4;
  }
}

// 霓虹光平滑滚动 (从右到左，模拟经过)
@keyframes neonScrollFast {
  0% {
    left: 100%;
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    left: -30%;
    transform: scale(1);
  }
}

@keyframes neonScrollMid {
  0% {
    left: 110%;
    transform: scale(0.8);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    left: -20%;
    transform: scale(0.8);
  }
}

@keyframes neonScrollSlow {
  0% {
    left: 120%;
    transform: scale(0.6);
  }

  50% {
    transform: scale(0.9);
  }

  100% {
    left: -10%;
    transform: scale(0.6);
  }
}

// ==================== 路面反光 ====================
.road-reflection {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15%;
  z-index: 3;
  background: linear-gradient(180deg,
      transparent 0%,
      rgba($asphalt-black, 0.4) 30%,
      rgba($asphalt-black, 0.7) 100%);

  // 湿漉漉的反光条纹
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 100px,
        rgba($laser-cyan, 0.05) 100px,
        rgba($laser-cyan, 0.05) 102px);
    animation: roadReflectionScroll 3s linear infinite;
  }

  // 霓虹反射光晕
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 300px 50px at 20% 80%, rgba($cyber-pink, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse 250px 40px at 60% 70%, rgba($laser-cyan, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse 200px 35px at 85% 90%, rgba($acid-green, 0.1) 0%, transparent 50%);
    animation: reflectionPulse 4s ease-in-out infinite;
  }
}

@keyframes roadReflectionScroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(102px);
  }
}

@keyframes reflectionPulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

// ==================== 全息终端面板 ====================
.holographic-terminal {
  position: relative;
  z-index: 10;
  width: 380px;
  padding: 40px;
  background: rgba($midnight-purple, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.3s ease;

  &.glitching {
    animation: terminalGlitch 0.15s;
  }

  &.imploding {
    animation: terminalImplode 0.5s ease-in forwards;
  }
}

@keyframes terminalGlitch {
  0% {
    transform: translate(0, 0) skewX(0);
  }

  20% {
    transform: translate(-3px, 2px) skewX(-2deg);
  }

  40% {
    transform: translate(3px, -1px) skewX(1deg);
  }

  60% {
    transform: translate(-2px, 1px) skewX(-1deg);
  }

  80% {
    transform: translate(2px, -2px) skewX(2deg);
  }

  100% {
    transform: translate(0, 0) skewX(0);
  }
}

@keyframes terminalImplode {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1, 0.02);
    opacity: 1;
    background: rgba($acid-green, 0.8);
  }

  100% {
    transform: scale(0, 0);
    opacity: 0;
  }
}

// 扫描线
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg,
      transparent 0px,
      transparent 2px,
      rgba(0, 0, 0, 0.1) 2px,
      rgba(0, 0, 0, 0.1) 4px);
  pointer-events: none;
  animation: scanlineMove 0.1s linear infinite;
}

// RGB色彩分离
.chromatic-aberration {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba($cyber-pink, 0.03) 0%, transparent 5%, transparent 95%, rgba($laser-cyan, 0.03) 100%);
  pointer-events: none;
}

// 故障边框
.glitch-border {
  position: absolute;
  inset: -2px;
  pointer-events: none;

  .border-segment {
    position: absolute;
    background: $laser-cyan;
    box-shadow: 0 0 10px $laser-cyan, 0 0 20px $laser-cyan;
    animation: borderFlicker 2s infinite;
    animation-delay: calc(var(--i) * 0.25s);

    &:nth-child(1),
    &:nth-child(5) {
      top: 0;
      height: 2px;
      width: 30%;
    }

    &:nth-child(1) {
      left: 0;
    }

    &:nth-child(5) {
      right: 0;
    }

    &:nth-child(2),
    &:nth-child(6) {
      right: 0;
      width: 2px;
      height: 30%;
    }

    &:nth-child(2) {
      top: 0;
    }

    &:nth-child(6) {
      bottom: 0;
    }

    &:nth-child(3),
    &:nth-child(7) {
      bottom: 0;
      height: 2px;
      width: 30%;
    }

    &:nth-child(3) {
      right: 0;
    }

    &:nth-child(7) {
      left: 0;
    }

    &:nth-child(4),
    &:nth-child(8) {
      left: 0;
      width: 2px;
      height: 30%;
    }

    &:nth-child(4) {
      bottom: 0;
    }

    &:nth-child(8) {
      top: 0;
    }
  }
}

@keyframes borderFlicker {

  0%,
  90%,
  100% {
    opacity: 0.8;
  }

  92% {
    opacity: 0.2;
  }

  95% {
    opacity: 1;
  }

  97% {
    opacity: 0.5;
  }
}

// 水珠效果
.water-droplets {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.droplet {
  position: absolute;
  width: var(--size);
  height: calc(var(--size) * 2);
  background: radial-gradient(ellipse at center top,
      rgba($signal-white, 0.6) 0%,
      rgba($laser-cyan, 0.3) 50%,
      transparent 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: dropletFall 3s ease-in infinite;
  animation-delay: var(--delay);
}

@keyframes dropletFall {
  0% {
    transform: translateY(0);
    opacity: 0.8;
  }

  100% {
    transform: translateY(200px);
    opacity: 0;
  }
}

// 终端内容
.terminal-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

// Logo
.logo-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.cyber-logo {
  position: relative;
  width: 100%;
  height: 100%;

  .hex-ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba($laser-cyan, 0.5);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    animation: hexRotate 6s linear infinite;
    animation-delay: calc(var(--i) * 0.3s);
    transform: scale(calc(0.6 + var(--i) * 0.2));
  }

  .logo-core {
    position: absolute;
    inset: 30%;
    background: linear-gradient(135deg, $cyber-pink, $laser-cyan);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);

    .core-pulse {
      position: absolute;
      inset: 0;
      background: rgba($signal-white, 0.3);
      clip-path: inherit;
      animation: corePulse 1.5s ease-in-out infinite;
    }
  }
}

.logo-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba($laser-cyan, 0.3) 0%, transparent 70%);
  animation: logoGlow 2s ease-in-out infinite;
}

@keyframes hexRotate {
  from {
    transform: scale(calc(0.6 + var(--i) * 0.2)) rotate(0deg);
  }

  to {
    transform: scale(calc(0.6 + var(--i) * 0.2)) rotate(360deg);
  }
}

@keyframes corePulse {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

@keyframes logoGlow {

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

// 应用名称
.app-name {
  font-size: 28px;
  font-weight: bold;
  color: $signal-white;
  text-shadow:
    0 0 10px $laser-cyan,
    0 0 20px $laser-cyan,
    0 0 40px $cyber-pink;
  letter-spacing: 4px;

  .char {
    display: inline-block;
    opacity: 0;
    animation: charReveal 0.5s ease forwards;
  }
}

@keyframes charReveal {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(1.5);
    filter: blur(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

// 加载指示器
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.loading-bar {
  position: relative;
  width: 200px;
  height: 4px;
  background: rgba($midnight-purple, 0.8);
  border: 1px solid rgba($laser-cyan, 0.3);
  overflow: hidden;
}

.loading-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, $cyber-pink, $laser-cyan);
  box-shadow: 0 0 10px $laser-cyan;
  animation: loadingProgress 2.5s ease-in-out forwards;
}

.loading-glitch {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 40%, rgba($signal-white, 0.8) 50%, transparent 60%);
  animation: loadingGlitch 1s linear infinite;
}

@keyframes loadingProgress {
  0% {
    width: 0%;
  }

  100% {
    width: 100%;
  }
}

@keyframes loadingGlitch {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(200%);
  }
}

.loading-text {
  font-size: 12px;
  color: rgba($laser-cyan, 0.8);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 5px $laser-cyan;

  // 动态省略号
  .loading-dots {
    display: inline-block;
    width: 24px;
    text-align: left;

    &::after {
      content: '';
      animation: loadingDots 1.5s steps(4, end) infinite;
    }
  }
}

@keyframes loadingDots {
  0% {
    content: '';
  }

  25% {
    content: '.';
  }

  50% {
    content: '..';
  }

  75% {
    content: '...';
  }

  100% {
    content: '';
  }
}

// ACCESS GRANTED
.access-granted {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($asphalt-black, 0.9);
  opacity: 0;
  pointer-events: none;
  z-index: 100;

  &.active {
    animation: accessGranted 0.5s ease forwards;
  }

  span {
    font-size: 24px;
    font-weight: bold;
    color: $acid-green;
    text-shadow:
      0 0 10px $acid-green,
      0 0 30px $acid-green,
      0 0 60px $acid-green;
    letter-spacing: 8px;
    animation: accessFlash 0.1s infinite;
  }
}

@keyframes accessGranted {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 1;
  }
}

@keyframes accessFlash {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

// ==================== 极速狂飙效果层 ====================
.highway-dive-layer {
  position: absolute;
  inset: 0;
  z-index: 100;
  opacity: 0;
  pointer-events: none;

  &.active {
    opacity: 1;
    animation: highwayDiveIn 0.3s ease forwards;
  }
}

@keyframes highwayDiveIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.warp-rain-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

// 光轨隧道
.light-tunnel {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;

  .tunnel-ring {
    position: absolute;
    width: 200px;
    height: 200px;
    border: 3px solid transparent;
    border-top-color: $laser-cyan;
    border-bottom-color: $cyber-pink;
    border-radius: 50%;
    animation: tunnelZoom 1.5s linear infinite;
    animation-delay: calc(var(--i) * 0.1s);
    transform: translateZ(calc(var(--i) * -100px)) scale(calc(1 + var(--i) * 0.3));
  }
}

@keyframes tunnelZoom {
  0% {
    transform: translateZ(-500px) scale(0.5);
    opacity: 0;
  }

  50% {
    opacity: 0.8;
  }

  100% {
    transform: translateZ(200px) scale(3);
    opacity: 0;
  }
}

// 数据隧道
.cyberspace-tunnel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  overflow: hidden;

  .data-stream {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: rgba($acid-green, 0.8);
    text-shadow: 0 0 5px $acid-green;
    white-space: nowrap;
    animation: dataStream 0.5s linear infinite;
    animation-delay: calc(var(--i) * 0.05s);
  }
}

@keyframes dataStream {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

// 警报闪烁
.alert-flash {
  position: absolute;
  inset: 0;
  background: rgba(#ff0000, 0.3);
  animation: alertPulse 0.2s ease-in-out 3;
  animation-delay: 0.5s;
}

@keyframes alertPulse {

  0%,
  100% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }
}

// 最终柔和渐变 (避免光污染)
.final-flash {
  position: absolute;
  inset: 0;
  // 使用柔和的渐变而非纯白
  background: radial-gradient(ellipse at center,
      rgba($laser-cyan, 0.3) 0%,
      rgba($midnight-purple, 0.6) 40%,
      rgba($asphalt-black, 0.9) 100%);
  opacity: 0;
  animation: softFadeOut 1.2s ease-out forwards;
  animation-delay: 1.8s;
}

@keyframes softFadeOut {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }

  30% {
    opacity: 0.4;
    backdrop-filter: blur(5px);
  }

  60% {
    opacity: 0.7;
    backdrop-filter: blur(10px);
  }

  100% {
    opacity: 1;
    backdrop-filter: blur(20px);
  }
}

// ==================== 底部 ====================
.splash-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

// ==================== 过渡动画 ====================
.cyber-fade-leave-active {
  animation: cyberLeave 0.5s ease-in forwards;
}

@keyframes cyberLeave {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

// 动态光效
@keyframes lightPass {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
