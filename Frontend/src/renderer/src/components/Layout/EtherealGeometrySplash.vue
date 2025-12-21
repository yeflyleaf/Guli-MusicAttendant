<template>
  <Transition name="ethereal-fade">
    <div v-if="visible" class="ethereal-splash">
      <!-- 第0层 - 拓扑网格 (3D线框起伏) -->
      <canvas ref="gridCanvas" class="grid-canvas"></canvas>

      <!-- 第1层 - Canvas 粒子系统：低多边形碎片 -->
      <canvas ref="particleCanvas" class="particle-canvas"></canvas>

      <!-- 第2层 - 分形生长层 -->
      <div class="fractal-layer">
        <canvas ref="fractalLeftCanvas" class="fractal-canvas fractal-left"></canvas>
        <canvas ref="fractalRightCanvas" class="fractal-canvas fractal-right"></canvas>
      </div>

      <!-- 第3层 - 莫比乌斯环 -->
      <canvas ref="mobiusCanvas" class="mobius-canvas"></canvas>

      <!-- 第4层 - 数学符号装饰 -->
      <div class="math-symbols">
        <div v-for="(symbol, index) in mathSymbols" :key="index" class="math-symbol"
          :style="{ '--i': index, '--delay': `${index * 1.5}s` }">
          {{ symbol }}
        </div>
      </div>

      <!-- 激光束装饰 -->
      <div class="laser-beam"></div>

      <!-- 主内容 - 亚克力悬浮体面板 -->
      <div class="acrylic-panel" :class="{ 'folding': isFolding }" ref="acrylicPanel">
        <!-- L型准星边框 -->
        <div class="crosshair-border">
          <div class="crosshair crosshair-tl"></div>
          <div class="crosshair crosshair-tr"></div>
          <div class="crosshair crosshair-bl"></div>
          <div class="crosshair crosshair-br"></div>
        </div>

        <!-- 噪点纹理 -->
        <div class="noise-texture"></div>

        <!-- 光学倒角边 -->
        <div class="optical-bevel"></div>

        <!-- 面板内容 -->
        <div class="panel-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-geometry">
              <!-- 嵌套的正多边形 -->
              <div class="polygon polygon-1"></div>
              <div class="polygon polygon-2"></div>
              <div class="polygon polygon-3"></div>
              <div class="polygon-core"></div>
            </div>
            <!-- 全息虹彩光环 -->
            <div class="holographic-halo"></div>
          </div>

          <!-- 应用名称 - 几何无衬线体 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.1}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 - 极简线条 -->
          <div class="loading-indicator">
            <div class="loading-line">
              <div class="loading-progress"></div>
            </div>
            <div class="loading-text">{{ loadingText }}</div>
          </div>
        </div>

        <!-- 彩虹光斑效果 -->
        <div class="rainbow-refraction" ref="rainbowRefraction"></div>
      </div>

      <!-- 无限递归效果层 -->
      <div class="fractal-zoom-layer" :class="{ active: isFractalDiving }">
        <!-- 分形坠落隧道 -->
        <div class="fractal-tunnel">
          <div class="tunnel-layer" v-for="n in 8" :key="n" :style="{ '--i': n }"></div>
        </div>
        <!-- 光谱爆发 -->
        <div class="spectrum-burst"></div>
        <!-- 纯白视界 -->
        <div class="void-white"></div>
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
const isFolding = ref(false)
const isFractalDiving = ref(false)
const acrylicPanel = ref<HTMLElement | null>(null)
const rainbowRefraction = ref<HTMLElement | null>(null)

// Canvas refs
const gridCanvas = ref<HTMLCanvasElement | null>(null)
const particleCanvas = ref<HTMLCanvasElement | null>(null)
const mobiusCanvas = ref<HTMLCanvasElement | null>(null)
const fractalLeftCanvas = ref<HTMLCanvasElement | null>(null)
const fractalRightCanvas = ref<HTMLCanvasElement | null>(null)

const appNameChars = '故里音乐助手'.split('')
const mathSymbols = ['∫', '∞', 'Σ', 'π', 'φ', '∂']

const loadingTexts = ['Initializing dimensions...', 'Calculating fractals...', 'Rendering geometry...', 'Ready']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

