<template>
  <div class="gothic-background" :class="{ embedded: embedded }" ref="containerRef" @mousemove="handleMouseMove">
    <!-- 底层：镜面黑曜石地面 -->
    <div class="obsidian-floor">
      <div class="floor-surface"></div>
      <div class="floor-reflection"></div>
      <div class="floor-shimmer"></div>
    </div>

    <!-- 底层：深邃渐变背景 -->
    <div class="sanctuary-bg"></div>

    <!-- 远景：尖顶剪影与迷雾 -->
    <div class="spire-layer">
      <div class="spire spire-1"></div>
      <div class="spire spire-2"></div>
      <div class="spire spire-3"></div>
      <div class="spire spire-4"></div>
      <div class="spire spire-5"></div>
      <div class="spire spire-6"></div>
      <div class="flying-buttress buttress-1"></div>
      <div class="flying-buttress buttress-2"></div>
      <div class="arch arch-1"></div>
      <div class="arch arch-2"></div>
    </div>

    <!-- 流动薄雾 - 增强版 -->
    <div class="mist-layer">
      <div class="mist mist-1"></div>
      <div class="mist mist-2"></div>
      <div class="mist mist-3"></div>
      <div class="mist mist-4"></div>
      <div class="mist mist-5"></div>
      <div class="ground-fog"></div>
    </div>

    <!-- 中层：悬浮玫瑰花窗 -->
    <div class="rose-windows-layer" :style="parallaxStyle">
      <!-- 中央主花窗 -->
      <div class="rose-window main-window">
        <svg viewBox="0 0 200 200" class="window-svg">
          <!-- 外圈装饰 -->
          <circle cx="100" cy="100" r="98" fill="none" stroke="rgba(197, 160, 89, 0.4)" stroke-width="1" />
          <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(114, 14, 30, 0.6)" stroke-width="2" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(15, 44, 103, 0.6)" stroke-width="1" />

          <!-- 中心圆 -->
          <circle cx="100" cy="100" r="15" fill="rgba(114, 14, 30, 0.4)" />
          <circle cx="100" cy="100" r="10" fill="rgba(197, 160, 89, 0.3)" />

          <!-- 花瓣放射线 -->
          <g class="petals">
            <path v-for="i in 12" :key="i" :d="getPetalPath(i)"
              :fill="i % 2 === 0 ? 'rgba(114, 14, 30, 0.3)' : 'rgba(15, 44, 103, 0.3)'"
              :stroke="i % 2 === 0 ? 'rgba(114, 14, 30, 0.6)' : 'rgba(15, 44, 103, 0.6)'" stroke-width="0.8" />
          </g>

          <!-- 内部几何图案 -->
          <g class="inner-pattern">
            <circle v-for="j in 6" :key="j" :cx="100 + 40 * Math.cos((j - 1) * Math.PI / 3)"
              :cy="100 + 40 * Math.sin((j - 1) * Math.PI / 3)" r="18" fill="rgba(114, 14, 30, 0.2)"
              stroke="rgba(197, 160, 89, 0.5)" stroke-width="0.8" />
          </g>

          <!-- 装饰外环 -->
          <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(197, 160, 89, 0.4)" stroke-width="1.5" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="rgba(197, 160, 89, 0.3)" stroke-width="0.8" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(197, 160, 89, 0.2)" stroke-width="0.5" />
        </svg>
        <div class="window-glow"></div>
        <div class="window-rays"></div>
      </div>

      <!-- 左侧小花窗 -->
      <div class="rose-window side-window left">
        <svg viewBox="0 0 100 100" class="window-svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(197, 160, 89, 0.3)" stroke-width="0.5" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(15, 44, 103, 0.6)" stroke-width="1.5" />
          <circle cx="50" cy="50" r="10" fill="rgba(15, 44, 103, 0.4)" />
          <g class="small-petals">
            <path v-for="i in 8" :key="i" :d="getSmallPetalPath(i)" fill="rgba(15, 44, 103, 0.25)"
              stroke="rgba(15, 44, 103, 0.5)" stroke-width="0.5" />
          </g>
        </svg>
        <div class="window-glow blue"></div>
      </div>

      <!-- 右侧小花窗 -->
      <div class="rose-window side-window right">
        <svg viewBox="0 0 100 100" class="window-svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(197, 160, 89, 0.3)" stroke-width="0.5" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(114, 14, 30, 0.6)" stroke-width="1.5" />
          <circle cx="50" cy="50" r="10" fill="rgba(114, 14, 30, 0.4)" />
          <g class="small-petals">
            <path v-for="i in 8" :key="i" :d="getSmallPetalPath(i)" fill="rgba(114, 14, 30, 0.25)"
              stroke="rgba(114, 14, 30, 0.5)" stroke-width="0.5" />
          </g>
        </svg>
        <div class="window-glow red"></div>
      </div>

      <!-- 左下小花窗 - 快速旋转 -->
      <div class="rose-window lower-window lower-left">
        <svg viewBox="0 0 100 100" class="window-svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(197, 160, 89, 0.35)" stroke-width="0.8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(138, 43, 226, 0.5)" stroke-width="1.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="0.5" />
          <circle cx="50" cy="50" r="12" fill="rgba(138, 43, 226, 0.35)" />
          <circle cx="50" cy="50" r="6" fill="rgba(197, 160, 89, 0.4)" />
          <g class="small-petals">
            <path v-for="i in 8" :key="i" :d="getSmallPetalPath(i)" fill="rgba(138, 43, 226, 0.2)"
              stroke="rgba(138, 43, 226, 0.45)" stroke-width="0.5" />
          </g>
        </svg>
        <div class="window-glow purple"></div>
      </div>

      <!-- 右下小花窗 - 快速旋转 -->
      <div class="rose-window lower-window lower-right">
        <svg viewBox="0 0 100 100" class="window-svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(197, 160, 89, 0.35)" stroke-width="0.8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(197, 160, 89, 0.5)" stroke-width="1.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(114, 14, 30, 0.25)" stroke-width="0.5" />
          <circle cx="50" cy="50" r="12" fill="rgba(197, 160, 89, 0.35)" />
          <circle cx="50" cy="50" r="6" fill="rgba(114, 14, 30, 0.4)" />
          <g class="small-petals">
            <path v-for="i in 8" :key="i" :d="getSmallPetalPath(i)" fill="rgba(197, 160, 89, 0.2)"
              stroke="rgba(197, 160, 89, 0.45)" stroke-width="0.5" />
          </g>
        </svg>
        <div class="window-glow gold"></div>
      </div>
    </div>

    <!-- 近景：烛光效果 - 增强版 -->
    <div class="candlelight-layer">
      <!-- 主烛光 -->
      <div class="candle-glow candle-1"></div>
      <div class="candle-glow candle-2"></div>
      <div class="candle-glow candle-3"></div>
      <div class="candle-glow candle-4"></div>
      <!-- 辅助烛光 -->
      <div class="candle-glow candle-5"></div>
      <div class="candle-glow candle-6"></div>
      <div class="candle-glow candle-7"></div>
      <div class="candle-glow candle-8"></div>
      <!-- 烛火火焰 -->
      <div class="candle-flame flame-1"></div>
      <div class="candle-flame flame-2"></div>
      <div class="candle-flame flame-3"></div>
      <div class="candle-flame flame-4"></div>
      <!-- 光柱效果 -->
      <div class="light-beam beam-1"></div>
      <div class="light-beam beam-2"></div>
    </div>

    <!-- 尘埃粒子 Canvas -->
    <canvas ref="dustCanvas" class="dust-canvas"></canvas>

    <!-- 流萤 Canvas -->
    <canvas ref="fireflyCanvas" class="firefly-canvas"></canvas>

    <!-- 装饰元素：哥特式边角 - 增强版 -->
    <div class="gothic-corners">
      <div class="corner corner-tl">
        <svg viewBox="0 0 120 120">
          <!-- 外框 -->
          <path d="M0 0 L120 0 L120 8 L8 8 L8 120 L0 120 Z" fill="rgba(197, 160, 89, 0.2)" />
          <!-- 内框 -->
          <path d="M15 15 L70 15 L70 18 L18 18 L18 70 L15 70 Z" fill="rgba(197, 160, 89, 0.15)" />
          <!-- 装饰线 -->
          <path d="M25 25 L50 25 L50 27 L27 27 L27 50 L25 50 Z" fill="rgba(197, 160, 89, 0.1)" />
          <!-- 装饰圆点 -->
          <circle cx="30" cy="30" r="4" fill="rgba(197, 160, 89, 0.3)" />
          <circle cx="45" cy="15" r="2" fill="rgba(197, 160, 89, 0.2)" />
          <circle cx="15" cy="45" r="2" fill="rgba(197, 160, 89, 0.2)" />
          <!-- 花纹装饰 -->
          <path d="M40 8 Q45 15 50 8" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="1" />
          <path d="M8 40 Q15 45 8 50" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="1" />
          <!-- 菱形装饰 -->
          <path d="M60 12 L65 8 L70 12 L65 16 Z" fill="rgba(197, 160, 89, 0.15)" />
          <path d="M12 60 L8 65 L12 70 L16 65 Z" fill="rgba(197, 160, 89, 0.15)" />
        </svg>
      </div>
      <div class="corner corner-tr">
        <svg viewBox="0 0 120 120">
          <path d="M120 0 L0 0 L0 8 L112 8 L112 120 L120 120 Z" fill="rgba(197, 160, 89, 0.2)" />
          <path d="M105 15 L50 15 L50 18 L102 18 L102 70 L105 70 Z" fill="rgba(197, 160, 89, 0.15)" />
          <path d="M95 25 L70 25 L70 27 L93 27 L93 50 L95 50 Z" fill="rgba(197, 160, 89, 0.1)" />
          <circle cx="90" cy="30" r="4" fill="rgba(197, 160, 89, 0.3)" />
          <circle cx="75" cy="15" r="2" fill="rgba(197, 160, 89, 0.2)" />
          <circle cx="105" cy="45" r="2" fill="rgba(197, 160, 89, 0.2)" />
          <path d="M80 8 Q75 15 70 8" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="1" />
          <path d="M112 40 Q105 45 112 50" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="1" />
          <path d="M60 12 L55 8 L50 12 L55 16 Z" fill="rgba(197, 160, 89, 0.15)" />
          <path d="M108 60 L112 65 L108 70 L104 65 Z" fill="rgba(197, 160, 89, 0.15)" />
        </svg>
      </div>
      <div class="corner corner-bl">
        <svg viewBox="0 0 120 120">
          <path d="M0 120 L120 120 L120 112 L8 112 L8 0 L0 0 Z" fill="rgba(197, 160, 89, 0.2)" />
          <path d="M15 105 L70 105 L70 102 L18 102 L18 50 L15 50 Z" fill="rgba(197, 160, 89, 0.15)" />
          <path d="M25 95 L50 95 L50 93 L27 93 L27 70 L25 70 Z" fill="rgba(197, 160, 89, 0.1)" />
          <circle cx="30" cy="90" r="4" fill="rgba(197, 160, 89, 0.3)" />
          <circle cx="45" cy="105" r="2" fill="rgba(197, 160, 89, 0.2)" />
          <circle cx="15" cy="75" r="2" fill="rgba(197, 160, 89, 0.2)" />
          <path d="M40 112 Q45 105 50 112" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="1" />
          <path d="M8 80 Q15 75 8 70" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="1" />
          <path d="M60 108 L65 112 L70 108 L65 104 Z" fill="rgba(197, 160, 89, 0.15)" />
          <path d="M12 60 L8 55 L12 50 L16 55 Z" fill="rgba(197, 160, 89, 0.15)" />
        </svg>
      </div>
      <div class="corner corner-br">
        <svg viewBox="0 0 120 120">
          <path d="M120 120 L0 120 L0 112 L112 112 L112 0 L120 0 Z" fill="rgba(197, 160, 89, 0.2)" />
          <path d="M105 105 L50 105 L50 102 L102 102 L102 50 L105 50 Z" fill="rgba(197, 160, 89, 0.15)" />
          <path d="M95 95 L70 95 L70 93 L93 93 L93 70 L95 70 Z" fill="rgba(197, 160, 89, 0.1)" />
          <circle cx="90" cy="90" r="4" fill="rgba(197, 160, 89, 0.3)" />
          <circle cx="75" cy="105" r="2" fill="rgba(197, 160, 89, 0.2)" />
          <circle cx="105" cy="75" r="2" fill="rgba(197, 160, 89, 0.2)" />
          <path d="M80 112 Q75 105 70 112" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="1" />
          <path d="M112 80 Q105 75 112 70" fill="none" stroke="rgba(197, 160, 89, 0.25)" stroke-width="1" />
          <path d="M60 108 L55 112 L50 108 L55 104 Z" fill="rgba(197, 160, 89, 0.15)" />
          <path d="M108 60 L112 55 L108 50 L104 55 Z" fill="rgba(197, 160, 89, 0.15)" />
        </svg>
      </div>
    </div>

    <!-- 哥特式边框装饰 -->
    <div class="gothic-border">
      <div class="border-top"></div>
      <div class="border-bottom"></div>
      <div class="border-left"></div>
      <div class="border-right"></div>
    </div>

    <!-- 悬浮蜡烛台装饰 -->
    <div class="candelabra candelabra-left">
      <div class="candelabra-arm"></div>
      <div class="candelabra-flame"></div>
    </div>
    <div class="candelabra candelabra-right">
      <div class="candelabra-arm"></div>
      <div class="candelabra-flame"></div>
    </div>

    <!-- 顶层：暗角遮罩 - 增强版 -->
    <div class="vignette-overlay"></div>
    <div class="vignette-gradient"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Props
