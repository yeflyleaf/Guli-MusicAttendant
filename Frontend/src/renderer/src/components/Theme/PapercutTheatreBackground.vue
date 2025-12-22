<template>
  <div class="papercut-background" :class="{ embedded: embedded }" ref="containerRef" @mousemove="handleMouseMove">
    <!-- 底层：透光宣纸天幕 -->
    <div class="rice-paper-sky">
      <div class="paper-texture"></div>
      <div class="moon-glow"></div>
      <div class="moon-core"></div>
    </div>

    <!-- 远景：层峦剪影 (3层山峦) -->
    <div class="mountain-layer" :style="mountainLayerStyle">
      <div class="mountain mountain-far"></div>
      <div class="mountain mountain-mid"></div>
      <div class="mountain mountain-near"></div>
      <!-- 云纹剪影 -->
      <div class="cloud-pattern cloud-1"></div>
      <div class="cloud-pattern cloud-2"></div>
      <div class="cloud-pattern cloud-3"></div>
    </div>

    <!-- 中层：园林与枯木 -->
    <div class="garden-layer" :style="gardenLayerStyle">
      <!-- 左侧亭台楼阁 -->
      <svg class="pavilion pavilion-left" viewBox="0 0 200 300">
        <!-- 屋顶 -->
        <path d="M10 100 L100 40 L190 100 L180 105 L100 50 L20 105 Z" fill="rgba(20, 15, 25, 0.85)"
          filter="url(#paperShadow)" />
        <!-- 飞檐 -->
        <path d="M5 100 Q30 90 10 100 M195 100 Q170 90 190 100" stroke="rgba(20, 15, 25, 0.9)" stroke-width="3"
          fill="none" />
        <!-- 屋檐下层 -->
        <path d="M25 105 L100 60 L175 105 L170 110 L100 70 L30 110 Z" fill="rgba(25, 20, 30, 0.7)" />
        <!-- 立柱 -->
        <rect x="40" y="110" width="6" height="120" fill="rgba(20, 15, 25, 0.85)" />
        <rect x="80" y="110" width="6" height="120" fill="rgba(20, 15, 25, 0.85)" />
        <rect x="114" y="110" width="6" height="120" fill="rgba(20, 15, 25, 0.85)" />
        <rect x="154" y="110" width="6" height="120" fill="rgba(20, 15, 25, 0.85)" />
        <!-- 窗棂镂空 -->
        <g class="window-lattice">
          <rect x="48" y="130" width="30" height="60" fill="none" stroke="rgba(20, 15, 25, 0.7)" stroke-width="2" />
          <line x1="48" y1="150" x2="78" y2="150" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
          <line x1="48" y1="170" x2="78" y2="170" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
          <line x1="63" y1="130" x2="63" y2="190" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />

          <rect x="122" y="130" width="30" height="60" fill="none" stroke="rgba(20, 15, 25, 0.7)" stroke-width="2" />
          <line x1="122" y1="150" x2="152" y2="150" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
          <line x1="122" y1="170" x2="152" y2="170" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
          <line x1="137" y1="130" x2="137" y2="190" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
        </g>
        <!-- 底座 -->
        <rect x="30" y="230" width="140" height="10" fill="rgba(20, 15, 25, 0.8)" />
        <!-- 滤镜定义 -->
        <defs>
          <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.5)" />
          </filter>
        </defs>
      </svg>

      <!-- 右侧盘曲松树 -->
      <svg class="pine-tree pine-right" viewBox="0 0 180 350">
        <!-- 主干 -->
        <path d="M90 350 Q85 300 95 250 Q80 200 100 150 Q90 100 95 50" stroke="rgba(20, 15, 25, 0.9)" stroke-width="8"
          fill="none" stroke-linecap="round" />
        <!-- 松枝 -->
        <g class="pine-branches">
          <!-- 左侧枝条 -->
          <path d="M95 250 Q60 240 30 260" stroke="rgba(20, 15, 25, 0.85)" stroke-width="3" fill="none" />
          <path d="M100 200 Q55 185 20 210" stroke="rgba(20, 15, 25, 0.85)" stroke-width="3" fill="none" />
          <path d="M95 150 Q50 130 25 160" stroke="rgba(20, 15, 25, 0.85)" stroke-width="2" fill="none" />
          <path d="M95 100 Q60 85 40 110" stroke="rgba(20, 15, 25, 0.8)" stroke-width="2" fill="none" />
          <!-- 右侧枝条 -->
          <path d="M95 280 Q130 270 160 290" stroke="rgba(20, 15, 25, 0.85)" stroke-width="3" fill="none" />
          <path d="M100 220 Q145 205 170 235" stroke="rgba(20, 15, 25, 0.85)" stroke-width="3" fill="none" />
          <path d="M95 170 Q140 155 165 180" stroke="rgba(20, 15, 25, 0.85)" stroke-width="2" fill="none" />
          <path d="M95 120 Q130 105 155 130" stroke="rgba(20, 15, 25, 0.8)" stroke-width="2" fill="none" />
          <!-- 松针簇 -->
          <ellipse cx="25" cy="260" rx="25" ry="15" fill="rgba(20, 15, 25, 0.7)" />
          <ellipse cx="15" cy="210" rx="30" ry="18" fill="rgba(20, 15, 25, 0.75)" />
          <ellipse cx="20" cy="160" rx="22" ry="12" fill="rgba(20, 15, 25, 0.65)" />
          <ellipse cx="35" cy="110" rx="20" ry="10" fill="rgba(20, 15, 25, 0.6)" />
          <ellipse cx="165" cy="290" rx="22" ry="13" fill="rgba(20, 15, 25, 0.7)" />
          <ellipse cx="175" cy="235" rx="28" ry="16" fill="rgba(20, 15, 25, 0.75)" />
          <ellipse cx="170" cy="180" rx="20" ry="11" fill="rgba(20, 15, 25, 0.65)" />
          <ellipse cx="160" cy="130" rx="18" ry="9" fill="rgba(20, 15, 25, 0.6)" />
          <!-- 顶部松针 -->
          <ellipse cx="95" cy="45" rx="30" ry="20" fill="rgba(20, 15, 25, 0.7)" />
        </g>
      </svg>

      <!-- 中间枯木枝条 -->
      <svg class="dead-branch branch-center" viewBox="0 0 300 200">
        <path d="M0 180 Q50 150 100 160 Q150 130 200 150 Q250 120 300 140" stroke="rgba(20, 15, 25, 0.8)"
          stroke-width="4" fill="none" />
        <path d="M80 165 Q70 120 60 80" stroke="rgba(20, 15, 25, 0.7)" stroke-width="2" fill="none" />
        <path d="M180 145 Q200 100 190 60" stroke="rgba(20, 15, 25, 0.7)" stroke-width="2" fill="none" />
      </svg>
    </div>

    <!-- 近景：摇曳边框 -->
    <div class="foreground-layer" :style="foregroundLayerStyle">
      <!-- 左上角垂柳 -->
      <div class="willow willow-left">
        <svg viewBox="0 0 200 400" class="willow-svg">
          <!-- 柳枝 -->
          <g class="willow-branch branch-1">
            <path d="M180 0 Q160 100 140 200 Q130 280 120 350" stroke="rgba(20, 15, 25, 0.6)" stroke-width="3"
              fill="none" />
            <path d="M120 200 Q100 250 90 320" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
          </g>
          <g class="willow-branch branch-2">
            <path d="M160 0 Q130 120 100 240 Q80 320 70 400" stroke="rgba(20, 15, 25, 0.55)" stroke-width="2.5"
              fill="none" />
          </g>
          <g class="willow-branch branch-3">
            <path d="M140 0 Q100 100 60 200 Q40 280 30 380" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 右上角垂柳 -->
      <div class="willow willow-right">
        <svg viewBox="0 0 200 400" class="willow-svg">
          <g class="willow-branch branch-4">
            <path d="M20 0 Q40 100 60 200 Q70 280 80 350" stroke="rgba(20, 15, 25, 0.55)" stroke-width="3"
              fill="none" />
            <path d="M80 200 Q100 250 110 320" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" fill="none" />
          </g>
          <g class="willow-branch branch-5">
            <path d="M40 0 Q70 120 100 240 Q120 320 130 400" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2.5"
              fill="none" />
          </g>
          <g class="willow-branch branch-6">
            <path d="M60 0 Q100 100 140 200 Q160 280 170 380" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 左下角垂柳 -->
      <div class="willow willow-bottom-left">
        <svg viewBox="0 0 180 300" class="willow-svg">
          <g class="willow-branch branch-7">
            <path d="M160 300 Q140 220 120 140 Q110 80 100 20" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2.5"
              fill="none" />
          </g>
          <g class="willow-branch branch-8">
            <path d="M140 300 Q100 200 70 100 Q50 40 40 0" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 中间顶部垂柳 -->
      <div class="willow willow-top-center">
        <svg viewBox="0 0 150 350" class="willow-svg">
          <g class="willow-branch branch-9">
            <path d="M75 0 Q60 80 50 160 Q40 240 35 320" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" fill="none" />
          </g>
          <g class="willow-branch branch-10">
            <path d="M75 0 Q90 80 100 160 Q110 240 115 320" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.8"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 右下角灯笼组 -->
      <div class="lantern-group lantern-group-right">
        <div class="lantern lantern-1">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-2">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-3">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 左侧悬挂灯笼组 -->
      <div class="lantern-group lantern-group-left">
        <div class="lantern lantern-4">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-5">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 顶部悬挂灯笼 -->
      <div class="lantern-group lantern-group-top">
        <div class="lantern lantern-6">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 顶部中央灯笼组 -->
      <div class="lantern-group lantern-group-top-center">
        <div class="lantern lantern-7">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-8">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-9">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 右侧中部灯笼组 -->
      <div class="lantern-group lantern-group-right-mid">
        <div class="lantern lantern-10">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-11">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 左下角灯笼组 -->
      <div class="lantern-group lantern-group-bottom-left">
        <div class="lantern lantern-12">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-13">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 底部中央灯笼组 -->
      <div class="lantern-group lantern-group-bottom-center">
        <div class="lantern lantern-14">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-15">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-16">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 右下角松针 -->
      <div class="pine-needle-cluster">
        <svg viewBox="0 0 150 200" class="pine-needle-svg">
          <g class="pine-needles">
            <path d="M75 200 Q60 150 50 100 Q45 50 55 0" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
            <path d="M75 200 Q80 140 90 80 Q100 30 95 0" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
            <path d="M75 200 Q40 160 20 120 Q5 80 10 40" stroke="rgba(20, 15, 25, 0.45)" stroke-width="1.5"
              fill="none" />
            <path d="M75 200 Q110 150 130 100 Q145 50 140 0" stroke="rgba(20, 15, 25, 0.45)" stroke-width="1.5"
              fill="none" />
            <ellipse cx="50" cy="50" rx="35" ry="20" fill="rgba(20, 15, 25, 0.4)" />
            <ellipse cx="100" cy="40" rx="30" ry="18" fill="rgba(20, 15, 25, 0.35)" />
          </g>
        </svg>
      </div>
    </div>

    <!-- 装饰元素：远处灯笼点缀 -->
    <div class="distant-lanterns">
      <div class="distant-lantern dl-1"></div>
      <div class="distant-lantern dl-2"></div>
      <div class="distant-lantern dl-3"></div>
    </div>

    <!-- 粒子效果 Canvas (飘落花瓣/纸片) -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 纸张纹理叠加层 -->
    <div class="paper-overlay"></div>

    <!-- 暗角遮罩 -->
    <div class="vignette-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Props