let loadingTextInterval: number | null = null
let animationFrameId: number | null = null
let mouseX = 0
let mouseY = 0

// ==================== 拓扑网格系统 ====================
const initGridSystem = () => {
  const canvas = gridCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const cols = 40
  const rows = 25
  const cellWidth = canvas.width / cols
  const cellHeight = canvas.height / rows
  let time = 0

  const render = () => {
    time += 0.008
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(200, 200, 210, 0.15)'
    ctx.lineWidth = 0.5

    // 绘制起伏的3D网格
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath()
      for (let j = 0; j <= rows; j++) {
        const x = i * cellWidth
        const baseY = j * cellHeight
        // 引力波状起伏
        const wave = Math.sin(i * 0.15 + time) * Math.cos(j * 0.1 + time * 0.7) * 15
        const y = baseY + wave

        if (j === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }

    for (let j = 0; j <= rows; j++) {
      ctx.beginPath()
      for (let i = 0; i <= cols; i++) {
        const baseX = i * cellWidth
        const y = j * cellHeight
        const wave = Math.sin(i * 0.15 + time) * Math.cos(j * 0.1 + time * 0.7) * 15
        const x = baseX

        if (i === 0) {
          ctx.moveTo(x, y + wave)
        } else {
          ctx.lineTo(x, y + wave)
        }
      }
      ctx.stroke()
    }
  }

  return render
}

// ==================== 低多边形粒子系统 ====================
interface Polyhedron {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  rotationX: number
  rotationY: number
  rotationZ: number
  rotationSpeedX: number
  rotationSpeedY: number
  rotationSpeedZ: number
  size: number
  type: 'tetrahedron' | 'octahedron' | 'cube'
  opacity: number
  color: { h: number; s: number; l: number }
  attractedToMouse: boolean
}

let polyhedrons: Polyhedron[] = []
let tunnelMode = false
let tunnelIntensity = 0

const initParticleSystem = () => {
  const canvas = particleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const random = (min: number, max: number) => Math.random() * (max - min) + min

  const types: Polyhedron['type'][] = ['tetrahedron', 'octahedron', 'cube']

  const createPolyhedron = (): Polyhedron => ({
    x: random(0, canvas.width),
    y: random(0, canvas.height),
    z: random(0.3, 1),
    vx: random(-0.2, 0.2),
    vy: random(-0.2, 0.2),
    rotationX: random(0, Math.PI * 2),
    rotationY: random(0, Math.PI * 2),
    rotationZ: random(0, Math.PI * 2),
    rotationSpeedX: random(0.002, 0.008),
    rotationSpeedY: random(0.002, 0.008),
    rotationSpeedZ: random(0.002, 0.008),
    size: random(15, 40),
    type: types[Math.floor(Math.random() * types.length)],
    opacity: random(0.15, 0.4),
    color: {
      h: random(180, 300), // 青色到洋红
      s: random(30, 60),
      l: random(70, 85)
    },
    attractedToMouse: false
  })

  polyhedrons = Array.from({ length: 35 }, createPolyhedron)

  const handleMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY
  }
  window.addEventListener('mousemove', handleMouseMove)

  // 绘制正四面体
  const drawTetrahedron = (ctx: CanvasRenderingContext2D, size: number, rotation: { x: number; y: number; z: number }) => {
    const h = size * Math.sqrt(2 / 3)
    const vertices = [
      { x: 0, y: -h * 0.75, z: 0 },
      { x: -size / 2, y: h * 0.25, z: -size / 3 },
      { x: size / 2, y: h * 0.25, z: -size / 3 },
      { x: 0, y: h * 0.25, z: size * 0.6 }
    ]

    const rotatedVertices = vertices.map(v => rotatePoint(v, rotation))

    const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]]
    edges.forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(rotatedVertices[a].x, rotatedVertices[a].y)
      ctx.lineTo(rotatedVertices[b].x, rotatedVertices[b].y)
      ctx.stroke()
    })
  }

  // 绘制正八面体
  const drawOctahedron = (ctx: CanvasRenderingContext2D, size: number, rotation: { x: number; y: number; z: number }) => {
    const vertices = [
      { x: 0, y: -size, z: 0 },
      { x: -size, y: 0, z: 0 },
      { x: 0, y: 0, z: -size },
      { x: size, y: 0, z: 0 },
      { x: 0, y: 0, z: size },
      { x: 0, y: size, z: 0 }
    ]

    const rotatedVertices = vertices.map(v => rotatePoint(v, rotation))

    const edges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2], [5, 3], [5, 4],
      [1, 2], [2, 3], [3, 4], [4, 1]
    ]
    edges.forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(rotatedVertices[a].x, rotatedVertices[a].y)
      ctx.lineTo(rotatedVertices[b].x, rotatedVertices[b].y)
      ctx.stroke()
    })
  }

  // 绘制立方体
  const drawCube = (ctx: CanvasRenderingContext2D, size: number, rotation: { x: number; y: number; z: number }) => {
    const s = size * 0.6
    const vertices = [
      { x: -s, y: -s, z: -s },
      { x: s, y: -s, z: -s },
      { x: s, y: s, z: -s },
      { x: -s, y: s, z: -s },
      { x: -s, y: -s, z: s },
      { x: s, y: -s, z: s },
      { x: s, y: s, z: s },
      { x: -s, y: s, z: s }
    ]

    const rotatedVertices = vertices.map(v => rotatePoint(v, rotation))

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ]
    edges.forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(rotatedVertices[a].x, rotatedVertices[a].y)
      ctx.lineTo(rotatedVertices[b].x, rotatedVertices[b].y)
      ctx.stroke()
    })
  }

  const rotatePoint = (p: { x: number; y: number; z: number }, r: { x: number; y: number; z: number }) => {
    // Rotate around X
    let y = p.y * Math.cos(r.x) - p.z * Math.sin(r.x)
    let z = p.y * Math.sin(r.x) + p.z * Math.cos(r.x)
    let x = p.x

    // Rotate around Y
    const x2 = x * Math.cos(r.y) + z * Math.sin(r.y)
    z = -x * Math.sin(r.y) + z * Math.cos(r.y)
    x = x2

    // Rotate around Z
    const x3 = x * Math.cos(r.z) - y * Math.sin(r.z)
    y = x * Math.sin(r.z) + y * Math.cos(r.z)

    return { x: x3, y, z }
  }

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    polyhedrons.forEach(p => {
      // 鼠标磁性吸附
      const dx = mouseX - p.x
      const dy = mouseY - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 150 && !tunnelMode) {
        p.attractedToMouse = true
        p.x += dx * 0.02
        p.y += dy * 0.02
      } else if (p.attractedToMouse && !tunnelMode) {
        p.attractedToMouse = false
        p.vx = (Math.random() - 0.5) * 0.5
        p.vy = (Math.random() - 0.5) * 0.5
      }

      if (tunnelMode) {
        // 隧道模式：向中心聚拢
        const toCenterX = centerX - p.x
        const toCenterY = centerY - p.y
        p.x += toCenterX * tunnelIntensity * 0.05
        p.y += toCenterY * tunnelIntensity * 0.05
        p.rotationSpeedX *= 1.01
        p.rotationSpeedY *= 1.01
      } else {
        // 布朗运动
        p.x += p.vx
        p.y += p.vy

        // 边界反弹
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }

      // 旋转
      p.rotationX += p.rotationSpeedX
      p.rotationY += p.rotationSpeedY
      p.rotationZ += p.rotationSpeedZ

      // 绘制
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.scale(p.z, p.z)

      // 全息虹彩色
      const hue = tunnelMode ? (p.color.h + tunnelIntensity * 180) % 360 : p.color.h
      ctx.strokeStyle = `hsla(${hue}, ${p.color.s}%, ${p.color.l}%, ${p.opacity})`
      ctx.lineWidth = 1

      const rotation = { x: p.rotationX, y: p.rotationY, z: p.rotationZ }

      if (p.type === 'tetrahedron') {
        drawTetrahedron(ctx, p.size, rotation)
      } else if (p.type === 'octahedron') {
        drawOctahedron(ctx, p.size, rotation)
      } else {
        drawCube(ctx, p.size, rotation)
      }

      ctx.restore()
    })
  }

  return {
    render,
    setTunnelMode: (active: boolean, intensity: number = 0) => {
      tunnelMode = active
      tunnelIntensity = intensity
    }
  }
}