defineProps<{
  embedded?: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)
const dustCanvas = ref<HTMLCanvasElement | null>(null)
const fireflyCanvas = ref<HTMLCanvasElement | null>(null)

// 鼠标位置用于视差效果
const mouseX = ref(0.5)
const mouseY = ref(0.5)

// 视差偏移量
const parallaxStyle = computed(() => ({
  transform: `translate(${(mouseX.value - 0.5) * -12}px, ${(mouseY.value - 0.5) * -12}px)`
}))

// 鼠标移动处理
const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  mouseX.value = (e.clientX - rect.left) / rect.width
  mouseY.value = (e.clientY - rect.top) / rect.height
}

// 生成花窗花瓣路径
const getPetalPath = (index: number) => {
  const angle = ((index - 1) * 30) * Math.PI / 180
  const nextAngle = (index * 30) * Math.PI / 180
  const innerR = 20
  const outerR = 70

  const x1 = 100 + innerR * Math.cos(angle)
  const y1 = 100 + innerR * Math.sin(angle)
  const x2 = 100 + outerR * Math.cos(angle + 0.1)
  const y2 = 100 + outerR * Math.sin(angle + 0.1)
  const x3 = 100 + outerR * Math.cos(nextAngle - 0.1)
  const y3 = 100 + outerR * Math.sin(nextAngle - 0.1)
  const x4 = 100 + innerR * Math.cos(nextAngle)
  const y4 = 100 + innerR * Math.sin(nextAngle)

  return `M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} L${x4} ${y4} Z`
}

