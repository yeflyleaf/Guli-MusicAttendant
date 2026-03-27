<template>
  <div class="quantum-background" :class="{ embedded: embedded }">
    <!-- 底层：零点能量场 - 深邃虚空背景 -->
    <div class="void-field"></div>

    <!-- 底层：静态噪点纹理 - 模拟真空能量涨落 -->
    <div class="zero-point-noise"></div>

    <!-- 中层：概率云团 Canvas - 使用 Gooey 效果实现融合 -->
    <div class="probability-cloud-container">
      <canvas ref="probabilityCanvas" class="probability-canvas"></canvas>
    </div>

    <!-- 中层：干涉纹理叠加 -->
    <div class="interference-pattern"></div>

    <!-- 顶层：虚粒子闪烁 Canvas -->
    <canvas ref="virtualParticleCanvas" class="virtual-particle-canvas"></canvas>

    <!-- 装饰层：量子磨砂边框效果 -->
    <div class="quantum-vignette"></div>

    <!-- 顶层：切伦科夫辐射光晕 -->
    <div class="cherenkov-glow cherenkov-1"></div>
    <div class="cherenkov-glow cherenkov-2"></div>

    <!-- 装饰层：虚空黑洞 - 左上 -->
    <div class="void-blackhole">
      <div class="blackhole-core"></div>
      <div class="blackhole-singularity"></div>
      <div class="accretion-disk"></div>
      <div class="accretion-disk-inner"></div>
      <div class="event-horizon"></div>
      <div class="gravitational-lensing"></div>
      <div class="hawking-radiation"></div>
    </div>

    <!-- 装饰层：虚空黑洞 - 右下（小型） -->
    <div class="void-blackhole void-blackhole-small">
      <div class="blackhole-core"></div>
      <div class="blackhole-singularity"></div>
      <div class="accretion-disk"></div>
      <div class="accretion-disk-inner"></div>
      <div class="event-horizon"></div>
      <div class="gravitational-lensing"></div>
      <div class="hawking-radiation"></div>
    </div>

    <!-- 装饰层：虚空黑洞 - 右上（小型） -->
    <div class="void-blackhole void-blackhole-small void-blackhole-top-right">
      <div class="blackhole-core"></div>
      <div class="blackhole-singularity"></div>
      <div class="accretion-disk"></div>
      <div class="accretion-disk-inner"></div>
      <div class="event-horizon"></div>
      <div class="gravitational-lensing"></div>
      <div class="hawking-radiation"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings.store';
import { onMounted, onUnmounted, ref } from 'vue';

// Props
defineProps<{
  embedded?: boolean
}>()

const cleanupFunctions: Array<() => void> = []

const probabilityCanvas = ref<HTMLCanvasElement | null>(null)
const virtualParticleCanvas = ref<HTMLCanvasElement | null>(null)

// 获取全局帧率设置
const settingsStore = useSettingsStore()

// ==================== 概率云团系统 ====================
interface ProbabilityCloud {
  x: number
  y: number
  targetX: number
  targetY: number
  radius: number
  baseRadius: number
  opacity: number
  hue: number  // 180-280 (青色到紫色)
  morphPhase: number
  morphSpeed: number
  driftSpeed: number
  pulsePhase: number
  pulseSpeed: number
}

let probabilityClouds: ProbabilityCloud[] = []
let probabilityAnimationId: number | null = null