// ==================== 莫比乌斯环系统 ====================
const initMobiusSystem = () => {
  const canvas = mobiusCanvas.value
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
  const centerX = () => canvas.width / 2
  const centerY = () => canvas.height / 2

  const render = () => {
    time += 0.005
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cx = centerX()
    const cy = centerY()
    const R = Math.min(canvas.width, canvas.height) * 0.25 // 主半径
    const r = R * 0.15 // 带宽

    // 绘制莫比乌斯环的线框
    const segments = 120
    const loops = 3

    for (let strip = -loops; strip <= loops; strip++) {
      ctx.beginPath()
      const stripOffset = (strip / loops) * r

      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2
        const halfT = t / 2 + time

        // 莫比乌斯环参数方程
        const x = (R + stripOffset * Math.cos(halfT)) * Math.cos(t)
        const y = (R + stripOffset * Math.cos(halfT)) * Math.sin(t)
        const z = stripOffset * Math.sin(halfT)

        // 3D到2D投影 (带轻微倾斜)
        const rotationX = 0.3
        const y2 = y * Math.cos(rotationX) - z * Math.sin(rotationX)
        const z2 = y * Math.sin(rotationX) + z * Math.cos(rotationX)

        const scale = 500 / (500 + z2) // 透视
        const screenX = cx + x * scale
        const screenY = cy + y2 * scale

        if (i === 0) {
          ctx.moveTo(screenX, screenY)
        } else {
          ctx.lineTo(screenX, screenY)
        }
      }

      // 霓虹流光色彩
      const hue = (180 + strip * 30 + time * 50) % 360
      ctx.strokeStyle = `hsla(${hue}, 60%, 70%, 0.3)`
      ctx.lineWidth = 0.8
      ctx.stroke()
    }

    // 绘制环形流光
    const glowSegments = 12
    for (let i = 0; i < glowSegments; i++) {
      const t = (i / glowSegments) * Math.PI * 2 + time * 2

      const x = R * Math.cos(t)
      const y = R * Math.sin(t)
      const z = 0

      const rotationX = 0.3
      const y2 = y * Math.cos(rotationX) - z * Math.sin(rotationX)
      const z2 = y * Math.sin(rotationX) + z * Math.cos(rotationX)

      const scale = 500 / (500 + z2)
      const screenX = cx + x * scale
      const screenY = cy + y2 * scale

      const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 20)
      gradient.addColorStop(0, `hsla(${(180 + i * 30 + time * 100) % 360}, 70%, 80%, 0.6)`)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(screenX, screenY, 15, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return render
}

// ==================== 分形生长系统 ====================
const initFractalSystem = (canvas: HTMLCanvasElement | null, side: 'left' | 'right') => {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 300
  canvas.height = window.innerHeight

  let time = 0
  let depth = 0
  const maxDepth = 7

  // 谢尔宾斯基三角形
  const drawSierpinski = (x: number, y: number, size: number, currentDepth: number) => {
    if (currentDepth > depth || currentDepth > maxDepth) return

    const h = size * Math.sqrt(3) / 2
    const opacity = 0.1 + (1 - currentDepth / maxDepth) * 0.2

    ctx.strokeStyle = `rgba(200, 200, 220, ${opacity})`
    ctx.lineWidth = 0.5

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y)
    ctx.lineTo(x + size / 2, y - h)
    ctx.closePath()
    ctx.stroke()

    if (currentDepth < depth) {
      drawSierpinski(x, y, size / 2, currentDepth + 1)
      drawSierpinski(x + size / 2, y, size / 2, currentDepth + 1)
      drawSierpinski(x + size / 4, y - h / 2, size / 2, currentDepth + 1)
    }
  }

  const render = () => {
    time += 0.02
    depth = Math.min(maxDepth, Math.floor(time) % (maxDepth + 3))

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const size = 250
    const startX = side === 'left' ? 20 : 30
    const startY = canvas.height * 0.7

    drawSierpinski(startX, startY, size, 0)
  }

  return render
}