// 生成小花窗花瓣路径
const getSmallPetalPath = (index: number) => {
  const angle = ((index - 1) * 45) * Math.PI / 180
  const nextAngle = (index * 45) * Math.PI / 180
  const innerR = 12
  const outerR = 38

  const x1 = 50 + innerR * Math.cos(angle)
  const y1 = 50 + innerR * Math.sin(angle)
  const x2 = 50 + outerR * Math.cos(angle + 0.15)
  const y2 = 50 + outerR * Math.sin(angle + 0.15)
  const x3 = 50 + outerR * Math.cos(nextAngle - 0.15)
  const y3 = 50 + outerR * Math.sin(nextAngle - 0.15)
  const x4 = 50 + innerR * Math.cos(nextAngle)
  const y4 = 50 + innerR * Math.sin(nextAngle)

  return `M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} L${x4} ${y4} Z`
}

// 尘埃粒子系统 - 增强版
interface DustParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  opacitySpeed: number
  inLight: boolean
  type: 'dust' | 'ember' | 'sparkle'
  life: number
  maxLife: number
}

let dustParticles: DustParticle[] = []
let dustAnimationId: number | null = null

const initDustSystem = () => {
  const canvas = dustCanvas.value
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

  // 光柱区域 - 更多烛光区域
  const lightZones = [
    { x: 0.08, y: 0.92, radius: 0.18 },
    { x: 0.92, y: 0.92, radius: 0.18 },
    { x: 0.25, y: 0.88, radius: 0.15 },
    { x: 0.75, y: 0.88, radius: 0.15 },
    { x: 0.15, y: 0.85, radius: 0.12 },
    { x: 0.85, y: 0.85, radius: 0.12 },
    { x: 0.5, y: 0.3, radius: 0.2 }, // 花窗光柱
    { x: 0.1, y: 0.25, radius: 0.1 },
    { x: 0.9, y: 0.25, radius: 0.1 },
  ]

  // 创建尘埃粒子 - 不同类型
  const createParticle = (): DustParticle => {
    const type = Math.random() > 0.85 ? (Math.random() > 0.5 ? 'ember' : 'sparkle') : 'dust'
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: type === 'ember' ? -Math.random() * 0.8 - 0.3 : -Math.random() * 0.15 - 0.03,
      size: type === 'sparkle' ? Math.random() * 1.5 + 0.5 : (type === 'ember' ? Math.random() * 3 + 1 : Math.random() * 2.5 + 0.8),
      opacity: 0,
      opacitySpeed: (Math.random() * 0.015 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
      inLight: false,
      type,
      life: 0,
      maxLife: type === 'ember' ? 150 : (type === 'sparkle' ? 80 : 300)
    }
  }

  // 初始化粒子 - 增加数量
  for (let i = 0; i < 200; i++) {
    const p = createParticle()
    p.opacity = Math.random() * 0.3
    dustParticles.push(p)
  }

  // 检查粒子是否在光柱中
  const isInLight = (x: number, y: number): boolean => {
    for (const zone of lightZones) {
      const dx = x / canvas.width - zone.x
      const dy = y / canvas.height - zone.y
      if (Math.sqrt(dx * dx + dy * dy) < zone.radius) {
        return true
      }
    }
    return false
  }

  // 动画循环
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    dustParticles.forEach((particle, index) => {
      particle.life++

      // Perlin 噪声模拟
      particle.vx += (Math.random() - 0.5) * 0.025
      particle.vy += (Math.random() - 0.5) * 0.015

      // 余烬有更强的上升力
      if (particle.type === 'ember') {
        particle.vy -= 0.005
      }

      // 限制速度
      particle.vx = Math.max(-0.6, Math.min(0.6, particle.vx))
      particle.vy = Math.max(-0.8, Math.min(0.15, particle.vy))

      particle.x += particle.vx
      particle.y += particle.vy

      // 检查是否在光柱中
      particle.inLight = isInLight(particle.x, particle.y)

      // 透明度呼吸效果
      if (particle.inLight) {
        const maxOpacity = particle.type === 'ember' ? 1 : (particle.type === 'sparkle' ? 0.9 : 0.7)
        particle.opacity += particle.opacitySpeed * 2.5
        if (particle.opacity >= maxOpacity) {
          particle.opacity = maxOpacity
          particle.opacitySpeed = -Math.abs(particle.opacitySpeed)
        } else if (particle.opacity <= 0.25) {
          particle.opacity = 0.25
          particle.opacitySpeed = Math.abs(particle.opacitySpeed)
        }
      } else {
        particle.opacity = Math.max(0, particle.opacity - 0.008)
      }

      // 生命周期结束或边界检查
      if (particle.life > particle.maxLife ||
        particle.x < -50 || particle.x > canvas.width + 50 ||
        particle.y < -50 || particle.y > canvas.height + 50) {
        dustParticles[index] = createParticle()
        dustParticles[index].y = canvas.height + 20
        dustParticles[index].x = Math.random() * canvas.width
      }

      // 绘制粒子
      if (particle.opacity > 0.05) {
        ctx.save()

        if (particle.type === 'ember') {
          // 余烬 - 橙红色发光
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
          )
          gradient.addColorStop(0, `rgba(255, 180, 80, ${particle.opacity})`)
          gradient.addColorStop(0.3, `rgba(255, 120, 40, ${particle.opacity * 0.7})`)
          gradient.addColorStop(1, 'transparent')

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
          ctx.fill()

          // 内核
          ctx.fillStyle = `rgba(255, 220, 150, ${particle.opacity})`
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
          ctx.fill()

        } else if (particle.type === 'sparkle') {
          // 闪光点 - 星芒效果
          ctx.strokeStyle = `rgba(255, 240, 200, ${particle.opacity})`
          ctx.lineWidth = 0.5
          const sparkleSize = particle.size * 3

          // 四向星芒
          ctx.beginPath()
          ctx.moveTo(particle.x - sparkleSize, particle.y)
          ctx.lineTo(particle.x + sparkleSize, particle.y)
          ctx.moveTo(particle.x, particle.y - sparkleSize)
          ctx.lineTo(particle.x, particle.y + sparkleSize)
          ctx.stroke()

          // 中心点
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2)
          ctx.fill()

        } else {
          // 普通尘埃
          const color = particle.inLight
            ? `rgba(255, 210, 140, ${particle.opacity})`
            : `rgba(160, 160, 180, ${particle.opacity * 0.4})`

          ctx.fillStyle = color
          ctx.shadowColor = particle.inLight ? 'rgba(255, 191, 0, 0.6)' : 'transparent'
          ctx.shadowBlur = particle.inLight ? 5 : 0

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }
    })

    dustAnimationId = requestAnimationFrame(animate)
  }

  animate()
}

