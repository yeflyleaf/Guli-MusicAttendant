<template>
  <div class="wasteland-background" :class="{ embedded: embedded }" ref="containerRef">
    <!-- 底层：风化金属板纹理 -->
    <div class="weathered-metal-base"></div>

    <!-- 夕阳天幕渐变 -->
    <div class="sunset-sky"></div>

    <!-- 噪点纹理层 - 模拟沙尘和金属划痕 -->
    <svg class="noise-overlay" xmlns="http://www.w3.org/2000/svg">
      <filter id="wastelandNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="5" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#wastelandNoise)" />
    </svg>

    <!-- 中层：巨型沉寂机械剪影 -->
    <div class="mechanical-ruins-layer" :style="ruinsParallaxStyle">
      <!-- 左侧巨型齿轮 - 主齿轮 400px -->
      <div class="giant-gear gear-left-main">
        <div class="gear-body">
          <div class="gear-center"></div>
        </div>
        <div class="gear-rust"></div>
        <div class="gear-rim-light"></div>
      </div>

      <!-- 左侧巨型齿轮 - 副齿轮 280px -->
      <div class="giant-gear gear-left-secondary">
        <div class="gear-body">
          <div class="gear-center"></div>
        </div>
        <div class="gear-rust"></div>
      </div>

      <!-- 右下巨型齿轮 450px -->
      <div class="giant-gear gear-right-bottom">
        <div class="gear-body">
          <div class="gear-center"></div>
        </div>
        <div class="gear-rust"></div>
        <div class="gear-rim-light"></div>
      </div>

      <!-- 右上方中型齿轮 200px -->
      <div class="medium-gear gear-right-top">
        <div class="gear-body">
          <div class="gear-center"></div>
        </div>
      </div>

      <!-- 左上角中型齿轮 200px -->
      <div class="medium-gear gear-left-top">
        <div class="gear-body">
          <div class="gear-center"></div>
        </div>
      </div>

      <!-- 顶部中央齿轮 160px -->
      <div class="medium-gear gear-top-center">
        <div class="gear-body">
          <div class="gear-center"></div>
        </div>
      </div>

      <!-- 相互啮合的旋转中型齿轮 180px (位于烟囱之间) -->
      <div class="medium-gear gear-mesh-left">
        <div class="gear-body">
          <div class="gear-center"></div>
        </div>
      </div>
      <div class="medium-gear gear-mesh-right">
        <div class="gear-body">
          <div class="gear-center"></div>
        </div>
      </div>

      <!-- 左侧旋转工业排风扇 140px -->
      <div class="industrial-fan fan-left">
        <div class="fan-frame">
          <div class="fan-blades">
            <div class="blade blade-1"></div>
            <div class="blade blade-2"></div>
            <div class="blade blade-3"></div>
            <div class="blade blade-4"></div>
            <div class="blade blade-5"></div>
            <div class="blade blade-6"></div>
          </div>
          <div class="fan-center"></div>
        </div>
        <div class="fan-glow"></div>
      </div>

      <!-- 右侧旋转工业排风扇 120px -->
      <div class="industrial-fan fan-right">
        <div class="fan-frame">
          <div class="fan-blades">
            <div class="blade blade-1"></div>
            <div class="blade blade-2"></div>
            <div class="blade blade-3"></div>
            <div class="blade blade-4"></div>
            <div class="blade blade-5"></div>
            <div class="blade blade-6"></div>
          </div>
          <div class="fan-center"></div>
        </div>
        <div class="fan-glow"></div>
      </div>

      <!-- 右上方断裂起重臂 -->
      <div class="crane-arm">
        <div class="arm-segment arm-segment-1"></div>
        <div class="arm-segment arm-segment-2"></div>
        <div class="arm-joint"></div>
      </div>



      <!-- 底部建筑群废墟 -->
      <!-- 左侧工厂建筑 280px -->
      <div class="ruin-silhouette ruin-factory"></div>
      <!-- 塔楼 220px -->
      <div class="ruin-silhouette ruin-tower"></div>
      <!-- 右侧仓库 180px -->
      <div class="ruin-silhouette ruin-warehouse"></div>
      <!-- 中间工厂 -->
      <div class="ruin-silhouette ruin-factory-2"></div>
      <!-- 储油罐 -->
      <div class="ruin-silhouette ruin-tank"></div>
      <!-- 烟囱 -->
      <div class="ruin-silhouette ruin-chimney"></div>
      <!-- 小型废墟 -->
      <div class="ruin-silhouette ruin-debris-1"></div>
      <div class="ruin-silhouette ruin-debris-2"></div>

      <!-- 散落的小齿轮 55-100px -->
      <div class="small-gear gear-small-1">
        <div class="gear-body"></div>
      </div>
      <div class="small-gear gear-small-2">
        <div class="gear-body"></div>
      </div>
      <div class="small-gear gear-small-3">
        <div class="gear-body"></div>
      </div>
      <div class="small-gear gear-small-4">
        <div class="gear-body"></div>
      </div>
      <div class="small-gear gear-small-5">
        <div class="gear-body"></div>
      </div>
      <div class="small-gear gear-small-6">
        <div class="gear-body"></div>
      </div>
      <div class="small-gear gear-small-7">
        <div class="gear-body"></div>
      </div>
      <div class="small-gear gear-small-8">
        <div class="gear-body"></div>
      </div>
    </div>

    <!-- 故障警示灯 -->
    <div class="warning-lights">
      <div class="warning-light light-1"></div>
      <div class="warning-light light-2"></div>
      <div class="warning-light light-3"></div>
    </div>

    <!-- 远处夕阳/余晖光源 -->
    <div class="sunset-glow">
      <div class="sun-core"></div>
      <div class="sun-corona"></div>
      <div class="god-rays">
        <div class="ray ray-1"></div>
        <div class="ray ray-2"></div>
        <div class="ray ray-3"></div>
        <div class="ray ray-4"></div>
        <div class="ray ray-5"></div>
      </div>
    </div>

    <!-- 近景：水平风沙流 Canvas -->
    <canvas ref="sandstormCanvas" class="sandstorm-canvas"></canvas>

    <!-- 漂浮余烬/火星 Canvas -->
    <canvas ref="embersCanvas" class="embers-canvas"></canvas>

    <!-- 体积雾效果 -->
    <div class="volumetric-fog"></div>

    <!-- 顶层：厚重暗角 -->
    <div class="vignette-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings.store';
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Props
defineProps<{
  embedded?: boolean
}>()

