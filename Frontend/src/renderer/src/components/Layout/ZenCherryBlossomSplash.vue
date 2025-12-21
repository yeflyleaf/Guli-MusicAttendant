<template>
  <Transition name="zen-fade">
    <div v-if="visible" class="zen-splash">
      <!-- 第0层 - 富士山远景与红日 -->
      <div class="fuji-layer">
        <div class="sun-moon" :class="{ setting: isToriiPassage }"></div>
        <div class="clouds">
          <div class="cloud" v-for="n in 6" :key="n" :style="getCloudStyle(n)"></div>
        </div>
        <div class="fuji-mountain">
          <div class="fuji-snow"></div>
        </div>
      </div>

      <!-- 第1层 - Canvas 樱吹雪粒子系统 -->
      <canvas ref="sakuraCanvas" class="sakura-canvas"></canvas>

      <!-- 第2层 - 浮世绘海浪 -->
      <div class="wave-layer">
        <div class="wave wave-1">
          <div class="wave-crest" v-for="n in 12" :key="'crest1-' + n" :style="getWaveCrestStyle(n, 1)"></div>
        </div>
        <div class="wave wave-2">
          <div class="wave-crest" v-for="n in 10" :key="'crest2-' + n" :style="getWaveCrestStyle(n, 2)"></div>
        </div>
        <div class="wave wave-3">
          <div class="wave-crest" v-for="n in 8" :key="'crest3-' + n" :style="getWaveCrestStyle(n, 3)"></div>
        </div>
        <div class="wave-foam"></div>
      </div>

      <!-- 第3层 - 漂浮油纸伞 -->
      <div class="wagasa-layer">
        <div class="wagasa" v-for="n in 3" :key="n" :style="getWagasaStyle(n)">
          <div class="wagasa-top"></div>
          <div class="wagasa-ribs">
            <div class="rib" v-for="r in 8" :key="r" :style="{ '--i': r }"></div>
          </div>
          <div class="wagasa-handle"></div>
        </div>
      </div>

      <!-- 第4层 - 装饰性元素 -->
      <div class="decorations">
        <!-- 鸟居 -->
        <div class="torii">
          <div class="torii-top"></div>
          <div class="torii-beam"></div>
          <div class="torii-pillar left"></div>
          <div class="torii-pillar right"></div>
        </div>
        <!-- 提灯 -->
        <div class="chochin-group">
          <div class="chochin" v-for="n in 3" :key="n" :style="getChochinStyle(n)">
            <div class="chochin-top"></div>
            <div class="chochin-body">
              <div class="chochin-glow"></div>
            </div>
            <div class="chochin-bottom"></div>
            <div class="chochin-tassel"></div>
          </div>
        </div>
      </div>

      <!-- 主内容 - 障子纸窗面板 -->
      <div class="shoji-panel" :class="{ breaking: isPanelBreaking }" ref="shojiPanel">
        <div class="shoji-frame">
          <div class="shoji-corner" v-for="c in 4" :key="c" :style="{ '--corner': c }"></div>
        </div>
        <div class="washi-texture"></div>
        <div class="shoji-grid">
          <div class="grid-cell" v-for="n in 12" :key="n"></div>
        </div>

        <!-- 面板内容 -->
        <div class="panel-content">
          <!-- Logo - 家纹风格 -->
          <div class="kamon-logo">
            <div class="kamon-ring" v-for="n in 3" :key="n" :style="{ '--i': n }"></div>
            <div class="kamon-center">
              <div class="sakura-emblem">
                <div class="petal" v-for="p in 5" :key="p" :style="{ '--p': p }"></div>
              </div>
            </div>
          </div>

          <!-- 应用名称 - 书法风格 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.1}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 - 墨水扩散风格 -->
          <div class="loading-indicator">
            <div class="ink-loading">
              <div class="ink-drop" v-for="n in 5" :key="n" :style="{ '--i': n }"></div>
            </div>
            <div class="loading-text">
              <span class="kanji">準備中</span>
              <span class="dots">...</span>
            </div>
          </div>
        </div>

        <!-- 破碎碎片 -->
        <div class="paper-shards" v-if="isPanelBreaking">
          <div class="shard" v-for="n in 24" :key="n" :style="getShardStyle(n)"></div>
        </div>
      </div>

      <!-- 千本鸟居隧道层 -->
      <div class="torii-tunnel-layer" :class="{ active: isToriiPassage }">
        <!-- 墨色背景 -->
        <div class="ink-wash-bg"></div>

        <!-- 鸟居隧道 -->
        <div class="torii-tunnel">
          <div class="torii-gate" v-for="n in 20" :key="n" :style="getToriiGateStyle(n)">
            <div class="gate-top"></div>
            <div class="gate-beam"></div>
            <div class="gate-pillar left"></div>
            <div class="gate-pillar right"></div>
          </div>
        </div>

        <!-- 樱花暴风雪 -->
        <canvas ref="blizzardCanvas" class="blizzard-canvas"></canvas>

        <!-- 终点光芒 -->
        <div class="bloom-light">
          <div class="bloom-petals">
            <div class="bloom-petal" v-for="n in 8" :key="n" :style="{ '--i': n }"></div>
          </div>
          <div class="white-flash"></div>
        </div>
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
const isPanelBreaking = ref(false)
const isToriiPassage = ref(false)

// Canvas refs
const sakuraCanvas = ref<HTMLCanvasElement | null>(null)
const blizzardCanvas = ref<HTMLCanvasElement | null>(null)

const appNameChars = '故里音乐助手'.split('')

let animationFrameId: number | null = null

// 云彩样式
const getCloudStyle = (n: number) => ({
  left: `${(n - 1) * 18}%`,
  top: `${10 + Math.sin(n) * 8}%`,
  '--delay': `${n * 2}s`,
  '--duration': `${20 + n * 5}s`,
  opacity: 0.3 + Math.random() * 0.4
})

// 浪花顶部样式
const getWaveCrestStyle = (n: number, layer: number) => ({
  left: `${(n - 1) * (100 / (12 - layer * 2))}%`,
  '--delay': `${n * 0.2 + layer * 0.5}s`,
  '--size': `${20 + layer * 10 + Math.random() * 15}px`
})

// 油纸伞样式
const getWagasaStyle = (n: number) => {
  const positions = [
    { left: '15%', top: '20%' },
    { left: '75%', top: '15%' },
    { left: '85%', top: '35%' }
  ]
  const colors = ['#ff6b6b', '#c41e3a', '#ff69b4']
  return {
    ...positions[n - 1],
    '--color': colors[n - 1],
    '--delay': `${n * 1.5}s`,
    '--duration': `${8 + n * 2}s`,
    '--rotate': `${(n - 2) * 15}deg`
  }
}