// 流萤粒子系统
interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  pulsePhase: number
  pulseSpeed: number
  tailLength: number
  trail: { x: number; y: number; opacity: number }[]
}

let fireflies: Firefly[] = []
let fireflyAnimationId: number | null = null

const initFireflySystem = () => {
  const canvas = fireflyCanvas.value
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

  // 创建流萤
  const createFirefly = (): Firefly => {
    // 从右上方生成
    const startFromRight = Math.random() > 0.3
    const x = startFromRight
      ? canvas.width + Math.random() * 100
      : Math.random() * canvas.width * 0.5 + canvas.width * 0.5
    const y = startFromRight
      ? Math.random() * canvas.height * 0.4
      : -Math.random() * 50

    // 向左下方移动
    const speed = 1.5 + Math.random() * 2
    const angle = Math.PI * 0.65 + (Math.random() - 0.5) * 0.3 // 约135°方向

    return {
      x,
      y,
      vx: -Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      opacity: 0.6 + Math.random() * 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.05 + Math.random() * 0.05,
      tailLength: 15 + Math.floor(Math.random() * 15),
      trail: []
    }
  }

  // 初始化流萤
  for (let i = 0; i < 25; i++) {
    const ff = createFirefly()
    // 分散到屏幕各处
    ff.x = Math.random() * canvas.width
    ff.y = Math.random() * canvas.height
    fireflies.push(ff)
  }

  // 动画循环
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    fireflies.forEach((ff, index) => {
      // 更新位置
      ff.x += ff.vx
      ff.y += ff.vy

      // 添加微小的波动
      ff.x += Math.sin(ff.pulsePhase * 0.5) * 0.3
      ff.y += Math.cos(ff.pulsePhase * 0.7) * 0.2

      // 更新脉冲相位
      ff.pulsePhase += ff.pulseSpeed

      // 记录轨迹
      ff.trail.unshift({ x: ff.x, y: ff.y, opacity: ff.opacity })
      if (ff.trail.length > ff.tailLength) {
        ff.trail.pop()
      }

      // 超出屏幕则重置
      if (ff.x < -100 || ff.y > canvas.height + 100) {
        fireflies[index] = createFirefly()
      }

      // 计算当前亮度(呼吸效果)
      const breathe = 0.7 + Math.sin(ff.pulsePhase) * 0.3
      const currentOpacity = ff.opacity * breathe

      // 绘制尾迹
      ff.trail.forEach((point, i) => {
        const trailOpacity = currentOpacity * (1 - i / ff.trail.length) * 0.6
        const trailSize = ff.size * (1 - i / ff.trail.length * 0.7)

        if (trailOpacity > 0.02) {
          // 尾迹光晕
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, trailSize * 3
          )
          gradient.addColorStop(0, `rgba(255, 200, 100, ${trailOpacity})`)
          gradient.addColorStop(0.4, `rgba(255, 170, 50, ${trailOpacity * 0.5})`)
          gradient.addColorStop(1, 'transparent')

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, trailSize * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // 绘制流萤本体
      // 外层光晕
      const outerGlow = ctx.createRadialGradient(
        ff.x, ff.y, 0,
        ff.x, ff.y, ff.size * 8
      )
      outerGlow.addColorStop(0, `rgba(255, 191, 0, ${currentOpacity * 0.4})`)
      outerGlow.addColorStop(0.3, `rgba(255, 160, 50, ${currentOpacity * 0.2})`)
      outerGlow.addColorStop(0.6, `rgba(255, 140, 30, ${currentOpacity * 0.08})`)
      outerGlow.addColorStop(1, 'transparent')

      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(ff.x, ff.y, ff.size * 8, 0, Math.PI * 2)
      ctx.fill()

      // 中层光晕
      const midGlow = ctx.createRadialGradient(
        ff.x, ff.y, 0,
        ff.x, ff.y, ff.size * 4
      )
      midGlow.addColorStop(0, `rgba(255, 210, 120, ${currentOpacity * 0.7})`)
      midGlow.addColorStop(0.5, `rgba(255, 180, 80, ${currentOpacity * 0.4})`)
      midGlow.addColorStop(1, 'transparent')

      ctx.fillStyle = midGlow
      ctx.beginPath()
      ctx.arc(ff.x, ff.y, ff.size * 4, 0, Math.PI * 2)
      ctx.fill()

      // 核心亮点
      const coreGlow = ctx.createRadialGradient(
        ff.x, ff.y, 0,
        ff.x, ff.y, ff.size * 1.5
      )
      coreGlow.addColorStop(0, `rgba(255, 250, 220, ${currentOpacity})`)
      coreGlow.addColorStop(0.3, `rgba(255, 230, 150, ${currentOpacity * 0.9})`)
      coreGlow.addColorStop(1, `rgba(255, 200, 100, ${currentOpacity * 0.5})`)

      ctx.fillStyle = coreGlow
      ctx.beginPath()
      ctx.arc(ff.x, ff.y, ff.size * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // 最亮的中心点
      ctx.fillStyle = `rgba(255, 255, 240, ${currentOpacity})`
      ctx.beginPath()
      ctx.arc(ff.x, ff.y, ff.size * 0.4, 0, Math.PI * 2)
      ctx.fill()
    })

    fireflyAnimationId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(() => {
  initDustSystem()
  initFireflySystem()
})

onUnmounted(() => {
  if (dustAnimationId) {
    cancelAnimationFrame(dustAnimationId)
  }
  if (fireflyAnimationId) {
    cancelAnimationFrame(fireflyAnimationId)
  }
})
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "sass:math";

// 暗夜哥特色板
$obsidian-dark: #050505;
$charcoal: #121212;
$amber-gold: #ffbf00;
$warm-amber: #ff9f1c;
$deep-ruby: #720e1e;
$royal-sapphire: #0f2c67;
$antique-gold: #C5A059;
$pale-gold: #D4C5A0;
$silver-mist: rgba(200, 195, 210, 0.2);
$warm-mist: rgba(255, 220, 180, 0.08);

.gothic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;

  &.embedded {
    position: absolute;
    z-index: 0;
  }
}

// 圣所渐变背景
.sanctuary-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 20%, rgba($deep-ruby, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 20% 80%, rgba($amber-gold, 0.05) 0%, transparent 40%),
    radial-gradient(ellipse at 80% 80%, rgba($amber-gold, 0.05) 0%, transparent 40%),
    linear-gradient(180deg,
      $obsidian-dark 0%,
      $charcoal 25%,
      color.adjust($charcoal, $lightness: -2%) 50%,
      color.adjust($charcoal, $lightness: -4%) 75%,
      $obsidian-dark 100%);
}

// 镜面黑曜石地面
.obsidian-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  perspective: 1000px;

  .floor-surface {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
        transparent 0%,
        rgba(8, 8, 10, 0.95) 25%,
        $obsidian-dark 100%);
    transform: rotateX(65deg);
    transform-origin: center bottom;
  }

  .floor-reflection {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 30%, rgba($amber-gold, 0.08) 0%, transparent 50%),
      linear-gradient(180deg,
        rgba($deep-ruby, 0.08) 0%,
        rgba($royal-sapphire, 0.05) 40%,
        rgba($amber-gold, 0.03) 80%,
        transparent 100%);
    transform: rotateX(65deg) scaleY(-1);
    transform-origin: center bottom;
    opacity: 0.4;
    filter: blur(12px);
    animation: reflectionPulse 6s ease-in-out infinite;
  }

  .floor-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba($antique-gold, 0.02) 25%,
        rgba($antique-gold, 0.04) 50%,
        rgba($antique-gold, 0.02) 75%,
        transparent 100%);
    transform: rotateX(65deg);
    transform-origin: center bottom;
    animation: shimmerDrift 15s ease-in-out infinite;
  }
}