const cleanupFunctions: Array<() => void> = []

const containerRef = ref<HTMLElement | null>(null)
const sandstormCanvas = ref<HTMLCanvasElement | null>(null)
const embersCanvas = ref<HTMLCanvasElement | null>(null)

// 获取全局帧率设置
const settingsStore = useSettingsStore()

// 鼠标位置用于视差效果
const mouseX = ref(0.5)
const mouseY = ref(0.5)

// 废墟层视差偏移量
const ruinsParallaxStyle = computed(() => ({
  transform: `translate(${(mouseX.value - 0.5) * -10}px, ${(mouseY.value - 0.5) * -8}px)`
}))

// 鼠标移动处理
const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  mouseX.value = e.clientX / rect.width
  mouseY.value = e.clientY / rect.height
}

// 沙尘粒子系统
interface SandParticle {
  x: number
  y: number
  width: number
  height: number
  speed: number
  opacity: number
  color: string
}

let sandParticles: SandParticle[] = []
let sandstormAnimationId: number | null = null

const initSandstormCanvas = () => {
  const canvas = sandstormCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
  cleanupFunctions.push(() => window.removeEventListener('resize', resize))

  // 沙尘颜色 - 黄褐色系
  const sandColors = [
    'rgba(139, 90, 43, 0.4)',   // 锈褐
    'rgba(160, 120, 70, 0.35)', // 沙黄
    'rgba(120, 80, 40, 0.45)',  // 深褐
    'rgba(180, 140, 90, 0.3)',  // 浅沙
    'rgba(100, 70, 35, 0.5)',   // 暗褐
  ]

  // 创建沙尘粒子 - 横向飞行的短线条
  const particleCount = 150
  sandParticles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * canvas.width * 1.5,
    y: Math.random() * canvas.height,
    width: 3 + Math.random() * 8,  // 短横线
    height: 1 + Math.random() * 1.5,
    speed: 300 + Math.random() * 400, // 快速移动
    opacity: 0.3 + Math.random() * 0.5,
    color: sandColors[Math.floor(Math.random() * sandColors.length)]
  }))

  // 帧率限制
  let lastFrameTime = 0
  const getFrameInterval = () => {
    const globalFPS = settingsStore.visualizationFrameRate || 60
    return 1000 / globalFPS
  }

  const animate = (currentTime: number) => {
    const frameInterval = getFrameInterval()
    const deltaTime = currentTime - lastFrameTime

    if (deltaTime < frameInterval) {
      sandstormAnimationId = requestAnimationFrame(animate)
      return
    }

    const dt = deltaTime / 1000 // 转换为秒
    lastFrameTime = currentTime

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    sandParticles.forEach(particle => {
      // 水平向左移动（制造风吹效果）
      particle.x -= particle.speed * dt

      // 略微上下波动
      const wave = Math.sin(currentTime * 0.003 + particle.y * 0.01) * 2

      // 如果飞出屏幕左侧，从右侧重新进入
      if (particle.x + particle.width < 0) {
        particle.x = canvas.width + Math.random() * 100
        particle.y = Math.random() * canvas.height
      }

      ctx.save()
      ctx.globalAlpha = particle.opacity

      // 绘制运动模糊的横线
      ctx.fillStyle = particle.color
      ctx.fillRect(
        particle.x,
        particle.y + wave,
        particle.width,
        particle.height
      )

      ctx.restore()
    })

    sandstormAnimationId = requestAnimationFrame(animate)
  }

  sandstormAnimationId = requestAnimationFrame(animate)
}