// ==================== 动画控制 ====================
let gridRender: (() => void) | undefined
let particleControls: { render: () => void; setTunnelMode: (active: boolean, intensity?: number) => void } | undefined
let mobiusRender: (() => void) | undefined
let fractalLeftRender: (() => void) | undefined
let fractalRightRender: (() => void) | undefined

const mainLoop = () => {
  gridRender?.()
  particleControls?.render()
  mobiusRender?.()
  fractalLeftRender?.()
  fractalRightRender?.()
  animationFrameId = requestAnimationFrame(mainLoop)
}

// 鼠标跟踪彩虹光斑
const handleMouseMove = (e: MouseEvent) => {
  if (rainbowRefraction.value && acrylicPanel.value) {
    const rect = acrylicPanel.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    rainbowRefraction.value.style.background = `
      radial-gradient(
        circle at ${x}px ${y}px,
        rgba(0, 255, 255, 0.15) 0%,
        rgba(255, 0, 255, 0.1) 25%,
        rgba(255, 255, 0, 0.05) 50%,
        transparent 70%
      )
    `
  }
}

// 触发无限递归动画
const triggerFractalDive = () => {
  isFolding.value = true

  setTimeout(() => {
    isFractalDiving.value = true

    // 粒子向中心聚拢
    const startTime = Date.now()
    const duration = 1500

    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      particleControls?.setTunnelMode(true, easeProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    animate()
  }, 500)
}

onMounted(async () => {
  // 初始化所有系统
  gridRender = initGridSystem()
  particleControls = initParticleSystem()
  mobiusRender = initMobiusSystem()
  fractalLeftRender = initFractalSystem(fractalLeftCanvas.value, 'left')
  fractalRightRender = initFractalSystem(fractalRightCanvas.value, 'right')

  // 启动主渲染循环
  mainLoop()

  // 鼠标光斑跟踪
  window.addEventListener('mousemove', handleMouseMove)

  // 文字切换
  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 650)

  const minDisplayTime = 2500
  const startTime = Date.now()

  // 等待预加载
  const preloadPromise = (window as any).__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[EtherealGeometrySplash] Data preload finished')
    } catch (error) {
      console.error('[EtherealGeometrySplash] Preload error:', error)
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
  triggerFractalDive()
  await new Promise((resolve) => setTimeout(resolve, 2500))

  visible.value = false
  console.log('[EtherealGeometrySplash] Hidden after', Date.now() - startTime, 'ms')
  setTimeout(() => emit('finished'), 500)
})