// 提灯样式
const getChochinStyle = (n: number) => ({
  right: `${20 + (n - 1) * 60}px`,
  '--delay': `${n * 0.3}s`,
  '--swing': `${3 + n}deg`
})

// 碎片样式
const getShardStyle = (n: number) => {
  const angle = (n / 24) * Math.PI * 2
  const distance = 200 + Math.random() * 300
  return {
    '--x': `${Math.cos(angle) * distance}px`,
    '--y': `${Math.sin(angle) * distance}px`,
    '--r': `${Math.random() * 720 - 360}deg`,
    '--delay': `${Math.random() * 0.2}s`,
    '--size': `${10 + Math.random() * 30}px`,
    left: `${40 + Math.random() * 20}%`,
    top: `${40 + Math.random() * 20}%`
  }
}

// 鸟居门样式
const getToriiGateStyle = (n: number) => ({
  '--z': 20 - n,
  '--delay': `${n * 0.08}s`,
  '--scale': 1 + (20 - n) * 0.15
})

// ==================== 樱花粒子系统 ====================
interface SakuraPetal {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  fallSpeed: number
  swayOffset: number
  swaySpeed: number
  opacity: number
  type: 'full' | 'petal'
}

let sakuraPetals: SakuraPetal[] = []
let mouseX = 0
let mouseY = 0
let isBlizzardMode = false

const initSakuraSystem = () => {
  const canvas = sakuraCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 鼠标跟踪
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  })

  const createPetal = (): SakuraPetal => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 100,
    size: 10 + Math.random() * 16,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.04,
    fallSpeed: 0.8 + Math.random() * 1.8,
    swayOffset: Math.random() * Math.PI * 2,
    swaySpeed: 0.4 + Math.random() * 0.8,
    opacity: 0.7 + Math.random() * 0.3,
    type: Math.random() > 0.35 ? 'petal' : 'full'
  })

  sakuraPetals = Array.from({ length: 160 }, createPetal)

  // 绘制精细的樱花花瓣形状（带缺口）
  const drawPetalShape = (size: number, hasNotch: boolean = true) => {
    ctx.beginPath()
    // 花瓣主体 - 使用贝塞尔曲线绘制更自然的形状
    ctx.moveTo(0, -size * 0.1)
    // 左侧曲线
    ctx.bezierCurveTo(
      -size * 0.5, -size * 0.3,
      -size * 0.6, -size * 0.8,
      0, -size * 1.1
    )
    // 顶部缺口
    if (hasNotch) {
      ctx.bezierCurveTo(
        size * 0.15, -size * 0.95,
        size * 0.15, -size * 0.95,
        0, -size * 1.1
      )
    }
    // 右侧曲线
    ctx.bezierCurveTo(
      size * 0.6, -size * 0.8,
      size * 0.5, -size * 0.3,
      0, -size * 0.1
    )
    ctx.closePath()
  }

  const drawPetal = (petal: SakuraPetal) => {
    ctx.save()
    ctx.translate(petal.x, petal.y)
    ctx.rotate(petal.rotation)
    ctx.globalAlpha = petal.opacity

    if (petal.type === 'full') {
      // 完整樱花 - 5片精细花瓣
      const petalSize = petal.size * 0.5

      for (let i = 0; i < 5; i++) {
        ctx.save()
        ctx.rotate((Math.PI * 2 / 5) * i)

        // 花瓣阴影
        ctx.shadowColor = 'rgba(180, 100, 120, 0.3)'
        ctx.shadowBlur = 3
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1

        // 花瓣底色
        drawPetalShape(petalSize, true)
        const baseGradient = ctx.createLinearGradient(0, 0, 0, -petalSize)
        baseGradient.addColorStop(0, '#ffb7c5')
        baseGradient.addColorStop(0.3, '#ffc0cb')
        baseGradient.addColorStop(0.7, '#ffd4dc')
        baseGradient.addColorStop(1, '#fff0f3')
        ctx.fillStyle = baseGradient
        ctx.fill()

        // 花瓣中脉纹理
        ctx.shadowColor = 'transparent'
        ctx.beginPath()
        ctx.moveTo(0, -petalSize * 0.2)
        ctx.quadraticCurveTo(0, -petalSize * 0.6, 0, -petalSize * 0.9)
        ctx.strokeStyle = 'rgba(255, 160, 180, 0.4)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        // 花瓣边缘高光
        drawPetalShape(petalSize, true)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.restore()
      }

      // 花心 - 多层渐变
      const centerSize = petal.size * 0.18
      // 花心底色
      ctx.beginPath()
      ctx.arc(0, 0, centerSize, 0, Math.PI * 2)
      const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, centerSize)
      centerGradient.addColorStop(0, '#fff8dc')
      centerGradient.addColorStop(0.5, '#ffeb99')
      centerGradient.addColorStop(1, '#ffd700')
      ctx.fillStyle = centerGradient
      ctx.fill()

      // 花心纹理 - 小点点
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i
        const dotX = Math.cos(angle) * centerSize * 0.5
        const dotY = Math.sin(angle) * centerSize * 0.5
        ctx.beginPath()
        ctx.arc(dotX, dotY, 1, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 180, 0, 0.6)'
        ctx.fill()
      }
    } else {
      // 单片花瓣 - 精细版
      const petalSize = petal.size * 0.6

      // 阴影
      ctx.shadowColor = 'rgba(180, 100, 120, 0.25)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      // 花瓣形状
      drawPetalShape(petalSize, true)

      // 多层渐变
      const gradient = ctx.createLinearGradient(-petalSize * 0.5, 0, petalSize * 0.5, -petalSize)
      gradient.addColorStop(0, '#ffccd5')
      gradient.addColorStop(0.3, '#ffc0cb')
      gradient.addColorStop(0.6, '#ffd9df')
      gradient.addColorStop(1, '#fff5f7')
      ctx.fillStyle = gradient
      ctx.fill()

      // 中脉
      ctx.shadowColor = 'transparent'
      ctx.beginPath()
      ctx.moveTo(0, -petalSize * 0.15)
      ctx.quadraticCurveTo(-petalSize * 0.05, -petalSize * 0.5, 0, -petalSize * 0.85)
      ctx.strokeStyle = 'rgba(255, 180, 190, 0.5)'
      ctx.lineWidth = 0.8
      ctx.stroke()

      // 边缘光晕
      drawPetalShape(petalSize, true)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 0.6
      ctx.stroke()
    }

    ctx.restore()
  }

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    sakuraPetals.forEach((petal, index) => {
      // 螺旋飘落
      const time = Date.now() * 0.001
      const sway = Math.sin(time * petal.swaySpeed + petal.swayOffset) * 30

      petal.y += petal.fallSpeed
      petal.x += sway * 0.02
      petal.rotation += petal.rotationSpeed

      // 鼠标交互 - 气流卷起
      const dx = petal.x - mouseX
      const dy = petal.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 100) {
        const force = (100 - dist) / 100
        petal.y -= force * 3
        petal.x += (dx / dist) * force * 2
        petal.rotationSpeed += force * 0.02
      }

      // 重置
      if (petal.y > canvas.height + 20) {
        sakuraPetals[index] = createPetal()
      }

      drawPetal(petal)
    })
  }

  return render
}