// 余烬/火星粒子系统
interface EmberParticle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  life: number
  maxLife: number
  brightness: number
  flickerPhase: number
}

let embers: EmberParticle[] = []
let embersAnimationId: number | null = null

const initEmbersCanvas = () => {
  const canvas = embersCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
  cleanupFunctions.push(() => window.removeEventListener('resize', resize))

  // 创建余烬粒子
  const emberCount = 25
  const createEmber = (): EmberParticle => ({
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 100,
    size: 1 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 30 - 20, // 略微向左飘动
    speedY: -20 - Math.random() * 40, // 向上飘动
    life: 0,
    maxLife: 3 + Math.random() * 4,
    brightness: 0.5 + Math.random() * 0.5,
    flickerPhase: Math.random() * Math.PI * 2
  })

  embers = Array.from({ length: emberCount }, createEmber)

  // 帧率限制
  let lastFrameTime = 0
  const getFrameInterval = () => {
    const globalFPS = settingsStore.visualizationFrameRate || 60
    return 1000 / globalFPS
  }

  const animate = (currentTime: number) => {
    const frameInterval = getFrameInterval()
    const deltaTime = currentTime - lastFrameTime

    if (deltaTime < frameInterval) {
      embersAnimationId = requestAnimationFrame(animate)
      return
    }

    const dt = deltaTime / 1000
    lastFrameTime = currentTime

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    embers.forEach((ember, index) => {
      // 更新位置
      ember.x += ember.speedX * dt
      ember.y += ember.speedY * dt
      ember.life += dt

      // 计算闪烁效果（模拟余火的忽明忽暗）
      const flicker = Math.sin(currentTime * 0.01 + ember.flickerPhase) * 0.3 + 0.7

      // 计算生命周期透明度
      const lifeRatio = ember.life / ember.maxLife
      const fadeIn = Math.min(1, ember.life * 2)
      const fadeOut = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1
      const alpha = fadeIn * fadeOut * ember.brightness * flicker

      // 如果生命周期结束，重置粒子
      if (ember.life >= ember.maxLife || ember.y < -50) {
        Object.assign(embers[index], createEmber())
        return
      }

      ctx.save()
      ctx.globalAlpha = alpha

      // 绘制发光的余烬
      const gradient = ctx.createRadialGradient(
        ember.x, ember.y, 0,
        ember.x, ember.y, ember.size * 3
      )
      gradient.addColorStop(0, 'rgba(255, 140, 50, 1)')  // 橙红核心
      gradient.addColorStop(0.3, 'rgba(255, 100, 30, 0.8)')
      gradient.addColorStop(0.6, 'rgba(200, 60, 20, 0.4)')
      gradient.addColorStop(1, 'rgba(150, 40, 10, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(ember.x, ember.y, ember.size * 3, 0, Math.PI * 2)
      ctx.fill()

      // 核心亮点
      ctx.fillStyle = 'rgba(255, 200, 150, 0.9)'
      ctx.beginPath()
      ctx.arc(ember.x, ember.y, ember.size * 0.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    })

    embersAnimationId = requestAnimationFrame(animate)
  }

  embersAnimationId = requestAnimationFrame(animate)
}

onMounted(() => {
  // 添加鼠标移动监听
  if (containerRef.value) {
    containerRef.value.addEventListener('mousemove', handleMouseMove)
  }
  initSandstormCanvas()
  initEmbersCanvas()
})

onUnmounted(() => {
  cleanupFunctions.forEach(fn => fn())
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousemove', handleMouseMove)
  }
  if (sandstormAnimationId) {
    cancelAnimationFrame(sandstormAnimationId)
  }
  if (embersAnimationId) {
    cancelAnimationFrame(embersAnimationId)
  }
})
</script>

<style lang="scss" scoped>
// 废土色彩变量
$wasteland-black: #1a0f0f;
$rust-brown: #3e2723;
$rust-orange: #8d4004;
$sunset-orange: #ff7043;
$copper-green: #4db6ac;
$dark-metal: #2a1a1a;
$sand-yellow: #c5a059;

.wasteland-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
  background: $wasteland-black;

  // 嵌入模式 - 用于歌词页面等容器内
  &.embedded {
    position: absolute;
    z-index: 0;
  }
}