defineProps<{
  embedded?: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)
const particleCanvas = ref<HTMLCanvasElement | null>(null)

// 鼠标位置用于视差效果
const mouseX = ref(0.5)
const mouseY = ref(0.5)

// 视差偏移量 - 三层不同速率
const mountainLayerStyle = computed(() => ({
  transform: `translate(${(mouseX.value - 0.5) * -4}px, ${(mouseY.value - 0.5) * -4}px)`
}))

const gardenLayerStyle = computed(() => ({
  transform: `translate(${(mouseX.value - 0.5) * -10}px, ${(mouseY.value - 0.5) * -10}px)`
}))

const foregroundLayerStyle = computed(() => ({
  transform: `translate(${(mouseX.value - 0.5) * -20}px, ${(mouseY.value - 0.5) * -20}px)`
}))

// 鼠标移动处理
const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  // 使用 lerp 平滑过渡
  const targetX = (e.clientX - rect.left) / rect.width
  const targetY = (e.clientY - rect.top) / rect.height
  mouseX.value += (targetX - mouseX.value) * 0.1
  mouseY.value += (targetY - mouseY.value) * 0.1
}

// 粒子系统 - 飘落纸片/花瓣
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
  type: 'petal' | 'paper'
  swayPhase: number
  swaySpeed: number
}

