<template>
  <Transition name="silicon-fade">
    <div v-if="visible" class="silicon-splash" ref="splashContainer">
      <!-- 第0层 - 主板宏观结构 -->
      <div class="motherboard-bg">
        <div class="chip-base"></div>
        <div class="clock-signal"></div>
        <div class="capacitor-array">
          <div v-for="n in 12" :key="n" class="capacitor" :style="{ '--i': n }"></div>
        </div>
        <div class="chip-packages">
          <div class="chip chip-1"></div>
          <div class="chip chip-2"></div>
          <div class="chip chip-3"></div>
        </div>
      </div>

      <!-- 第1层 - Canvas 粒子系统：二进制雨 -->
      <canvas ref="binaryCanvas" class="binary-canvas"></canvas>

      <!-- 第2层 - 逻辑门阵列 -->
      <div class="logic-gates">
        <div v-for="n in 8" :key="n" class="logic-gate" :style="{ '--i': n }">
          <div class="gate-symbol">{{ gateSymbols[n % gateSymbols.length] }}</div>
          <div class="gate-input-1"></div>
          <div class="gate-input-2"></div>
          <div class="gate-output"></div>
        </div>
      </div>

      <!-- 第3层 - 散热结构 -->
      <div class="heatsink-layer">
        <div class="heatsink-fin fin-left"></div>
        <div class="heatsink-fin fin-right"></div>
      </div>

      <!-- 第4层 - 装饰性元素 -->
      <div class="debug-layer">
        <!-- 旋转的线框立方体 -->
        <div class="wireframe-cube" ref="wireframeCube">
          <div class="cube-face face-front"></div>
          <div class="cube-face face-back"></div>
          <div class="cube-face face-left"></div>
          <div class="cube-face face-right"></div>
          <div class="cube-face face-top"></div>
          <div class="cube-face face-bottom"></div>
        </div>
        <!-- 系统日志 -->
        <div class="system-logs">
          <div v-for="(log, index) in visibleLogs" :key="index" class="log-line">
            {{ log }}
          </div>
        </div>
      </div>

      <!-- 主内容 - 晶圆悬浮窗面板 -->
      <div class="wafer-panel" :class="{ 'overclocking': isOverclocking }" ref="waferPanel">
        <div class="grid-texture"></div>
        <div class="circuit-border">
          <div class="border-trace trace-top"></div>
          <div class="border-trace trace-right"></div>
          <div class="border-trace trace-bottom"></div>
          <div class="border-trace trace-left"></div>
          <div class="solder-pad pad-tl"></div>
          <div class="solder-pad pad-tr"></div>
          <div class="solder-pad pad-bl"></div>
          <div class="solder-pad pad-br"></div>
          <div class="data-packet" v-for="n in 4" :key="n" :style="{ '--i': n }"></div>
        </div>
        <div class="panel-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-icon">
              <div class="cpu-core">
                <div class="core-ring ring-1"></div>
                <div class="core-ring ring-2"></div>
                <div class="core-center"></div>
              </div>
            </div>
            <div class="logo-circuit-glow"></div>
          </div>

          <!-- 应用名称 - 像素化等宽字体 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.08}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 - IDE 风格 -->
          <div class="loading-indicator">
            <div class="terminal-line">
              <span class="line-number">001</span>
              <span class="terminal-cursor"></span>
              <span class="terminal-text">{{ loadingText }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 超频执行效果层 -->
      <div class="overclock-layer" :class="{ active: isOverclocking }" ref="overclockLayer">
        <!-- 数据隧道 -->
        <div class="data-tunnel">
          <div class="tunnel-ring" v-for="n in 5" :key="n" :style="{ '--i': n }"></div>
        </div>
        <!-- 奇点坍缩 -->
        <div class="singularity">
          <div class="singularity-core"></div>
          <div class="singularity-pulse"></div>
        </div>
        <!-- 系统引导文字 -->
        <div class="boot-text">
          <span class="boot-prompt">_root@system:</span>
          <span class="boot-message">login successful</span>
        </div>
        <!-- CRT 关机效果 -->
        <div class="crt-effect"></div>
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
const isOverclocking = ref(false)
const binaryCanvas = ref<HTMLCanvasElement | null>(null)
const splashContainer = ref<HTMLElement | null>(null)
const waferPanel = ref<HTMLElement | null>(null)
const overclockLayer = ref<HTMLElement | null>(null)

const appNameChars = '故里音乐助手'.split('')
const gateSymbols = ['AND', 'OR', 'XOR', 'NOT']

const loadingTexts = ['Initializing core...', 'Loading modules...', 'Compiling assets...', 'Build succeeded']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

const systemLogs = [
  '[00:00:00] Initializing...',
  '[00:00:01] Loading kernel modules...',
  '[00:00:02] Mounting file systems...',
  '[00:00:03] Starting network services...',
  '[00:00:04] CPU frequency: 4.2GHz',
  '[00:00:05] Memory: 16384MB OK',
  '[00:00:06] GPU: Rendering pipeline active',
  '[00:00:07] Audio subsystem: 200 OK',
  '[00:00:08] All systems nominal',
  '[00:00:09] Ready to execute...'
]
const currentLogIndex = ref(0)
const visibleLogs = computed(() => systemLogs.slice(0, currentLogIndex.value + 1).slice(-5))

let loadingTextInterval: number | null = null
let logInterval: number | null = null
let animationFrameId: number | null = null
let mouseX = 0
let mouseY = 0

const random = (min: number, max: number) => Math.random() * (max - min) + min

// 二进制字符
const binaryChars = ['0', '1']
const glitchChars = ['#', '!', '?', '@', '$', '%']

// 二进制粒子
interface BinaryParticle {
  x: number
  y: number
  char: string
  size: number
  opacity: number
  speed: number
  direction: 'vertical' | 'horizontal'
  isGlitch: boolean
  glitchTimer: number
  baseX: number
}

let particles: BinaryParticle[] = []
let time = 0
let isTunnelMode = false
let tunnelIntensity = 0

const initBinarySystem = () => {
  const canvas = binaryCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const particleCount = 150

  const createParticle = (randomY = true): BinaryParticle => {
    const isHorizontal = Math.random() > 0.7
    return {
      x: isHorizontal ? (Math.random() > 0.5 ? -50 : canvas.width + 50) : random(0, canvas.width),
      y: randomY ? random(0, canvas.height) : -50,
      baseX: random(0, canvas.width),
      char: binaryChars[Math.floor(Math.random() * binaryChars.length)],
      size: random(12, 24),
      opacity: random(0.3, 0.8),
      speed: random(2, 6),
      direction: isHorizontal ? 'horizontal' : 'vertical',
      isGlitch: false,
      glitchTimer: 0
    }
  }

  particles = Array.from({ length: particleCount }, () => createParticle(true))

  const handleMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY
  }
  window.addEventListener('mousemove', handleMouseMove)

  const render = () => {
    time += 0.016
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    particles.forEach((particle, index) => {
      // 检测鼠标距离 - 磁滞效应
      const dx = particle.x - mouseX
      const dy = particle.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 100 && !isTunnelMode) {
        // 磁滞效应：粒子跟随鼠标
        particle.x += (mouseX - particle.x) * 0.02
        particle.y += (mouseY - particle.y) * 0.02
      }

      // 数据碰撞检测
      if (!particle.isGlitch && Math.random() < 0.0005) {
        particle.isGlitch = true
        particle.glitchTimer = 30
        particle.char = glitchChars[Math.floor(Math.random() * glitchChars.length)]
      }

      if (particle.isGlitch) {
        particle.glitchTimer--
        if (particle.glitchTimer <= 0) {
          particle.isGlitch = false
          particle.char = binaryChars[Math.floor(Math.random() * binaryChars.length)]
        }
      }

      if (isTunnelMode) {
        // 隧道模式：向中心聚拢
        const toCenterX = centerX - particle.x
        const toCenterY = centerY - particle.y
        const angle = Math.atan2(toCenterY, toCenterX)
        const distToCenter = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY)

        particle.x += Math.cos(angle) * tunnelIntensity * 15
        particle.y += Math.sin(angle) * tunnelIntensity * 15
        particle.opacity = Math.min(particle.opacity + 0.02, 1)

        // 变红
        if (distToCenter < 200) {
          particle.opacity -= 0.05
        }
      } else {
        // 正常运动：沿数据总线
        if (particle.direction === 'vertical') {
          particle.y += particle.speed
          particle.x = particle.baseX + Math.sin(time * 2 + index * 0.1) * 5
        } else {
          particle.x += particle.speed * (particle.x < centerX ? 1 : -1)
        }
      }

      // 绘制粒子
      ctx.save()
      ctx.font = `${particle.size}px "JetBrains Mono", "Fira Code", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      let color = isTunnelMode && tunnelIntensity > 0.5
        ? `rgba(255, 50, 50, ${particle.opacity})`  // 红色（温度升高）
        : particle.isGlitch
          ? `rgba(255, 0, 85, ${particle.opacity})`  // 错误红
          : `rgba(0, 255, 65, ${particle.opacity})`  // 终端绿

      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.fillStyle = color
      ctx.fillText(particle.char, particle.x, particle.y)
      ctx.restore()

      // 重置
      if (particle.direction === 'vertical' && particle.y > canvas.height + 50) {
        Object.assign(particle, createParticle(false))
      } else if (particle.direction === 'horizontal') {
        if ((particle.speed > 0 && particle.x > canvas.width + 50) ||
          (particle.speed < 0 && particle.x < -50)) {
          Object.assign(particle, createParticle(true))
        }
      }
      if (particle.opacity <= 0) {
        Object.assign(particle, createParticle(true))
      }
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  return {
    setTunnelMode: (active: boolean, intensity: number = 0) => {
      isTunnelMode = active
      tunnelIntensity = intensity
    }
  }
}

let binaryControls: { setTunnelMode: (active: boolean, intensity?: number) => void } | null = null

// 触发超频执行动画
const triggerOverclock = () => {
  isOverclocking.value = true
  const overclockDuration = 2000

  const startTime = Date.now()
  const accelerate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / overclockDuration, 1)
    const easeProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2

    binaryControls?.setTunnelMode(true, easeProgress)

    // 时钟信号加速
    const clockSignal = splashContainer.value?.querySelector('.clock-signal') as HTMLElement
    if (clockSignal) {
      clockSignal.style.animationDuration = `${Math.max(0.1, 2 - easeProgress * 1.9)}s`
    }

    if (progress < 1) {
      requestAnimationFrame(accelerate)
    }
  }
  accelerate()

  // 面板发光效果
  setTimeout(() => {
    if (waferPanel.value) {
      waferPanel.value.style.boxShadow = '0 0 60px rgba(0, 255, 65, 0.8), inset 0 0 30px rgba(0, 219, 255, 0.5)'
    }
  }, overclockDuration * 0.3)

  // 奇点坍缩
  const singularity = overclockLayer.value?.querySelector('.singularity') as HTMLElement
  if (singularity) {
    setTimeout(() => {
      singularity.style.opacity = '1'
      singularity.style.transform = 'translate(-50%, -50%) scale(1)'
    }, overclockDuration * 0.5)
  }

  // 系统引导文字
  const bootText = overclockLayer.value?.querySelector('.boot-text') as HTMLElement
  if (bootText) {
    setTimeout(() => {
      bootText.style.opacity = '1'
    }, overclockDuration * 0.8)
  }

  // CRT 效果
  const crtEffect = overclockLayer.value?.querySelector('.crt-effect') as HTMLElement
  if (crtEffect) {
    setTimeout(() => {
      crtEffect.style.animation = 'crtShutdown 0.5s ease-out forwards'
    }, overclockDuration * 0.9)
  }
}

onMounted(async () => {
  binaryControls = initBinarySystem() || null

  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 600)

  logInterval = window.setInterval(() => {
    if (currentLogIndex.value < systemLogs.length - 1) {
      currentLogIndex.value++
    }
  }, 300)

  const minDisplayTime = 2500
  const startTime = Date.now()

  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[SiliconOrderSplash] Data preload finished')
    } catch (error) {
      console.error('[SiliconOrderSplash] Preload error:', error)
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

  triggerOverclock()
  await new Promise((resolve) => setTimeout(resolve, 2500))

  visible.value = false
  console.log('[SiliconOrderSplash] Hidden after', Date.now() - startTime, 'ms')
  setTimeout(() => emit('finished'), 500)
})

onUnmounted(() => {
  if (loadingTextInterval) clearInterval(loadingTextInterval)
  if (logInterval) clearInterval(logInterval)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$substrate-black: #0a0a0a;
$peacock-blue: #001a1a;
$terminal-green: #00ff41;
$logic-blue: #00dbff;
$compile-white: #ffffff;
$error-red: #ff0055;

.silicon-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, $substrate-black 0%, $peacock-blue 50%, $substrate-black 100%);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

// ==================== 第0层 - 主板宏观结构 ====================
.motherboard-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .chip-base {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba($logic-blue, 0.03) 1px, transparent 1px),
      linear-gradient(rgba($logic-blue, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .clock-signal {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%,
        rgba($terminal-green, 0.15) 0%,
        transparent 50%);
    animation: clockPulse 2s ease-in-out infinite;
  }

  .capacitor-array {
    position: absolute;
    inset: 0;
  }

  .capacitor {
    position: absolute;
    width: 8px;
    height: 20px;
    background: linear-gradient(180deg, #c0c0c0 0%, #888 50%, #c0c0c0 100%);
    border-radius: 2px;
    opacity: 0.3;
    left: calc(var(--i) * 8%);
    top: calc(var(--i) * 5% + 10%);

    &::after {
      content: '';
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 5px;
      background: #444;
      border-radius: 2px 2px 0 0;
    }
  }

  .chip-packages {
    position: absolute;
    inset: 0;
  }

  .chip {
    position: absolute;
    background: #111;
    border: 1px solid #333;
    opacity: 0.4;

    &::before {
      content: '';
      position: absolute;
      inset: 5px;
      background: #0a0a0a;
      border: 1px solid #222;
    }

    &.chip-1 {
      left: 5%;
      top: 20%;
      width: 80px;
      height: 80px;
    }

    &.chip-2 {
      right: 10%;
      top: 60%;
      width: 60px;
      height: 60px;
    }

    &.chip-3 {
      left: 15%;
      bottom: 15%;
      width: 100px;
      height: 50px;
    }
  }
}

@keyframes clockPulse {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

// ==================== 第1层 - 二进制 Canvas ====================
.binary-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

// ==================== 第2层 - 逻辑门阵列 ====================
.logic-gates {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.logic-gate {
  position: absolute;
  width: 60px;
  height: 40px;
  opacity: 0.3;
  animation: gateFloat 8s ease-in-out infinite;

  &:nth-child(1) {
    left: 10%;
    top: 15%;
    animation-delay: 0s;
  }

  &:nth-child(2) {
    right: 15%;
    top: 20%;
    animation-delay: 1s;
  }

  &:nth-child(3) {
    left: 20%;
    bottom: 25%;
    animation-delay: 2s;
  }

  &:nth-child(4) {
    right: 10%;
    bottom: 15%;
    animation-delay: 3s;
  }

  &:nth-child(5) {
    left: 5%;
    top: 50%;
    animation-delay: 0.5s;
  }

  &:nth-child(6) {
    right: 5%;
    top: 45%;
    animation-delay: 1.5s;
  }

  &:nth-child(7) {
    left: 30%;
    top: 10%;
    animation-delay: 2.5s;
  }

  &:nth-child(8) {
    right: 25%;
    bottom: 10%;
    animation-delay: 3.5s;
  }

  .gate-symbol {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: $logic-blue;
    text-shadow: 0 0 10px $logic-blue;
    border: 1px solid rgba($logic-blue, 0.5);
    border-radius: 4px;
    background: rgba($peacock-blue, 0.5);
  }

  .gate-input-1,
  .gate-input-2 {
    position: absolute;
    left: -15px;
    width: 15px;
    height: 2px;
    background: $logic-blue;
    box-shadow: 0 0 5px $logic-blue;
  }

  .gate-input-1 {
    top: 30%;
  }

  .gate-input-2 {
    top: 70%;
  }

  .gate-output {
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 2px;
    background: $terminal-green;
    box-shadow: 0 0 5px $terminal-green;
    animation: outputPulse 1s ease-in-out infinite;
  }
}

@keyframes gateFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes outputPulse {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

// ==================== 第3层 - 散热结构 ====================
.heatsink-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.heatsink-fin {
  position: absolute;
  width: 150px;
  height: 100%;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(#666, 0.1) 20%,
      rgba(#888, 0.15) 50%,
      rgba(#666, 0.1) 80%,
      transparent 100%);
  filter: blur(3px);

  &.fin-left {
    left: -50px;
    transform: skewX(-10deg);
  }

  &.fin-right {
    right: -50px;
    transform: skewX(10deg);
  }
}

// ==================== 第4层 - 装饰性元素 ====================
.debug-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.wireframe-cube {
  position: absolute;
  right: 10%;
  bottom: 15%;
  width: 80px;
  height: 80px;
  transform-style: preserve-3d;
  animation: cubeRotate 10s linear infinite;

  .cube-face {
    position: absolute;
    width: 80px;
    height: 80px;
    border: 1px solid rgba($terminal-green, 0.4);
    background: transparent;

    &.face-front {
      transform: translateZ(40px);
    }

    &.face-back {
      transform: rotateY(180deg) translateZ(40px);
    }

    &.face-left {
      transform: rotateY(-90deg) translateZ(40px);
    }

    &.face-right {
      transform: rotateY(90deg) translateZ(40px);
    }

    &.face-top {
      transform: rotateX(90deg) translateZ(40px);
    }

    &.face-bottom {
      transform: rotateX(-90deg) translateZ(40px);
    }
  }
}

@keyframes cubeRotate {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
  }

  100% {
    transform: rotateX(360deg) rotateY(360deg);
  }
}

.system-logs {
  position: absolute;
  left: 20px;
  top: 20px;
  font-size: 11px;
  color: $terminal-green;
  text-shadow: 0 0 5px $terminal-green;
  opacity: 0.7;

  .log-line {
    margin-bottom: 4px;
    animation: logFlicker 0.1s ease-out;
  }
}

@keyframes logFlicker {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

// ==================== 主内容 - 晶圆悬浮窗面板 ====================
.wafer-panel {
  position: relative;
  z-index: 10;
  width: 400px;
  padding: 40px;
  background: rgba($peacock-blue, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  transition: all 0.5s ease;

  &.overclocking {
    .circuit-border .border-trace {
      background: $terminal-green;
      box-shadow: 0 0 20px $terminal-green;
    }
  }
}

.grid-texture {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba($logic-blue, 0.05) 1px, transparent 1px),
    linear-gradient(rgba($logic-blue, 0.05) 1px, transparent 1px);
  background-size: 10px 10px;
  border-radius: 8px;
  opacity: 0.5;
}

.circuit-border {
  position: absolute;
  inset: -2px;
  pointer-events: none;

  .border-trace {
    position: absolute;
    background: rgba($logic-blue, 0.6);
    box-shadow: 0 0 10px rgba($logic-blue, 0.5);
    transition: all 0.3s ease;

    &.trace-top,
    &.trace-bottom {
      height: 2px;
      left: 20px;
      right: 20px;
    }

    &.trace-left,
    &.trace-right {
      width: 2px;
      top: 20px;
      bottom: 20px;
    }

    &.trace-top {
      top: 0;
    }

    &.trace-bottom {
      bottom: 0;
    }

    &.trace-left {
      left: 0;
    }

    &.trace-right {
      right: 0;
    }
  }

  .solder-pad {
    position: absolute;
    width: 12px;
    height: 12px;
    background: radial-gradient(circle, #ffd700 0%, #c9a227 50%, #8b7355 100%);
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);

    &.pad-tl {
      top: -4px;
      left: -4px;
    }

    &.pad-tr {
      top: -4px;
      right: -4px;
    }

    &.pad-bl {
      bottom: -4px;
      left: -4px;
    }

    &.pad-br {
      bottom: -4px;
      right: -4px;
    }
  }

  .data-packet {
    position: absolute;
    width: 6px;
    height: 6px;
    background: $terminal-green;
    border-radius: 50%;
    box-shadow: 0 0 10px $terminal-green;
    animation: packetFlow 2s linear infinite;
    animation-delay: calc(var(--i) * 0.5s);

    &:nth-child(5) {
      animation-name: packetFlowTop;
    }

    &:nth-child(6) {
      animation-name: packetFlowRight;
    }

    &:nth-child(7) {
      animation-name: packetFlowBottom;
    }

    &:nth-child(8) {
      animation-name: packetFlowLeft;
    }
  }
}

@keyframes packetFlowTop {
  0% {
    top: 0;
    left: 20px;
  }

  100% {
    top: 0;
    left: calc(100% - 20px);
  }
}

@keyframes packetFlowRight {
  0% {
    top: 20px;
    right: 0;
    left: auto;
  }

  100% {
    top: calc(100% - 20px);
    right: 0;
    left: auto;
  }
}

@keyframes packetFlowBottom {
  0% {
    bottom: 0;
    left: calc(100% - 20px);
    top: auto;
  }

  100% {
    bottom: 0;
    left: 20px;
    top: auto;
  }
}

@keyframes packetFlowLeft {
  0% {
    top: calc(100% - 20px);
    left: 0;
  }

  100% {
    top: 20px;
    left: 0;
  }
}

@keyframes packetFlow {
  0% {
    top: 0;
    left: 20px;
  }

  25% {
    top: 0;
    left: calc(100% - 20px);
  }

  50% {
    top: calc(100% - 6px);
    left: calc(100% - 20px);
  }

  75% {
    top: calc(100% - 6px);
    left: 20px;
  }

  100% {
    top: 0;
    left: 20px;
  }
}

.panel-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

// Logo
.logo-container {
  position: relative;
  margin-bottom: 24px;
}

.logo-icon {
  position: relative;
  width: 80px;
  height: 80px;
}

.cpu-core {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .core-ring {
    position: absolute;
    border: 2px solid $logic-blue;
    border-radius: 50%;
    animation: coreRingSpin 4s linear infinite;

    &.ring-1 {
      inset: 5px;
      border-color: $terminal-green;
      animation-direction: reverse;
    }

    &.ring-2 {
      inset: 15px;
      border-style: dashed;
    }
  }

  .core-center {
    width: 30px;
    height: 30px;
    background: radial-gradient(circle, $compile-white 0%, $logic-blue 50%, $terminal-green 100%);
    border-radius: 4px;
    box-shadow: 0 0 20px $terminal-green;
    animation: corePulse 1s ease-in-out infinite;
  }
}

@keyframes coreRingSpin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes corePulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.logo-circuit-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba($terminal-green, 0.3) 0%, transparent 70%);
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

// 应用名称
.app-name {
  font-size: 28px;
  font-weight: 700;
  color: $terminal-green;
  text-shadow: 0 0 10px $terminal-green, 0 0 20px rgba($terminal-green, 0.5);
  margin-bottom: 24px;
  letter-spacing: 4px;

  .char {
    display: inline-block;
    animation: charGlitch 0.5s ease-out forwards;
    opacity: 0;
  }
}

@keyframes charGlitch {
  0% {
    opacity: 0;
    transform: translateY(-20px);
    text-shadow: 2px 2px 0 $error-red, -2px -2px 0 $logic-blue;
  }

  50% {
    text-shadow: -2px 2px 0 $error-red, 2px -2px 0 $logic-blue;
  }

  100% {
    opacity: 1;
    transform: translateY(0);
    text-shadow: 0 0 10px $terminal-green;
  }
}

// 加载指示器
.loading-indicator {
  width: 100%;
}

.terminal-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(#000, 0.5);
  border-radius: 4px;
  margin-bottom: 12px;

  .line-number {
    color: rgba($terminal-green, 0.5);
    font-size: 12px;
  }

  .terminal-cursor {
    width: 8px;
    height: 16px;
    background: $terminal-green;
    animation: cursorBlink 0.5s step-end infinite;
  }

  .terminal-text {
    color: $terminal-green;
    font-size: 14px;
  }
}

@keyframes cursorBlink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

.progress-bar {
  height: 4px;
  background: rgba($terminal-green, 0.2);
  border-radius: 2px;
  overflow: hidden;

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $terminal-green, $logic-blue);
    box-shadow: 0 0 10px $terminal-green;
    animation: progressFill 2.5s ease-out forwards;
  }
}

@keyframes progressFill {
  0% {
    width: 0%;
  }

  100% {
    width: 100%;
  }
}

// ==================== 超频执行效果层 ====================
.overclock-layer {
  position: absolute;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
  }
}

.data-tunnel {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .tunnel-ring {
    position: absolute;
    border: 2px solid rgba($terminal-green, 0.3);
    border-radius: 50%;
    animation: tunnelExpand 1s ease-out infinite;
    animation-delay: calc(var(--i) * 0.2s);

    &:nth-child(1) {
      width: 100px;
      height: 100px;
    }

    &:nth-child(2) {
      width: 200px;
      height: 200px;
    }

    &:nth-child(3) {
      width: 300px;
      height: 300px;
    }

    &:nth-child(4) {
      width: 400px;
      height: 400px;
    }

    &:nth-child(5) {
      width: 500px;
      height: 500px;
    }
  }
}

@keyframes tunnelExpand {
  0% {
    transform: scale(0);
    opacity: 1;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.singularity {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.5s ease;

  .singularity-core {
    width: 20px;
    height: 20px;
    background: $compile-white;
    border-radius: 50%;
    box-shadow:
      0 0 30px $compile-white,
      0 0 60px $logic-blue,
      0 0 100px $terminal-green;
  }

  .singularity-pulse {
    position: absolute;
    inset: -20px;
    border: 2px solid rgba($compile-white, 0.5);
    border-radius: 50%;
    animation: singularityPulse 0.5s ease-out infinite;
  }
}

@keyframes singularityPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.boot-text {
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.3s ease;

  .boot-prompt {
    color: $terminal-green;
    text-shadow: 0 0 10px $terminal-green;
  }

  .boot-message {
    color: $compile-white;
    text-shadow: 0 0 10px $compile-white;
    animation: bootBlink 0.3s step-end infinite;
  }
}

@keyframes bootBlink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0.7;
  }
}

.crt-effect {
  position: absolute;
  inset: 0;
  background: $substrate-black;
  opacity: 0;
}

@keyframes crtShutdown {
  0% {
    opacity: 0;
    transform: scaleY(1);
  }

  50% {
    opacity: 1;
    transform: scaleY(0.01);
  }

  100% {
    opacity: 1;
    transform: scaleY(0);
  }
}

// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

// ==================== 过渡动画 ====================
.silicon-fade-enter-active,
.silicon-fade-leave-active {
  transition: opacity 0.5s ease;
}

.silicon-fade-enter-from,
.silicon-fade-leave-to {
  opacity: 0;
}
</style>
