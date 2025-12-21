<template>
  <Transition name="sanctum-fade">
    <div v-if="visible" class="sanctum-splash" ref="splashContainer">
      <!-- 第0层 - 无限书架与虚空 -->
      <div class="infinite-library-bg">
        <div class="void-gradient"></div>
        <div class="magic-nebula"></div> <!-- 新增：魔法星云 -->
        <div class="bookshelf-silhouettes">
          <div class="bookshelf shelf-1"></div>
          <div class="bookshelf shelf-2"></div>
          <div class="bookshelf shelf-3"></div>
        </div>
        <div class="distant-lights">
          <div v-for="n in 30" :key="n" class="magic-light" :style="{ '--i': n }"></div>
        </div>
      </div>

      <!-- 第1层 - Canvas 粒子系统：奥术符文 (增强版) -->
      <canvas ref="runeCanvas" class="rune-canvas"></canvas>

      <!-- 第2层 - 悬浮烛火 -->
      <div class="floating-candles">
        <div v-for="n in 6" :key="n" class="candle" :style="{ '--i': n }">
          <div class="flame"></div>
          <div class="flame-glow"></div>
        </div>
      </div>

      <!-- 第3层 - 灵性书籍 -->
      <div class="animated-tomes">
        <div class="tome tome-1">
          <div class="tome-cover"></div>
          <div class="tome-pages"></div>
        </div>
        <div class="tome tome-2">
          <div class="tome-cover"></div>
          <div class="tome-pages"></div>
        </div>
        <div class="tome tome-3 open">
          <div class="tome-left"></div>
          <div class="tome-right"></div>
          <div class="page-flip"></div>
          <div class="book-light"></div> <!-- 新增：书中发出的光 -->
        </div>
      </div>

      <!-- 第4层 - 装饰性元素 -->
      <div class="artifacts">
        <div class="astrolabe" ref="astrolabe">
          <div class="astrolabe-ring ring-outer"></div>
          <div class="astrolabe-ring ring-middle"></div>
          <div class="astrolabe-ring ring-inner"></div>
          <div class="astrolabe-center"></div>
        </div>
        <div class="quill-pen">
          <div class="quill-body"></div>
          <div class="ink-trail"></div>
        </div>
      </div>

      <!-- 丁达尔效应 - 魔法尘埃 -->
      <div class="tyndall-beams">
        <div class="light-beam beam-1"></div>
        <div class="light-beam beam-2"></div>
        <div class="dust-particles">
          <div v-for="n in 40" :key="n" class="dust" :style="{ '--i': n }"></div>
        </div>
      </div>

      <!-- 主内容 - 悬浮魔导书面板 -->
      <div class="grimoire-panel" :class="{ 'burning': isBurning }" ref="grimoirePanel">
        <div class="parchment-texture"></div>
        <div class="burnt-edges"></div>
        <div class="panel-sheen"></div> <!-- 新增：流光效果 -->
        <div class="magic-border">
          <svg class="border-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="goldInk" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ffaa00;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#ffeebb;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ffaa00;stop-opacity:1" />
              </linearGradient>
              <filter id="glowFilter">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x="5" y="5" width="390" height="290" fill="none" stroke="url(#goldInk)" stroke-width="2"
              class="border-rect" filter="url(#glowFilter)" />
            <!-- 凯尔特结角饰 -->
            <path class="corner-ornament tl" d="M5,40 Q5,5 40,5 M20,5 Q5,5 5,20 M10,10 L30,30" fill="none"
              stroke="url(#goldInk)" stroke-width="2" />
            <path class="corner-ornament tr" d="M360,5 Q395,5 395,40 M395,20 Q395,5 380,5 M390,10 L370,30" fill="none"
              stroke="url(#goldInk)" stroke-width="2" />
            <path class="corner-ornament bl" d="M5,260 Q5,295 40,295 M5,280 Q5,295 20,295 M10,290 L30,270" fill="none"
              stroke="url(#goldInk)" stroke-width="2" />
            <path class="corner-ornament br" d="M395,260 Q395,295 360,295 M380,295 Q395,295 395,280 M390,290 L370,270"
              fill="none" stroke="url(#goldInk)" stroke-width="2" />
          </svg>
        </div>
        <div class="rotating-sigil"></div>
        <div class="panel-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 100 100" class="sanctum-icon">
                <defs>
                  <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                    <stop offset="30%" style="stop-color:#ffaa00;stop-opacity:1" />
                    <stop offset="70%" style="stop-color:#fff0d0;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ffd700;stop-opacity:1" />
                  </linearGradient>
                  <filter id="goldGlow">
                    <feGaussianBlur stdDeviation="1.5" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="25" cy="72" r="10" fill="url(#goldFoil)" filter="url(#goldGlow)" class="note-base" />
                <circle cx="62" cy="65" r="10" fill="url(#goldFoil)" filter="url(#goldGlow)" class="note-base delay" />
                <rect x="33" y="22" width="3" height="50" fill="url(#goldFoil)" filter="url(#goldGlow)"
                  class="note-stem" />
                <rect x="70" y="18" width="3" height="47" fill="url(#goldFoil)" filter="url(#goldGlow)"
                  class="note-stem delay" />
                <path d="M 36 22 Q 53 12 73 18" stroke="url(#goldFoil)" stroke-width="3" fill="none"
                  filter="url(#goldGlow)" class="note-beam" />
              </svg>
            </div>
            <div class="logo-magic-ring"></div>
            <div class="logo-rays"></div> <!-- 新增：Logo光芒 -->
          </div>

          <!-- 应用名称 - 金箔烫金 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.1}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 -->
          <div class="loading-indicator">
            <div class="contract-line">
              <div class="line-fill"></div>
              <div class="quill-cursor"></div>
            </div>
            <p class="loading-text">{{ loadingText }}</p>
          </div>
        </div>
      </div>

      <!-- 封印解除效果层 -->
      <div class="seal-release-layer" :class="{ active: isBurning }" ref="sealLayer">
        <!-- 史诗级魔法阵 (新增) -->
        <div class="epic-magic-circle">
          <div class="circle-ring ring-1"></div>
          <div class="circle-ring ring-2"></div>
          <div class="circle-ring ring-3"></div>
          <div class="circle-runes"></div>
          <div class="circle-core"></div>
        </div>

        <!-- 契约燃烧火星 -->
        <div class="burning-sparks">
          <div v-for="n in 80" :key="n" class="spark" :style="{ '--i': n }"></div>
        </div>
        <!-- 符文风暴漩涡 -->
        <div class="rune-vortex"></div>
        <!-- 空间撕裂传送门 -->
        <div class="dimensional-rift">
          <div class="rift-core"></div>
          <div class="warp-tunnel"></div>
          <div class="rift-shards"></div> <!-- 新增：空间碎片 -->
        </div>
        <!-- 真理之光 -->
        <div class="truth-light"></div>
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
const isBurning = ref(false)
const runeCanvas = ref<HTMLCanvasElement | null>(null)
const splashContainer = ref<HTMLElement | null>(null)
const grimoirePanel = ref<HTMLElement | null>(null)
const sealLayer = ref<HTMLElement | null>(null)

