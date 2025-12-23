<template>
    <div class="solar-storm-background" :class="{ embedded: embedded }" ref="containerRef" @mousemove="handleMouseMove">
        <!-- 底层：日蚀黑渐变背景 -->
        <div class="eclipse-bg"></div>

        <!-- 底层：米粒组织纹理 Canvas (Solar Granulation) -->
        <canvas ref="granulationCanvas" class="granulation-canvas"></canvas>

        <!-- 中层：磁场日珥拱门 (Magnetic Prominence Arcs) -->
        <div class="magnetic-arcs-layer" :style="parallaxStyle">
            <svg class="arcs-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <!-- 日珥拱门渐变 -->
                    <linearGradient id="arc-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="20%" stop-color="rgba(255, 69, 0, 0.6)" />
                        <stop offset="50%" stop-color="rgba(255, 204, 0, 0.8)" />
                        <stop offset="80%" stop-color="rgba(255, 69, 0, 0.6)" />
                        <stop offset="100%" stop-color="transparent" />
                    </linearGradient>
                    <linearGradient id="arc-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="30%" stop-color="rgba(255, 100, 50, 0.5)" />
                        <stop offset="50%" stop-color="rgba(255, 180, 80, 0.7)" />
                        <stop offset="70%" stop-color="rgba(255, 100, 50, 0.5)" />
                        <stop offset="100%" stop-color="transparent" />
                    </linearGradient>
                    <linearGradient id="arc-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="25%" stop-color="rgba(255, 80, 20, 0.4)" />
                        <stop offset="50%" stop-color="rgba(255, 150, 50, 0.6)" />
                        <stop offset="75%" stop-color="rgba(255, 80, 20, 0.4)" />
                        <stop offset="100%" stop-color="transparent" />
                    </linearGradient>
                    <!-- 发光滤镜 -->
                    <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <!-- 日珥拱门路径 -->
                <path class="prominence-arc arc-1" d="M -5 95 Q 25 30, 55 95" fill="none" stroke="url(#arc-gradient-1)"
                    stroke-width="0.8" filter="url(#arc-glow)" />
                <path class="prominence-arc arc-2" d="M 35 95 Q 60 45, 85 95" fill="none" stroke="url(#arc-gradient-2)"
                    stroke-width="0.6" filter="url(#arc-glow)" />
                <path class="prominence-arc arc-3" d="M 70 95 Q 90 55, 110 95" fill="none" stroke="url(#arc-gradient-3)"
                    stroke-width="0.5" filter="url(#arc-glow)" />
            </svg>
        </div>

        <!-- 顶层：日冕物质抛射微粒 Canvas (CME Particles / Solar Wind) -->
        <canvas ref="solarWindCanvas" class="solar-wind-canvas"></canvas>

        <!-- 热变形效果层 (Heat Distortion) -->
        <div class="heat-distortion-layer">
            <svg class="heat-filter-svg">
                <defs>
                    <filter id="heat-wave">
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R"
                            yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>
        </div>

        <!-- 顶层：深红暗角遮罩 -->
        <div class="crimson-vignette"></div>

        <!-- 顶层：炉膛边框效果 -->
        <div class="furnace-frame">
            <div class="frame-edge top"></div>
            <div class="frame-edge right"></div>
            <div class="frame-edge bottom"></div>
            <div class="frame-edge left"></div>
            <div class="corner-ember top-left"></div>
            <div class="corner-ember top-right"></div>
            <div class="corner-ember bottom-left"></div>
            <div class="corner-ember bottom-right"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Props
defineProps<{
    embedded?: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)
const granulationCanvas = ref<HTMLCanvasElement | null>(null)
const solarWindCanvas = ref<HTMLCanvasElement | null>(null)

// 鼠标位置用于视差效果
const mouseX = ref(0.5)
const mouseY = ref(0.5)

// 视差偏移量
const parallaxStyle = computed(() => ({
    transform: `translate(${(mouseX.value - 0.5) * -8}px, ${(mouseY.value - 0.5) * -8}px)`
}))

// 鼠标移动处理
const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    mouseX.value = e.clientX / rect.width
    mouseY.value = e.clientY / rect.height
}

// ============================================
// 米粒组织纹理系统 (Solar Granulation with Perlin Noise)
// ============================================
let granulationAnimationId: number | null = null
let noiseTime = 0