@keyframes reflectionPulse {

  0%,
  100% {
    opacity: 0.35;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes shimmerDrift {

  0%,
  100% {
    transform: rotateX(65deg) translateX(-20%);
  }

  50% {
    transform: rotateX(65deg) translateX(20%);
  }
}

// 尖顶剪影层
.spire-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.spire {
  position: absolute;
  bottom: 30%;
  background: linear-gradient(to top,
      rgba(8, 8, 12, 0.98) 0%,
      rgba(15, 15, 22, 0.95) 100%);

  &::before {
    content: '';
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-bottom: 60px solid rgba(8, 8, 12, 0.98);
  }

  &::after {
    content: '';
    position: absolute;
    top: -75px;
    left: 50%;
    width: 6px;
    height: 20px;
    background: linear-gradient(to top, rgba(8, 8, 12, 0.95), rgba(20, 20, 30, 0.9));
    transform: translateX(-50%);
  }

  &.spire-1 {
    left: 3%;
    width: 45px;
    height: 200px;
    opacity: 0.85;
  }

  &.spire-2 {
    left: 10%;
    width: 38px;
    height: 250px;
    opacity: 0.75;
  }

  &.spire-3 {
    right: 5%;
    width: 50px;
    height: 220px;
    opacity: 0.8;
  }

  &.spire-4 {
    right: 12%;
    width: 35px;
    height: 180px;
    opacity: 0.7;
  }

  &.spire-5 {
    left: 18%;
    width: 30px;
    height: 150px;
    opacity: 0.6;
  }

  &.spire-6 {
    right: 20%;
    width: 32px;
    height: 160px;
    opacity: 0.55;
  }
}

.flying-buttress {
  position: absolute;
  bottom: 30%;
  background: linear-gradient(45deg,
      rgba(8, 8, 12, 0.9) 0%,
      transparent 100%);

  &.buttress-1 {
    left: 2%;
    width: 100px;
    height: 120px;
    transform: skewX(-25deg);
    opacity: 0.6;
  }

  &.buttress-2 {
    right: 2%;
    width: 100px;
    height: 120px;
    transform: skewX(25deg);
    opacity: 0.6;
  }
}

.arch {
  position: absolute;
  bottom: 32%;
  width: 80px;
  height: 100px;
  border: 3px solid rgba(15, 15, 22, 0.8);
  border-bottom: none;
  border-radius: 40px 40px 0 0;

  &.arch-1 {
    left: 6%;
    opacity: 0.5;
  }

  &.arch-2 {
    right: 8%;
    opacity: 0.45;
  }
}

// 流动薄雾 - 增强版
.mist-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
}

.mist {
  position: absolute;
  width: 250%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent 0%,
      $silver-mist 15%,
      $warm-mist 30%,
      $silver-mist 50%,
      $warm-mist 70%,
      $silver-mist 85%,
      transparent 100%);

  &.mist-1 {
    bottom: 0;
    opacity: 0.6;
    animation: mistDrift 45s linear infinite;
  }

  &.mist-2 {
    bottom: 5%;
    opacity: 0.5;
    animation: mistDrift 60s linear infinite reverse;
  }

  &.mist-3 {
    bottom: 12%;
    opacity: 0.4;
    animation: mistDrift 80s linear infinite;
  }

  &.mist-4 {
    bottom: 20%;
    opacity: 0.3;
    animation: mistDrift 100s linear infinite reverse;
  }

  &.mist-5 {
    bottom: 28%;
    opacity: 0.2;
    animation: mistDrift 120s linear infinite;
  }
}