// 风化金属板背景纹理
.weathered-metal-base {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg,
      rgba(42, 26, 26, 0.9) 0%,
      rgba(26, 15, 15, 0.95) 50%,
      rgba(30, 18, 18, 0.9) 100%);

  // 金属划痕纹理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(90deg,
        transparent 0px,
        rgba(80, 60, 40, 0.03) 1px,
        transparent 2px,
        transparent 20px),
      repeating-linear-gradient(0deg,
        transparent 0px,
        rgba(60, 40, 20, 0.02) 1px,
        transparent 2px,
        transparent 30px);
    pointer-events: none;
  }

  // 油污斑痕
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 40% 30% at 20% 80%, rgba(20, 10, 5, 0.4) 0%, transparent 70%),
      radial-gradient(ellipse 35% 25% at 75% 60%, rgba(25, 15, 8, 0.3) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 50% 90%, rgba(15, 8, 3, 0.5) 0%, transparent 75%);
    pointer-events: none;
  }
}

// 夕阳天幕
.sunset-sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      rgba(255, 112, 67, 0.15) 0%,
      rgba(255, 152, 100, 0.1) 25%,
      rgba(141, 64, 4, 0.08) 50%,
      rgba(62, 39, 35, 0.05) 75%,
      transparent 100%);
  pointer-events: none;
}

// 噪点纹理
.noise-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.12;
  mix-blend-mode: overlay;
  pointer-events: none;
}

// 机械废墟层
.mechanical-ruins-layer {
  position: absolute;
  inset: 0;
  transition: transform 0.3s ease-out;
}

// 巨型齿轮
.giant-gear {
  position: absolute;
  width: 400px;
  height: 400px;

  // 左侧主齿轮 400px
  &.gear-left-main {
    left: -80px;
    bottom: -60px;
    // 初始角度 -15deg，动画叠加
    animation: gearRotate 80s linear infinite;
  }

  // 左侧副齿轮 280px（与主齿轮啮合）
  &.gear-left-secondary {
    left: 200px;
    bottom: 140px;
    width: 280px;
    height: 280px;
    opacity: 0.85;
    // 反向旋转，模拟啮合
    animation: gearRotate 80s linear infinite reverse;
  }

  // 右下巨型齿轮 450px
  &.gear-right-bottom {
    right: -120px;
    bottom: -100px;
    width: 450px;
    height: 450px;
    animation: gearRotate 70s linear infinite;
  }

  .gear-body {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg,
        rgba(50, 32, 28, 1) 0%,
        rgba(70, 45, 38, 0.95) 50%,
        rgba(35, 22, 18, 1) 100%);
    border: 3px solid rgba(90, 60, 45, 0.6);
    box-shadow:
      inset -25px -25px 70px rgba(0, 0, 0, 0.7),
      inset 15px 15px 50px rgba(120, 90, 60, 0.15),
      0 0 100px rgba(0, 0, 0, 0.9),
      0 0 3px rgba(255, 112, 67, 0.2);

    // 齿轮齿 - 清晰轮廓
    &::before {
      content: '';
      position: absolute;
      inset: -35px;
      background:
        repeating-conic-gradient(from 0deg,
          rgba(55, 35, 30, 1) 0deg 12deg,
          transparent 12deg 24deg);
      border-radius: 50%;
      mask: radial-gradient(circle at center, transparent 52%, black 53%);
      -webkit-mask: radial-gradient(circle at center, transparent 52%, black 53%);
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
    }
  }

  .gear-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90px;
    height: 90px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%,
        rgba(100, 75, 55, 0.9) 0%,
        rgba(50, 32, 28, 1) 50%,
        rgba(25, 15, 12, 1) 100%);
    border: 2px solid rgba(80, 55, 40, 0.5);
    box-shadow:
      inset 0 0 25px rgba(0, 0, 0, 0.9),
      0 0 10px rgba(0, 0, 0, 0.6);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 35px;
      height: 35px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: rgba(30, 18, 15, 1);
      border: 1px solid rgba(60, 40, 30, 0.4);
      box-shadow:
        inset 0 0 12px rgba(0, 0, 0, 0.95),
        0 0 8px rgba(120, 90, 60, 0.15);
    }
  }

  .gear-rust {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background:
      radial-gradient(ellipse 35% 25% at 25% 35%, rgba(160, 80, 20, 0.35) 0%, transparent 70%),
      radial-gradient(ellipse 30% 30% at 75% 55%, rgba(150, 100, 50, 0.3) 0%, transparent 65%),
      radial-gradient(ellipse 20% 20% at 55% 80%, rgba(140, 70, 25, 0.25) 0%, transparent 60%);
    pointer-events: none;
  }

  // 边缘高光 - 夕阳余晖照射效果
  .gear-rim-light {
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    background: conic-gradient(from 200deg,
        transparent 0deg,
        rgba(255, 140, 80, 0.15) 30deg,
        rgba(255, 180, 120, 0.25) 60deg,
        transparent 120deg,
        transparent 360deg);
    pointer-events: none;
    filter: blur(2px);
  }
}