onUnmounted(() => {
  if (loadingTextInterval) clearInterval(loadingTextInterval)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('mousemove', handleMouseMove)
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$zero-white: #f5f7fa;
$quantum-gray: #e0e5ec;
$deep-shadow: rgba(80, 85, 100, 0.25);
$holographic-cyan: #00ffff;
$holographic-magenta: #ff00ff;
$holographic-yellow: #ffff00;

.ethereal-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, $zero-white 0%, $quantum-gray 50%, darken($quantum-gray, 5%) 100%);
  font-family: 'Century Gothic', 'Futura', 'Avant Garde', sans-serif;
}

// ==================== Canvas 层 ====================
.grid-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.8;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.mobius-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0.6;
}

// ==================== 分形层 ====================
.fractal-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.fractal-canvas {
  position: absolute;
  top: 0;
  height: 100%;
  opacity: 0.4;

  &.fractal-left {
    left: 0;
  }

  &.fractal-right {
    right: 0;
    transform: scaleX(-1);
  }
}

// ==================== 数学符号 ====================
.math-symbols {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  overflow: hidden;
}

.math-symbol {
  position: absolute;
  font-size: 200px;
  font-weight: 100;
  color: rgba(180, 185, 200, 0.08);
  filter: blur(2px);
  animation: floatSymbol 20s linear infinite;
  animation-delay: var(--delay);

  &:nth-child(1) {
    left: 10%;
    top: -200px;
  }

  &:nth-child(2) {
    left: 30%;
    top: -200px;
  }

  &:nth-child(3) {
    right: 20%;
    top: -200px;
  }

  &:nth-child(4) {
    left: 50%;
    top: -200px;
  }

  &:nth-child(5) {
    right: 10%;
    top: -200px;
  }

  &:nth-child(6) {
    left: 70%;
    top: -200px;
  }
}

