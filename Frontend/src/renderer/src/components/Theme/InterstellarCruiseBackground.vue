<template>
    <div class="interstellar-background" ref="containerRef" @mousemove="handleMouseMove">
        <!-- 底层：深空渐变背景 -->
        <div class="deep-space-bg"></div>

        <!-- 底层：脉动的星云 -->
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
        <div class="nebula nebula-3"></div>
        <div class="nebula nebula-4"></div>

        <!-- 中层：星尘粒子 Canvas -->
        <canvas ref="stardustCanvas" class="stardust-canvas"></canvas>

        <!-- 中层：数据雨粒子 Canvas -->
        <canvas ref="dataRainCanvas" class="data-rain-canvas"></canvas>

        <!-- 装饰层：悬浮行星 -->
        <div class="planets-layer" :style="parallaxStyle">
            <!-- 主星球 - 右下角蓝紫色带光环 -->
            <div class="planet main-planet">
                <div class="planet-body"></div>
                <div class="planet-ring"></div>
                <div class="planet-glow"></div>
            </div>

            <!-- 红巨星 - 左上角 -->
            <div class="planet red-giant">
                <div class="planet-body"></div>
                <div class="magma-texture"></div>
                <div class="planet-glow"></div>
            </div>

            <!-- 毒气绿星 - 左下角装饰 -->
            <div class="planet toxic-planet">
                <div class="planet-body"></div>
                <div class="planet-glow"></div>
            </div>

            <!-- 陨石带 - 边缘装饰 -->
            <div class="asteroid-belt">
                <div class="asteroid" v-for="i in 12" :key="i" :style="getAsteroidStyle(i)"></div>
            </div>
        </div>

        <!-- 顶层：暗角遮罩 -->
        <div class="vignette-overlay"></div>

        <!-- 顶层：玻璃座舱边框效果 -->
        <div class="cockpit-frame">
            <div class="cockpit-corner top-left"></div>
            <div class="cockpit-corner top-right"></div>
            <div class="cockpit-corner bottom-left"></div>
            <div class="cockpit-corner bottom-right"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
const stardustCanvas = ref<HTMLCanvasElement | null>(null)
const dataRainCanvas = ref<HTMLCanvasElement | null>(null)

// 鼠标位置用于视差效果
const mouseX = ref(0.5)
const mouseY = ref(0.5)

// 视差偏移量（极其微小）
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

// 陨石样式生成
const getAsteroidStyle = (index: number) => {
    const angle = (index / 12) * 360 + Math.random() * 30
    const distance = 35 + Math.random() * 15
    const size = 2 + Math.random() * 4
    const delay = Math.random() * 6
    const duration = 8 + Math.random() * 4

    return {
        '--angle': `${angle}deg`,
        '--distance': `${distance}%`,
        '--size': `${size}px`,
        '--delay': `${delay}s`,
        '--duration': `${duration}s`,
        '--opacity': 0.3 + Math.random() * 0.4
    }
}

// 星尘粒子系统
interface StarDust {
    x: number
    y: number
    z: number
    size: number
    opacity: number
    twinkleSpeed: number
    twinklePhase: number
}

let stardustParticles: StarDust[] = []
let stardustAnimationId: number | null = null

const initStardust = () => {
    const canvas = stardustCanvas.value
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

    // 创建星尘粒子
    const particleCount = 200
    stardustParticles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random(), // 深度 0-1
        size: 0.5 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.5,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2
    }))

    let time = 0

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        time += 0.016 // ~60fps

        stardustParticles.forEach(particle => {
            // 更新闪烁相位
            particle.twinklePhase += particle.twinkleSpeed

            // 计算闪烁透明度
            const twinkle = 0.5 + 0.5 * Math.sin(particle.twinklePhase)
            const finalOpacity = particle.opacity * (0.4 + twinkle * 0.6)

            // 极缓慢的 Z 轴移动（仿佛缓慢前进）
            particle.z += 0.0001
            if (particle.z > 1) {
                particle.z = 0
                particle.x = Math.random() * canvas.width
                particle.y = Math.random() * canvas.height
            }

            // 视差效果
            const parallaxX = (mouseX.value - 0.5) * particle.z * 20
            const parallaxY = (mouseY.value - 0.5) * particle.z * 20

            // 绘制星尘
            ctx.beginPath()
            ctx.arc(
                particle.x + parallaxX,
                particle.y + parallaxY,
                particle.size * (0.5 + particle.z * 0.5),
                0,
                Math.PI * 2
            )
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`
            ctx.fill()

            // 添加发光效果（仅对较大的星星）
            if (particle.size > 1.2 && twinkle > 0.7) {
                ctx.beginPath()
                ctx.arc(
                    particle.x + parallaxX,
                    particle.y + parallaxY,
                    particle.size * 2,
                    0,
                    Math.PI * 2
                )
                const gradient = ctx.createRadialGradient(
                    particle.x + parallaxX, particle.y + parallaxY, 0,
                    particle.x + parallaxX, particle.y + parallaxY, particle.size * 2
                )
                gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.5})`)
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
                ctx.fillStyle = gradient
                ctx.fill()
            }
        })

        stardustAnimationId = requestAnimationFrame(animate)
    }

    animate()
}

