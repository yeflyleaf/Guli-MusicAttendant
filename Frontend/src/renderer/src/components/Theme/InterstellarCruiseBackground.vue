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
                <div class="planet-ring ring-outer"></div>
                <div class="planet-ring ring-middle"></div>
                <div class="planet-ring ring-inner"></div>
                <div class="planet-glow"></div>
                <div class="ring-glow"></div>
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
                <div class="toxic-atmosphere"></div>
                <div class="planet-glow"></div>
            </div>

            <!-- 冰霜星球 - 右上角 -->
            <div class="planet ice-planet">
                <div class="planet-body"></div>
                <div class="ice-crystals"></div>
                <div class="planet-glow"></div>
            </div>

            <!-- 熔岩金星 - 中左侧 -->
            <div class="planet lava-planet">
                <div class="planet-body"></div>
                <div class="lava-cracks"></div>
                <div class="planet-glow"></div>
            </div>

            <!-- 紫水晶星 - 中右侧 -->
            <div class="planet crystal-planet">
                <div class="planet-body"></div>
                <div class="crystal-facets"></div>
                <div class="planet-glow"></div>
            </div>

            <!-- 暗物质星球 - 底部中央 -->
            <div class="planet dark-matter-planet">
                <div class="planet-body"></div>
                <div class="dark-energy-ring"></div>
                <div class="planet-glow"></div>
            </div>

            <!-- 陨石带 - 边缘装饰 -->
            <div class="asteroid-belt">
                <div class="asteroid" v-for="i in 20" :key="i" :style="getAsteroidStyle(i)"></div>
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
            <div class="cockpit-hud-line hud-top"></div>
            <div class="cockpit-hud-line hud-bottom"></div>
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
    transform: `translate(${(mouseX.value - 0.5) * -12}px, ${(mouseY.value - 0.5) * -12}px)`
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
    const angle = (index / 20) * 360 + Math.random() * 18
    const distance = 30 + Math.random() * 20
    const size = 2 + Math.random() * 5
    const delay = Math.random() * 8
    const duration = 10 + Math.random() * 6

    return {
        '--angle': `${angle}deg`,
        '--distance': `${distance}%`,
        '--size': `${size}px`,
        '--delay': `${delay}s`,
        '--duration': `${duration}s`,
        '--opacity': 0.3 + Math.random() * 0.5
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
    color: string
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

    // 星星颜色
    const starColors = ['#ffffff', '#00f2fe', '#4facfe', '#a78bfa', '#f472b6']

    // 创建星尘粒子 - 增加到 300
    const particleCount = 300
    stardustParticles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random(), // 深度 0-1
        size: 0.5 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.6,
        twinkleSpeed: 0.015 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)]
    }))

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        stardustParticles.forEach(particle => {
            // 更新闪烁相位
            particle.twinklePhase += particle.twinkleSpeed

            // 计算闪烁透明度
            const twinkle = 0.5 + 0.5 * Math.sin(particle.twinklePhase)
            const finalOpacity = particle.opacity * (0.4 + twinkle * 0.6)

            // 极缓慢的 Z 轴移动（仿佛缓慢前进）
            particle.z += 0.00015
            if (particle.z > 1) {
                particle.z = 0
                particle.x = Math.random() * canvas.width
                particle.y = Math.random() * canvas.height
            }

            // 视差效果
            const parallaxX = (mouseX.value - 0.5) * particle.z * 25
            const parallaxY = (mouseY.value - 0.5) * particle.z * 25

            const drawX = particle.x + parallaxX
            const drawY = particle.y + parallaxY
            const drawSize = particle.size * (0.5 + particle.z * 0.5)

            // 绘制星尘
            ctx.beginPath()
            ctx.arc(drawX, drawY, drawSize, 0, Math.PI * 2)
            ctx.fillStyle = particle.color.replace(')', `, ${finalOpacity})`).replace('rgb', 'rgba').replace('#', '')

            // 处理十六进制颜色
            if (particle.color.startsWith('#')) {
                const r = parseInt(particle.color.slice(1, 3), 16)
                const g = parseInt(particle.color.slice(3, 5), 16)
                const b = parseInt(particle.color.slice(5, 7), 16)
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`
            }
            ctx.fill()

            // 添加发光效果（对所有星星，更强烈）
            if (particle.size > 1 && twinkle > 0.5) {
                ctx.beginPath()
                ctx.arc(drawX, drawY, drawSize * 3, 0, Math.PI * 2)
                const gradient = ctx.createRadialGradient(
                    drawX, drawY, 0,
                    drawX, drawY, drawSize * 3
                )

                if (particle.color.startsWith('#')) {
                    const r = parseInt(particle.color.slice(1, 3), 16)
                    const g = parseInt(particle.color.slice(3, 5), 16)
                    const b = parseInt(particle.color.slice(5, 7), 16)
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.6})`)
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
                } else {
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.6})`)
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
                }
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
    width: number
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

    // 创建数据雨滴 - 增加到 80
    const dropCount = 80
    const colors = ['#00f2fe', '#4facfe', '#a78bfa', '#ffffff', '#22d3ee']

    dataRainDrops = Array.from({ length: dropCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 60 + Math.random() * 150,
        speed: 0.4 + Math.random() * 0.8,
        opacity: 0.1 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 1 + Math.random() * 1.5
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

            // 解析颜色
            let r = 255, g = 255, b = 255
            if (drop.color.startsWith('#')) {
                r = parseInt(drop.color.slice(1, 3), 16)
                g = parseInt(drop.color.slice(3, 5), 16)
                b = parseInt(drop.color.slice(5, 7), 16)
            }

            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
            gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${drop.opacity})`)
            gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${drop.opacity})`)
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

            ctx.beginPath()
            ctx.moveTo(drop.x, drop.y)
            ctx.lineTo(drop.x, drop.y + drop.length)
            ctx.strokeStyle = gradient
            ctx.lineWidth = drop.width
            ctx.lineCap = 'round'
            ctx.stroke()

            // 添加头部发光点
            ctx.beginPath()
            ctx.arc(drop.x, drop.y + drop.length * 0.5, drop.width * 2, 0, Math.PI * 2)
            const glowGradient = ctx.createRadialGradient(
                drop.x, drop.y + drop.length * 0.5, 0,
                drop.x, drop.y + drop.length * 0.5, drop.width * 3
            )
            glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${drop.opacity * 0.8})`)
            glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
            ctx.fillStyle = glowGradient
            ctx.fill()
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
    opacity: 0.3;
    animation: nebulaPulse 20s ease-in-out infinite;

    &.nebula-1 {
        top: -15%;
        left: -10%;
        width: 50%;
        height: 50%;
        background: radial-gradient(ellipse at center,
                rgba(139, 92, 246, 0.5) 0%,
                rgba(79, 172, 254, 0.25) 40%,
                transparent 70%);
        animation-delay: 0s;
    }

    &.nebula-2 {
        bottom: -20%;
        right: -15%;
        width: 60%;
        height: 60%;
        background: radial-gradient(ellipse at center,
                rgba(236, 72, 153, 0.4) 0%,
                rgba(139, 92, 246, 0.2) 40%,
                transparent 70%);
        animation-delay: -5s;
    }

    &.nebula-3 {
        top: 30%;
        right: -10%;
        width: 40%;
        height: 40%;
        background: radial-gradient(ellipse at center,
                rgba(16, 185, 129, 0.35) 0%,
                rgba(79, 172, 254, 0.15) 40%,
                transparent 70%);
        animation-delay: -10s;
    }

    &.nebula-4 {
        bottom: 10%;
        left: -5%;
        width: 35%;
        height: 35%;
        background: radial-gradient(ellipse at center,
                rgba(79, 172, 254, 0.4) 0%,
                rgba(0, 242, 254, 0.2) 40%,
                transparent 70%);
        animation-delay: -15s;
    }
}