const initProbabilityClouds = () => {
  const canvas = probabilityCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    // 重新初始化云团位置
    initClouds()
  }

  const initClouds = () => {
    const cloudCount = 6
    probabilityClouds = Array.from({ length: cloudCount }, () => {
      const baseRadius = 80 + Math.random() * 120
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        radius: baseRadius,
        baseRadius: baseRadius,
        opacity: 0.15 + Math.random() * 0.2,
        hue: 180 + Math.random() * 100, // 青色到紫色
        morphPhase: Math.random() * Math.PI * 2,
        morphSpeed: 0.003 + Math.random() * 0.005,
        driftSpeed: 0.0003 + Math.random() * 0.0005,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.012
      }
    })
  }

  resize()
  window.addEventListener('resize', resize)
  cleanupFunctions.push(() => window.removeEventListener('resize', resize))

  // 帧率限制
  let lastFrameTime = 0
  const getFrameInterval = () => {
    const globalFPS = settingsStore.visualizationFrameRate || 60
    return 1000 / globalFPS
  }

  const animate = (currentTime: number) => {
    const frameInterval = getFrameInterval()
    if (currentTime - lastFrameTime < frameInterval) {
      probabilityAnimationId = requestAnimationFrame(animate)
      return
    }
    lastFrameTime = currentTime

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制概率云团
    probabilityClouds.forEach(cloud => {
      // 布朗运动 - 缓慢漂移向目标点
      const dx = cloud.targetX - cloud.x
      const dy = cloud.targetY - cloud.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // 添加随机抖动（不确定性）
      const jitterX = (Math.random() - 0.5) * 2
      const jitterY = (Math.random() - 0.5) * 2

      cloud.x += dx * cloud.driftSpeed + jitterX * 0.3
      cloud.y += dy * cloud.driftSpeed + jitterY * 0.3

      // 到达目标后随机选择新目标
      if (dist < 50) {
        cloud.targetX = Math.random() * canvas.width
        cloud.targetY = Math.random() * canvas.height
      }

      // 形态变化 (Morphing)
      cloud.morphPhase += cloud.morphSpeed
      cloud.pulsePhase += cloud.pulseSpeed

      // 脉动半径变化
      const pulse = Math.sin(cloud.pulsePhase) * 0.15
      const morph = Math.sin(cloud.morphPhase) * 0.1
      cloud.radius = cloud.baseRadius * (1 + pulse + morph)

      // 绘制云团 - 多层径向渐变实现柔和边缘
      const gradient = ctx.createRadialGradient(
        cloud.x, cloud.y, 0,
        cloud.x, cloud.y, cloud.radius * 2
      )

      const alpha = cloud.opacity * (0.7 + Math.sin(cloud.pulsePhase) * 0.3)
      gradient.addColorStop(0, `hsla(${cloud.hue}, 100%, 60%, ${alpha * 0.8})`)
      gradient.addColorStop(0.2, `hsla(${cloud.hue}, 90%, 55%, ${alpha * 0.5})`)
      gradient.addColorStop(0.5, `hsla(${cloud.hue}, 80%, 45%, ${alpha * 0.2})`)
      gradient.addColorStop(0.8, `hsla(${cloud.hue}, 70%, 35%, ${alpha * 0.05})`)
      gradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cloud.x, cloud.y, cloud.radius * 2, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // 绘制内核发光
      const coreGradient = ctx.createRadialGradient(
        cloud.x, cloud.y, 0,
        cloud.x, cloud.y, cloud.radius * 0.5
      )
      coreGradient.addColorStop(0, `hsla(${cloud.hue + 20}, 100%, 75%, ${alpha * 0.6})`)
      coreGradient.addColorStop(0.5, `hsla(${cloud.hue}, 100%, 60%, ${alpha * 0.2})`)
      coreGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cloud.x, cloud.y, cloud.radius * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.fill()
    })

    // 绘制云团之间的干涉效果
    ctx.globalCompositeOperation = 'screen'
    for (let i = 0; i < probabilityClouds.length; i++) {
      for (let j = i + 1; j < probabilityClouds.length; j++) {
        const c1 = probabilityClouds[i]
        const c2 = probabilityClouds[j]
        const dist = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2)
        const maxDist = c1.radius + c2.radius + 100

        if (dist < maxDist) {
          // 在两个云团之间绘制干涉线
          const midX = (c1.x + c2.x) / 2
          const midY = (c1.y + c2.y) / 2
          const intensity = 1 - dist / maxDist

          const interferenceGradient = ctx.createRadialGradient(
            midX, midY, 0,
            midX, midY, dist * 0.3
          )
          interferenceGradient.addColorStop(0, `hsla(200, 100%, 70%, ${intensity * 0.15})`)
          interferenceGradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.arc(midX, midY, dist * 0.3, 0, Math.PI * 2)
          ctx.fillStyle = interferenceGradient
          ctx.fill()
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over'

    probabilityAnimationId = requestAnimationFrame(animate)
  }

  probabilityAnimationId = requestAnimationFrame(animate)
}

// ==================== 虚粒子系统 ====================
interface VirtualParticle {
  x: number
  y: number
  life: number
  maxLife: number
  size: number
  maxSize: number
  hue: number
  type: 'pop' | 'fade'
}

let virtualParticles: VirtualParticle[] = []
let virtualParticleAnimationId: number | null = null

const initVirtualParticles = () => {
  const canvas = virtualParticleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
  cleanupFunctions.push(() => window.removeEventListener('resize', resize))

  // 帧率限制
  let lastFrameTime = 0
  const getFrameInterval = () => {
    const globalFPS = settingsStore.visualizationFrameRate || 60
    return 1000 / globalFPS
  }

  // 泊松分布随机生成 - 模拟虚粒子对的产生与湮灭
  const spawnParticle = () => {
    if (Math.random() < 0.78) { // 每帧约58%概率生成（高密度）
      virtualParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        life: 0,
        maxLife: 15 + Math.random() * 25, // 200-500ms at 60fps
        size: 0,
        maxSize: 2 + Math.random() * 4,
        hue: 180 + Math.random() * 100, // 青到紫
        type: Math.random() > 0.3 ? 'pop' : 'fade'
      })
    }
  }

  const animate = (currentTime: number) => {
    const frameInterval = getFrameInterval()
    if (currentTime - lastFrameTime < frameInterval) {
      virtualParticleAnimationId = requestAnimationFrame(animate)
      return
    }
    lastFrameTime = currentTime

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 生成新粒子
    spawnParticle()

    // 更新和绘制粒子
    virtualParticles = virtualParticles.filter(p => {
      p.life++

      const progress = p.life / p.maxLife

      // 动画曲线: 快速出现，缓慢消失
      let scale: number
      let alpha: number

      if (p.type === 'pop') {
        // 弹出效果
        if (progress < 0.2) {
          scale = progress / 0.2
          alpha = progress / 0.2
        } else {
          scale = 1 - (progress - 0.2) / 0.8 * 0.3
          alpha = 1 - (progress - 0.2) / 0.8
        }
      } else {
        // 渐变效果
        scale = Math.sin(progress * Math.PI)
        alpha = Math.sin(progress * Math.PI)
      }

      p.size = p.maxSize * scale

      if (p.size > 0 && alpha > 0) {
        // 绘制发光粒子
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size * 3
        )
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 80%, ${alpha * 0.9})`)
        gradient.addColorStop(0.3, `hsla(${p.hue}, 100%, 60%, ${alpha * 0.5})`)
        gradient.addColorStop(0.6, `hsla(${p.hue}, 90%, 50%, ${alpha * 0.2})`)
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // 核心亮点
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue + 30}, 100%, 95%, ${alpha})`
        ctx.fill()
      }

      return p.life < p.maxLife
    })

    virtualParticleAnimationId = requestAnimationFrame(animate)
  }

  virtualParticleAnimationId = requestAnimationFrame(animate)
}