// 中型齿轮
.medium-gear {
  position: absolute;
  width: 200px;
  height: 200px;

  // 相互啮合的旋转齿轮 (位于烟囱之间) - 请在此处手动调整位置
  &.gear-mesh-left {
    left: 32%; // 左侧齿轮水平位置
    bottom: 15%; // 左侧齿轮垂直位置
    width: 180px;
    height: 180px;
    animation: gearRotate 20s linear infinite;
    z-index: 0;
    opacity: 0.8;
  }

  &.gear-mesh-right {
    left: 45%; // 右侧齿轮水平位置 (建议与左侧相差约 8-9% 以啮合)
    bottom: 26%; // 右侧齿轮垂直位置
    width: 180px;
    height: 180px;
    animation: gearRotate 20s linear infinite reverse; // 反向旋转
    z-index: 0;
    opacity: 0.8;
  }

  // 左上角齿轮 200px
  &.gear-left-top {
    left: -1%;
    top: -5%;
    animation: gearRotate 40s linear infinite;
    opacity: 0.8;
  }

  // 右上方齿轮 200px
  &.gear-right-top {
    right: 8%;
    top: 12%;
    animation: gearRotate 45s linear infinite reverse;
    opacity: 0.75;
  }

  // 顶部中央齿轮 160px
  &.gear-top-center {
    left: 35%;
    top: -40px;
    width: 160px;
    height: 160px;
    animation: gearRotate 50s linear infinite;
    opacity: 0.6;
  }

  .gear-body {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg,
        rgba(48, 30, 26, 1) 0%,
        rgba(65, 42, 35, 0.95) 50%,
        rgba(32, 20, 16, 1) 100%);
    border: 2px solid rgba(85, 55, 42, 0.5);
    box-shadow:
      inset -15px -15px 40px rgba(0, 0, 0, 0.6),
      0 0 50px rgba(0, 0, 0, 0.7);

    &::before {
      content: '';
      position: absolute;
      inset: -20px;
      background:
        repeating-conic-gradient(from 0deg,
          rgba(50, 32, 28, 1) 0deg 18deg,
          transparent 18deg 36deg);
      border-radius: 50%;
      mask: radial-gradient(circle at center, transparent 55%, black 56%);
      -webkit-mask: radial-gradient(circle at center, transparent 55%, black 56%);
    }
  }

  .gear-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50px;
    height: 50px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle at 40% 40%,
        rgba(80, 60, 45, 0.85) 0%,
        rgba(40, 25, 22, 1) 100%);
    border: 1px solid rgba(70, 50, 38, 0.4);
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.85);
  }
}

