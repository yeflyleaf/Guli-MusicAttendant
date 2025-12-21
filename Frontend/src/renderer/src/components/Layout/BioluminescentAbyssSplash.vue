<template>
  <Transition name="abyss-fade">
    <div v-if="visible" class="abyss-splash" ref="splashContainer">
      <!-- 第0层 - 深海底色与焦散光斑 -->
      <div class="deep-ocean-bg">
        <div class="ocean-gradient"></div>
        <!-- 丁达尔效应 - 焦散光斑 -->
        <div class="caustics">
          <div class="caustic-beam caustic-1"></div>
          <div class="caustic-beam caustic-2"></div>
          <div class="caustic-beam caustic-3"></div>
        </div>
        <!-- 海底峡谷剪影 -->
        <div class="abyss-silhouette"></div>
      </div>

      <!-- 第1层 - Canvas 粒子系统：上升气泡 -->
      <canvas ref="bubbleCanvas" class="bubble-canvas"></canvas>

      <!-- 第2层 - 游弋生物：水母群 (10只) -->
      <div class="sea-life">
        <div v-for="jelly in jellyfishData" :key="jelly.id" class="jellyfish" :style="jelly.style">
          <div class="jelly-body">
            <div class="jelly-dome"></div>
            <div class="jelly-inner"></div>
          </div>
          <div class="jelly-tentacles">
            <div v-for="t in jelly.tentacleCount" :key="t" class="tentacle" :class="`t${t}`"></div>
          </div>
        </div>
        <!-- 鱼群剪影 -->
        <div class="fish-school">
          <div v-for="fish in fishSchool" :key="fish.id" class="fish" :style="fish.style"></div>
        </div>
      </div>

      <!-- 第3层 - 海洋雪 (Marine Snow) -->
      <div class="marine-snow">
        <div v-for="snow in marineSnowParticles" :key="snow.id" class="snow-particle" :style="snow.style"></div>
      </div>

      <!-- 第4层 - 蓝色流光粒子 -->
      <div class="blue-streams">
        <div v-for="stream in blueStreamParticles" :key="stream.id" class="stream-particle" :style="stream.style"></div>
      </div>

      <!-- 主内容 - 水盾气泡舱面板 -->
      <div class="hydro-panel" :class="{ 'bobbing': !isDiving, 'diving-shake': isDiving }" ref="hydroPanel">
        <div class="water-membrane"></div>
        <div class="panel-refraction"></div>
        <div class="flowing-border">
          <div class="border-bubble b1"></div>
          <div class="border-bubble b2"></div>
          <div class="border-bubble b3"></div>
        </div>
        <div class="panel-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 100 100" class="ocean-icon">
                <defs>
                  <linearGradient id="biolumGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#00f2fe;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#4facfe;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
                  </linearGradient>
                  <filter id="biolumGlow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="25" cy="72" r="10" fill="url(#biolumGradient)" filter="url(#biolumGlow)"
                  class="note-base" />
                <circle cx="62" cy="65" r="10" fill="url(#biolumGradient)" filter="url(#biolumGlow)"
                  class="note-base delay" />
                <rect x="33" y="22" width="3" height="50" fill="url(#biolumGradient)" filter="url(#biolumGlow)"
                  class="note-stem" />
                <rect x="70" y="18" width="3" height="47" fill="url(#biolumGradient)" filter="url(#biolumGlow)"
                  class="note-stem delay" />
                <path d="M 36 22 Q 53 12 73 18" stroke="url(#biolumGradient)" stroke-width="3" fill="none"
                  filter="url(#biolumGlow)" class="note-beam" />
              </svg>
            </div>
            <div class="logo-ripple"></div>
            <div class="logo-ripple delay-1"></div>
            <div class="logo-ripple delay-2"></div>
          </div>

          <!-- 应用名称 - 水波纹理效果 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.1}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 -->
          <div class="loading-indicator">
            <div class="loading-bar">
              <div class="loading-water"></div>
              <div class="loading-glow"></div>
            </div>
            <p class="loading-text">{{ loadingText }}</p>
          </div>
        </div>

        <!-- 压力气泡效果 -->
        <div class="pressure-bubble" v-if="showPressureBubble"></div>
        <!-- 水光边框 -->
        <div class="hydro-glow" :class="{ active: isDiving }"></div>
      </div>

      <!-- 深渊潜航效果层 -->
      <div class="deep-dive-layer" :class="{ active: isDiving }" ref="diveLayer">
        <!-- 空泡效应 (增加5倍到200个) -->
        <div class="cavitation">
          <div v-for="n in 200" :key="n" class="cavitation-bubble" :style="{ '--i': n }"></div>
        </div>
        <!-- 径向模糊/晕影 -->
        <div class="radial-blur"></div>
        <!-- 声呐穿透 -->
        <div class="sonar-ring"></div>
        <div class="final-flash"></div>
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
const isDiving = ref(false)
const showPressureBubble = ref(false)
const bubbleCanvas = ref<HTMLCanvasElement | null>(null)
const splashContainer = ref<HTMLElement | null>(null)
const hydroPanel = ref<HTMLElement | null>(null)
const diveLayer = ref<HTMLElement | null>(null)