// 简化的 Simplex Noise 实现
class SimplexNoise {
    private perm: number[] = []

    constructor() {
        const p: number[] = []
        for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256)
        for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255]
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    private lerp(a: number, b: number, t: number): number {
        return a + t * (b - a)
    }

    private grad(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15
        const u = h < 8 ? x : y
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
    }

    noise3D(x: number, y: number, z: number): number {
        const X = Math.floor(x) & 255
        const Y = Math.floor(y) & 255
        const Z = Math.floor(z) & 255

        x -= Math.floor(x)
        y -= Math.floor(y)
        z -= Math.floor(z)

        const u = this.fade(x)
        const v = this.fade(y)
        const w = this.fade(z)

        const A = this.perm[X] + Y
        const AA = this.perm[A] + Z
        const AB = this.perm[A + 1] + Z
        const B = this.perm[X + 1] + Y
        const BA = this.perm[B] + Z
        const BB = this.perm[B + 1] + Z

        return this.lerp(
            this.lerp(
                this.lerp(this.grad(this.perm[AA], x, y, z), this.grad(this.perm[BA], x - 1, y, z), u),
                this.lerp(this.grad(this.perm[AB], x, y - 1, z), this.grad(this.perm[BB], x - 1, y - 1, z), u),
                v
            ),
            this.lerp(
                this.lerp(this.grad(this.perm[AA + 1], x, y, z - 1), this.grad(this.perm[BA + 1], x - 1, y, z - 1), u),
                this.lerp(this.grad(this.perm[AB + 1], x, y - 1, z - 1), this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1), u),
                v
            ),
            w
        )
    }

    // FBM (Fractional Brownian Motion) 分形布朗运动
    fbm(x: number, y: number, z: number, octaves: number = 4): number {
        let value = 0
        let amplitude = 0.5
        let frequency = 1

        for (let i = 0; i < octaves; i++) {
            value += amplitude * this.noise3D(x * frequency, y * frequency, z * frequency)
            amplitude *= 0.5
            frequency *= 2
        }

        return value
    }
}

let simplexNoise: SimplexNoise | null = null

const initGranulation = () => {
    const canvas = granulationCanvas.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    simplexNoise = new SimplexNoise()

    // 降低分辨率以提高性能
    const scale = 0.5
    let width = 0
    let height = 0
    let imageData: ImageData | null = null

    const resize = () => {
        width = Math.floor(window.innerWidth * scale)
        height = Math.floor(window.innerHeight * scale)
        canvas.width = width
        canvas.height = height
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        imageData = ctx.createImageData(width, height)
    }
    resize()
    window.addEventListener('resize', resize)

    // 帧率限制
    let lastFrameTime = 0
    const targetFPS = 20
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
        if (currentTime - lastFrameTime < frameInterval) {
            granulationAnimationId = requestAnimationFrame(animate)
            return
        }
        lastFrameTime = currentTime

        if (!imageData || !simplexNoise) {
            granulationAnimationId = requestAnimationFrame(animate)
            return
        }

        const data = imageData.data

        // 极慢的时间推进（模拟恒星表面的缓慢对流）
        noiseTime += 0.0008

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4

                // 使用 FBM 噪声生成细胞状纹理
                const noiseScale = 0.008
                const noiseValue = simplexNoise.fbm(x * noiseScale, y * noiseScale, noiseTime, 4)

                // 阈值处理：细胞壁发亮，细胞中心变暗
                // 将噪声值映射到 0-1，然后应用阈值创建细胞边缘
                const normalized = (noiseValue + 1) * 0.5

                // 创建细胞边缘效果
                const edgeThreshold = 0.5
                const edgeWidth = 0.15
                const distToEdge = Math.abs(normalized - edgeThreshold)
                const edgeIntensity = Math.max(0, 1 - distToEdge / edgeWidth)

                // 基础暗红色 (deep magma red)
                const baseR = 45  // #2d0a0a
                const baseG = 10
                const baseB = 10

                // 边缘发光颜色 (熔炉橙 + 微弱的金色高光)
                const glowR = 255
                const glowG = 69 + edgeIntensity * 100  // 橙到金
                const glowB = 0

                // 混合基础色和边缘发光
                const intensity = edgeIntensity * 0.4  // 降低整体亮度

                data[idx] = Math.floor(baseR + (glowR - baseR) * intensity)
                data[idx + 1] = Math.floor(baseG + (glowG - baseG) * intensity)
                data[idx + 2] = Math.floor(baseB + (glowB - baseB) * intensity)
                data[idx + 3] = 255
            }
        }

        ctx.putImageData(imageData, 0, 0)
        granulationAnimationId = requestAnimationFrame(animate)
    }

    granulationAnimationId = requestAnimationFrame(animate)
}