// 数据雨粒子系统
interface DataRainDrop {
    x: number
    y: number
    length: number
    speed: number
    opacity: number
    color: string
}

let dataRainDrops: DataRainDrop[] = []
let dataRainAnimationId: number | null = null

const initDataRain = () => {
    const canvas = dataRainCanvas.value
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

    // 创建数据雨滴（稀疏的）
    const dropCount = 30
    const colors = ['#00f2fe', '#4facfe', '#ffffff']

    dataRainDrops = Array.from({ length: dropCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 80 + Math.random() * 120,
        speed: 0.3 + Math.random() * 0.5, // 极慢的速度
        opacity: 0.15 + Math.random() * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)]
    }))

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        dataRainDrops.forEach(drop => {
            // 更新位置
            drop.y += drop.speed
            if (drop.y > canvas.height + drop.length) {
                drop.y = -drop.length
                drop.x = Math.random() * canvas.width
            }

            // 绘制渐变线条
            const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length)
            gradient.addColorStop(0, `${drop.color}00`)
            gradient.addColorStop(0.5, drop.color + Math.floor(drop.opacity * 255).toString(16).padStart(2, '0'))
            gradient.addColorStop(1, `${drop.color}00`)

            ctx.beginPath()
            ctx.moveTo(drop.x, drop.y)
            ctx.lineTo(drop.x, drop.y + drop.length)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
        })

        dataRainAnimationId = requestAnimationFrame(animate)
    }

    animate()
}

onMounted(() => {
    initStardust()
    initDataRain()
})

onUnmounted(() => {
    if (stardustAnimationId) {
        cancelAnimationFrame(stardustAnimationId)
    }
    if (dataRainAnimationId) {
        cancelAnimationFrame(dataRainAnimationId)
    }
})
</script>

<style lang="scss" scoped>
@use "sass:color";

.interstellar-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -1;
    pointer-events: none;
}

// 深空渐变背景
.deep-space-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
            #090a0f 0%,
            #0a0b12 20%,
            #080915 50%,
            #050608 80%,
            #000000 100%);
}

// 脉动星云
.nebula {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.25;
    animation: nebulaPulse 20s ease-in-out infinite;

    &.nebula-1 {
        top: -15%;
        left: -10%;
        width: 50%;
        height: 50%;
        background: radial-gradient(ellipse at center,
                rgba(139, 92, 246, 0.4) 0%,
                rgba(79, 172, 254, 0.2) 40%,
                transparent 70%);
        animation-delay: 0s;
    }

    &.nebula-2 {
        bottom: -20%;
        right: -15%;
        width: 60%;
        height: 60%;
        background: radial-gradient(ellipse at center,
                rgba(236, 72, 153, 0.3) 0%,
                rgba(139, 92, 246, 0.15) 40%,
                transparent 70%);
        animation-delay: -5s;
    }

    &.nebula-3 {
        top: 30%;
        right: -10%;
        width: 40%;
        height: 40%;
        background: radial-gradient(ellipse at center,
                rgba(16, 185, 129, 0.25) 0%,
                rgba(79, 172, 254, 0.1) 40%,
                transparent 70%);
        animation-delay: -10s;
    }

    &.nebula-4 {
        bottom: 10%;
        left: -5%;
        width: 35%;
        height: 35%;
        background: radial-gradient(ellipse at center,
                rgba(79, 172, 254, 0.3) 0%,
                rgba(0, 242, 254, 0.15) 40%,
                transparent 70%);
        animation-delay: -15s;
    }
}

@keyframes nebulaPulse {

    0%,
    100% {
        opacity: 0.2;
        transform: scale(1);
    }

    50% {
        opacity: 0.4;
        transform: scale(1.05);
    }
}

// Canvas 层
.stardust-canvas,
.data-rain-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

// 行星层
.planets-layer {
    position: absolute;
    inset: 0;
    transition: transform 0.3s ease-out;
}

// 行星基础样式
.planet {
    position: absolute;

    .planet-body {
        position: absolute;
        border-radius: 50%;
    }

    .planet-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(30px);
        opacity: 0.5;
    }
}