onMounted(() => {
  initProbabilityClouds()
  initVirtualParticles()
})

onUnmounted(() => {
  cleanupFunctions.forEach(fn => fn())
  if (probabilityAnimationId) {
    cancelAnimationFrame(probabilityAnimationId)
  }
  if (virtualParticleAnimationId) {
    cancelAnimationFrame(virtualParticleAnimationId)
  }
})
</script>

<style lang="scss" scoped>
.quantum-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;

  // 嵌入模式 - 用于歌词页面等容器内
  &.embedded {
    position: absolute;
    z-index: 0;
  }
}

// 底层：深邃虚空背景
.void-field {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      #020c1b 0%,
      #010810 30%,
      #000408 60%,
      #000000 100%);
}

// 零点能量噪点纹理
.zero-point-noise {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  animation: noiseShift 0.5s steps(5) infinite;
}

@keyframes noiseShift {

  0%,
  100% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(-1px, 1px);
  }

  50% {
    transform: translate(1px, -1px);
  }

  75% {
    transform: translate(-1px, -1px);
  }
}

// 概率云容器
.probability-cloud-container {
  position: absolute;
  inset: 0;
  // 使用 CSS 滤镜实现 Gooey 效果
  filter: contrast(1.2) brightness(1.1);
}

.probability-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: blur(30px);
}