// 小齿轮 55-100px
.small-gear {
  position: absolute;
  width: 100px;
  height: 100px;

  &.gear-small-1 {
    right: 18%;
    bottom: 8%;
    animation: gearRotate 20s linear infinite;
    opacity: 0.75;
  }

  &.gear-small-2 {
    left: 28%;
    top: 22%;
    width: 70px;
    height: 70px;
    animation: gearRotate 25s linear infinite reverse;
    opacity: 0.55;
  }

  &.gear-small-3 {
    right: 35%;
    top: 8%;
    width: 55px;
    height: 55px;
    animation: gearRotate 18s linear infinite;
    opacity: 0.45;
  }

  &.gear-small-4 {
    left: 8%;
    top: 45%;
    width: 65px;
    height: 65px;
    animation: gearRotate 22s linear infinite reverse;
    opacity: 0.5;
  }

  &.gear-small-5 {
    left: 45%;
    top: 15%;
    width: 40px;
    height: 40px;
    animation: gearRotate 20s linear infinite;
    opacity: 0.4;
  }

  &.gear-small-6 {
    right: 30%;
    bottom: 35%;
    width: 60px;
    height: 60px;
    animation: gearRotate 24s linear infinite reverse;
    opacity: 0.5;
  }

  &.gear-small-7 {
    left: 15%;
    top: 60%;
    width: 45px;
    height: 45px;
    animation: gearRotate 19s linear infinite;
    opacity: 0.45;
  }

  &.gear-small-8 {
    right: 42%;
    top: 25%;
    width: 35px;
    height: 35px;
    animation: gearRotate 21s linear infinite reverse;
    opacity: 0.35;
  }

  .gear-body {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg,
        rgba(48, 30, 26, 1) 0%,
        rgba(38, 24, 20, 1) 100%);
    border: 2px solid rgba(75, 50, 40, 0.5);
    box-shadow:
      inset -5px -5px 18px rgba(0, 0, 0, 0.6),
      0 0 25px rgba(0, 0, 0, 0.7);

    &::before {
      content: '';
      position: absolute;
      inset: -8px;
      background:
        repeating-conic-gradient(from 0deg,
          rgba(45, 28, 24, 1) 0deg 22deg,
          transparent 22deg 44deg);
      border-radius: 50%;
      mask: radial-gradient(circle at center, transparent 52%, black 53%);
      -webkit-mask: radial-gradient(circle at center, transparent 52%, black 53%);
    }
  }
}

// 断裂起重臂
.crane-arm {
  position: absolute;
  right: -30px;
  top: 5%;
  width: 300px;
  height: 150px;
  transform: rotate(-25deg);
  opacity: 0.8;

  .arm-segment {
    position: absolute;
    background: linear-gradient(90deg,
        rgba(62, 39, 35, 0.9) 0%,
        rgba(42, 26, 26, 0.95) 50%,
        rgba(30, 18, 15, 0.9) 100%);
    box-shadow:
      inset -5px -5px 20px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(0, 0, 0, 0.7);

    &.arm-segment-1 {
      width: 180px;
      height: 25px;
      top: 50px;
      right: 0;
      border-radius: 3px;
    }

    &.arm-segment-2 {
      width: 120px;
      height: 20px;
      top: 80px;
      right: 60px;
      transform: rotate(15deg);
      border-radius: 3px;
    }
  }

  .arm-joint {
    position: absolute;
    width: 40px;
    height: 40px;
    top: 45px;
    right: 60px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 40%,
        rgba(80, 60, 40, 0.8) 0%,
        rgba(42, 26, 26, 0.9) 100%);
    box-shadow:
      inset -3px -3px 10px rgba(0, 0, 0, 0.6),
      0 0 15px rgba(0, 0, 0, 0.5);
  }
}