@keyframes nebulaPulse {

    0%,
    100% {
        opacity: 0.25;
        transform: scale(1);
    }

    50% {
        opacity: 0.45;
        transform: scale(1.08);
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
        opacity: 0.6;
    }
}

// 主星球 - 蓝紫色带多层光环
.main-planet {
    bottom: -10%;
    right: -8%;
    width: 350px;
    height: 350px;
    animation: planetFloat 10s ease-in-out infinite;

    .planet-body {
        inset: 15%;
        background: radial-gradient(circle at 30% 30%,
                #818cf8 0%,
                #6366f1 20%,
                #4f46e5 40%,
                #3730a3 60%,
                #1e1b4b 100%);
        box-shadow:
            inset -30px -30px 60px rgba(0, 0, 0, 0.6),
            inset 10px 10px 30px rgba(167, 139, 250, 0.4),
            0 0 80px rgba(99, 102, 241, 0.4);
    }

    // 多层星环 - 更加清晰可见
    .planet-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        animation: ringRotate 40s linear infinite;

        &.ring-outer {
            width: 200%;
            height: 50%;
            transform: translate(-50%, -50%) rotateX(72deg);
            border: 3px solid rgba(167, 139, 250, 0.7);
            background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(139, 92, 246, 0.25) 15%,
                    rgba(79, 172, 254, 0.35) 35%,
                    rgba(236, 72, 153, 0.3) 50%,
                    rgba(79, 172, 254, 0.35) 65%,
                    rgba(139, 92, 246, 0.25) 85%,
                    transparent 100%);
            box-shadow:
                0 0 20px rgba(167, 139, 250, 0.5),
                0 0 40px rgba(79, 172, 254, 0.3),
                inset 0 0 20px rgba(167, 139, 250, 0.3);
        }

        &.ring-middle {
            width: 180%;
            height: 45%;
            transform: translate(-50%, -50%) rotateX(72deg);
            border: 2px solid rgba(79, 172, 254, 0.6);
            background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(0, 242, 254, 0.2) 20%,
                    rgba(79, 172, 254, 0.3) 50%,
                    rgba(0, 242, 254, 0.2) 80%,
                    transparent 100%);
            animation-duration: 35s;
            animation-direction: reverse;
        }

        &.ring-inner {
            width: 160%;
            height: 40%;
            transform: translate(-50%, -50%) rotateX(72deg);
            border: 1px solid rgba(236, 72, 153, 0.5);
            background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(236, 72, 153, 0.15) 30%,
                    rgba(167, 139, 250, 0.2) 50%,
                    rgba(236, 72, 153, 0.15) 70%,
                    transparent 100%);
            animation-duration: 30s;
        }
    }

    // 星环发光层
    .ring-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200%;
        height: 60%;
        transform: translate(-50%, -50%) rotateX(72deg);
        background: radial-gradient(ellipse at center,
                rgba(139, 92, 246, 0.3) 0%,
                rgba(79, 172, 254, 0.15) 40%,
                transparent 70%);
        filter: blur(15px);
        animation: ringGlow 5s ease-in-out infinite;
    }

    .planet-glow {
        inset: -25%;
        background: radial-gradient(circle at center,
                rgba(99, 102, 241, 0.5) 0%,
                rgba(139, 92, 246, 0.2) 40%,
                transparent 70%);
    }
}