// 干涉纹理
.interference-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background:
    repeating-linear-gradient(0deg,
      transparent,
      transparent 2px,
      rgba(0, 240, 255, 0.1) 2px,
      rgba(0, 240, 255, 0.1) 4px),
    repeating-linear-gradient(90deg,
      transparent,
      transparent 2px,
      rgba(112, 0, 255, 0.08) 2px,
      rgba(112, 0, 255, 0.08) 4px);
  animation: interferenceWave 20s linear infinite;
}

@keyframes interferenceWave {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(4px, 4px);
  }
}

// 虚粒子 Canvas
.virtual-particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

// 量子暗角
.quantum-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center,
      transparent 30%,
      rgba(0, 0, 0, 0.3) 70%,
      rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

// 切伦科夫辐射光晕
.cherenkov-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  animation: cherenkovPulse 15s ease-in-out infinite;

  &.cherenkov-1 {
    top: 10%;
    right: 15%;
    width: 400px;
    height: 400px;
    background: radial-gradient(ellipse at center,
        rgba(0, 240, 255, 0.6) 0%,
        rgba(0, 180, 255, 0.3) 40%,
        transparent 70%);
    animation-delay: 0s;
  }

  &.cherenkov-2 {
    bottom: 15%;
    left: 10%;
    width: 350px;
    height: 350px;
    background: radial-gradient(ellipse at center,
        rgba(112, 0, 255, 0.5) 0%,
        rgba(80, 0, 200, 0.25) 40%,
        transparent 70%);
    animation-delay: -7s;
  }
}

@keyframes cherenkovPulse {

  0%,
  100% {
    opacity: 0.1;
    transform: scale(1);
  }

  50% {
    opacity: 0.2;
    transform: scale(1.15);
  }
}

// 虚空黑洞 - 左上区域
.void-blackhole {
  position: absolute;
  top: -10%;
  left: -8%;
  width: 560px;
  height: 560px;
  animation: blackholeRotate 120s linear infinite;

  // 黑洞核心 - 绝对黑暗
  .blackhole-core {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    height: 200px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle at center,
        #000000 0%,
        #000000 60%,
        rgba(0, 0, 0, 0.95) 80%,
        rgba(0, 0, 0, 0.8) 100%);
    border-radius: 50%;
    box-shadow:
      0 0 120px 60px rgba(0, 0, 0, 0.9),
      0 0 200px 120px rgba(0, 0, 0, 0.6),
      0 0 280px 180px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }

  // 奇点 - 极小的白色亮点
  .blackhole-singularity {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    transform: translate(-50%, -50%);
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 16px 4px rgba(255, 255, 255, 0.8);
    z-index: 11;
    animation: singularityPulse 3s ease-in-out infinite;
  }

  // 吸积盘 - 外层
  .accretion-disk {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 640px;
    height: 640px;
    transform: translate(-50%, -50%) rotateX(75deg);
    border-radius: 50%;
    background: conic-gradient(from 0deg,
        rgba(0, 240, 255, 0.4) 0deg,
        rgba(112, 0, 255, 0.3) 60deg,
        rgba(0, 180, 255, 0.35) 120deg,
        rgba(180, 0, 255, 0.25) 180deg,
        rgba(0, 240, 255, 0.4) 240deg,
        rgba(112, 0, 255, 0.3) 300deg,
        rgba(0, 240, 255, 0.4) 360deg);
    mask-image: radial-gradient(circle at center,
        transparent 25%,
        black 35%,
        black 90%,
        transparent 100%);
    -webkit-mask-image: radial-gradient(circle at center,
        transparent 25%,
        black 35%,
        black 90%,
        transparent 100%);
    filter: blur(4px);
    animation: accretionSpin 40s linear infinite;
    z-index: 5;
  }

  // 吸积盘 - 内层
  .accretion-disk-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    height: 400px;
    transform: translate(-50%, -50%) rotateX(75deg);
    border-radius: 50%;
    background: conic-gradient(from 180deg,
        rgba(0, 240, 255, 0.6) 0deg,
        rgba(255, 100, 200, 0.4) 90deg,
        rgba(0, 180, 255, 0.5) 180deg,
        rgba(200, 50, 255, 0.35) 270deg,
        rgba(0, 240, 255, 0.6) 360deg);
    mask-image: radial-gradient(circle at center,
        transparent 40%,
        black 50%,
        black 85%,
        transparent 100%);
    -webkit-mask-image: radial-gradient(circle at center,
        transparent 40%,
        black 50%,
        black 85%,
        transparent 100%);
    filter: blur(3px);
    animation: accretionSpin 25s linear infinite reverse;
    z-index: 6;
  }

  // 事件视界 - 边缘发光
  .event-horizon {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 220px;
    height: 220px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: transparent;
    border: 3px solid rgba(0, 240, 255, 0.3);
    box-shadow:
      0 0 40px 10px rgba(0, 240, 255, 0.2),
      inset 0 0 60px 20px rgba(0, 0, 0, 0.8);
    z-index: 9;
    animation: eventHorizonPulse 8s ease-in-out infinite;
  }

  // 引力透镜效应
  .gravitational-lensing {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 560px;
    height: 560px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle at center,
        transparent 30%,
        rgba(0, 240, 255, 0.03) 50%,
        rgba(112, 0, 255, 0.02) 70%,
        transparent 85%);
    filter: blur(12px);
    z-index: 4;
    animation: lensingWobble 20s ease-in-out infinite;
  }

  // 霍金辐射 - 黑洞边缘的微小粒子散射
  .hawking-radiation {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle at center,
        transparent 30%,
        rgba(0, 240, 255, 0.08) 45%,
        rgba(180, 100, 255, 0.05) 60%,
        transparent 75%);
    z-index: 8;
    animation: hawkingFlicker 4s ease-in-out infinite;
  }
}