// 废墟轮廓 - 连绵不断的底部建筑群
.ruin-silhouette {
  position: absolute;
  background: rgba(30, 18, 15, 1);
  border-top: 1px solid rgba(60, 40, 35, 0.5);
  box-shadow:
    0 0 60px rgba(0, 0, 0, 0.95),
    inset 0 10px 30px rgba(0, 0, 0, 0.7),
    0 -1px 3px rgba(255, 112, 67, 0.15);
  z-index: 2;

  // 1. 左侧重型工厂 (0% - 22%)
  &.ruin-factory {
    left: -2%;
    bottom: 0;
    width: 24%;
    height: 300px;
    clip-path: polygon(0% 100%,
        0% 40%,
        10% 40%,
        10% 30%,
        25% 30%,
        25% 20%,
        40% 20%,
        40% 10%,
        60% 10%,
        60% 25%,
        75% 25%,
        75% 35%,
        90% 35%,
        90% 50%,
        100% 50%,
        100% 100%);
    opacity: 0.95;
  }

  // 2. 通讯塔楼 (改为高瘦梯形圆柱)
  &.ruin-tower {
    left: 22%;
    bottom: 0;
    width: 50px;
    height: 420px;
    clip-path: polygon(25% 0%,
        75% 0%,
        85% 5%,
        100% 100%,
        0% 100%,
        15% 5%);
    opacity: 0.9;
    z-index: 1;
  }

  // 3. 中间加工厂 (28% - 48%)
  &.ruin-factory-2 {
    left: 28%;
    bottom: 0;
    width: 20%;
    height: 220px;
    clip-path: polygon(0% 100%,
        0% 50%,
        15% 40%,
        30% 50%,
        45% 40%,
        60% 50%,
        75% 40%,
        90% 50%,
        100% 40%,
        100% 100%);
    opacity: 0.85;
  }

  // 4. 储油罐群 (45% - 60%)
  &.ruin-tank {
    left: 46%;
    bottom: 0;
    width: 15%;
    height: 160px;
    clip-path: polygon(0% 100%,
        5% 30%,
        15% 20%,
        30% 20%,
        40% 30%,
        50% 30%,
        60% 20%,
        75% 20%,
        85% 30%,
        95% 30%,
        100% 100%);
    opacity: 0.8;
  }

  // 5. 烟囱 (改为高瘦梯形圆柱)
  &.ruin-chimney {
    left: 62%;
    bottom: 0;
    width: 40px;
    height: 480px;
    clip-path: polygon(30% 0%,
        70% 0%,
        100% 100%,
        0% 100%);
    opacity: 0.85;
  }

  // 6. 废弃反应堆 (65% - 85%) - 新增
  &.ruin-debris-1 {
    left: 66%;
    bottom: 0;
    width: 20%;
    height: 260px;
    clip-path: polygon(0% 100%,
        10% 60%,
        20% 50%,
        30% 20%,
        50% 10%,
        70% 20%,
        80% 50%,
        90% 60%,
        100% 100%);
    opacity: 0.9;
  }

  // 7. 右侧大型仓库 (82% - 102%)
  &.ruin-warehouse {
    left: 84%;
    bottom: 0;
    width: 18%;
    height: 240px;
    clip-path: polygon(0% 100%,
        0% 50%,
        10% 40%,
        50% 15%,
        90% 40%,
        100% 50%,
        100% 100%);
    opacity: 0.95;
  }

  // 8. 填充碎片 (任意位置填充空隙)
  &.ruin-debris-2 {
    left: 40%;
    bottom: 0;
    width: 10%;
    height: 120px;
    clip-path: polygon(0% 100%,
        20% 40%,
        40% 60%,
        60% 30%,
        80% 50%,
        100% 100%);
    opacity: 0.7;
    z-index: 0;
  }
}

// 工业排风扇
.industrial-fan {
  position: absolute;
  width: 140px;
  height: 140px;

  &.fan-left {
    left: 12%;
    top: 28%;
  }

  &.fan-right {
    right: 15%;
    top: 35%;
    width: 120px;
    height: 120px;
  }

  .fan-frame {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg,
        rgba(45, 28, 24, 1) 0%,
        rgba(55, 35, 30, 0.95) 50%,
        rgba(35, 22, 18, 1) 100%);
    border: 4px solid rgba(70, 45, 38, 0.8);
    box-shadow:
      inset 0 0 30px rgba(0, 0, 0, 0.7),
      0 0 40px rgba(0, 0, 0, 0.8),
      0 0 5px rgba(255, 112, 67, 0.15);

    // 外框装饰
    &::before {
      content: '';
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 2px solid rgba(80, 55, 45, 0.4);
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
    }
  }

  .fan-blades {
    position: absolute;
    inset: 15%;
    animation: fanRotate 12s linear infinite;
  }

  .blade {
    position: absolute;
    width: 45%;
    height: 12%;
    top: 44%;
    left: 50%;
    transform-origin: 0% 50%;
    background: linear-gradient(90deg,
        rgba(65, 42, 35, 1) 0%,
        rgba(50, 32, 28, 1) 50%,
        rgba(40, 25, 22, 1) 100%);
    border: 1px solid rgba(85, 55, 45, 0.5);
    border-radius: 3px;
    box-shadow:
      inset -3px 0 8px rgba(0, 0, 0, 0.4),
      0 2px 5px rgba(0, 0, 0, 0.5);

    &.blade-1 {
      transform: rotate(0deg);
    }

    &.blade-2 {
      transform: rotate(60deg);
    }

    &.blade-3 {
      transform: rotate(120deg);
    }

    &.blade-4 {
      transform: rotate(180deg);
    }

    &.blade-5 {
      transform: rotate(240deg);
    }

    &.blade-6 {
      transform: rotate(300deg);
    }
  }

  .fan-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30%;
    height: 30%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle at 40% 40%,
        rgba(80, 55, 45, 0.9) 0%,
        rgba(45, 28, 24, 1) 60%,
        rgba(30, 18, 15, 1) 100%);
    border: 2px solid rgba(100, 70, 55, 0.5);
    box-shadow:
      inset 0 0 12px rgba(0, 0, 0, 0.8),
      0 0 8px rgba(0, 0, 0, 0.6);
    z-index: 1;
  }

  .fan-glow {
    position: absolute;
    inset: -15px;
    border-radius: 50%;
    background: radial-gradient(circle at center,
        rgba(255, 112, 67, 0.08) 0%,
        transparent 70%);
    pointer-events: none;
    animation: fanGlow 6s ease-in-out infinite;
  }
}