// 主星球 - 蓝紫色带光环
.main-planet {
    bottom: -8%;
    right: -5%;
    width: 300px;
    height: 300px;
    animation: planetFloat 10s ease-in-out infinite;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 30% 30%,
                #6366f1 0%,
                #4f46e5 30%,
                #3730a3 60%,
                #1e1b4b 100%);
        box-shadow:
            inset -30px -30px 60px rgba(0, 0, 0, 0.6),
            inset 10px 10px 30px rgba(139, 92, 246, 0.3);
    }

    .planet-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 180%;
        height: 40%;
        transform: translate(-50%, -50%) rotateX(75deg);
        border: 2px solid rgba(139, 92, 246, 0.4);
        border-radius: 50%;
        background: linear-gradient(90deg,
                transparent 0%,
                rgba(139, 92, 246, 0.1) 20%,
                rgba(79, 172, 254, 0.15) 50%,
                rgba(139, 92, 246, 0.1) 80%,
                transparent 100%);
        animation: ringRotate 30s linear infinite;

        &::before,
        &::after {
            content: '';
            position: absolute;
            inset: -8px;
            border: 1px solid rgba(79, 172, 254, 0.2);
            border-radius: 50%;
        }

        &::after {
            inset: 8px;
            border-color: rgba(236, 72, 153, 0.15);
        }
    }

    .planet-glow {
        inset: -20%;
        background: radial-gradient(circle at center,
                rgba(99, 102, 241, 0.4) 0%,
                transparent 70%);
    }
}

@keyframes ringRotate {
    from {
        transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg);
    }

    to {
        transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg);
    }
}

// 红巨星
.red-giant {
    top: -5%;
    left: -3%;
    width: 180px;
    height: 180px;
    animation: planetFloat 8s ease-in-out infinite;
    animation-delay: -3s;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 40% 40%,
                #dc2626 0%,
                #991b1b 40%,
                #450a0a 80%,
                #1c0505 100%);
        box-shadow:
            inset -20px -20px 40px rgba(0, 0, 0, 0.7),
            0 0 60px rgba(220, 38, 38, 0.3);
    }

    .magma-texture {
        position: absolute;
        inset: 5%;
        border-radius: 50%;
        background:
            radial-gradient(ellipse at 20% 30%, rgba(251, 146, 60, 0.4) 0%, transparent 30%),
            radial-gradient(ellipse at 60% 70%, rgba(251, 146, 60, 0.3) 0%, transparent 25%),
            radial-gradient(ellipse at 80% 40%, rgba(234, 88, 12, 0.35) 0%, transparent 20%);
        animation: magmaFlow 15s ease-in-out infinite;
    }

    .planet-glow {
        inset: -30%;
        background: radial-gradient(circle at center,
                rgba(220, 38, 38, 0.3) 0%,
                rgba(251, 146, 60, 0.1) 40%,
                transparent 70%);
    }
}

@keyframes magmaFlow {

    0%,
    100% {
        transform: rotate(0deg) scale(1);
    }

    50% {
        transform: rotate(10deg) scale(1.02);
    }
}

// 毒气绿星
.toxic-planet {
    bottom: 15%;
    left: 3%;
    width: 80px;
    height: 80px;
    animation: planetFloat 7s ease-in-out infinite;
    animation-delay: -5s;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 35% 35%,
                #22c55e 0%,
                #15803d 40%,
                #052e16 80%,
                #022c22 100%);
        box-shadow:
            inset -10px -10px 20px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(34, 197, 94, 0.2);
    }

    .planet-glow {
        inset: -40%;
        background: radial-gradient(circle at center,
                rgba(34, 197, 94, 0.3) 0%,
                transparent 70%);
    }
}

@keyframes planetFloat {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-15px);
    }
}

// 陨石带
.asteroid-belt {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    transform: translate(-50%, -50%);
}

.asteroid {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--size);
    height: var(--size);
    background: linear-gradient(135deg,
            #64748b 0%,
            #334155 50%,
            #1e293b 100%);
    border-radius: 30% 70% 50% 50%;
    opacity: var(--opacity);
    transform-origin: center;
    animation: asteroidOrbit var(--duration) linear infinite;
    animation-delay: var(--delay);

    // 初始位置
    --x: calc(cos(var(--angle)) * var(--distance));
    --y: calc(sin(var(--angle)) * var(--distance));
    left: calc(50% + var(--x));
    top: calc(50% + var(--y));
}

@keyframes asteroidOrbit {
    from {
        transform: rotate(0deg) translateX(10px) rotate(0deg);
    }

    to {
        transform: rotate(360deg) translateX(10px) rotate(-360deg);
    }
}

// 暗角遮罩
.vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center,
            transparent 30%,
            rgba(0, 0, 0, 0.4) 70%,
            rgba(0, 0, 0, 0.7) 100%);
    pointer-events: none;
}

// 座舱边框效果
.cockpit-frame {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.cockpit-corner {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 1px solid rgba(79, 172, 254, 0.15);

    &.top-left {
        top: 20px;
        left: 20px;
        border-right: none;
        border-bottom: none;
        border-radius: 20px 0 0 0;
    }

    &.top-right {
        top: 20px;
        right: 20px;
        border-left: none;
        border-bottom: none;
        border-radius: 0 20px 0 0;
    }

    &.bottom-left {
        bottom: 20px;
        left: 20px;
        border-right: none;
        border-top: none;
        border-radius: 0 0 0 20px;
    }

    &.bottom-right {
        bottom: 20px;
        right: 20px;
        border-left: none;
        border-top: none;
        border-radius: 0 0 20px 0;
    }
}
</style>