// 右下方小型黑洞 - 尺寸为左上方的一半
.void-blackhole-small {
  top: auto;
  bottom: 1%;
  left: auto;
  right: 1%;
  width: 280px;
  height: 280px;
  animation: blackholeRotate 90s linear infinite reverse;

  .blackhole-core {
    width: 100px;
    height: 100px;
    box-shadow:
      0 0 60px 30px rgba(0, 0, 0, 0.9),
      0 0 100px 60px rgba(0, 0, 0, 0.6),
      0 0 140px 90px rgba(0, 0, 0, 0.3);
  }

  .blackhole-singularity {
    width: 4px;
    height: 4px;
    box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.8);
  }

  .accretion-disk {
    width: 320px;
    height: 320px;
    filter: blur(2px);
  }

  .accretion-disk-inner {
    width: 200px;
    height: 200px;
    filter: blur(2px);
  }

  .event-horizon {
    width: 110px;
    height: 110px;
    border-width: 2px;
    box-shadow:
      0 0 20px 5px rgba(0, 240, 255, 0.2),
      inset 0 0 30px 10px rgba(0, 0, 0, 0.8);
  }

  .gravitational-lensing {
    width: 280px;
    height: 280px;
    filter: blur(6px);
  }

  .hawking-radiation {
    width: 150px;
    height: 150px;
  }
}

// 右上方小型黑洞 - 位置覆盖
.void-blackhole-top-right {
  bottom: auto;
  top: -1%; // ← 调整这个值控制垂直位置
  right: 8%; // ← 调整这个值控制水平位置
  animation: blackholeRotate 75s linear infinite; // 正向旋转，与右下方区分
}

@keyframes blackholeRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes singularityPulse {

  0%,
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

@keyframes accretionSpin {
  from {
    transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg);
  }
}

@keyframes eventHorizonPulse {

  0%,
  100% {
    box-shadow:
      0 0 20px 5px rgba(0, 240, 255, 0.2),
      inset 0 0 30px 10px rgba(0, 0, 0, 0.8);
  }

  50% {
    box-shadow:
      0 0 30px 10px rgba(0, 240, 255, 0.35),
      inset 0 0 40px 15px rgba(0, 0, 0, 0.9);
  }
}

@keyframes lensingWobble {

  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.08);
    opacity: 0.9;
  }
}

@keyframes hawkingFlicker {

  0%,
  100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }

  25% {
    opacity: 0.7;
  }

  50% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.1);
  }

  75% {
    opacity: 0.8;
  }
}
</style>