@keyframes ringRotate {
    from {
        transform: translate(-50%, -50%) rotateX(72deg) rotateZ(0deg);
    }

    to {
        transform: translate(-50%, -50%) rotateX(72deg) rotateZ(360deg);
    }
}

@keyframes ringGlow {

    0%,
    100% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }
}

// 红巨星
.red-giant {
    top: -8%;
    left: -5%;
    width: 200px;
    height: 200px;
    animation: planetFloat 8s ease-in-out infinite;
    animation-delay: -3s;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 40% 40%,
                #fca5a5 0%,
                #dc2626 30%,
                #991b1b 50%,
                #450a0a 80%,
                #1c0505 100%);
        box-shadow:
            inset -25px -25px 50px rgba(0, 0, 0, 0.7),
            0 0 80px rgba(220, 38, 38, 0.4),
            0 0 120px rgba(251, 146, 60, 0.2);
    }

    .magma-texture {
        position: absolute;
        inset: 5%;
        border-radius: 50%;
        background:
            radial-gradient(ellipse at 20% 30%, rgba(251, 146, 60, 0.5) 0%, transparent 30%),
            radial-gradient(ellipse at 60% 70%, rgba(251, 146, 60, 0.4) 0%, transparent 25%),
            radial-gradient(ellipse at 80% 40%, rgba(234, 88, 12, 0.45) 0%, transparent 20%),
            radial-gradient(ellipse at 40% 60%, rgba(239, 68, 68, 0.3) 0%, transparent 35%);
        animation: magmaFlow 12s ease-in-out infinite;
    }

    .planet-glow {
        inset: -35%;
        background: radial-gradient(circle at center,
                rgba(220, 38, 38, 0.4) 0%,
                rgba(251, 146, 60, 0.2) 40%,
                transparent 70%);
    }
}

@keyframes magmaFlow {

    0%,
    100% {
        transform: rotate(0deg) scale(1);
    }

    50% {
        transform: rotate(15deg) scale(1.03);
    }
}