// ==================== 樱花暴风雪系统 ====================
const initBlizzardSystem = () => {
  const canvas = blizzardCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  interface BlizzardPetal {
    x: number
    y: number
    z: number
    size: number
    speed: number
    opacity: number
  }

  const petals: BlizzardPetal[] = Array.from({ length: 300 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random(),
    size: 5 + Math.random() * 15,
    speed: 5 + Math.random() * 15,
    opacity: 0.3 + Math.random() * 0.7
  }))

  let progress = 0

  const render = () => {
    progress += 0.016
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    petals.forEach(petal => {
      // 向中心汇聚
      const dx = centerX - petal.x
      const dy = centerY - petal.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      petal.x += (dx / dist) * petal.speed * (1 + progress * 2)
      petal.y += (dy / dist) * petal.speed * (1 + progress * 2)

      // 重置到边缘
      if (dist < 50) {
        const angle = Math.random() * Math.PI * 2
        const edge = Math.max(canvas.width, canvas.height)
        petal.x = centerX + Math.cos(angle) * edge
        petal.y = centerY + Math.sin(angle) * edge
      }

      // 绘制
      ctx.save()
      ctx.globalAlpha = petal.opacity
      ctx.beginPath()
      ctx.ellipse(petal.x, petal.y, petal.size * 0.4, petal.size * 0.8,
        Math.atan2(dy, dx), 0, Math.PI * 2)
      ctx.fillStyle = `hsl(350, ${70 + petal.z * 30}%, ${85 + petal.z * 15}%)`
      ctx.fill()
      ctx.restore()
    })
  }

  return render
}

// ==================== 动画控制 ====================
let sakuraRender: (() => void) | undefined
let blizzardRender: (() => void) | undefined

const mainLoop = () => {
  sakuraRender?.()
  if (isBlizzardMode) {
    blizzardRender?.()
  }
  animationFrameId = requestAnimationFrame(mainLoop)
}

// 触发千本鸟居穿越动画
const triggerToriiPassage = () => {
  // 面板破碎
  isPanelBreaking.value = true

  setTimeout(() => {
    // 进入鸟居隧道
    isToriiPassage.value = true
    isBlizzardMode = true
    blizzardRender = initBlizzardSystem()
  }, 400)
}

onMounted(async () => {
  // 初始化樱花系统
  sakuraRender = initSakuraSystem()

  // 启动主渲染循环
  mainLoop()

  const minDisplayTime = 2500
  const startTime = Date.now()

  // 等待预加载
  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[ZenCherryBlossomSplash] Data preload finished')
    } catch (error) {
      console.error('[ZenCherryBlossomSplash] Preload error:', error)
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
  triggerToriiPassage()
  await new Promise((resolve) => setTimeout(resolve, 2500))

  visible.value = false
  console.log('[ZenCherryBlossomSplash] Hidden after', Date.now() - startTime, 'ms')
  setTimeout(() => emit('finished'), 500)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$twilight-purple: #2e2a38;
$madder-red: #b63636;
$sakura-pink: #ffc0cb;
$mica-white: #fcfaf2;
$ultramarine: #1e2f55;
$gold-leaf: #d4af37;
$vermillion: #ff4500;
$torii-red: #c41e3a;
$washi-beige: #f5f0e1;
$ink-black: #1a1a2e;

.zen-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(180deg,
      $twilight-purple 0%,
      mix($twilight-purple, $madder-red, 70%) 30%,
      mix($madder-red, $ultramarine, 50%) 60%,
      $ultramarine 100%);
  font-family: 'Noto Serif JP', 'Hiragino Mincho Pro', serif;
}

// ==================== 富士山远景层 ====================
.fuji-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.sun-moon {
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 140px;

  // 多层太阳结构
  background:
    // 核心光球
    radial-gradient(circle at 45% 45%,
      #fff8e0 0%,
      #ffcc00 8%,
      #ff9500 20%,
      #ff6b35 35%,
      #ff4500 50%,
      rgba(255, 69, 0, 0.7) 65%,
      rgba(255, 50, 0, 0.4) 80%,
      transparent 100%);
  border-radius: 50%;
  box-shadow:
    // 内发光
    inset 0 0 20px rgba(255, 255, 200, 0.8),
    inset 5px 5px 30px rgba(255, 200, 100, 0.5),
    // 外层光晕
    0 0 30px rgba(255, 180, 80, 0.9),
    0 0 60px rgba(255, 120, 50, 0.7),
    0 0 100px rgba(255, 80, 30, 0.5),
    0 0 150px rgba(255, 50, 0, 0.3),
    0 0 200px rgba(200, 50, 50, 0.2);
  animation: sunPulse 4s ease-in-out infinite;

  // 太阳黑子纹理
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 25%;
    width: 15px;
    height: 12px;
    background: radial-gradient(ellipse,
        rgba(200, 80, 0, 0.4) 0%,
        transparent 70%);
    border-radius: 50%;
    filter: blur(2px);
  }

  // 另一个黑子
  &::after {
    content: '';
    position: absolute;
    top: 35%;
    right: 30%;
    width: 10px;
    height: 8px;
    background: radial-gradient(ellipse,
        rgba(200, 80, 0, 0.3) 0%,
        transparent 70%);
    border-radius: 50%;
    filter: blur(1px);
  }

  &.setting {
    animation: sunSet 2s ease-in forwards;
  }
}