// 排风扇旋转动画 - 12秒一圈
@keyframes fanRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 故障警示灯
.warning-lights {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .warning-light {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: radial-gradient(circle at center,
        rgba(255, 70, 40, 1) 0%,
        rgba(220, 50, 25, 0.8) 40%,
        rgba(180, 30, 15, 0.4) 70%,
        transparent 100%);
    box-shadow:
      0 0 20px rgba(255, 70, 40, 0.6),
      0 0 40px rgba(255, 50, 25, 0.3);
    animation: glitchFlicker 3s infinite;

    &.light-1 {
      left: 18%;
      top: 32%;
      animation-delay: 0s;
    }

    &.light-2 {
      right: 22%;
      top: 28%;
      width: 8px;
      height: 8px;
      animation-delay: -1.5s;
    }

    &.light-3 {
      left: 35%;
      top: 55%;
      width: 6px;
      height: 6px;
      animation-delay: -2.2s;
    }
  }
}

// 故障闪烁动画
@keyframes glitchFlicker {

  0%,
  5% {
    opacity: 0.9;
  }

  6%,
  8% {
    opacity: 0.1;
  }

  9%,
  15% {
    opacity: 0.85;
  }

  16%,
  17% {
    opacity: 0.2;
  }

  18%,
  50% {
    opacity: 0.9;
  }

  51%,
  52% {
    opacity: 0.15;
  }

  53%,
  70% {
    opacity: 0.8;
  }

  71%,
  72% {
    opacity: 0.1;
  }

  73%,
  100% {
    opacity: 0.9;
  }
}

// 夕阳光芒
.sunset-glow {
  position: absolute;
  top: 8%; // 垂直位置：数值越大越靠下
  left: 35%; // 水平位置：数值越大越靠右
  width: 200px;
  height: 200px;
  transform: translate(-50%, 0);
  pointer-events: none;

  .sun-core {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle at center,
        rgba(255, 180, 120, 0.9) 0%,
        rgba(255, 140, 80, 0.7) 40%,
        rgba(255, 100, 50, 0.4) 70%,
        transparent 100%);
    filter: blur(5px);
    animation: sunPulse 8s ease-in-out infinite;
  }

  .sun-corona {
    position: absolute;
    inset: -50px;
    border-radius: 50%;
    background: radial-gradient(circle at center,
        rgba(255, 140, 80, 0.2) 0%,
        rgba(255, 100, 50, 0.1) 40%,
        transparent 70%);
    filter: blur(20px);
  }

  .god-rays {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);

    .ray {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 400px;
      height: 8px;
      background: linear-gradient(90deg,
          rgba(255, 180, 120, 0.3) 0%,
          rgba(255, 140, 80, 0.15) 30%,
          transparent 100%);
      filter: blur(3px);
      animation: rayPulse 6s ease-in-out infinite;

      &.ray-1 {
        transform: translate(-50%, -50%) rotate(-15deg);
        animation-delay: 0s;
      }

      &.ray-2 {
        transform: translate(-50%, -50%) rotate(5deg);
        animation-delay: -1.2s;
      }

      &.ray-3 {
        transform: translate(-50%, -50%) rotate(25deg);
        animation-delay: -2.4s;
      }

      &.ray-4 {
        transform: translate(-50%, -50%) rotate(-35deg);
        animation-delay: -3.6s;
      }

      &.ray-5 {
        transform: translate(-50%, -50%) rotate(45deg);
        animation-delay: -4.8s;
      }
    }
  }
}

// 齿轮旋转动画
@keyframes gearRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes sunPulse {

  0%,
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes rayPulse {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.6;
  }
}

// Canvas 层
.sandstorm-canvas,
.embers-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.embers-canvas {
  z-index: 5;
}

// 体积雾效果
.volumetric-fog {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      rgba(139, 90, 43, 0.05) 0%,
      rgba(160, 120, 70, 0.08) 30%,
      rgba(100, 70, 40, 0.1) 50%,
      rgba(62, 39, 35, 0.12) 70%,
      rgba(26, 15, 15, 0.15) 100%);
  pointer-events: none;
  animation: fogDrift 20s ease-in-out infinite;
}

@keyframes fogDrift {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

// 厚重暗角
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 60% at center center,
      transparent 0%,
      rgba(26, 15, 15, 0.3) 50%,
      rgba(26, 15, 15, 0.7) 80%,
      rgba(26, 15, 15, 0.9) 100%);
  pointer-events: none;
}
</style>