// ============================================
// 太阳风粒子系统 (Solar Wind / CME Particles)
// ============================================
interface SolarWindParticle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    life: number
    maxLife: number
    color: string
}

let solarWindParticles: SolarWindParticle[] = []
let solarWindAnimationId: number | null = null

const initSolarWind = () => {
    const canvas = solarWindCanvas.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 太阳风粒子颜色（金色尘埃）
    const particleColors = [
        'rgba(255, 204, 0, ',    // 耀斑金
        'rgba(255, 140, 0, ',    // 深橙
        'rgba(255, 100, 50, ',   // 熔炉橙
        'rgba(255, 180, 80, ',   // 浅金
        'rgba(255, 255, 200, '   // 电离白（极少量）
    ]

    // 创建太阳风粒子
    const createParticle = (): SolarWindParticle => {
        // 粒子主要从底部向上流动（模拟磁力线方向）
        const startFromBottom = Math.random() > 0.3

        return {
            x: Math.random() * canvas.width,
            y: startFromBottom ? canvas.height + 20 : Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: startFromBottom ? -0.3 - Math.random() * 0.5 : (Math.random() - 0.5) * 0.2,
            size: 1 + Math.random() * 2,
            opacity: 0.1 + Math.random() * 0.3,
            life: 0,
            maxLife: 300 + Math.random() * 400,
            color: particleColors[Math.floor(Math.random() * particleColors.length)]
        }
    }

    // 初始化粒子
    const particleCount = 120
    solarWindParticles = Array.from({ length: particleCount }, createParticle)

    // 帧率限制
    let lastFrameTime = 0
    const targetFPS = 30
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
        if (currentTime - lastFrameTime < frameInterval) {
            solarWindAnimationId = requestAnimationFrame(animate)
            return
        }
        lastFrameTime = currentTime

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        solarWindParticles.forEach((particle, index) => {
            // 更新位置
            particle.x += particle.vx
            particle.y += particle.vy
            particle.life++

            // 生命周期淡入淡出
            let alpha = particle.opacity
            const fadeInDuration = 50
            const fadeOutStart = particle.maxLife - 80

            if (particle.life < fadeInDuration) {
                alpha *= particle.life / fadeInDuration
            } else if (particle.life > fadeOutStart) {
                alpha *= (particle.maxLife - particle.life) / (particle.maxLife - fadeOutStart)
            }

            // 重置死亡粒子
            if (particle.life >= particle.maxLife ||
                particle.y < -20 ||
                particle.x < -20 ||
                particle.x > canvas.width + 20) {
                solarWindParticles[index] = createParticle()
                return
            }

            // 绘制粒子（带发光效果）
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            )
            gradient.addColorStop(0, particle.color + (alpha * 0.8) + ')')
            gradient.addColorStop(0.5, particle.color + (alpha * 0.3) + ')')
            gradient.addColorStop(1, particle.color + '0)')

            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
            ctx.fillStyle = gradient
            ctx.fill()

            // 粒子核心
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = particle.color + alpha + ')'
            ctx.fill()
        })

        solarWindAnimationId = requestAnimationFrame(animate)
    }

    solarWindAnimationId = requestAnimationFrame(animate)
}

onMounted(() => {
    initGranulation()
    initSolarWind()
})

onUnmounted(() => {
    if (granulationAnimationId) {
        cancelAnimationFrame(granulationAnimationId)
    }
    if (solarWindAnimationId) {
        cancelAnimationFrame(solarWindAnimationId)
    }
})
</script>

<style lang="scss" scoped>
@use "sass:color";