@keyframes sunPulse {

  0%,
  100% {
    transform: translateX(-50%) scale(1);
    box-shadow:
      inset 0 0 20px rgba(255, 255, 200, 0.8),
      inset 5px 5px 30px rgba(255, 200, 100, 0.5),
      0 0 30px rgba(255, 180, 80, 0.9),
      0 0 60px rgba(255, 120, 50, 0.7),
      0 0 100px rgba(255, 80, 30, 0.5),
      0 0 150px rgba(255, 50, 0, 0.3),
      0 0 200px rgba(200, 50, 50, 0.2);
  }

  50% {
    transform: translateX(-50%) scale(1.03);
    box-shadow:
      inset 0 0 25px rgba(255, 255, 200, 0.9),
      inset 5px 5px 35px rgba(255, 200, 100, 0.6),
      0 0 40px rgba(255, 180, 80, 1),
      0 0 80px rgba(255, 120, 50, 0.8),
      0 0 120px rgba(255, 80, 30, 0.6),
      0 0 180px rgba(255, 50, 0, 0.4),
      0 0 250px rgba(200, 50, 50, 0.25);
  }
}

@keyframes sunSet {
  to {
    transform: translateX(-50%) translateY(100px) scale(1.5);
    opacity: 0;
    filter: blur(20px);
  }
}

.clouds {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.cloud {
  position: absolute;
  width: 280px;
  height: 50px;

  // 多层云彩效果
  background:
    // 主体云彩
    linear-gradient(90deg,
      transparent 0%,
      rgba($gold-leaf, 0.2) 10%,
      rgba($gold-leaf, 0.5) 30%,
      rgba(255, 200, 100, 0.6) 50%,
      rgba($gold-leaf, 0.5) 70%,
      rgba($gold-leaf, 0.2) 90%,
      transparent 100%),
    // 金边高光
    linear-gradient(180deg,
      rgba(255, 220, 150, 0.4) 0%,
      transparent 40%,
      transparent 60%,
      rgba(255, 180, 100, 0.2) 100%);
  border-radius: 50%;
  filter: blur(8px);
  animation: cloudDrift var(--duration) linear infinite;
  animation-delay: var(--delay);

  // 云彩边缘光晕
  &::before {
    content: '';
    position: absolute;
    inset: -5px;
    background: radial-gradient(ellipse at center,
        rgba(255, 200, 100, 0.3) 0%,
        transparent 70%);
    border-radius: 50%;
    filter: blur(5px);
  }
}

@keyframes cloudDrift {
  from {
    transform: translateX(-300px);
  }

  to {
    transform: translateX(calc(100vw + 300px));
  }
}

.fuji-mountain {
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  width: 550px;
  height: 280px;

  // 多层山体渐变
  background:
    // 山体主色
    linear-gradient(180deg,
      rgba(45, 60, 95, 0.95) 0%,
      rgba(35, 50, 80, 0.97) 30%,
      rgba(28, 40, 65, 0.98) 60%,
      rgba(22, 30, 50, 1) 100%),
    // 左侧阴影
    linear-gradient(120deg,
      rgba(0, 0, 0, 0.3) 0%,
      transparent 40%);
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);

  // 山体轮廓光晕
  filter: drop-shadow(0 0 30px rgba(255, 100, 50, 0.15));

  // 岩石纹理 - 横向层理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      // 细密纹理
      repeating-linear-gradient(0deg,
        transparent 0px,
        transparent 3px,
        rgba(0, 0, 0, 0.08) 3px,
        rgba(0, 0, 0, 0.08) 4px),
      // 岩石表面纹理
      repeating-linear-gradient(75deg,
        transparent 0px,
        transparent 20px,
        rgba(255, 255, 255, 0.02) 20px,
        rgba(255, 255, 255, 0.02) 21px),
      // 随机岩石阴影
      repeating-linear-gradient(-60deg,
        transparent 0px,
        transparent 30px,
        rgba(0, 0, 0, 0.05) 30px,
        rgba(0, 0, 0, 0.05) 32px);
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  }

  // 山体右侧高光
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(240deg,
        rgba(255, 150, 100, 0.1) 0%,
        transparent 30%);
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  }
}

.fuji-snow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 145px;
  height: 80px;

  // 多层雪线效果
  background:
    // 主雪层
    linear-gradient(180deg,
      $mica-white 0%,
      rgba($mica-white, 0.95) 20%,
      rgba($mica-white, 0.85) 40%,
      rgba($mica-white, 0.6) 60%,
      rgba($mica-white, 0.3) 80%,
      transparent 100%),
    // 手左侧阴影
    linear-gradient(120deg,
      rgba(200, 210, 230, 0.3) 0%,
      transparent 50%),
    // 右侧高光
    linear-gradient(240deg,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 40%);
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);

  // 冰晶光泽
  &::before {
    content: '';
    position: absolute;
    top: 5%;
    left: 30%;
    width: 40%;
    height: 30%;
    background: radial-gradient(ellipse at center,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.4) 40%,
        transparent 70%);
    filter: blur(2px);
    animation: iceGlitter 3s ease-in-out infinite;
  }

  // 雪线边缘细节
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 40%;
    background:
      repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 8px,
        rgba(255, 255, 255, 0.3) 8px,
        rgba(255, 255, 255, 0.3) 10px);
    clip-path: polygon(0 100%, 50% 0%, 100% 100%);
    opacity: 0.5;
  }
}

@keyframes iceGlitter {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

// ==================== 樱花Canvas层 ====================
.sakura-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

// ==================== 浮世绘海浪层 ====================
.wave-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25%;
  z-index: 3;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: -10%;
  right: -10%;
  height: 100%;
  display: flex;
  align-items: flex-end;

  &.wave-1 {
    z-index: 3;
    height: 60%;
    animation: waveMove1 8s ease-in-out infinite;

    .wave-crest {
      background: linear-gradient(180deg,
          $mica-white 0%,
          rgba($ultramarine, 0.9) 100%);
    }
  }

  &.wave-2 {
    z-index: 2;
    height: 70%;
    animation: waveMove2 10s ease-in-out infinite;

    .wave-crest {
      background: linear-gradient(180deg,
          rgba($mica-white, 0.8) 0%,
          rgba($ultramarine, 0.7) 100%);
    }
  }

  &.wave-3 {
    z-index: 1;
    height: 80%;
    animation: waveMove3 12s ease-in-out infinite;

    .wave-crest {
      background: linear-gradient(180deg,
          rgba($mica-white, 0.6) 0%,
          rgba($ultramarine, 0.5) 100%);
    }
  }
}