@keyframes floatSymbol {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 0.15;
  }

  90% {
    opacity: 0.15;
  }

  100% {
    transform: translateY(calc(100vh + 200px)) rotate(30deg);
    opacity: 0;
  }
}

// ==================== 激光束 ====================
.laser-beam {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 2px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba($holographic-cyan, 0.3) 20%,
      rgba($holographic-magenta, 0.5) 50%,
      rgba($holographic-cyan, 0.3) 80%,
      transparent 100%);
  transform: rotate(45deg) translateX(-50%);
  transform-origin: left center;
  animation: laserSweep 8s linear infinite;
  z-index: 5;
  filter: blur(1px);
}

@keyframes laserSweep {
  0% {
    transform: rotate(45deg) translateX(-100%);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: rotate(45deg) translateX(100%);
    opacity: 0;
  }
}

// ==================== 亚克力面板 ====================
.acrylic-panel {
  position: relative;
  z-index: 10;
  width: 380px;
  padding: 50px 40px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(1.5);
  border-radius: 20px;
  box-shadow:
    0 8px 32px $deep-shadow,
    inset 0 0 60px rgba(255, 255, 255, 0.3);
  transform-style: preserve-3d;
  animation: panelFloat 6s ease-in-out infinite;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  &.folding {
    transform: perspective(1000px) rotateY(90deg) scale(0.5);
    opacity: 0;
  }
}

@keyframes panelFloat {

  0%,
  100% {
    transform: translateY(0) rotateX(0deg) rotateY(0deg);
  }

  25% {
    transform: translateY(-5px) rotateX(1deg) rotateY(-1deg);
  }

  50% {
    transform: translateY(0) rotateX(0deg) rotateY(0deg);
  }

  75% {
    transform: translateY(-5px) rotateX(-1deg) rotateY(1deg);
  }
}

// L型准星边框
.crosshair-border {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}

.crosshair {
  position: absolute;
  width: 30px;
  height: 30px;
  border-color: rgba(100, 100, 120, 0.4);
  border-style: solid;
  border-width: 0;

  &.crosshair-tl {
    top: 0;
    left: 0;
    border-top-width: 2px;
    border-left-width: 2px;
  }

  &.crosshair-tr {
    top: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
  }

  &.crosshair-bl {
    bottom: 0;
    left: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }

  &.crosshair-br {
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-right-width: 2px;
  }
}

// 噪点纹理
.noise-texture {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  border-radius: inherit;
}

// 光学倒角
.optical-bevel {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 30%,
      transparent 70%,
      rgba(0, 0, 0, 0.05) 100%);
  pointer-events: none;
}

// 彩虹折射
.rainbow-refraction {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  mix-blend-mode: overlay;
}

// ==================== 面板内容 ====================
.panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

// Logo容器
.logo-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.logo-geometry {
  position: relative;
  width: 100%;
  height: 100%;
  animation: logoRotate 20s linear infinite;
}

@keyframes logoRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.polygon {
  position: absolute;
  inset: 0;
  border: 2px solid;
  border-radius: 50%;
  animation: polygonPulse 3s ease-in-out infinite;

  &.polygon-1 {
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    border-color: rgba($holographic-cyan, 0.6);
    animation-delay: 0s;
  }

  &.polygon-2 {
    inset: 15%;
    clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
    border-color: rgba($holographic-magenta, 0.5);
    animation-delay: 0.5s;
    animation-direction: reverse;
  }

  &.polygon-3 {
    inset: 30%;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    border-color: rgba($holographic-yellow, 0.4);
    animation-delay: 1s;
  }
}