.solar-storm-background {
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

// 日蚀黑渐变背景
.eclipse-bg {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse at 50% 120%,
            rgba(80, 20, 10, 0.4) 0%,
            transparent 50%),
        linear-gradient(180deg,
            #1a0505 0%,
            #120303 20%,
            #0a0101 40%,
            #050000 70%,
            #000000 100%);
}

// 米粒组织 Canvas
.granulation-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.7;
    image-rendering: auto;
}

// 磁场日珥拱门层
.magnetic-arcs-layer {
    position: absolute;
    inset: 0;
    transition: transform 0.3s ease-out;
}

.arcs-svg {
    position: absolute;
    width: 100%;
    height: 100%;
}

.prominence-arc {
    stroke-linecap: round;
    opacity: 0.6;

    &.arc-1 {
        animation: arcFlow1 25s ease-in-out infinite, arcPulse 8s ease-in-out infinite;
    }

    &.arc-2 {
        animation: arcFlow2 30s ease-in-out infinite, arcPulse 10s ease-in-out infinite;
        animation-delay: -5s;
    }

    &.arc-3 {
        animation: arcFlow3 28s ease-in-out infinite, arcPulse 12s ease-in-out infinite;
        animation-delay: -10s;
    }
}

@keyframes arcFlow1 {

    0%,
    100% {
        stroke-dasharray: 0 200;
        stroke-dashoffset: 0;
    }

    50% {
        stroke-dasharray: 100 200;
        stroke-dashoffset: -100;
    }
}

@keyframes arcFlow2 {

    0%,
    100% {
        stroke-dasharray: 0 180;
        stroke-dashoffset: 0;
    }

    50% {
        stroke-dasharray: 90 180;
        stroke-dashoffset: -90;
    }
}

@keyframes arcFlow3 {

    0%,
    100% {
        stroke-dasharray: 0 160;
        stroke-dashoffset: 0;
    }

    50% {
        stroke-dasharray: 80 160;
        stroke-dashoffset: -80;
    }
}

@keyframes arcPulse {

    0%,
    100% {
        opacity: 0.4;
    }

    50% {
        opacity: 0.8;
    }
}

// 太阳风粒子 Canvas
.solar-wind-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

// 热变形效果层
.heat-distortion-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;

    // 使用伪元素应用热变形效果到局部区域
    &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30%;
        background: transparent;
        filter: url(#heat-wave);
        animation: heatWave 15s ease-in-out infinite;
    }
}

.heat-filter-svg {
    position: absolute;
    width: 0;
    height: 0;
}

@keyframes heatWave {

    0%,
    100% {
        opacity: 0.3;
    }

    50% {
        opacity: 0.6;
    }
}

// 深红暗角遮罩
.crimson-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center,
            transparent 20%,
            rgba(30, 5, 0, 0.3) 60%,
            rgba(10, 0, 0, 0.7) 100%);
    pointer-events: none;
}

// 炉膛边框效果
.furnace-frame {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .frame-edge {
        position: absolute;
        background: linear-gradient(90deg,
                transparent,
                rgba(255, 80, 0, 0.1),
                transparent);

        &.top,
        &.bottom {
            left: 0;
            right: 0;
            height: 2px;
        }

        &.left,
        &.right {
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(180deg,
                    transparent,
                    rgba(255, 80, 0, 0.1),
                    transparent);
        }

        &.top {
            top: 0;
        }

        &.bottom {
            bottom: 0;
        }

        &.left {
            left: 0;
        }

        &.right {
            right: 0;
        }
    }

    .corner-ember {
        position: absolute;
        width: 60px;
        height: 60px;

        &::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center,
                    rgba(255, 120, 0, 0.15) 0%,
                    rgba(255, 69, 0, 0.08) 40%,
                    transparent 70%);
            animation: emberGlow 6s ease-in-out infinite;
        }

        &.top-left {
            top: 0;
            left: 0;

            &::before {
                animation-delay: 0s;
            }
        }

        &.top-right {
            top: 0;
            right: 0;

            &::before {
                animation-delay: -1.5s;
            }
        }

        &.bottom-left {
            bottom: 0;
            left: 0;

            &::before {
                animation-delay: -3s;
            }
        }

        &.bottom-right {
            bottom: 0;
            right: 0;

            &::before {
                animation-delay: -4.5s;
            }
        }
    }
}

@keyframes emberGlow {

    0%,
    100% {
        opacity: 0.5;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.2);
    }
}
</style>