.wave-crest {
  flex: 1;
  height: var(--size);
  position: relative;

  // 鹰爪浪形状 - 更复杂的卷曲
  border-radius: 90% 90% 0 0 / 100% 100% 0 0;
  transform-origin: bottom center;
  animation: crestBob 3s ease-in-out infinite;
  animation-delay: var(--delay);

  // 浪尖卷曲效果
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 15%;
    width: 70%;
    height: 50%;
    background: radial-gradient(ellipse at 50% 100%,
        rgba($mica-white, 0.95) 0%,
        rgba($mica-white, 0.7) 30%,
        transparent 60%);
    border-radius: 50% 50% 0 0;
    animation: foamSparkle 2s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  // 泵沫飞溅效果
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 20%;
    width: 60%;
    height: 20%;
    background:
      radial-gradient(circle at 20% 50%, rgba($mica-white, 0.8) 0%, transparent 30%),
      radial-gradient(circle at 50% 30%, rgba($mica-white, 0.9) 0%, transparent 25%),
      radial-gradient(circle at 80% 60%, rgba($mica-white, 0.7) 0%, transparent 35%),
      radial-gradient(circle at 35% 70%, rgba($mica-white, 0.6) 0%, transparent 20%),
      radial-gradient(circle at 65% 40%, rgba($mica-white, 0.85) 0%, transparent 28%);
    filter: blur(1px);
    animation: foamDrift 4s ease-in-out infinite;
    animation-delay: var(--delay);
  }
}

@keyframes foamDrift {

  0%,
  100% {
    transform: translateX(0) translateY(0);
    opacity: 0.8;
  }

  25% {
    transform: translateX(3px) translateY(-2px);
    opacity: 1;
  }

  50% {
    transform: translateX(-2px) translateY(-3px);
    opacity: 0.9;
  }

  75% {
    transform: translateX(2px) translateY(-1px);
    opacity: 1;
  }
}

@keyframes waveMove1 {

  0%,
  100% {
    transform: translateX(0) translateY(0);
  }

  50% {
    transform: translateX(20px) translateY(-5px);
  }
}

@keyframes waveMove2 {

  0%,
  100% {
    transform: translateX(0) translateY(0);
  }

  50% {
    transform: translateX(-15px) translateY(-8px);
  }
}

@keyframes waveMove3 {

  0%,
  100% {
    transform: translateX(0) translateY(0);
  }

  50% {
    transform: translateX(10px) translateY(-3px);
  }
}

@keyframes crestBob {

  0%,
  100% {
    transform: scaleY(1);
  }

  50% {
    transform: scaleY(1.15);
  }
}

@keyframes foamSparkle {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.8;
  }
}

.wave-foam {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg,
      transparent 0%,
      rgba($ultramarine, 0.8) 50%,
      $ultramarine 100%);
  z-index: 4;
}

// ==================== 油纸伞层 ====================
.wagasa-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.wagasa {
  position: absolute;
  width: 100px;
  height: 100px;
  animation: wagasaFloat var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  transform: rotate(var(--rotate));
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

@keyframes wagasaFloat {

  0%,
  100% {
    transform: rotate(var(--rotate)) translateY(0) rotateZ(0deg) rotateX(15deg);
  }

  25% {
    transform: rotate(var(--rotate)) translateY(-15px) rotateZ(5deg) rotateX(20deg);
  }

  50% {
    transform: rotate(var(--rotate)) translateY(-5px) rotateZ(-3deg) rotateX(12deg);
  }

  75% {
    transform: rotate(var(--rotate)) translateY(-20px) rotateZ(8deg) rotateX(18deg);
  }
}

.wagasa-top {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 55%;

  // 多层伞面效果
  background:
    // 边缘暗色
    radial-gradient(ellipse at center,
      transparent 60%,
      rgba(0, 0, 0, 0.2) 100%),
    // 主体颜色
    radial-gradient(ellipse at 40% 40%,
      lighten($torii-red, 15%) 0%,
      var(--color) 30%,
      darken($torii-red, 10%) 70%,
      darken($torii-red, 25%) 100%);
  border-radius: 50% 50% 0 0;
  box-shadow:
    0 -3px 15px rgba(0, 0, 0, 0.25),
    inset 0 5px 20px rgba(255, 255, 255, 0.15);

  // 伞面图案 - 梅花
  &::before {
    content: '';
    position: absolute;
    top: 25%;
    left: 30%;
    width: 40%;
    height: 50%;
    background:
      // 梅花图案
      radial-gradient(circle at 30% 40%, rgba($gold-leaf, 0.6) 0%, rgba($gold-leaf, 0.3) 8%, transparent 12%),
      radial-gradient(circle at 35% 35%, rgba($gold-leaf, 0.5) 0%, transparent 6%),
      radial-gradient(circle at 70% 50%, rgba($gold-leaf, 0.55) 0%, rgba($gold-leaf, 0.25) 8%, transparent 12%),
      radial-gradient(circle at 50% 65%, rgba($gold-leaf, 0.5) 0%, rgba($gold-leaf, 0.2) 7%, transparent 10%),
      // 中心金色高光
      radial-gradient(ellipse at 45% 45%,
        rgba($gold-leaf, 0.25) 0%,
        transparent 50%);
    border-radius: 50%;
  }

  // 伞面纹理
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-conic-gradient(from 0deg,
        rgba(0, 0, 0, 0.03) 0deg 6deg,
        transparent 6deg 12deg);
    border-radius: inherit;
    opacity: 0.5;
  }
}

.wagasa-ribs {
  position: absolute;
  top: 5%;
  left: 50%;
  width: 100%;
  height: 50%;
  transform: translateX(-50%);
}

.rib {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48%;
  height: 2px;

  // 竹骨纹理
  background: linear-gradient(90deg,
      #2a1810 0%,
      #3d2815 20%,
      #4a3520 50%,
      #3d2815 80%,
      rgba(60, 40, 20, 0.3) 100%);
  transform-origin: left center;
  transform: rotate(calc((var(--i) - 1) * 22.5deg));
  border-radius: 1px;

  // 竹骨高光
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 50%;
    height: 1px;
    background: linear-gradient(90deg,
        rgba(255, 255, 255, 0.2) 0%,
        transparent 100%);
  }
}

.wagasa-handle {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 45%;

  // 精细的手柄
  background: linear-gradient(90deg,
      #5c3d1e 0%,
      #8b5a2b 30%,
      #a0522d 50%,
      #8b5a2b 70%,
      #5c3d1e 100%);
  border-radius: 2px;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.3);

  // 手柄纹理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg,
        transparent 0px,
        transparent 3px,
        rgba(0, 0, 0, 0.1) 3px,
        rgba(0, 0, 0, 0.1) 4px);
    border-radius: inherit;
  }

  // 手柄顶部金属环
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    height: 6px;
    background: linear-gradient(180deg,
        $gold-leaf 0%,
        darken($gold-leaf, 15%) 100%);
    border-radius: 2px;
  }
}