const appNameChars = '故里音乐助手'.split('')

const loadingTexts = ['解读古老符文...', '唤醒沉睡的知识...', '连接魔法网络...', '准备签订契约...']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

let loadingTextInterval: number | null = null
let animationFrameId: number | null = null
let mouseX = 0
let mouseY = 0

const random = (min: number, max: number) => Math.random() * (max - min) + min

// 符文字符集
const runeChars = ['α', 'Ω', 'ᚢ', 'ᚠ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛗ', 'ᛞ', '☉', '☽', '♃', '♄', '⚶', '⚷', '⚡', '❈', '✦']

// 符文粒子
interface Rune {
  x: number
  y: number
  char: string
  size: number
  opacity: number
  rotation: number
  rotationSpeed: number
  riseSpeed: number
  swayPhase: number
  swayAmount: number
  hue: number
  isWarning: boolean
  pulseSpeed: number
}

let runes: Rune[] = []
let time = 0
let isVortexMode = false
let vortexIntensity = 0

const initRuneSystem = () => {
  const canvas = runeCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const runeCount = 80 // 增加数量

  const createRune = (randomY = true): Rune => ({
    x: random(0, canvas.width),
    y: randomY ? random(0, canvas.height) : canvas.height + random(50, 200),
    char: runeChars[Math.floor(Math.random() * runeChars.length)],
    size: random(12, 36),
    opacity: random(0.2, 0.7),
    rotation: random(-0.3, 0.3),
    rotationSpeed: random(-0.02, 0.02),
    riseSpeed: random(0.4, 1.2),
    swayPhase: random(0, Math.PI * 2),
    swayAmount: random(20, 60),
    hue: random(250, 300), // 紫色范围
    isWarning: false,
    pulseSpeed: random(0.02, 0.05)
  })

  runes = Array.from({ length: runeCount }, () => createRune(true))

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

    runes.forEach((rune) => {
      // 脉冲发光
      const pulse = Math.sin(time * 5 * rune.pulseSpeed) * 0.2 + 0.8

      // 检测鼠标距离
      const dx = rune.x - mouseX
      const dy = rune.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 120 && !isVortexMode) {
        rune.isWarning = true
        rune.riseSpeed = 4
        rune.opacity = Math.min(rune.opacity + 0.1, 1)
        rune.hue = 30 // 变成金色/橙色
      } else {
        rune.isWarning = false
        rune.riseSpeed = Math.max(rune.riseSpeed - 0.1, random(0.4, 1.2))
        if (!isVortexMode) rune.hue = 270 + Math.sin(time + rune.x * 0.01) * 30 // 恢复紫色动态
      }

      if (isVortexMode) {
        // 漩涡模式
        const toCenterX = centerX - rune.x
        const toCenterY = centerY - rune.y
        const angle = Math.atan2(toCenterY, toCenterX)
        const distToCenter = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY)

        rune.x += Math.cos(angle + 0.8) * vortexIntensity * 8
        rune.y += Math.sin(angle + 0.8) * vortexIntensity * 8
        rune.rotation += 0.2 * vortexIntensity
        rune.opacity = Math.min(rune.opacity + 0.05, 1)
        rune.hue = 280 + Math.random() * 60 // 混乱色彩

        if (distToCenter < 30) {
          rune.opacity -= 0.1
        }
      } else {
        // 正常上升
        const sway = Math.sin(time * 2 + rune.swayPhase) * rune.swayAmount * 0.02
        rune.y -= rune.riseSpeed
        rune.x += sway
        rune.rotation += rune.rotationSpeed
        rune.opacity += Math.sin(time * 3 + rune.swayPhase) * 0.01
      }

      // 绘制符文
      ctx.save()
      ctx.translate(rune.x, rune.y)
      ctx.rotate(rune.rotation)
      ctx.font = `${rune.size}px "Cinzel Decorative", serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 增强发光效果
      const glowColor = `hsla(${rune.hue}, 100%, 70%,`
      ctx.shadowColor = `hsl(${rune.hue}, 100%, 60%)`
      ctx.shadowBlur = 20 * pulse
      ctx.fillStyle = `${glowColor}${rune.opacity})`
      ctx.fillText(rune.char, 0, 0)

      // 核心高亮
      ctx.shadowBlur = 0
      ctx.fillStyle = `rgba(255, 255, 255, ${rune.opacity * 0.8})`
      ctx.fillText(rune.char, 0, 0)

      ctx.restore()

      // 重置
      if (rune.y < -50 || rune.opacity <= 0) {
        Object.assign(rune, createRune(false))
      }
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  return {
    setVortexMode: (active: boolean, intensity: number = 0) => {
      isVortexMode = active
      vortexIntensity = intensity
    }
  }
}

let runeControls: { setVortexMode: (active: boolean, intensity?: number) => void } | null = null

// 触发封印解除动画
const triggerSealRelease = () => {
  isBurning.value = true
  const releaseDuration = 3000 // 延长动画时间

  const startTime = Date.now()
  const accelerate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / releaseDuration, 1)
    const easeProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2

    runeControls?.setVortexMode(true, easeProgress)

    if (progress < 1) {
      requestAnimationFrame(accelerate)
    }
  }
  accelerate()

  // 魔法阵激活
  const magicCircle = sealLayer.value?.querySelector('.epic-magic-circle') as HTMLElement
  if (magicCircle) {
    magicCircle.style.opacity = '1'
    magicCircle.style.transform = 'translate(-50%, -50%) scale(1.5)'
  }

  // 面板燃烧效果
  setTimeout(() => {
    if (grimoirePanel.value) {
      grimoirePanel.value.style.animation = 'panelBurn 1.8s ease-out forwards'
    }
  }, releaseDuration * 0.2)

  // 书籍和蜡烛被吸入
  const tomes = splashContainer.value?.querySelectorAll('.tome')
  const candles = splashContainer.value?.querySelectorAll('.candle')
  const artifacts = splashContainer.value?.querySelector('.artifacts') as HTMLElement

  tomes?.forEach((tome, i) => {
    const el = tome as HTMLElement
    el.style.transition = `all ${1.5 - i * 0.2}s ease-in`
    setTimeout(() => {
      el.style.transform = 'translate(50vw, 50vh) scale(0) rotate(720deg)'
      el.style.opacity = '0'
    }, releaseDuration * 0.3 + i * 100)
  })

  candles?.forEach((candle, i) => {
    const el = candle as HTMLElement
    el.style.transition = `all ${1.2 - i * 0.1}s ease-in`
    setTimeout(() => {
      el.style.transform = 'translate(50vw, 50vh) scale(0)'
      el.style.opacity = '0'
    }, releaseDuration * 0.4 + i * 80)
  })

  if (artifacts) {
    artifacts.style.transition = `all 1.5s ease-in`
    setTimeout(() => {
      artifacts.style.transform = 'translate(50%, 50%) scale(0) rotate(360deg)'
      artifacts.style.opacity = '0'
    }, releaseDuration * 0.3)
  }

  // 真理之光
  const truthLight = sealLayer.value?.querySelector('.truth-light') as HTMLElement
  if (truthLight) {
    setTimeout(() => {
      truthLight.style.animation = 'truthLightFlash 1.2s ease-out forwards'
    }, releaseDuration - 600)
  }
}

onMounted(async () => {
  runeControls = initRuneSystem() || null

  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 1200)

  const minDisplayTime = 3000 // 延长展示时间
  const startTime = Date.now()

  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[SanctumOfTruthSplash] Data preload finished')
    } catch (error) {
      console.error('[SanctumOfTruthSplash] Preload error:', error)
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

  triggerSealRelease()
  await new Promise((resolve) => setTimeout(resolve, 3000))

  visible.value = false
  console.log('[SanctumOfTruthSplash] Hidden after', Date.now() - startTime, 'ms')
  setTimeout(() => emit('finished'), 500)
})

onUnmounted(() => {
  if (loadingTextInterval) clearInterval(loadingTextInterval)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$ebony-brown: #1a1005;
$abyss-purple: #12001f;
$candle-gold: #ffaa00;
$parchment-yellow: #d4c5a9;
$arcane-purple: #b026ff;
$ether-blue: #00e5ff;
$parchment-bg: rgba(240, 230, 210, 0.15);

.sanctum-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, $ebony-brown 0%, $abyss-purple 100%);
}

// ==================== 第0层 - 无限书架 ====================
.infinite-library-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .void-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, rgba($abyss-purple, 0.5) 0%, transparent 70%),
      radial-gradient(ellipse at 20% 80%, rgba($candle-gold, 0.1) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 20%, rgba($arcane-purple, 0.15) 0%, transparent 50%);
  }

  // 新增：魔法星云
  .magic-nebula {
    position: absolute;
    inset: -50%;
    background-image:
      radial-gradient(circle at 50% 50%, rgba($arcane-purple, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 20% 30%, rgba($ether-blue, 0.1) 0%, transparent 40%);
    filter: blur(60px);
    animation: nebulaFlow 30s linear infinite;
    opacity: 0.6;
  }

  .bookshelf-silhouettes {
    position: absolute;
    inset: 0;
    perspective: 1000px;
  }

  .bookshelf {
    position: absolute;
    background: linear-gradient(180deg, rgba($ebony-brown, 0.9) 0%, transparent 100%);
    opacity: 0.4;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);

    &.shelf-1 {
      left: 5%;
      bottom: 0;
      width: 15%;
      height: 120%;
      transform: rotateY(-15deg);
      animation: shelfFloat 20s ease-in-out infinite;
    }

    &.shelf-2 {
      right: 10%;
      bottom: 0;
      width: 12%;
      height: 150%;
      transform: rotateY(10deg);
      animation: shelfFloat 25s ease-in-out infinite reverse;
    }

    &.shelf-3 {
      left: 30%;
      bottom: 0;
      width: 8%;
      height: 200%;
      opacity: 0.2;
      animation: shelfFloat 30s ease-in-out infinite;
    }
  }

  .distant-lights {
    position: absolute;
    inset: 0;
  }

  .magic-light {
    position: absolute;
    width: 4px;
    height: 4px;
    background: $arcane-purple;
    border-radius: 50%;
    box-shadow: 0 0 10px $arcane-purple, 0 0 20px $ether-blue;
    animation: twinkle 3s ease-in-out infinite;
    left: calc(var(--i) * 5%);
    top: calc(var(--i) * 4%);
    animation-delay: calc(var(--i) * 0.2s);
  }
}

@keyframes nebulaFlow {
  0% {
    transform: rotate(0deg) scale(1);
  }

  50% {
    transform: rotate(180deg) scale(1.1);
  }

  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes shelfFloat {

  0%,
  100% {
    transform: translateY(0) rotateY(-15deg);
  }

  50% {
    transform: translateY(-20px) rotateY(-15deg);
  }
}

@keyframes twinkle {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

// ==================== 第1层 - 符文 Canvas ====================
.rune-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

// ==================== 第2层 - 悬浮烛火 ====================
.floating-candles {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.candle {
  position: absolute;
  width: 20px;
  height: 60px;
  animation: candleFloat 8s ease-in-out infinite;

  &:nth-child(1) {
    left: 10%;
    top: 20%;
    animation-delay: 0s;
  }

  &:nth-child(2) {
    left: 85%;
    top: 30%;
    animation-delay: 1s;
  }

  &:nth-child(3) {
    left: 15%;
    top: 60%;
    animation-delay: 2s;
  }

  &:nth-child(4) {
    left: 80%;
    top: 70%;
    animation-delay: 3s;
  }

  &:nth-child(5) {
    left: 25%;
    top: 40%;
    animation-delay: 1.5s;
  }

  &:nth-child(6) {
    left: 70%;
    top: 50%;
    animation-delay: 2.5s;
  }

  .flame {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 25px;
    background: linear-gradient(180deg, #fff 0%, $candle-gold 30%, #ff6b00 100%);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    animation: flicker 0.3s ease-in-out infinite alternate;
    box-shadow: 0 -5px 10px rgba($candle-gold, 0.8);
  }

  .flame-glow {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba($candle-gold, 0.3) 0%, transparent 70%);
    animation: breathe 2s ease-in-out infinite;
  }
}

@keyframes candleFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-15px);
  }
}

@keyframes flicker {
  0% {
    transform: translateX(-50%) scaleY(1) scaleX(1);
  }

  100% {
    transform: translateX(-50%) scaleY(1.1) scaleX(0.9);
  }
}

@keyframes breathe {

  0%,
  100% {
    opacity: 0.5;
    transform: translateX(-50%) scale(1);
  }

  50% {
    opacity: 0.8;
    transform: translateX(-50%) scale(1.2);
  }
}

// ==================== 第3层 - 灵性书籍 ====================
.animated-tomes {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.tome {
  position: absolute;
  width: 80px;
  height: 100px;
  animation: tomeFloat 10s ease-in-out infinite;
  transform-style: preserve-3d;

  &.tome-1 {
    left: 8%;
    top: 35%;
    animation-delay: 0s;
    transform: rotateZ(-15deg);
  }

  &.tome-2 {
    right: 12%;
    top: 55%;
    animation-delay: 3s;
    transform: rotateZ(10deg);
  }

  &.tome-3 {
    left: 20%;
    bottom: 25%;
    animation-delay: 6s;
  }

  .tome-cover {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4a3728 0%, #2d1f14 100%);
    border-radius: 3px 8px 8px 3px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba($candle-gold, 0.1);
    border: 1px solid rgba($candle-gold, 0.3);
  }

  .tome-pages {
    position: absolute;
    right: 3px;
    top: 5px;
    width: 70%;
    height: 90%;
    background: repeating-linear-gradient(90deg, $parchment-yellow 0px, $parchment-yellow 2px, #c9b896 2px, #c9b896 4px);
    border-radius: 0 5px 5px 0;
  }

  &.open {
    width: 160px;
    height: 100px;

    .tome-cover {
      display: none;
    }

    .tome-pages {
      display: none;
    }

    .tome-left,
    .tome-right {
      position: absolute;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, #c9b896 0%, $parchment-yellow 100%);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .tome-left {
      left: 0;
      border-radius: 5px 0 0 5px;
      transform: rotateY(-10deg);
      transform-origin: right;
    }

    .tome-right {
      right: 0;
      border-radius: 0 5px 5px 0;
      transform: rotateY(10deg);
      transform-origin: left;
    }

    .page-flip {
      position: absolute;
      left: 50%;
      top: 5%;
      width: 45%;
      height: 90%;
      background: $parchment-yellow;
      transform-origin: left;
      animation: pageFlip 4s ease-in-out infinite;
    }

    .book-light {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba($candle-gold, 0.4) 0%, transparent 70%);
      filter: blur(10px);
      animation: bookGlow 2s ease-in-out infinite;
    }
  }
}

@keyframes tomeFloat {

  0%,
  100% {
    transform: translateY(0) rotate(var(--rot, 0deg));
  }

  50% {
    transform: translateY(-20px) rotate(var(--rot, 0deg));
  }
}

@keyframes pageFlip {

  0%,
  45%,
  100% {
    transform: rotateY(0deg);
  }

  50%,
  95% {
    transform: rotateY(-160deg);
  }
}

@keyframes bookGlow {

  0%,
  100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

// ==================== 第4层 - 装饰元素 ====================
.artifacts {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.astrolabe {
  position: absolute;
  right: 8%;
  bottom: 15%;
  width: 120px;
  height: 120px;

  .astrolabe-ring {
    position: absolute;
    border: 2px solid rgba($candle-gold, 0.6);
    border-radius: 50%;
    box-shadow: 0 0 10px rgba($candle-gold, 0.3);

    &.ring-outer {
      inset: 0;
      animation: rotateRing 20s linear infinite;
      border-width: 3px;
    }

    &.ring-middle {
      inset: 15px;
      animation: rotateRing 15s linear infinite reverse;
    }

    &.ring-inner {
      inset: 30px;
      animation: rotateRing 10s linear infinite;
    }
  }

  .astrolabe-center {
    position: absolute;
    inset: 45px;
    background: radial-gradient(circle, $candle-gold 0%, transparent 70%);
    border-radius: 50%;
    box-shadow: 0 0 20px $candle-gold;
  }
}

@keyframes rotateRing {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.quill-pen {
  position: absolute;
  left: 10%;
  top: 15%;
  width: 100px;
  height: 30px;
  transform: rotate(-30deg);

  .quill-body {
    width: 100%;
    height: 8px;
    background: linear-gradient(90deg, #fff 0%, #e8d5b5 50%, #4a3728 100%);
    border-radius: 2px 50% 50% 2px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }

  .ink-trail {
    position: absolute;
    left: 100%;
    top: 50%;
    width: 150px;
    height: 2px;
    background: linear-gradient(90deg, $arcane-purple, transparent);
    transform: translateY(-50%);
    animation: inkWrite 3s ease-in-out infinite;
    opacity: 0.7;
    box-shadow: 0 0 10px $arcane-purple;
  }
}

@keyframes inkWrite {

  0%,
  100% {
    width: 0;
    opacity: 0;
  }

  20% {
    opacity: 0.8;
  }

  50% {
    width: 150px;
    opacity: 0.8;
  }

  80% {
    opacity: 0;
  }
}

// ==================== 丁达尔光束 ====================
.tyndall-beams {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.light-beam {
  position: absolute;
  background: linear-gradient(180deg, rgba($candle-gold, 0.2) 0%, transparent 100%);
  transform-origin: top;
  filter: blur(10px);

  &.beam-1 {
    left: 30%;
    top: -20%;
    width: 150px;
    height: 80%;
    transform: rotate(15deg);
    animation: beamPulse 8s ease-in-out infinite;
  }

  &.beam-2 {
    right: 25%;
    top: -20%;
    width: 120px;
    height: 70%;
    transform: rotate(-10deg);
    animation: beamPulse 10s ease-in-out infinite reverse;
  }
}

@keyframes beamPulse {

  0%,
  100% {
    opacity: 0.3;
    transform: rotate(15deg) scaleX(1);
  }

  50% {
    opacity: 0.6;
    transform: rotate(15deg) scaleX(1.2);
  }
}

.dust-particles .dust {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba($candle-gold, 0.8);
  border-radius: 50%;
  left: calc(25% + var(--i) * 2%);
  top: calc(10% + var(--i) * 1.5%);
  animation: dustFloat 5s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.15s);
  box-shadow: 0 0 5px $candle-gold;
}

@keyframes dustFloat {

  0%,
  100% {
    transform: translate(0, 0);
    opacity: 0.3;
  }

  25% {
    transform: translate(10px, 5px);
    opacity: 0.8;
  }

  50% {
    transform: translate(-5px, 15px);
    opacity: 0.5;
  }

  75% {
    transform: translate(8px, 8px);
    opacity: 0.7;
  }
}

// ==================== 主面板 - 魔导书 ====================
.grimoire-panel {
  position: relative;
  width: 400px;
  padding: 40px;
  z-index: 10;
  background: $parchment-bg;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 60px rgba(0, 0, 0, 0.6), inset 0 0 100px rgba($candle-gold, 0.1);
  overflow: hidden;

  .parchment-texture {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.08;
    border-radius: 8px;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  .burnt-edges {
    position: absolute;
    inset: -5px;
    border: 8px solid transparent;
    border-image: radial-gradient(ellipse at center, transparent 60%, rgba(60, 30, 10, 0.6) 100%) 1;
    pointer-events: none;
  }

  // 新增：流光效果
  .panel-sheen {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent 40%, rgba($candle-gold, 0.1) 50%, transparent 60%);
    transform: rotate(30deg);
    animation: sheenPass 6s ease-in-out infinite;
    pointer-events: none;
  }

  .magic-border {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .border-svg {
      width: 100%;
      height: 100%;
    }

    .border-rect {
      stroke-dasharray: 1400;
      stroke-dashoffset: 1400;
      animation: drawBorder 2s ease-out forwards;
    }

    .corner-ornament {
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      animation: drawCorner 1.5s ease-out forwards;
      animation-delay: 1s;
    }
  }

  .rotating-sigil {
    position: absolute;
    inset: -20px;
    border: 1px dashed rgba($candle-gold, 0.3);
    border-radius: 50%;
    animation: sigilRotate 30s linear infinite;
    pointer-events: none;
  }

  &.burning {
    animation: panelBurn 1.8s ease-out forwards;
  }
}

@keyframes sheenPass {
  0% {
    transform: rotate(30deg) translateY(100%);
  }

  20% {
    transform: rotate(30deg) translateY(-100%);
  }

  100% {
    transform: rotate(30deg) translateY(-100%);
  }
}

@keyframes drawBorder {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes drawCorner {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes sigilRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes panelBurn {
  0% {
    filter: brightness(1);
  }

  30% {
    filter: brightness(1.5) sepia(0.3);
    box-shadow: 0 0 50px $candle-gold;
  }

  60% {
    filter: brightness(2) sepia(0.5);
    transform: scale(1.05) rotate(2deg);
  }

  100% {
    opacity: 0;
    filter: brightness(3);
    transform: scale(0.8) rotate(-5deg);
  }
}

// ==================== 面板内容 ====================
.panel-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.logo-container {
  position: relative;
  width: 100px;
  height: 100px;

  .logo-icon {
    width: 100%;
    height: 100%;
    animation: logoGlow 3s ease-in-out infinite;
  }

  .logo-magic-ring {
    position: absolute;
    inset: -15px;
    border: 1px solid rgba($candle-gold, 0.4);
    border-radius: 50%;
    animation: ringPulse 2s ease-in-out infinite;
    box-shadow: 0 0 15px rgba($candle-gold, 0.2);
  }

  .logo-rays {
    position: absolute;
    inset: -20px;
    background: conic-gradient(from 0deg, transparent 0%, rgba($candle-gold, 0.2) 10%, transparent 20%);
    border-radius: 50%;
    animation: sigilRotate 10s linear infinite;
  }
}

@keyframes logoGlow {

  0%,
  100% {
    filter: drop-shadow(0 0 10px rgba($candle-gold, 0.5));
  }

  50% {
    filter: drop-shadow(0 0 25px rgba($candle-gold, 0.9));
  }
}

@keyframes ringPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.app-name {
  font-family: 'Cinzel Decorative', 'Times New Roman', serif;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  margin: 0;

  .char {
    display: inline-block;
    background: linear-gradient(180deg, #ffd700 0%, $candle-gold 50%, #d4a574 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 10px rgba($candle-gold, 0.5);
    animation: charReveal 0.8s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
  }
}

@keyframes charReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-indicator {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.contract-line {
  position: relative;
  width: 80%;
  height: 2px;
  background: rgba($parchment-yellow, 0.3);
  overflow: hidden;

  .line-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, $candle-gold, $arcane-purple);
    animation: lineFill 2.5s ease-in-out infinite;
    box-shadow: 0 0 10px $candle-gold;
  }

  .quill-cursor {
    position: absolute;
    top: -8px;
    left: 0;
    width: 16px;
    height: 16px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffaa00'%3E%3Cpath d='M21.17 2.83a2.01 2.01 0 00-2.83 0L3 18.17V21h2.83L21.17 5.66a2.01 2.01 0 000-2.83z'/%3E%3C/svg%3E") center/contain no-repeat;
    animation: quillMove 2.5s ease-in-out infinite;
    filter: drop-shadow(0 0 5px $candle-gold);
  }
}

@keyframes lineFill {
  0% {
    width: 0;
  }

  100% {
    width: 100%;
  }
}

@keyframes quillMove {
  0% {
    left: 0;
  }

  100% {
    left: calc(100% - 16px);
  }
}

.loading-text {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  color: $parchment-yellow;
  margin: 0;
  opacity: 0.8;
  letter-spacing: 2px;
  animation: textPulse 2s ease-in-out infinite;
}

@keyframes textPulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

// ==================== 封印解除层 ====================
.seal-release-layer {
  position: absolute;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s;

  &.active {
    opacity: 1;
  }
}

// 新增：史诗级魔法阵
.epic-magic-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 600px;
  height: 600px;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 1s ease-out;

  .circle-ring {
    position: absolute;
    border: 2px solid $arcane-purple;
    border-radius: 50%;
    box-shadow: 0 0 20px $arcane-purple;

    &.ring-1 {
      inset: 0;
      border-width: 4px;
      border-style: double;
      animation: rotateRing 10s linear infinite;
    }

    &.ring-2 {
      inset: 50px;
      border-width: 2px;
      border-style: dashed;
      animation: rotateRing 8s linear infinite reverse;
    }

    &.ring-3 {
      inset: 100px;
      border-width: 1px;
      animation: rotateRing 6s linear infinite;
    }
  }

  .circle-runes {
    position: absolute;
    inset: 20px;
    background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpath id='textPath' d='M 280, 280 m -250, 0 a 250,250 0 1,1 500,0 a 250,250 0 1,1 -500,0'/%3E%3C/defs%3E%3Ctext fill='%23b026ff' font-family='serif' font-size='24' font-weight='bold' letter-spacing='10'%3E%3CtextPath href='%23textPath'%3Eα Ω ᚢ ᚠ ᛉ ᛋ ᛏ ᛒ ᛗ ᛞ ☉ ☽ ♃ ♄ ⚶ ⚷ ⚡ ❈ ✦ α Ω ᚢ ᚠ ᛉ ᛋ ᛏ ᛒ ᛗ ᛞ ☉ ☽ ♃ ♄ ⚶ ⚷ ⚡ ❈ ✦%3C/textPath%3E%3C/text%3E%3C/svg%3E");
    animation: rotateRing 20s linear infinite;
    opacity: 0.8;
  }

  .circle-core {
    position: absolute;
    inset: 150px;
    border: 5px solid $ether-blue;
    transform: rotate(45deg);
    box-shadow: 0 0 30px $ether-blue;
    animation: pulseCore 1s ease-in-out infinite alternate;
  }
}

@keyframes pulseCore {
  from {
    box-shadow: 0 0 20px $ether-blue;
    opacity: 0.6;
  }

  to {
    box-shadow: 0 0 50px $ether-blue;
    opacity: 1;
  }
}

.burning-sparks .spark {
  position: absolute;
  width: 4px;
  height: 4px;
  background: $candle-gold;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  opacity: 0;
  box-shadow: 0 0 6px $candle-gold, 0 0 12px #ff6b00;

  .active & {
    animation: sparkBurst 2s ease-out forwards;
    animation-delay: calc(var(--i) * 0.01s);
  }
}

@keyframes sparkBurst {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }

  100% {
    transform: translate(calc(-50% + (var(--i) - 40) * 20px),
        calc(-50% + (var(--i) - 40) * 15px)) scale(0);
    opacity: 0;
  }
}

.rune-vortex {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  border: 2px solid transparent;
  border-radius: 50%;
  opacity: 0;

  .active & {
    animation: vortexSpin 2s ease-in forwards;
    border-color: $arcane-purple;
    box-shadow: 0 0 80px $arcane-purple, inset 0 0 80px rgba($ether-blue, 0.5);
  }
}

@keyframes vortexSpin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(0);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) rotate(720deg) scale(4);
    opacity: 0;
  }
}

.dimensional-rift {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .rift-core {
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, $ether-blue 0%, $arcane-purple 50%, transparent 70%);
    border-radius: 50%;
    opacity: 0;

    .active & {
      animation: riftOpen 2s ease-out 0.5s forwards;
    }
  }

  .warp-tunnel {
    position: absolute;
    inset: -100px;
    background: conic-gradient(from 0deg, transparent, $arcane-purple, $ether-blue, $candle-gold, transparent);
    border-radius: 50%;
    opacity: 0;
    filter: blur(10px);

    .active & {
      animation: tunnelSpin 1s linear 1s infinite;
    }
  }

  .rift-shards {
    position: absolute;
    inset: -200px;
    background-image: radial-gradient(circle, #fff 2px, transparent 2px);
    background-size: 50px 50px;
    opacity: 0;

    .active & {
      animation: shardsFly 1.5s ease-out 1s forwards;
    }
  }
}

@keyframes riftOpen {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: scale(8);
    opacity: 0;
  }
}

@keyframes tunnelSpin {
  from {
    transform: rotate(0deg);
    opacity: 0.8;
  }

  to {
    transform: rotate(360deg);
    opacity: 0.8;
  }
}

@keyframes shardsFly {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: scale(2) rotate(180deg);
    opacity: 0;
  }
}

.truth-light {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba($candle-gold, 0.8) 30%, transparent 70%);
  opacity: 0;
}

@keyframes truthLightFlash {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 1;
    transform: scale(3);
    background: white;
  }
}

// ==================== 底部 ====================
.splash-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}

.version {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  color: rgba($parchment-yellow, 0.5);
  margin: 0;
  letter-spacing: 2px;
}

// ==================== 过渡动画 ====================
.sanctum-fade-enter-active,
.sanctum-fade-leave-active {
  transition: opacity 0.5s ease;
}

.sanctum-fade-enter-from,
.sanctum-fade-leave-to {
  opacity: 0;
}
</style>