.ground-fog {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15%;
  background: linear-gradient(to top,
      rgba(180, 175, 190, 0.25) 0%,
      rgba(180, 175, 190, 0.1) 50%,
      transparent 100%);
  animation: fogPulse 8s ease-in-out infinite;
}

@keyframes mistDrift {
  0% {
    transform: translateX(-60%);
  }

  100% {
    transform: translateX(0%);
  }
}

@keyframes fogPulse {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

// 玫瑰花窗层
.rose-windows-layer {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 6%;
  transition: transform 0.5s ease-out;
}

.rose-window {
  position: relative;

  &.main-window {
    width: 320px;
    height: 320px;
    animation: windowRotate 180s linear infinite;

    .window-glow {
      position: absolute;
      inset: -30%;
      background: radial-gradient(circle at center,
          rgba($deep-ruby, 0.2) 0%,
          rgba($royal-sapphire, 0.15) 30%,
          rgba($amber-gold, 0.05) 60%,
          transparent 75%);
      filter: blur(40px);
      animation: glowPulse 5s ease-in-out infinite;
    }

    .window-rays {
      position: absolute;
      inset: -50%;
      background: conic-gradient(from 0deg at 50% 50%,
          transparent 0deg,
          rgba($amber-gold, 0.03) 15deg,
          transparent 30deg,
          rgba($deep-ruby, 0.02) 45deg,
          transparent 60deg,
          rgba($amber-gold, 0.03) 75deg,
          transparent 90deg,
          rgba($royal-sapphire, 0.02) 105deg,
          transparent 120deg,
          rgba($amber-gold, 0.03) 135deg,
          transparent 150deg,
          rgba($deep-ruby, 0.02) 165deg,
          transparent 180deg,
          rgba($amber-gold, 0.03) 195deg,
          transparent 210deg,
          rgba($royal-sapphire, 0.02) 225deg,
          transparent 240deg,
          rgba($amber-gold, 0.03) 255deg,
          transparent 270deg,
          rgba($deep-ruby, 0.02) 285deg,
          transparent 300deg,
          rgba($amber-gold, 0.03) 315deg,
          transparent 330deg,
          rgba($royal-sapphire, 0.02) 345deg,
          transparent 360deg);
      animation: raysRotate 60s linear infinite reverse;
      opacity: 0.8;
    }
  }

  &.side-window {
    position: absolute;
    top: 18%;
    width: 140px;
    height: 140px;
    animation: windowRotate 120s linear infinite reverse;

    &.left {
      left: 8%;
    }

    &.right {
      right: 8%;
    }

    .window-glow {
      position: absolute;
      inset: -40%;
      border-radius: 50%;
      filter: blur(25px);
      animation: glowPulse 4s ease-in-out infinite;

      &.blue {
        background: radial-gradient(circle at center,
            rgba($royal-sapphire, 0.25) 0%,
            rgba($royal-sapphire, 0.1) 50%,
            transparent 75%);
      }

      &.red {
        background: radial-gradient(circle at center,
            rgba($deep-ruby, 0.25) 0%,
            rgba($deep-ruby, 0.1) 50%,
            transparent 75%);
      }
    }
  }

  // 下部快速旋转小花窗
  &.lower-window {
    position: absolute;
    top: 48%;
    width: 100px;
    height: 100px;
    animation: windowRotateFast 45s linear infinite; // 更快的旋转

    &.lower-left {
      left: 18%;
      animation-direction: normal;
    }

    &.lower-right {
      right: 18%;
      animation-direction: reverse;
    }

    .window-glow {
      position: absolute;
      inset: -45%;
      border-radius: 50%;
      filter: blur(20px);
      animation: glowPulse 3s ease-in-out infinite;

      &.purple {
        background: radial-gradient(circle at center,
            rgba(138, 43, 226, 0.3) 0%,
            rgba(138, 43, 226, 0.12) 50%,
            transparent 75%);
      }

      &.gold {
        background: radial-gradient(circle at center,
            rgba($antique-gold, 0.35) 0%,
            rgba($antique-gold, 0.15) 50%,
            transparent 75%);
      }
    }
  }
}

.window-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 20px rgba($deep-ruby, 0.4)) drop-shadow(0 0 40px rgba($amber-gold, 0.2));
}