// ==================== 装饰性元素 ====================
.decorations {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.torii {
  position: absolute;
  bottom: 18%;
  left: 4%;
  width: 180px;
  height: 240px;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.4));
}

.torii-top {
  position: absolute;
  top: 0;
  left: -12%;
  right: -12%;
  height: 24px;

  // 多层漆面效果
  background:
    linear-gradient(180deg,
      lighten($torii-red, 8%) 0%,
      $torii-red 30%,
      darken($torii-red, 12%) 100%),
    // 木纹质感
    repeating-linear-gradient(90deg,
      transparent 0px,
      transparent 20px,
      rgba(0, 0, 0, 0.05) 20px,
      rgba(0, 0, 0, 0.05) 22px);
  border-radius: 6px 6px 0 0;
  box-shadow:
    0 5px 25px rgba(0, 0, 0, 0.45),
    inset 0 2px 4px rgba(255, 255, 255, 0.15);

  // 屋根结构
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -6%;
    right: -6%;
    height: 14px;
    background:
      linear-gradient(180deg,
        lighten($torii-red, 12%) 0%,
        $torii-red 50%,
        darken($torii-red, 5%) 100%);
    border-radius: 50% 50% 0 0;
    box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.2);
  }

  // 屋根边缘装饰
  &::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 5%;
    right: 5%;
    height: 4px;
    background: linear-gradient(90deg,
        $gold-leaf 0%,
        darken($gold-leaf, 10%) 50%,
        $gold-leaf 100%);
    border-radius: 2px;
  }
}

.torii-beam {
  position: absolute;
  top: 35px;
  left: 2%;
  right: 2%;
  height: 18px;

  background:
    linear-gradient(180deg,
      $torii-red 0%,
      darken($torii-red, 8%) 100%),
    repeating-linear-gradient(90deg,
      transparent 0px,
      transparent 15px,
      rgba(0, 0, 0, 0.03) 15px,
      rgba(0, 0, 0, 0.03) 16px);
  box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.1);

  // 横梁下方金具装饰
  &::before {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 5px;
    background: repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 28px,
        $gold-leaf 28px,
        darken($gold-leaf, 10%) 32px,
        $gold-leaf 36px,
        transparent 36px);
  }
}

.torii-pillar {
  position: absolute;
  top: 22px;
  bottom: 0;
  width: 22px;

  // 柱子漆面
  background:
    linear-gradient(90deg,
      darken($torii-red, 12%) 0%,
      darken($torii-red, 5%) 20%,
      $torii-red 50%,
      darken($torii-red, 5%) 80%,
      darken($torii-red, 12%) 100%),
    // 木纹
    repeating-linear-gradient(0deg,
      transparent 0px,
      transparent 8px,
      rgba(0, 0, 0, 0.04) 8px,
      rgba(0, 0, 0, 0.04) 9px);

  // 岁月斑驳效果
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(0, 0, 0, 0.08) 0%, transparent 25%),
      radial-gradient(ellipse at 70% 60%, rgba(0, 0, 0, 0.06) 0%, transparent 20%),
      radial-gradient(ellipse at 50% 85%, rgba(0, 0, 0, 0.1) 0%, transparent 30%);
  }

  &.left {
    left: 10%;
  }

  &.right {
    right: 10%;
  }

  // 柱底石基
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -8px;
    right: -8px;
    height: 15px;
    background:
      linear-gradient(180deg,
        #4a4a5a 0%,
        #3a3a4a 50%,
        #2a2a3a 100%),
      // 石头纹理
      repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 5px,
        rgba(255, 255, 255, 0.03) 5px,
        rgba(255, 255, 255, 0.03) 6px);
    border-radius: 4px;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 2px rgba(255, 255, 255, 0.1);
  }
}

// 提灯 - 精细版
.chochin-group {
  position: absolute;
  top: 8%;
  right: 4%;
}

.chochin {
  position: absolute;
  width: 50px;
  height: 75px;
  animation: chochinSwing 4s ease-in-out infinite;
  animation-delay: var(--delay);
  transform-origin: top center;
  filter: drop-shadow(0 5px 15px rgba(255, 150, 50, 0.3));
}

@keyframes chochinSwing {

  0%,
  100% {
    transform: rotate(calc(var(--swing) * -1));
  }

  50% {
    transform: rotate(var(--swing));
  }
}

.chochin-top {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 10px;

  // 精细的顶部结构
  background:
    linear-gradient(180deg,
      #3a3a3a 0%,
      #1a1a1a 100%);
  border-radius: 4px 4px 2px 2px;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.3);

  // 挂钩
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 10px;
    background: linear-gradient(90deg,
        #5a5a5a 0%,
        #8a8a8a 50%,
        #5a5a5a 100%);
    border-radius: 3px 3px 0 0;
  }
}

.chochin-body {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 55px;

  // 多层纸面效果
  background:
    // 内发光
    radial-gradient(ellipse at 50% 40%,
      rgba(255, 250, 220, 1) 0%,
      rgba(255, 240, 200, 0.95) 30%,
      rgba(255, 220, 160, 0.9) 60%,
      rgba(255, 200, 140, 0.85) 100%),
    // 纸面纹理
    repeating-linear-gradient(0deg,
      transparent 0px,
      transparent 3px,
      rgba(200, 150, 100, 0.08) 3px,
      rgba(200, 150, 100, 0.08) 4px);
  border-radius: 50%;
  box-shadow:
    // 内部烛光
    inset 0 0 25px rgba(255, 180, 80, 0.6),
    inset 0 -10px 20px rgba(255, 100, 30, 0.2),
    // 外部光晕
    0 0 25px rgba(255, 180, 100, 0.7),
    0 0 50px rgba(255, 140, 50, 0.5),
    0 0 80px rgba(255, 100, 30, 0.3);

  // 纸面装饰图案 - 山水
  &::before {
    content: '';
    position: absolute;
    bottom: 20%;
    left: 15%;
    width: 70%;
    height: 35%;
    background:
      // 小山
      radial-gradient(ellipse at 30% 80%, rgba(180, 80, 60, 0.25) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 85%, rgba(180, 80, 60, 0.2) 0%, transparent 35%),
      // 波纹
      repeating-linear-gradient(0deg,
        transparent 0px,
        transparent 4px,
        rgba(180, 80, 60, 0.15) 4px,
        rgba(180, 80, 60, 0.15) 5px);
    opacity: 0.8;
  }

  // 竖条纹
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 8px,
        rgba(139, 69, 19, 0.08) 8px,
        rgba(139, 69, 19, 0.08) 9px);
    border-radius: inherit;
  }
}