// 应用名称
const appNameChars = '故里音乐助手'.split('')

// 加载文字
const loadingTexts = ['初始化深海引擎...', '连接生物光网络...', '加载音频声呐...', '准备深渊潜航...']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

let loadingTextInterval: number | null = null
let animationFrameId: number | null = null
let pressureBubbleInterval: number | null = null

// 气泡粒子系统
interface Bubble {
  x: number
  y: number
  baseX: number // 用于正弦波轨迹
  radius: number
  speed: number
  wobbleSpeed: number
  wobbleAmount: number
  phase: number
  opacity: number
  isEllipse: boolean
}

let bubbles: Bubble[] = []
let time = 0
let speedMultiplier = 1
let isDescending = false

// 生成海洋雪微粒 (增加到120个)
const random = (min: number, max: number) => Math.random() * (max - min) + min
const marineSnowParticles = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  style: {
    left: `${random(0, 100)}%`,
    top: `${random(0, 100)}%`,
    width: `${random(1, 4)}px`,
    height: `${random(1, 4)}px`,
    animationDelay: `${random(0, 10)}s`,
    animationDuration: `${random(12, 20)}s`,
    opacity: random(0.2, 0.6)
  }
}))

// 生成水母数据 (10只普通 + 3只特大)
const jellyfishData = [
  // 3只特别大的水母 - 固定位置
  {
    id: 'big-1',
    tentacleCount: 6,
    style: {
      left: '45%',      // 中上
      top: '8%',
      transform: 'scale(1.8)',
      animationDelay: '0s',
      opacity: 0.85
    }
  },
  {
    id: 'big-2',
    tentacleCount: 5,
    style: {
      left: '5%',       // 左上
      top: '12%',
      transform: 'scale(1.6)',
      animationDelay: '1.5s',
      opacity: 0.8
    }
  },
  {
    id: 'big-3',
    tentacleCount: 6,
    style: {
      left: '8%',       // 左下
      top: '65%',
      transform: 'scale(1.5)',
      animationDelay: '3s',
      opacity: 0.75
    }
  },
  // 10只普通大小的水母 - 随机位置
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i,
    tentacleCount: Math.floor(random(3, 6)),
    style: {
      left: `${random(2, 95)}%`,
      top: `${random(5, 80)}%`,
      transform: `scale(${random(0.4, 1)})`,
      animationDelay: `${random(0, 5)}s`,
      opacity: random(0.5, 0.9)
    }
  }))
]

// 生成蓝色流光粒子 (双倍数量)
const blueStreamParticles = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  style: {
    left: `${random(0, 100)}%`,
    top: `${random(0, 100)}%`,
    width: `${random(2, 6)}px`,
    height: `${random(30, 100)}px`,
    animationDelay: `${random(0, 8)}s`,
    animationDuration: `${random(3, 6)}s`,
    opacity: random(0.1, 0.4)
  }
}))