// 毒气绿星
.toxic-planet {
    bottom: 12%;
    left: 2%;
    width: 100px;
    height: 100px;
    animation: planetFloat 7s ease-in-out infinite;
    animation-delay: -5s;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 35% 35%,
                #4ade80 0%,
                #22c55e 30%,
                #15803d 50%,
                #052e16 80%,
                #022c22 100%);
        box-shadow:
            inset -12px -12px 25px rgba(0, 0, 0, 0.6),
            0 0 40px rgba(34, 197, 94, 0.3);
    }

    .toxic-atmosphere {
        position: absolute;
        inset: -15%;
        border-radius: 50%;
        background: radial-gradient(circle at center,
                transparent 50%,
                rgba(34, 197, 94, 0.2) 70%,
                rgba(74, 222, 128, 0.1) 100%);
        animation: atmospherePulse 4s ease-in-out infinite;
    }

    .planet-glow {
        inset: -45%;
        background: radial-gradient(circle at center,
                rgba(34, 197, 94, 0.4) 0%,
                transparent 70%);
    }
}

@keyframes atmospherePulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.8;
    }

    50% {
        transform: scale(1.1);
        opacity: 1;
    }
}

// 冰霜星球
.ice-planet {
    top: 8%;
    right: 15%;
    width: 70px;
    height: 70px;
    animation: planetFloat 9s ease-in-out infinite;
    animation-delay: -2s;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 30% 30%,
                #ffffff 0%,
                #e0f2fe 20%,
                #7dd3fc 40%,
                #0ea5e9 60%,
                #0369a1 100%);
        box-shadow:
            inset -10px -10px 20px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(14, 165, 233, 0.4),
            0 0 50px rgba(125, 211, 252, 0.2);
    }

    .ice-crystals {
        position: absolute;
        inset: 10%;
        border-radius: 50%;
        background:
            radial-gradient(ellipse at 25% 25%, rgba(255, 255, 255, 0.8) 0%, transparent 20%),
            radial-gradient(ellipse at 70% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 15%),
            radial-gradient(ellipse at 40% 70%, rgba(255, 255, 255, 0.5) 0%, transparent 18%);
        animation: crystalShimmer 3s ease-in-out infinite;
    }

    .planet-glow {
        inset: -50%;
        background: radial-gradient(circle at center,
                rgba(14, 165, 233, 0.4) 0%,
                rgba(125, 211, 252, 0.2) 40%,
                transparent 70%);
    }
}

@keyframes crystalShimmer {

    0%,
    100% {
        opacity: 0.7;
    }

    50% {
        opacity: 1;
    }
}

// 熔岩金星
.lava-planet {
    top: 40%;
    left: 8%;
    width: 55px;
    height: 55px;
    animation: planetFloat 6s ease-in-out infinite;
    animation-delay: -4s;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 35% 35%,
                #fef08a 0%,
                #facc15 25%,
                #eab308 45%,
                #a16207 70%,
                #78350f 100%);
        box-shadow:
            inset -8px -8px 16px rgba(0, 0, 0, 0.4),
            0 0 35px rgba(234, 179, 8, 0.5);
    }

    .lava-cracks {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background:
            linear-gradient(45deg, transparent 45%, rgba(239, 68, 68, 0.4) 50%, transparent 55%),
            linear-gradient(-45deg, transparent 45%, rgba(251, 146, 60, 0.3) 50%, transparent 55%);
        animation: lavaPulse 2s ease-in-out infinite;
    }

    .planet-glow {
        inset: -55%;
        background: radial-gradient(circle at center,
                rgba(234, 179, 8, 0.5) 0%,
                rgba(251, 146, 60, 0.2) 40%,
                transparent 70%);
    }
}

@keyframes lavaPulse {

    0%,
    100% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }
}

// 紫水晶星
.crystal-planet {
    top: 25%;
    right: 5%;
    width: 45px;
    height: 45px;
    animation: planetFloat 8s ease-in-out infinite;
    animation-delay: -6s;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 30% 30%,
                #f5d0fe 0%,
                #e879f9 25%,
                #c026d3 50%,
                #86198f 75%,
                #4a044e 100%);
        box-shadow:
            inset -6px -6px 12px rgba(0, 0, 0, 0.4),
            0 0 25px rgba(192, 38, 211, 0.5);
    }

    .crystal-facets {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background:
            linear-gradient(60deg, transparent 40%, rgba(255, 255, 255, 0.4) 50%, transparent 60%),
            linear-gradient(-60deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%);
        animation: facetGlint 4s ease-in-out infinite;
    }

    .planet-glow {
        inset: -60%;
        background: radial-gradient(circle at center,
                rgba(192, 38, 211, 0.5) 0%,
                rgba(232, 121, 249, 0.2) 40%,
                transparent 70%);
    }
}