.chochin-glow {
  position: absolute;
  inset: 15%;
  background: radial-gradient(circle,
      rgba(255, 220, 150, 0.9) 0%,
      rgba(255, 180, 80, 0.5) 40%,
      transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2.5s ease-in-out infinite;

  // 烛火跳动效果
  &::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 40%;
    width: 20%;
    height: 25%;
    background: radial-gradient(ellipse,
        rgba(255, 255, 200, 0.9) 0%,
        rgba(255, 200, 100, 0.5) 50%,
        transparent 100%);
    animation: candleFlicker 0.3s ease-in-out infinite;
  }
}

@keyframes candleFlicker {

  0%,
  100% {
    transform: scale(1) translateY(0);
    opacity: 0.9;
  }

  25% {
    transform: scale(0.95) translateY(1px);
    opacity: 1;
  }

  50% {
    transform: scale(1.05) translateY(-1px);
    opacity: 0.85;
  }

  75% {
    transform: scale(0.98) translateY(0.5px);
    opacity: 0.95;
  }
}

@keyframes glowPulse {

  0%,
  100% {
    opacity: 0.85;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

.chochin-bottom {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 8px;
  background:
    linear-gradient(180deg,
      #2a2a2a 0%,
      #1a1a1a 100%);
  border-radius: 0 0 4px 4px;
  box-shadow: inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

.chochin-tassel {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 22px;

  // 精细的穗子
  background: linear-gradient(180deg,
      $torii-red 0%,
      darken($torii-red, 10%) 50%,
      darken($torii-red, 25%) 100%);
  border-radius: 2px;
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.2);

  // 穗子缓结
  &::before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    background:
      radial-gradient(ellipse at center,
        $torii-red 0%,
        darken($torii-red, 15%) 100%);
    border-radius: 0 0 50% 50%;
    box-shadow: inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  // 穗子顶部结点
  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 6px;
    background: linear-gradient(180deg,
        $gold-leaf 0%,
        darken($gold-leaf, 15%) 100%);
    border-radius: 3px 3px 1px 1px;
  }
}

// ==================== 障子纸窗面板 ====================
.shoji-panel {
  position: relative;
  z-index: 10;
  width: 380px;
  padding: 40px;
  background: rgba($washi-beige, 0.85);
  border-radius: 8px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 0 30px rgba(139, 69, 19, 0.1);
  overflow: hidden;
  transition: all 0.5s ease;

  &.breaking {
    animation: panelBreak 0.5s ease-out forwards;
  }
}

@keyframes panelBreak {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    filter: blur(2px);
  }

  100% {
    transform: scale(1.5);
    opacity: 0;
    filter: blur(20px);
  }
}

.shoji-frame {
  position: absolute;
  inset: 0;
  border: 12px solid transparent;
  border-image: linear-gradient(135deg,
      #3d2914 0%,
      #5c3d1e 25%,
      #8b5a2b 50%,
      #5c3d1e 75%,
      #3d2914 100%) 1;
  pointer-events: none;
}

.shoji-corner {
  position: absolute;
  width: 25px;
  height: 25px;
  background: linear-gradient(135deg,
      #b8860b 0%,
      #daa520 50%,
      #b8860b 100%);
  border-radius: 3px;

  &:nth-child(1) {
    top: 5px;
    left: 5px;
  }

  &:nth-child(2) {
    top: 5px;
    right: 5px;
  }

  &:nth-child(3) {
    bottom: 5px;
    left: 5px;
  }

  &:nth-child(4) {
    bottom: 5px;
    right: 5px;
  }
}

.washi-texture {
  position: absolute;
  inset: 0;
  background:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E"),
    linear-gradient(180deg,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 50%,
      rgba(139, 69, 19, 0.05) 100%);
  opacity: 0.5;
  pointer-events: none;
}

.shoji-grid {
  position: absolute;
  inset: 15px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2px;
  pointer-events: none;
}

.grid-cell {
  border: 1px solid rgba(139, 69, 19, 0.15);
}

.panel-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

// ==================== 家纹Logo ====================
.kamon-logo {
  position: relative;
  width: 80px;
  height: 80px;
}

.kamon-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba($torii-red, 0.6);
  border-radius: 50%;
  animation: kamonRotate 8s linear infinite;
  animation-delay: calc(var(--i) * -2.66s);

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    width: 8px;
    height: 8px;
    background: $torii-red;
    border-radius: 50%;
    transform: translateX(-50%);
  }
}

@keyframes kamonRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.kamon-center {
  position: absolute;
  inset: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle,
      rgba($sakura-pink, 0.3) 0%,
      transparent 70%);
  border-radius: 50%;
}

.sakura-emblem {
  position: relative;
  width: 40px;
  height: 40px;
}

.petal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 15px;
  height: 25px;
  background: linear-gradient(180deg,
      $sakura-pink 0%,
      darken($sakura-pink, 10%) 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  transform-origin: center bottom;
  transform: translate(-50%, -100%) rotate(calc((var(--p) - 1) * 72deg));
  animation: petalPulse 3s ease-in-out infinite;
  animation-delay: calc(var(--p) * 0.3s);
}

@keyframes petalPulse {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

// ==================== 应用名称 ====================
.app-name {
  font-size: 28px;
  font-weight: 600;
  color: $ink-black;
  text-shadow:
    1px 1px 0 rgba(255, 255, 255, 0.5),
    -1px -1px 0 rgba(0, 0, 0, 0.1);
  letter-spacing: 8px;
  display: flex;
  gap: 4px;
}

.char {
  display: inline-block;
  animation: charReveal 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba($ink-black, 0.3) 50%,
        transparent 100%);
    animation: inkSpread 0.5s ease-out forwards;
    animation-delay: inherit;
  }
}

@keyframes charReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes inkSpread {
  from {
    transform: scaleX(0);
    opacity: 0;
  }

  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

// ==================== 加载指示器 ====================
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ink-loading {
  display: flex;
  gap: 8px;
}

.ink-drop {
  width: 8px;
  height: 8px;
  background: $ink-black;
  border-radius: 50%;
  animation: inkDrop 1.5s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.15s);

  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    background: radial-gradient(circle,
        rgba($ink-black, 0.3) 0%,
        transparent 70%);
    border-radius: 50%;
    animation: inkBleed 1.5s ease-out infinite;
    animation-delay: calc(var(--i) * 0.15s);
  }
}