// 生成鱼群 (增加到15条)
const fishSchool = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  style: {
    left: `${-20 - i * 3}%`,
    top: `${20 + random(-15, 40)}%`,
    animationDelay: `${i * 0.12}s`,
    transform: `scale(${random(0.5, 1)})`,
    opacity: random(0.2, 0.6)
  }
}))

// 初始化Canvas气泡系统
const initBubbleSystem = () => {
  const canvas = bubbleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 创建气泡 (双倍数量到120个)
  const bubbleCount = 120

  const createBubble = (): Bubble => {
    const radius = random(2, 12)
    return {
      x: random(0, canvas.width),
      y: canvas.height + random(0, 100),
      baseX: random(0, canvas.width),
      radius,
      speed: radius > 6 ? random(1.5, 3) : random(0.5, 1.5), // 大气泡快，小气泡慢
      wobbleSpeed: random(0.02, 0.05),
      wobbleAmount: random(20, 50),
      phase: random(0, Math.PI * 2),
      opacity: random(0.3, 0.8),
      isEllipse: radius > 6 // 大气泡变形为椭圆
    }
  }

  bubbles = Array.from({ length: bubbleCount }, createBubble)

  const render = () => {
    time += 0.016

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    bubbles.forEach((bubble) => {
      // 正弦波轨迹摇摆
      const wobble = Math.sin(time * bubble.wobbleSpeed + bubble.phase) * bubble.wobbleAmount
      bubble.x = bubble.baseX + wobble

      if (isDescending) {
        // 下潜模式 - 气泡极速向上飞
        bubble.y -= bubble.speed * speedMultiplier * 3

        // 绘制拉长的气泡（模拟速度感）
        const stretch = Math.min(speedMultiplier * 2, 20)
        ctx.beginPath()
        ctx.moveTo(bubble.x, bubble.y)
        ctx.lineTo(bubble.x, bubble.y - bubble.radius * stretch)
        const gradient = ctx.createLinearGradient(bubble.x, bubble.y, bubble.x, bubble.y - bubble.radius * stretch)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        gradient.addColorStop(0.3, `rgba(0, 242, 254, ${bubble.opacity * 0.5})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)')
        ctx.strokeStyle = gradient
        ctx.lineWidth = Math.max(1, bubble.radius * 0.5)
        ctx.stroke()
      } else {
        // 常规模式 - 缓慢上升
        bubble.y -= bubble.speed * speedMultiplier

        // 绘制气泡
        ctx.beginPath()
        if (bubble.isEllipse) {
          // 大气泡绘制为椭圆
          ctx.ellipse(bubble.x, bubble.y, bubble.radius, bubble.radius * 0.7, 0, 0, Math.PI * 2)
        } else {
          ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
        }

        // 气泡渐变填充
        const bubbleGradient = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          0,
          bubble.x,
          bubble.y,
          bubble.radius
        )
        bubbleGradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.9})`)
        bubbleGradient.addColorStop(0.4, `rgba(0, 242, 254, ${bubble.opacity * 0.5})`)
        bubbleGradient.addColorStop(1, `rgba(79, 172, 254, ${bubble.opacity * 0.1})`)

        ctx.fillStyle = bubbleGradient
        ctx.fill()

        // 高光
        ctx.beginPath()
        ctx.arc(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.8})`
        ctx.fill()
      }

      // 重置离开屏幕的气泡
      if (bubble.y < -50) {
        Object.assign(bubble, createBubble())
        bubble.y = canvas.height + random(0, 100)
      }
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  return {
    setSpeed: (speed: number) => { speedMultiplier = speed },
    setDescending: (descending: boolean) => { isDescending = descending }
  }
}

let bubbleControls: { setSpeed: (speed: number) => void; setDescending: (descending: boolean) => void } | null = null

// 触发压强气泡效果
const triggerPressureBubble = () => {
  showPressureBubble.value = true
  setTimeout(() => {
    showPressureBubble.value = false
  }, 2000)
}

// 触发深渊潜航动画
const triggerDeepDive = () => {
  isDiving.value = true
  const diveDuration = 2000 // 2秒下潜动画

  // 1. 启动气泡下潜模式
  bubbleControls?.setDescending(true)

  const startTime = Date.now()
  const accelerate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / diveDuration, 1)
    const easeProgress = progress === 0 ? 0 : Math.pow(2, 10 * progress - 10)
    const speed = 1 + easeProgress * 50
    bubbleControls?.setSpeed(speed)

    if (progress < 1) {
      requestAnimationFrame(accelerate)
    }
  }
  accelerate()

  // 2. 水母急速向上消失
  const jellyfishes = splashContainer.value?.querySelectorAll('.jellyfish')
  jellyfishes?.forEach((jelly) => {
    const el = jelly as HTMLElement
    el.style.transition = `all ${diveDuration / 1000}s cubic-bezier(0.55, 0.055, 0.675, 0.19)`
    el.style.transform = `translateY(-200vh) scale(0.5)`
    el.style.opacity = '0'
  })

  // 3. 海洋雪加速
  const snowParticles = splashContainer.value?.querySelectorAll('.snow-particle')
  snowParticles?.forEach((snow) => {
    const el = snow as HTMLElement
    el.style.transition = `all ${diveDuration / 1000}s ease-out`
    el.style.transform = `translateY(-200vh)`
  })

  // 4. 蓝色流光加速消失
  const streams = splashContainer.value?.querySelectorAll('.stream-particle')
  streams?.forEach((stream) => {
    const el = stream as HTMLElement
    el.style.transition = `all ${diveDuration / 1000 * 0.5}s ease-out`
    el.style.transform = `translateY(-150vh)`
    el.style.opacity = '0'
  })

  // 5. 鱼群逃逸
  const fishes = splashContainer.value?.querySelectorAll('.fish')
  fishes?.forEach((fish) => {
    const el = fish as HTMLElement
    el.style.transition = `all ${diveDuration / 1000 * 0.5}s ease-out`
    el.style.transform = `translateY(-100vh) translateX(50vw)`
    el.style.opacity = '0'
  })

  // 6. 面板缩小消失
  setTimeout(() => {
    if (hydroPanel.value) {
      hydroPanel.value.style.transition = 'all 0.8s cubic-bezier(0.55, 0.055, 0.675, 0.19)'
      hydroPanel.value.style.transform = 'scale(0.5) translateY(-20vh)'
      hydroPanel.value.style.opacity = '0'
      hydroPanel.value.style.filter = 'blur(10px)'
    }
  }, diveDuration - 800)

  // 7. 声呐爆发 (最后阶段)
  setTimeout(() => {
    const sonarRing = diveLayer.value?.querySelector('.sonar-ring') as HTMLElement
    if (sonarRing) {
      sonarRing.style.animation = 'sonarExpand 0.8s ease-out forwards'
    }
    const finalFlash = diveLayer.value?.querySelector('.final-flash') as HTMLElement
    if (finalFlash) {
      finalFlash.style.animation = 'finalFlash 0.6s ease-out 0.3s forwards'
    }
  }, diveDuration - 300)
}

onMounted(async () => {
  // 初始化气泡系统
  bubbleControls = initBubbleSystem() || null

  // 加载文字轮换
  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 1000)

  // 定期触发压强气泡效果
  pressureBubbleInterval = window.setInterval(() => {
    if (!isDiving.value) {
      triggerPressureBubble()
    }
  }, 5000)

  const minDisplayTime = 2000 // 最小显示2秒
  const startTime = Date.now()

  // 等待数据预加载
  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[BioluminescentAbyssSplash] Data preload finished')
    } catch (error) {
      console.error('[BioluminescentAbyssSplash] Preload error:', error)
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

  // 触发深渊潜航
  triggerDeepDive()

  // 等待动画完成 (2秒)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  visible.value = false
  console.log('[BioluminescentAbyssSplash] Hidden after', Date.now() - startTime, 'ms')

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
  if (pressureBubbleInterval) {
    clearInterval(pressureBubbleInterval)
  }
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$abyss-black: #000000;
$deep-ocean: #021019;
$electric-cyan: #00f2fe;
$ghost-blue: #4facfe;
$biolum-purple: #a855f7;
$pearl-white: #f0f8ff;
$hydro-glass: rgba(2, 16, 25, 0.7);

.abyss-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: $abyss-black;
}

// ==================== 第0层 - 深海背景 ====================
.deep-ocean-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .ocean-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba($ghost-blue, 0.15) 0%, $deep-ocean 40%, $abyss-black 100%);
  }
}

// 焦散光斑（丁达尔效应）
.caustics {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.caustic-beam {
  position: absolute;
  top: -20%;
  width: 200px;
  height: 120%;
  background: linear-gradient(180deg,
      rgba($electric-cyan, 0.1) 0%,
      rgba($ghost-blue, 0.05) 50%,
      transparent 100%);
  filter: blur(30px);
  animation: causticWave 12s ease-in-out infinite;
  transform-origin: top center;

  &.caustic-1 {
    left: 10%;
    animation-delay: 0s;
    width: 180px;
  }

  &.caustic-2 {
    left: 45%;
    animation-delay: 4s;
    width: 250px;
  }

  &.caustic-3 {
    right: 15%;
    animation-delay: 8s;
    width: 200px;
  }
}

@keyframes causticWave {

  0%,
  100% {
    transform: skewX(-5deg) scaleX(1);
    opacity: 0.3;
  }

  50% {
    transform: skewX(5deg) scaleX(1.2);
    opacity: 0.6;
  }
}

// 海底峡谷剪影
.abyss-silhouette {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, $abyss-black 0%, transparent 100%);
  clip-path: polygon(0% 100%,
      0% 60%,
      10% 65%,
      20% 55%,
      30% 70%,
      40% 50%,
      50% 60%,
      60% 45%,
      70% 55%,
      80% 40%,
      90% 50%,
      100% 35%,
      100% 100%);
  opacity: 0.8;
}

// ==================== 第1层 - Canvas 气泡 ====================
.bubble-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

// ==================== 第2层 - 游弋生物 ====================
.sea-life {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

// 水母 (动态生成10只)
.jellyfish {
  position: absolute;
  animation: jellyFloat 8s ease-in-out infinite;
  transition: all 0.3s ease;
}

.jelly-body {
  position: relative;
  width: 80px;
  height: 60px;
}

.jelly-dome {
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at 50% 30%,
      rgba($biolum-purple, 0.6) 0%,
      rgba($biolum-purple, 0.3) 50%,
      rgba($biolum-purple, 0.1) 100%);
  border-radius: 50% 50% 30% 30%;
  animation: jellyPulse 2s ease-in-out infinite;
  box-shadow: 0 0 30px rgba($biolum-purple, 0.5),
    inset 0 -10px 20px rgba($biolum-purple, 0.3);
}

.jelly-inner {
  position: absolute;
  top: 30%;
  left: 20%;
  width: 60%;
  height: 40%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
}

@keyframes jellyPulse {

  0%,
  100% {
    transform: scaleY(1) scaleX(1);
  }

  50% {
    transform: scaleY(0.85) scaleX(1.1);
  }
}

.jelly-tentacles {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: -5px;
}

.tentacle {
  width: 2px;
  height: 60px;
  background: linear-gradient(180deg,
      rgba($biolum-purple, 0.5) 0%,
      rgba($biolum-purple, 0.2) 50%,
      transparent 100%);
  border-radius: 0 0 2px 2px;
  transform-origin: top center;
  animation: tentacleWave 3s ease-in-out infinite;

  &.t1 {
    animation-delay: 0s;
    height: 70px;
  }

  &.t2 {
    animation-delay: 0.2s;
    height: 55px;
  }

  &.t3 {
    animation-delay: 0.4s;
    height: 65px;
  }

  &.t4 {
    animation-delay: 0.6s;
    height: 50px;
  }

  &.t5 {
    animation-delay: 0.8s;
    height: 60px;
  }
}

@keyframes tentacleWave {

  0%,
  100% {
    transform: rotateZ(-10deg);
  }

  50% {
    transform: rotateZ(10deg);
  }
}

@keyframes jellyFloat {

  0%,
  100% {
    transform: translateY(0) translateX(0);
  }

  25% {
    transform: translateY(-20px) translateX(10px);
  }

  50% {
    transform: translateY(0) translateX(20px);
  }

  75% {
    transform: translateY(-15px) translateX(5px);
  }
}

// 鱼群
.fish-school {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.fish {
  position: absolute;
  width: 20px;
  height: 8px;
  background: linear-gradient(90deg, transparent 0%, rgba($ghost-blue, 0.4) 30%, rgba($ghost-blue, 0.6) 50%, rgba($ghost-blue, 0.4) 70%, transparent 100%);
  clip-path: polygon(0% 50%, 30% 0%, 100% 50%, 30% 100%);
  animation: fishSwim 8s linear infinite;
}

@keyframes fishSwim {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(150vw);
  }
}

// ==================== 第3层 - 海洋雪 ====================
.marine-snow {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.snow-particle {
  position: absolute;
  background: radial-gradient(circle, rgba($pearl-white, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: marineDrift 20s linear infinite;
}

@keyframes marineDrift {
  0% {
    transform: translateY(0) translateX(0);
  }

  100% {
    transform: translateY(20px) translateX(30px);
  }
}

// ==================== 第4层 - 蓝色流光粒子 ====================
.blue-streams {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  overflow: hidden;
}

.stream-particle {
  position: absolute;
  background: linear-gradient(180deg,
      transparent 0%,
      rgba($electric-cyan, 0.6) 20%,
      rgba($ghost-blue, 0.8) 50%,
      rgba($electric-cyan, 0.6) 80%,
      transparent 100%);
  border-radius: 2px;
  filter: blur(1px);
  animation: streamFloat 4s ease-in-out infinite;
  box-shadow: 0 0 10px rgba($electric-cyan, 0.4),
    0 0 20px rgba($ghost-blue, 0.2);
}

@keyframes streamFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0;
  }
}

// ==================== 水盾气泡舱面板 ====================
.hydro-panel {
  position: relative;
  z-index: 10;
  padding: 48px 64px;
  background: $hydro-glass;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 30px;
  overflow: hidden;

  &.bobbing {
    animation: oceanBob 4s ease-in-out infinite;
  }

  &.diving-shake {
    animation: divingShake 0.1s ease-in-out infinite;
  }
}

@keyframes oceanBob {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes divingShake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-3px);
  }

  75% {
    transform: translateX(3px);
  }
}

// 水膜效果
.water-membrane {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      rgba($electric-cyan, 0.1) 0%,
      transparent 30%,
      transparent 70%,
      rgba($ghost-blue, 0.1) 100%);
  border-radius: 30px;
  pointer-events: none;
}

// 折射效果
.panel-refraction {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  border-radius: 30px;
  pointer-events: none;
  animation: refractionShift 8s linear infinite;
}

@keyframes refractionShift {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 100px 100px;
  }
}

// 流动边框
.flowing-border {
  position: absolute;
  inset: -2px;
  border-radius: 32px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba($electric-cyan, 0.5) 25%,
      rgba($ghost-blue, 0.8) 50%,
      rgba($electric-cyan, 0.5) 75%,
      transparent 100%);
  background-size: 200% 100%;
  animation: flowingBorder 3s linear infinite;
  z-index: -1;

  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: $hydro-glass;
    border-radius: 30px;
  }
}

@keyframes flowingBorder {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: 0 0;
  }
}

// 边框气泡
.border-bubble {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba($pearl-white, 0.9) 0%, rgba($electric-cyan, 0.5) 50%, transparent 100%);
  border-radius: 50%;
  animation: borderBubbleFloat 4s ease-in-out infinite;

  &.b1 {
    bottom: 20%;
    left: -3px;
    animation-delay: 0s;
  }

  &.b2 {
    top: 30%;
    right: -3px;
    animation-delay: 1.5s;
  }

  &.b3 {
    bottom: 40%;
    right: -3px;
    animation-delay: 3s;
  }
}

@keyframes borderBubbleFloat {

  0%,
  100% {
    transform: translateY(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(-50px);
    opacity: 0;
  }
}

// 面板内容
.panel-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

// Logo
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
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

.ocean-icon {
  width: 100%;
  height: 100%;

  .note-base {
    animation: notePulse 2s ease-in-out infinite;

    &.delay {
      animation-delay: 0.3s;
    }
  }

  .note-stem {
    animation: stemGlow 2s ease-in-out infinite;

    &.delay {
      animation-delay: 0.3s;
    }
  }
}

@keyframes notePulse {

  0%,
  100% {
    filter: url(#biolumGlow) brightness(1);
  }

  50% {
    filter: url(#biolumGlow) brightness(1.3);
  }
}

@keyframes stemGlow {

  0%,
  100% {
    opacity: 0.9;
  }

  50% {
    opacity: 1;
  }
}

// Logo 涟漪
.logo-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  border: 2px solid rgba($electric-cyan, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: rippleExpand 3s ease-out infinite;

  &.delay-1 {
    animation-delay: 1s;
  }

  &.delay-2 {
    animation-delay: 2s;
  }
}

@keyframes rippleExpand {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

// 应用名称
.app-name {
  font-family: 'Quicksand', 'Microsoft YaHei', sans-serif;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 4px;
  margin-bottom: 24px;
  background: linear-gradient(90deg, $electric-cyan 0%, $ghost-blue 50%, $biolum-purple 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba($electric-cyan, 0.5);

  .char {
    display: inline-block;
    animation: charWave 2s ease-in-out infinite;
  }
}

@keyframes charWave {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

// 加载指示器
.loading-indicator {
  width: 200px;
  margin: 0 auto;
}

.loading-bar {
  position: relative;
  height: 4px;
  background: rgba($pearl-white, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.loading-water {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent 0%,
      $electric-cyan 20%,
      $ghost-blue 50%,
      $electric-cyan 80%,
      transparent 100%);
  background-size: 200% 100%;
  animation: waterFlow 1.5s linear infinite;
}

@keyframes waterFlow {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: 0 0;
  }
}

.loading-glow {
  position: absolute;
  inset: -2px;
  background: rgba($electric-cyan, 0.3);
  filter: blur(4px);
  border-radius: 4px;
  animation: loadingPulse 2s ease-in-out infinite;
}

@keyframes loadingPulse {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.8;
  }
}

.loading-text {
  margin-top: 12px;
  font-size: 12px;
  color: rgba($pearl-white, 0.7);
  letter-spacing: 1px;
  animation: textFade 2s ease-in-out infinite;
}

@keyframes textFade {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

// 压力气泡效果
.pressure-bubble {
  position: absolute;
  bottom: -100px;
  left: 50%;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle,
      rgba($pearl-white, 0.1) 0%,
      rgba($electric-cyan, 0.05) 50%,
      transparent 70%);
  border: 1px solid rgba($electric-cyan, 0.2);
  border-radius: 50%;
  transform: translateX(-50%);
  animation: pressureBubbleRise 2s ease-out forwards;
}

@keyframes pressureBubbleRise {
  0% {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translateX(-50%) translateY(-200px) scale(1.5);
    opacity: 0;
  }
}

// 水光边框
.hydro-glow {
  position: absolute;
  inset: -4px;
  border-radius: 34px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  background: transparent;
  box-shadow: 0 0 30px rgba($electric-cyan, 0.5),
    0 0 60px rgba($electric-cyan, 0.3),
    0 0 90px rgba($ghost-blue, 0.2),
    inset 0 0 30px rgba($electric-cyan, 0.1);

  &.active {
    opacity: 1;
    animation: hydroPulse 0.2s ease-in-out infinite;
  }
}

@keyframes hydroPulse {

  0%,
  100% {
    box-shadow: 0 0 30px rgba($electric-cyan, 0.5),
      0 0 60px rgba($electric-cyan, 0.3),
      0 0 90px rgba($ghost-blue, 0.2);
  }

  50% {
    box-shadow: 0 0 40px rgba($electric-cyan, 0.7),
      0 0 80px rgba($electric-cyan, 0.5),
      0 0 120px rgba($ghost-blue, 0.3);
  }
}

// ==================== 深渊潜航效果层 ====================
.deep-dive-layer {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
  }
}

// 空泡效应
.cavitation {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cavitation-bubble {
  position: absolute;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, rgba($pearl-white, 0.9) 0%, rgba($electric-cyan, 0.5) 50%, transparent 100%);
  border-radius: 50%;
  animation: cavitationBurst 0.8s ease-out forwards;
  animation-delay: calc(var(--i) * 0.02s);
  --angle: calc(var(--i) * 9deg);
  --distance: calc(50px + var(--i) * 5px);
}

@keyframes cavitationBurst {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform:
      translate(calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))) scale(1.5);
    opacity: 0;
  }
}

// 径向模糊/晕影
.radial-blur {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center,
      transparent 30%,
      rgba($abyss-black, 0.3) 60%,
      rgba($abyss-black, 0.8) 100%);
  animation: vignettePulse 2s ease-in-out forwards;
}

@keyframes vignettePulse {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

// 巨鲸掠影
.leviathan {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-200%) translateY(-50%) scale(0.5);
  opacity: 0;
  transition: all 1.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.whale-body {
  width: 400px;
  height: 120px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba($ghost-blue, 0.3) 20%,
      rgba($ghost-blue, 0.5) 50%,
      rgba($ghost-blue, 0.3) 80%,
      transparent 100%);
  clip-path: polygon(0% 50%,
      5% 30%,
      20% 20%,
      40% 15%,
      60% 20%,
      80% 30%,
      95% 45%,
      100% 50%,
      95% 55%,
      80% 70%,
      60% 80%,
      40% 85%,
      20% 80%,
      5% 70%);
  filter: blur(3px);
}

.whale-glow {
  position: absolute;
  inset: -30px;
  background: radial-gradient(ellipse at center, rgba($ghost-blue, 0.3) 0%, transparent 70%);
  filter: blur(20px);
}

// 鲸歌波纹
.whale-song {
  position: absolute;
  top: 20%;
  left: 10%;
}

.song-wave {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid rgba($electric-cyan, 0.4);
  border-radius: 50%;
  animation: songWaveExpand 2s ease-out infinite;

  &.sw1 {
    animation-delay: 0s;
  }

  &.sw2 {
    animation-delay: 0.5s;
  }

  &.sw3 {
    animation-delay: 1s;
  }
}

@keyframes songWaveExpand {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }

  100% {
    transform: scale(3);
    opacity: 0;
  }
}

// 声呐穿透
.sonar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  border: 3px solid rgba($electric-cyan, 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
}

@keyframes sonarExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
    border-color: rgba($electric-cyan, 1);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    transform: translate(-50%, -50%) scale(50);
    opacity: 0;
    border-color: rgba($pearl-white, 0.5);
  }
}

// 最终闪光
.final-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center,
      rgba($pearl-white, 1) 0%,
      rgba($electric-cyan, 0.8) 30%,
      transparent 70%);
  opacity: 0;
}

@keyframes finalFlash {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: scale(2);
  }
}

// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}

.version {
  font-size: 12px;
  color: rgba($pearl-white, 0.4);
  letter-spacing: 2px;
}

// ==================== 过渡动画 ====================
.abyss-fade-enter-active,
.abyss-fade-leave-active {
  transition: opacity 0.5s ease-out;
}

.abyss-fade-enter-from,
.abyss-fade-leave-to {
  opacity: 0;
}
</style>