@keyframes polygonPulse {

  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.polygon-core {
  position: absolute;
  inset: 40%;
  background: radial-gradient(circle,
      rgba($holographic-magenta, 0.3) 0%,
      rgba($holographic-cyan, 0.2) 50%,
      transparent 70%);
  border-radius: 50%;
  animation: corePulse 2s ease-in-out infinite;
}

@keyframes corePulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.holographic-halo {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: conic-gradient(from 0deg,
      rgba($holographic-cyan, 0.2),
      rgba($holographic-magenta, 0.2),
      rgba($holographic-yellow, 0.2),
      rgba($holographic-cyan, 0.2));
  filter: blur(15px);
  animation: haloSpin 10s linear infinite;
}

@keyframes haloSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 应用名称
.app-name {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 0.3em;
  color: rgba(60, 65, 80, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
}

.char {
  display: inline-block;
  animation: charAppear 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes charAppear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 加载指示器
.loading-indicator {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-line {
  width: 60%;
  height: 1px;
  background: rgba(100, 100, 120, 0.2);
  position: relative;
  overflow: hidden;
}

.loading-progress {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba($holographic-cyan, 0.6) 30%,
      rgba($holographic-magenta, 0.6) 70%,
      transparent 100%);
  animation: progressSweep 1.5s ease-in-out infinite;
}

@keyframes progressSweep {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.loading-text {
  font-size: 12px;
  letter-spacing: 0.1em;
  color: rgba(100, 100, 120, 0.6);
  text-transform: uppercase;
}

// ==================== 无限递归效果层 ====================
.fractal-zoom-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease;

  &.active {
    opacity: 1;
    pointer-events: all;

    .fractal-tunnel {
      animation: tunnelZoom 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .spectrum-burst {
      animation: spectrumBurst 1.2s cubic-bezier(0.4, 0, 0.2, 1) 1.3s forwards;
    }

    .void-white {
      animation: voidExpand 1s cubic-bezier(0.4, 0, 0.2, 1) 2s forwards;
    }
  }
}

.fractal-tunnel {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 500px;
}

.tunnel-layer {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 2px solid rgba(150, 150, 170, 0.3);
  transform: translateZ(calc(var(--i) * -100px)) rotateZ(calc(var(--i) * 15deg));

  &:nth-child(odd) {
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    border-color: rgba($holographic-cyan, 0.4);
  }

  &:nth-child(even) {
    clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
    border-color: rgba($holographic-magenta, 0.4);
  }
}

@keyframes tunnelZoom {
  0% {
    transform: scale(1) translateZ(0);
    opacity: 1;
  }

  70% {
    opacity: 0.8;
  }

  100% {
    transform: scale(15) translateZ(800px);
    opacity: 0;
  }
}

// 光谱爆发 - 柔和版本，避免频闪
.spectrum-burst {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center,
      rgba(255, 255, 255, 0) 0%,
      rgba($holographic-cyan, 0) 30%,
      rgba($holographic-magenta, 0) 60%,
      transparent 100%);
  opacity: 0;
  pointer-events: none;
}

@keyframes spectrumBurst {
  0% {
    opacity: 0;
    transform: scale(0.8);
    background: radial-gradient(circle at center,
        rgba(255, 255, 255, 0) 0%,
        rgba($holographic-cyan, 0) 30%,
        rgba($holographic-magenta, 0) 60%,
        transparent 100%);
  }

  30% {
    opacity: 0.6;
    transform: scale(1);
    background: radial-gradient(circle at center,
        rgba(255, 255, 255, 0.3) 0%,
        rgba($holographic-cyan, 0.15) 25%,
        rgba($holographic-magenta, 0.1) 50%,
        transparent 80%);
  }

  60% {
    opacity: 0.8;
    transform: scale(1.1);
    background: radial-gradient(circle at center,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 255, 255, 0.3) 30%,
        rgba($holographic-cyan, 0.1) 60%,
        transparent 90%);
  }

  100% {
    opacity: 1;
    transform: scale(1.2);
    background: radial-gradient(circle at center,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(255, 255, 255, 0.5) 40%,
        rgba(255, 255, 255, 0.2) 70%,
        transparent 100%);
  }
}

// 纯白视界 - 柔和渐入，避免突然闪白
.void-white {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(250, 252, 255, 1) 50%,
      rgba(255, 255, 255, 0.95) 100%);
  opacity: 0;
  pointer-events: none;
}

@keyframes voidExpand {
  0% {
    opacity: 0;
  }

  40% {
    opacity: 0.4;
  }

  70% {
    opacity: 0.7;
  }

  100% {
    opacity: 1;
  }
}

// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 30px;
  text-align: center;
}

// ==================== 过渡动画 ====================
.ethereal-fade-enter-active,
.ethereal-fade-leave-active {
  transition: opacity 0.5s ease;
}

.ethereal-fade-enter-from,
.ethereal-fade-leave-to {
  opacity: 0;
}
</style>