@keyframes inkDrop {

  0%,
  100% {
    transform: scale(1) translateY(0);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.3) translateY(-5px);
    opacity: 1;
  }
}

@keyframes inkBleed {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.loading-text {
  font-size: 14px;
  color: rgba($ink-black, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
}

.kanji {
  letter-spacing: 4px;
}

.dots {
  animation: dotsWave 1.5s ease-in-out infinite;
}

@keyframes dotsWave {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }
}

// ==================== 碎片效果 ====================
.paper-shards {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shard {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: linear-gradient(135deg,
      $washi-beige 0%,
      rgba($washi-beige, 0.8) 100%);
  animation: shardFly 0.8s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes shardFly {
  from {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }

  to {
    transform: translate(var(--x), var(--y)) rotate(var(--r));
    opacity: 0;
  }
}

// ==================== 千本鸟居隧道层 ====================
.torii-tunnel-layer {
  position: absolute;
  inset: 0;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
  }
}

.ink-wash-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      $ink-black 0%,
      #2a2a3e 50%,
      $ink-black 100%);
  animation: inkWash 2s ease-out forwards;
}

@keyframes inkWash {
  from {
    filter: saturate(1);
  }

  to {
    filter: saturate(0.3);
    background: linear-gradient(180deg,
        #1a1a1a 0%,
        #2a2a2a 50%,
        #1a1a1a 100%);
  }
}

.torii-tunnel {
  position: absolute;
  inset: 0;
  perspective: 1000px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.torii-gate {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(calc(var(--z) * -100px)) scale(var(--scale));
  animation: gatePass 2s ease-in forwards;
  animation-delay: var(--delay);
}

@keyframes gatePass {
  0% {
    transform: translateZ(calc(var(--z) * -100px)) scale(var(--scale));
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    transform: translateZ(500px) scale(0.1);
    opacity: 0;
  }
}

.gate-top {
  position: absolute;
  top: 30%;
  left: 20%;
  right: 20%;
  height: 30px;
  background: linear-gradient(180deg,
      lighten($torii-red, 10%) 0%,
      $torii-red 50%,
      darken($torii-red, 15%) 100%);
  border-radius: 10px 10px 0 0;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.5);

  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: -5%;
    right: -5%;
    height: 20px;
    background: linear-gradient(180deg,
        lighten($torii-red, 15%) 0%,
        $torii-red 100%);
    border-radius: 50% 50% 0 0;
  }
}

.gate-beam {
  position: absolute;
  top: calc(30% + 40px);
  left: 22%;
  right: 22%;
  height: 20px;
  background: linear-gradient(180deg,
      $torii-red 0%,
      darken($torii-red, 10%) 100%);
}

.gate-pillar {
  position: absolute;
  top: 30%;
  bottom: 20%;
  width: 30px;
  background: linear-gradient(90deg,
      darken($torii-red, 10%) 0%,
      $torii-red 50%,
      darken($torii-red, 10%) 100%);

  &.left {
    left: 22%;
  }

  &.right {
    right: 22%;
  }
}

// 樱花暴风雪Canvas
.blizzard-canvas {
  position: absolute;
  inset: 0;
  z-index: 10;
}

// 终点光芒 - 花开彼岸
.bloom-light {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: bloomAppear 2s ease-out 1.5s forwards;
}

@keyframes bloomAppear {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
  }
}

.bloom-petals {
  position: relative;
  width: 400px;
  height: 400px;
  animation: bloomRotate 4s linear infinite;
}

@keyframes bloomRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.bloom-petal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 160px;
  transform-origin: center bottom;
  transform: translate(-50%, -100%) rotate(calc((var(--i) - 1) * 45deg));
  animation: bloomPetalGrow 2s ease-out 1.5s forwards;
  opacity: 0;

  // 精细的花瓣结构 - 不使用模糊
  background:
    // 主体渐变
    linear-gradient(180deg,
      rgba(255, 200, 210, 0.95) 0%,
      rgba($sakura-pink, 0.9) 20%,
      rgba($sakura-pink, 0.8) 40%,
      rgba($sakura-pink, 0.5) 70%,
      rgba($sakura-pink, 0.2) 90%,
      transparent 100%),
    // 中脉纹理
    linear-gradient(180deg,
      transparent 0%,
      rgba(255, 180, 190, 0.4) 20%,
      rgba(255, 180, 190, 0.6) 50%,
      rgba(255, 180, 190, 0.3) 80%,
      transparent 100%);

  // 花瓣形状 - 带缺口
  clip-path: path('M40 160 Q5 120 8 60 Q10 30 25 10 Q35 0 40 5 Q45 0 55 10 Q70 30 72 60 Q75 120 40 160');

  // 边缘高光
  box-shadow:
    inset 2px 0 8px rgba(255, 255, 255, 0.5),
    inset -2px 0 8px rgba(255, 255, 255, 0.3),
    0 0 20px rgba($sakura-pink, 0.4);

  // 花瓣内部纹理
  &::before {
    content: '';
    position: absolute;
    top: 10%;
    left: 45%;
    width: 10%;
    height: 70%;
    background: linear-gradient(180deg,
        rgba(255, 160, 180, 0.5) 0%,
        rgba(255, 160, 180, 0.3) 100%);
    border-radius: 50%;
  }

  // 花瓣边缘细节
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.4);
    clip-path: inherit;
  }
}

@keyframes bloomPetalGrow {
  from {
    opacity: 0;
    transform: translate(-50%, -100%) rotate(calc((var(--i) - 1) * 45deg)) scale(0);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -100%) rotate(calc((var(--i) - 1) * 45deg)) scale(1);
  }
}

// 白光 - 降低亮度，更柔和
.white-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center,
      rgba(255, 250, 252, 0.85) 0%,
      rgba(255, 240, 245, 0.7) 20%,
      rgba(255, 220, 230, 0.5) 40%,
      rgba(255, 200, 215, 0.3) 60%,
      rgba(255, 180, 200, 0.15) 80%,
      transparent 100%);
  opacity: 0;
  animation: finalFlash 0.8s ease-out 2.2s forwards;
}

@keyframes finalFlash {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  50% {
    opacity: 0.85;
    transform: scale(1.2);
  }

  100% {
    opacity: 0.9;
    transform: scale(2.5);
  }
}

// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba($mica-white, 0.5);
  font-size: 12px;
  z-index: 20;
}

// ==================== 过渡动画 ====================
.zen-fade-enter-active {
  animation: zenFadeIn 0.5s ease-out;
}

.zen-fade-leave-active {
  animation: zenFadeOut 0.5s ease-in;
}

@keyframes zenFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes zenFadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>