let particles: Particle[] = []
let animationId: number | null = null
let lightBreathPhase = 0

const initParticleSystem = () => {
  const canvas = particleCanvas.value
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

  // 创建粒子
  const createParticle = (): Particle => {
    const type = Math.random() > 0.7 ? 'paper' : 'petal'
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      size: type === 'paper' ? 8 + Math.random() * 12 : 4 + Math.random() * 6,
      opacity: 0.3 + Math.random() * 0.4,
      type,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.02
    }
  }

  // 初始化粒子 - 加倍数量
  for (let i = 0; i < 50; i++) {
    const p = createParticle()
    p.y = Math.random() * canvas.height
    particles.push(p)
  }

  // 动画循环
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 光影呼吸效果 (8-10秒周期)
    lightBreathPhase += 0.008
    const breathFactor = 0.9 + Math.sin(lightBreathPhase) * 0.1

    // 更新月光强度 (通过 CSS 变量)
    document.documentElement.style.setProperty('--moon-breath', breathFactor.toString())

    particles.forEach((particle, index) => {
      // 摇摆效果
      particle.swayPhase += particle.swaySpeed
      particle.x += particle.vx + Math.sin(particle.swayPhase) * 0.5
      particle.y += particle.vy
      particle.rotation += particle.rotationSpeed

      // 边界检查
      if (particle.y > canvas.height + 20 || particle.x < -50 || particle.x > canvas.width + 50) {
        particles[index] = createParticle()
      }

      // 绘制粒子
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      ctx.globalAlpha = particle.opacity * breathFactor

      if (particle.type === 'paper') {
        // 纸片 - 矩形带圆角
        ctx.fillStyle = 'rgba(253, 246, 227, 0.6)'
        ctx.shadowColor = 'rgba(255, 236, 179, 0.3)'
        ctx.shadowBlur = 5
        ctx.beginPath()
        const w = particle.size
        const h = particle.size * 0.6
        ctx.roundRect(-w / 2, -h / 2, w, h, 2)
        ctx.fill()
      } else {
        // 花瓣 - 椭圆形
        ctx.fillStyle = 'rgba(255, 236, 200, 0.5)'
        ctx.beginPath()
        ctx.ellipse(0, 0, particle.size, particle.size * 0.5, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(() => {
  initParticleSystem()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "sass:math";

// 剪纸戏梦色板
$twilight-purple: #242038;
$deep-indigo: #1a1c29;
$moon-white: #fdf6e3;
$candle-yellow: #ffecb3;
$cinnabar-muted: rgba(180, 80, 70, 0.6);
$indigo-accent: rgba(75, 100, 140, 0.5);
$paper-dark: rgba(20, 15, 25, 0.85);
$paper-shadow: rgba(0, 0, 0, 0.5);

:root {
  --moon-breath: 1;
}

.papercut-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(180deg, $twilight-purple 0%, $deep-indigo 100%);

  &.embedded {
    position: absolute;
    z-index: 0;
  }
}

// 底层：透光宣纸天幕
.rice-paper-sky {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .paper-texture {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 25%, rgba($moon-white, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 60%, rgba($moon-white, 0.03) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 70%, rgba($moon-white, 0.03) 0%, transparent 40%);
    // 纸张纤维纹理通过 noise 模拟
    filter: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E#noise");
    opacity: 0.03;
    mix-blend-mode: overlay;
  }

  .moon-glow {
    position: absolute;
    top: 8%;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 400px;
    background: radial-gradient(circle,
        rgba($moon-white, calc(0.15 * var(--moon-breath))) 0%,
        rgba($candle-yellow, calc(0.08 * var(--moon-breath))) 30%,
        transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
    animation: moonPulse 10s ease-in-out infinite;
  }

  .moon-core {
    position: absolute;
    top: 12%;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: radial-gradient(circle,
        rgba($moon-white, calc(0.9 * var(--moon-breath))) 0%,
        rgba($candle-yellow, calc(0.6 * var(--moon-breath))) 50%,
        transparent 100%);
    border-radius: 50%;
    filter: blur(8px);
    box-shadow:
      0 0 60px rgba($moon-white, 0.3),
      0 0 120px rgba($candle-yellow, 0.2);
  }
}

@keyframes moonPulse {

  0%,
  100% {
    opacity: 0.9;
    transform: translateX(-50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.05);
  }
}

// 远景：层峦剪影
.mountain-layer {
  position: absolute;
  inset: 0;
  transition: transform 0.3s ease-out;

  .mountain {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    filter: drop-shadow(0 4px 8px $paper-shadow);
  }

  .mountain-far {
    height: 40%;
    background: linear-gradient(to bottom,
        rgba(40, 50, 80, 0.3) 0%,
        rgba(30, 35, 55, 0.5) 100%);
    clip-path: polygon(0% 100%,
        0% 70%,
        10% 55%,
        20% 65%,
        35% 45%,
        50% 60%,
        65% 40%,
        80% 55%,
        90% 50%,
        100% 60%,
        100% 100%);
    opacity: 0.6;
  }

  .mountain-mid {
    height: 35%;
    background: linear-gradient(to bottom,
        rgba(35, 40, 65, 0.5) 0%,
        rgba(25, 28, 45, 0.7) 100%);
    clip-path: polygon(0% 100%,
        0% 65%,
        15% 50%,
        30% 60%,
        45% 40%,
        60% 55%,
        75% 35%,
        90% 50%,
        100% 45%,
        100% 100%);
    opacity: 0.75;
  }

  .mountain-near {
    height: 28%;
    background: linear-gradient(to bottom,
        rgba(28, 32, 50, 0.7) 0%,
        rgba(20, 22, 35, 0.9) 100%);
    clip-path: polygon(0% 100%,
        0% 55%,
        12% 45%,
        25% 55%,
        40% 35%,
        55% 50%,
        70% 30%,
        85% 45%,
        100% 40%,
        100% 100%);
    opacity: 0.9;
  }

  // 云纹剪影
  .cloud-pattern {
    position: absolute;
    background: rgba(50, 60, 90, 0.2);
    border-radius: 50%;
    filter: blur(20px);
  }

  .cloud-1 {
    top: 25%;
    left: 10%;
    width: 200px;
    height: 60px;
    animation: cloudDrift 30s ease-in-out infinite;
  }

  .cloud-2 {
    top: 30%;
    right: 15%;
    width: 150px;
    height: 45px;
    animation: cloudDrift 25s ease-in-out infinite reverse;
  }

  .cloud-3 {
    top: 35%;
    left: 40%;
    width: 180px;
    height: 50px;
    animation: cloudDrift 35s ease-in-out infinite;
    animation-delay: -10s;
  }
}

@keyframes cloudDrift {

  0%,
  100% {
    transform: translateX(0);
    opacity: 0.4;
  }

  50% {
    transform: translateX(30px);
    opacity: 0.6;
  }
}

// 中层：园林与枯木
.garden-layer {
  position: absolute;
  inset: 0;
  transition: transform 0.2s ease-out;

  .pavilion {
    position: absolute;
    filter: drop-shadow(0 6px 12px $paper-shadow);
  }

  .pavilion-left {
    left: 5%;
    bottom: 15%;
    width: 180px;
    height: auto;
    opacity: 0.9;
  }

  .pine-tree {
    position: absolute;
    filter: drop-shadow(0 6px 12px $paper-shadow);
  }

  .pine-right {
    right: 8%;
    bottom: 10%;
    width: 150px;
    height: auto;
    opacity: 0.85;
  }

  .dead-branch {
    position: absolute;
    filter: drop-shadow(0 4px 8px $paper-shadow);
  }

  .branch-center {
    left: 30%;
    bottom: 25%;
    width: 250px;
    height: auto;
    opacity: 0.7;
  }
}

// 近景：摇曳边框
.foreground-layer {
  position: absolute;
  inset: 0;
  transition: transform 0.15s ease-out;
  filter: blur(2px); // 景深模糊
}

// 垂柳
.willow {
  position: absolute;

  .willow-svg {
    width: 100%;
    height: 100%;
  }

  .willow-branch {
    transform-origin: top center;
  }

  .branch-1 {
    animation: willowSway 5s ease-in-out infinite;
  }

  .branch-2 {
    animation: willowSway 6s ease-in-out infinite;
    animation-delay: -1s;
  }

  .branch-3 {
    animation: willowSway 5.5s ease-in-out infinite;
    animation-delay: -2s;
  }

  .branch-4 {
    animation: willowSwayReverse 5.2s ease-in-out infinite;
  }

  .branch-5 {
    animation: willowSwayReverse 6.2s ease-in-out infinite;
    animation-delay: -0.5s;
  }

  .branch-6 {
    animation: willowSwayReverse 5.8s ease-in-out infinite;
    animation-delay: -1.5s;
  }

  .branch-7 {
    animation: willowSwayBottom 4.5s ease-in-out infinite;
    transform-origin: bottom center;
  }

  .branch-8 {
    animation: willowSwayBottom 5s ease-in-out infinite;
    animation-delay: -1s;
    transform-origin: bottom center;
  }

  .branch-9 {
    animation: willowSway 5.5s ease-in-out infinite;
    animation-delay: -0.8s;
  }

  .branch-10 {
    animation: willowSway 6s ease-in-out infinite;
    animation-delay: -2.5s;
  }
}

.willow-left {
  top: 0;
  left: 0;
  width: 200px;
  height: 400px;
}

.willow-right {
  top: 0;
  right: 0;
  width: 200px;
  height: 400px;
}

.willow-bottom-left {
  bottom: 0;
  left: 5%;
  width: 180px;
  height: 300px;
}

.willow-top-center {
  top: 0;
  left: 35%;
  width: 150px;
  height: 350px;
  opacity: 0.7;
}

@keyframes willowSway {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(2deg);
  }

  75% {
    transform: rotate(-2deg);
  }
}

@keyframes willowSwayReverse {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-2deg);
  }

  75% {
    transform: rotate(2deg);
  }
}

@keyframes willowSwayBottom {

  0%,
  100% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(1.5deg);
  }
}

// 灯笼组
.lantern-group {
  position: absolute;
  display: flex;
  gap: 30px;
}

.lantern-group-right {
  right: 10%;
  bottom: 20%;
}

.lantern-group-left {
  left: 8%;
  top: 35%;
  flex-direction: column;
  gap: 20px;
}

.lantern-group-top {
  top: 15%;
  right: 25%;
}

.lantern-group-top-center {
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  gap: 40px;
}

.lantern-group-right-mid {
  right: 5%;
  top: 45%;
  flex-direction: column;
  gap: 25px;
}

.lantern-group-bottom-left {
  left: 15%;
  bottom: 10%;
  gap: 25px;
}

.lantern-group-bottom-center {
  bottom: 8%;
  left: 40%;
  gap: 35px;
}

.lantern {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: top center;
  filter: drop-shadow(0 4px 12px rgba(255, 100, 50, 0.3));

  .lantern-top {
    width: 20px;
    height: 8px;
    background: $paper-dark;
    border-radius: 2px 2px 0 0;
  }

  .lantern-body {
    width: 35px;
    height: 50px;
    background: linear-gradient(to bottom,
        rgba(180, 60, 50, 0.7) 0%,
        rgba(200, 80, 60, 0.8) 50%,
        rgba(180, 60, 50, 0.7) 100%);
    border-radius: 8px;
    position: relative;
    overflow: hidden;

    .lantern-glow {
      position: absolute;
      inset: 5px;
      background: radial-gradient(ellipse,
          rgba($candle-yellow, 0.6) 0%,
          rgba(255, 180, 100, 0.3) 50%,
          transparent 100%);
      border-radius: 6px;
      animation: lanternGlow 3s ease-in-out infinite;
    }
  }

  .lantern-bottom {
    width: 20px;
    height: 8px;
    background: $paper-dark;
    border-radius: 0 0 2px 2px;
  }

  .lantern-tassel {
    width: 2px;
    height: 25px;
    background: linear-gradient(to bottom, rgba(180, 60, 50, 0.8), rgba(180, 60, 50, 0.4));
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 15px;
      background: linear-gradient(to bottom, rgba(180, 60, 50, 0.7), transparent);
      border-radius: 0 0 6px 6px;
    }
  }
}

.lantern-1 {
  animation: lanternSwing 4s ease-in-out infinite;
}

.lantern-2 {
  animation: lanternSwing 4.5s ease-in-out infinite;
  animation-delay: -1s;
  transform: scale(0.85);
}

.lantern-3 {
  animation: lanternSwing 3.8s ease-in-out infinite;
  animation-delay: -2s;
  transform: scale(0.75);
}

.lantern-4 {
  animation: lanternSwing 4.2s ease-in-out infinite;
  animation-delay: -0.5s;
  transform: scale(0.9);
}

.lantern-5 {
  animation: lanternSwing 4.8s ease-in-out infinite;
  animation-delay: -1.5s;
  transform: scale(0.75);
}

.lantern-6 {
  animation: lanternSwing 5s ease-in-out infinite;
  animation-delay: -2.5s;
  transform: scale(0.8);
}

.lantern-7 {
  animation: lanternSwing 4.3s ease-in-out infinite;
  animation-delay: -0.8s;
  transform: scale(0.85);
}

.lantern-8 {
  animation: lanternSwing 4.7s ease-in-out infinite;
  animation-delay: -1.8s;
  transform: scale(0.7);
}

.lantern-9 {
  animation: lanternSwing 5.2s ease-in-out infinite;
  animation-delay: -3s;
  transform: scale(0.75);
}

.lantern-10 {
  animation: lanternSwing 4.1s ease-in-out infinite;
  animation-delay: -0.3s;
  transform: scale(0.82);
}

.lantern-11 {
  animation: lanternSwing 4.6s ease-in-out infinite;
  animation-delay: -2.2s;
  transform: scale(0.68);
}

.lantern-12 {
  animation: lanternSwing 3.9s ease-in-out infinite;
  animation-delay: -1.2s;
  transform: scale(0.78);
}

.lantern-13 {
  animation: lanternSwing 4.4s ease-in-out infinite;
  animation-delay: -2.8s;
  transform: scale(0.65);
}

.lantern-14 {
  animation: lanternSwing 4.9s ease-in-out infinite;
  animation-delay: -0.6s;
  transform: scale(0.88);
}

.lantern-15 {
  animation: lanternSwing 5.1s ease-in-out infinite;
  animation-delay: -1.4s;
  transform: scale(0.72);
}

.lantern-16 {
  animation: lanternSwing 4s ease-in-out infinite;
  animation-delay: -2s;
  transform: scale(0.8);
}

@keyframes lanternSwing {

  0%,
  100% {
    transform: rotate(-3deg);
  }

  50% {
    transform: rotate(3deg);
  }
}

@keyframes lanternGlow {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

// 松针簇
.pine-needle-cluster {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 150px;
  height: 200px;
  opacity: 0.6;

  .pine-needle-svg {
    width: 100%;
    height: 100%;
  }

  .pine-needles {
    animation: pineNeedleSway 6s ease-in-out infinite;
    transform-origin: bottom center;
  }
}

@keyframes pineNeedleSway {

  0%,
  100% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(1deg);
  }
}

// 远处灯笼点缀
.distant-lanterns {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .distant-lantern {
    position: absolute;
    width: 8px;
    height: 12px;
    background: radial-gradient(ellipse,
        rgba(255, 150, 80, 0.6) 0%,
        rgba(255, 100, 50, 0.3) 50%,
        transparent 100%);
    border-radius: 30%;
    filter: blur(2px);
    animation: distantLanternGlow 4s ease-in-out infinite;
  }

  .dl-1 {
    left: 25%;
    bottom: 35%;
    animation-delay: 0s;
  }

  .dl-2 {
    left: 45%;
    bottom: 40%;
    animation-delay: -1.5s;
    transform: scale(0.7);
  }

  .dl-3 {
    right: 30%;
    bottom: 38%;
    animation-delay: -3s;
    transform: scale(0.85);
  }
}

@keyframes distantLanternGlow {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.7;
  }
}

// 粒子画布
.particle-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

// 纸张纹理叠加层
.paper-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
}

// 暗角遮罩
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.3) 80%,
      rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
}
</style>