@keyframes facetGlint {

    0%,
    100% {
        opacity: 0.5;
        transform: rotate(0deg);
    }

    50% {
        opacity: 1;
        transform: rotate(10deg);
    }
}

// 暗物质星球
.dark-matter-planet {
    bottom: 25%;
    left: 45%;
    width: 60px;
    height: 60px;
    animation: planetFloat 11s ease-in-out infinite;
    animation-delay: -7s;

    .planet-body {
        inset: 0;
        background: radial-gradient(circle at 40% 40%,
                #374151 0%,
                #1f2937 30%,
                #111827 60%,
                #030712 100%);
        box-shadow:
            inset -8px -8px 16px rgba(0, 0, 0, 0.8),
            0 0 30px rgba(55, 65, 81, 0.3);
    }

    .dark-energy-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 180%;
        height: 180%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        border: 1px solid rgba(139, 92, 246, 0.3);
        animation: darkEnergyPulse 3s ease-in-out infinite;

        &::before {
            content: '';
            position: absolute;
            inset: 15%;
            border-radius: 50%;
            border: 1px solid rgba(79, 172, 254, 0.2);
            animation: darkEnergyPulse 3s ease-in-out infinite reverse;
        }
    }

    .planet-glow {
        inset: -40%;
        background: radial-gradient(circle at center,
                rgba(139, 92, 246, 0.3) 0%,
                rgba(55, 65, 81, 0.2) 40%,
                transparent 70%);
    }
}

@keyframes darkEnergyPulse {

    0%,
    100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.5;
    }

    50% {
        transform: translate(-50%, -50%) scale(1.15);
        opacity: 1;
    }
}

@keyframes planetFloat {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-18px);
    }
}

// 陨石带
.asteroid-belt {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 140%;
    height: 140%;
    transform: translate(-50%, -50%);
}

.asteroid {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--size);
    height: var(--size);
    background: linear-gradient(135deg,
            #94a3b8 0%,
            #64748b 30%,
            #475569 60%,
            #334155 100%);
    border-radius: 30% 70% 50% 50%;
    opacity: var(--opacity);
    transform-origin: center;
    animation: asteroidOrbit var(--duration) linear infinite;
    animation-delay: var(--delay);
    box-shadow: 0 0 5px rgba(100, 116, 139, 0.3);

    // 初始位置
    --x: calc(cos(var(--angle)) * var(--distance));
    --y: calc(sin(var(--angle)) * var(--distance));
    left: calc(50% + var(--x));
    top: calc(50% + var(--y));
}

@keyframes asteroidOrbit {
    from {
        transform: rotate(0deg) translateX(15px) rotate(0deg);
    }

    to {
        transform: rotate(360deg) translateX(15px) rotate(-360deg);
    }
}

// 暗角遮罩
.vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center,
            transparent 25%,
            rgba(0, 0, 0, 0.3) 60%,
            rgba(0, 0, 0, 0.6) 100%);
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
    width: 120px;
    height: 120px;
    border: 2px solid rgba(79, 172, 254, 0.25);

    &.top-left {
        top: 15px;
        left: 15px;
        border-right: none;
        border-bottom: none;
        border-radius: 25px 0 0 0;
        box-shadow: -5px -5px 20px rgba(79, 172, 254, 0.1);
    }

    &.top-right {
        top: 15px;
        right: 15px;
        border-left: none;
        border-bottom: none;
        border-radius: 0 25px 0 0;
        box-shadow: 5px -5px 20px rgba(79, 172, 254, 0.1);
    }

    &.bottom-left {
        bottom: 15px;
        left: 15px;
        border-right: none;
        border-top: none;
        border-radius: 0 0 0 25px;
        box-shadow: -5px 5px 20px rgba(79, 172, 254, 0.1);
    }

    &.bottom-right {
        bottom: 15px;
        right: 15px;
        border-left: none;
        border-top: none;
        border-radius: 0 0 25px 0;
        box-shadow: 5px 5px 20px rgba(79, 172, 254, 0.1);
    }
}

.cockpit-hud-line {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 1px;
    background: linear-gradient(90deg,
            transparent 0%,
            rgba(79, 172, 254, 0.3) 20%,
            rgba(79, 172, 254, 0.5) 50%,
            rgba(79, 172, 254, 0.3) 80%,
            transparent 100%);

    &.hud-top {
        top: 20px;
    }

    &.hud-bottom {
        bottom: 20px;
    }
}
</style>