@keyframes windowRotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes raysRotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// 快速旋转动画 - 用于下部小花窗
@keyframes windowRotateFast {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes glowPulse {

  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

// 烛光效果层 - 增强版
.candlelight-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.candle-glow {
  position: absolute;
  border-radius: 50%;
  animation: candleFlicker 2.5s ease-in-out infinite;

  // 主烛光 - 更大更亮
  &.candle-1 {
    left: 3%;
    bottom: 3%;
    width: 400px;
    height: 350px;
    background: radial-gradient(ellipse at center bottom,
        rgba($amber-gold, 0.35) 0%,
        rgba($warm-amber, 0.2) 30%,
        rgba($amber-gold, 0.08) 60%,
        transparent 80%);
    animation-delay: 0s;
  }

  &.candle-2 {
    right: 3%;
    bottom: 3%;
    width: 380px;
    height: 330px;
    background: radial-gradient(ellipse at center bottom,
        rgba($amber-gold, 0.35) 0%,
        rgba($warm-amber, 0.2) 30%,
        rgba($amber-gold, 0.08) 60%,
        transparent 80%);
    animation-delay: -0.8s;
  }

  &.candle-3 {
    left: 22%;
    bottom: 5%;
    width: 280px;
    height: 250px;
    background: radial-gradient(ellipse at center bottom,
        rgba($amber-gold, 0.3) 0%,
        rgba($amber-gold, 0.12) 50%,
        transparent 80%);
    animation-delay: -0.4s;
  }

  &.candle-4 {
    right: 22%;
    bottom: 5%;
    width: 280px;
    height: 250px;
    background: radial-gradient(ellipse at center bottom,
        rgba($amber-gold, 0.3) 0%,
        rgba($amber-gold, 0.12) 50%,
        transparent 80%);
    animation-delay: -1.2s;
  }

  // 辅助烛光
  &.candle-5 {
    left: 12%;
    bottom: 8%;
    width: 180px;
    height: 160px;
    background: radial-gradient(ellipse at center,
        rgba($amber-gold, 0.25) 0%,
        rgba($amber-gold, 0.08) 60%,
        transparent 85%);
    animation-delay: -0.6s;
  }

  &.candle-6 {
    right: 12%;
    bottom: 8%;
    width: 180px;
    height: 160px;
    background: radial-gradient(ellipse at center,
        rgba($amber-gold, 0.25) 0%,
        rgba($amber-gold, 0.08) 60%,
        transparent 85%);
    animation-delay: -1.4s;
  }

  &.candle-7 {
    left: 38%;
    bottom: 6%;
    width: 150px;
    height: 140px;
    background: radial-gradient(ellipse at center,
        rgba($amber-gold, 0.2) 0%,
        rgba($amber-gold, 0.06) 60%,
        transparent 85%);
    animation-delay: -0.3s;
  }

  &.candle-8 {
    right: 38%;
    bottom: 6%;
    width: 150px;
    height: 140px;
    background: radial-gradient(ellipse at center,
        rgba($amber-gold, 0.2) 0%,
        rgba($amber-gold, 0.06) 60%,
        transparent 85%);
    animation-delay: -1s;
  }
}

// 烛火火焰
.candle-flame {
  position: absolute;
  width: 12px;
  height: 25px;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: linear-gradient(to top,
      rgba(255, 100, 20, 0.9) 0%,
      rgba(255, 180, 60, 0.95) 40%,
      rgba(255, 255, 200, 1) 70%,
      rgba(255, 255, 255, 0.9) 100%);
  box-shadow:
    0 0 20px rgba(255, 150, 50, 0.8),
    0 0 40px rgba(255, 100, 20, 0.5),
    0 0 60px rgba(255, 80, 0, 0.3);
  animation: flameFlicker 0.15s ease-in-out infinite alternate;

  &.flame-1 {
    left: 8%;
    bottom: 12%;
  }

  &.flame-2 {
    right: 8%;
    bottom: 12%;
  }

  &.flame-3 {
    left: 28%;
    bottom: 14%;
    transform: scale(0.8);
  }

  &.flame-4 {
    right: 28%;
    bottom: 14%;
    transform: scale(0.8);
  }
}

// 光柱效果
.light-beam {
  position: absolute;
  width: 120px;
  background: linear-gradient(to top,
      rgba($amber-gold, 0.15) 0%,
      rgba($amber-gold, 0.08) 30%,
      rgba($amber-gold, 0.03) 60%,
      transparent 100%);
  clip-path: polygon(30% 100%, 70% 100%, 60% 0%, 40% 0%);
  animation: beamPulse 4s ease-in-out infinite;

  &.beam-1 {
    left: 6%;
    bottom: 0;
    height: 50%;
    animation-delay: 0s;
  }

  &.beam-2 {
    right: 6%;
    bottom: 0;
    height: 50%;
    animation-delay: -2s;
  }
}

@keyframes candleFlicker {

  0%,
  100% {
    transform: scale(1) translateY(0);
    opacity: 0.9;
  }

  20% {
    transform: scale(0.96) translateY(2px);
    opacity: 0.85;
  }

  40% {
    transform: scale(1.03) translateY(-1px);
    opacity: 0.95;
  }

  60% {
    transform: scale(0.98) translateY(1px);
    opacity: 0.88;
  }

  80% {
    transform: scale(1.01) translateY(-2px);
    opacity: 0.92;
  }
}

@keyframes flameFlicker {
  0% {
    transform: scaleX(1) scaleY(1) rotate(-2deg);
  }

  100% {
    transform: scaleX(0.9) scaleY(1.1) rotate(2deg);
  }
}

@keyframes beamPulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 0.9;
  }
}

// 尘埃粒子画布
.dust-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

// 流萤画布
.firefly-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// 哥特式装饰边角 - 增强版
.gothic-corners {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .corner {
    position: absolute;
    width: 120px;
    height: 120px;
    opacity: 0.8;
    filter: drop-shadow(0 0 5px rgba($antique-gold, 0.2));

    &.corner-tl {
      top: 0;
      left: 0;
    }

    &.corner-tr {
      top: 0;
      right: 0;
    }

    &.corner-bl {
      bottom: 0;
      left: 0;
    }

    &.corner-br {
      bottom: 0;
      right: 0;
    }
  }
}

// 哥特式边框
.gothic-border {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .border-top,
  .border-bottom {
    position: absolute;
    left: 120px;
    right: 120px;
    height: 2px;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba($antique-gold, 0.15) 20%,
        rgba($antique-gold, 0.25) 50%,
        rgba($antique-gold, 0.15) 80%,
        transparent 100%);
  }

  .border-top {
    top: 4px;
  }

  .border-bottom {
    bottom: 4px;
  }

  .border-left,
  .border-right {
    position: absolute;
    top: 120px;
    bottom: 120px;
    width: 2px;
    background: linear-gradient(180deg,
        transparent 0%,
        rgba($antique-gold, 0.15) 20%,
        rgba($antique-gold, 0.25) 50%,
        rgba($antique-gold, 0.15) 80%,
        transparent 100%);
  }

  .border-left {
    left: 4px;
  }

  .border-right {
    right: 4px;
  }
}

// 悬浮蜡烛台
.candelabra {
  position: absolute;
  bottom: 25%;
  width: 60px;
  height: 100px;

  &.candelabra-left {
    left: 5%;
  }

  &.candelabra-right {
    right: 5%;
  }

  .candelabra-arm {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 80px;
    background: linear-gradient(to top,
        rgba($antique-gold, 0.4) 0%,
        rgba($antique-gold, 0.2) 100%);
    border-radius: 2px;

    &::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 8px;
      background: rgba($antique-gold, 0.3);
      border-radius: 3px;
    }
  }

  .candelabra-flame {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 16px;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    background: linear-gradient(to top,
        rgba(255, 120, 30, 0.8) 0%,
        rgba(255, 200, 80, 0.9) 50%,
        rgba(255, 255, 200, 1) 100%);
    box-shadow:
      0 0 15px rgba(255, 150, 50, 0.7),
      0 0 30px rgba(255, 100, 20, 0.4);
    animation: flameFlicker 0.12s ease-in-out infinite alternate;
  }
}

// 暗角遮罩 - 增强版
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center,
      transparent 30%,
      rgba(0, 0, 0, 0.25) 55%,
      rgba(0, 0, 0, 0.5) 75%,
      rgba(0, 0, 0, 0.75) 100%);
  pointer-events: none;
}

.vignette-gradient {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      transparent 15%,
      transparent 85%,
      rgba(0, 0, 0, 0.2) 100%),
    linear-gradient(to right,
      rgba(0, 0, 0, 0.2) 0%,
      transparent 10%,
      transparent 90%,
      rgba(0, 0, 0, 0.2) 100%);
  pointer-events: none;
}
</style>
