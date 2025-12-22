<template>
    <div class="gothic-background" :class="{ embedded: embedded }" ref="containerRef" @mousemove="handleMouseMove">
        <!-- 底层：镜面黑曜石地面 -->
        <div class="obsidian-floor">
            <div class="floor-surface"></div>
            <div class="floor-reflection"></div>
        </div>

        <!-- 底层：深邃渐变背景 -->
        <div class="sanctuary-bg"></div>

        <!-- 远景：尖顶剪影与迷雾 -->
        <div class="spire-layer">
            <div class="spire spire-1"></div>
            <div class="spire spire-2"></div>
            <div class="spire spire-3"></div>
            <div class="spire spire-4"></div>
            <div class="flying-buttress buttress-1"></div>
            <div class="flying-buttress buttress-2"></div>
        </div>

        <!-- 流动薄雾 -->
        <div class="mist-layer">
            <div class="mist mist-1"></div>
            <div class="mist mist-2"></div>
            <div class="mist mist-3"></div>
        </div>

        <!-- 中层：悬浮玫瑰花窗 -->
        <div class="rose-windows-layer" :style="parallaxStyle">
            <!-- 中央主花窗 -->
            <div class="rose-window main-window">
                <svg viewBox="0 0 200 200" class="window-svg">
                    <!-- 外圈装饰 -->
                    <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(114, 14, 30, 0.6)" stroke-width="2" />
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(15, 44, 103, 0.6)" stroke-width="1" />

                    <!-- 中心圆 -->
                    <circle cx="100" cy="100" r="15" fill="rgba(114, 14, 30, 0.3)" />

                    <!-- 花瓣放射线 -->
                    <g class="petals">
                        <path v-for="i in 12" :key="i" :d="getPetalPath(i)"
                            :fill="i % 2 === 0 ? 'rgba(114, 14, 30, 0.25)' : 'rgba(15, 44, 103, 0.25)'"
                            :stroke="i % 2 === 0 ? 'rgba(114, 14, 30, 0.5)' : 'rgba(15, 44, 103, 0.5)'"
                            stroke-width="0.5" />
                    </g>

                    <!-- 内部几何图案 -->
                    <g class="inner-pattern">
                        <circle v-for="j in 6" :key="j" :cx="100 + 40 * Math.cos((j - 1) * Math.PI / 3)"
                            :cy="100 + 40 * Math.sin((j - 1) * Math.PI / 3)" r="18" fill="rgba(114, 14, 30, 0.15)"
                            stroke="rgba(197, 160, 89, 0.4)" stroke-width="0.5" />
                    </g>

                    <!-- 装饰外环 -->
                    <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(197, 160, 89, 0.3)" stroke-width="1" />
                    <circle cx="100" cy="100" r="55" fill="none" stroke="rgba(197, 160, 89, 0.2)" stroke-width="0.5" />
                </svg>
                <div class="window-glow"></div>
            </div>

            <!-- 左侧小花窗 -->
            <div class="rose-window side-window left">
                <svg viewBox="0 0 100 100" class="window-svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(15, 44, 103, 0.5)" stroke-width="1.5" />
                    <circle cx="50" cy="50" r="10" fill="rgba(15, 44, 103, 0.3)" />
                    <g class="small-petals">
                        <path v-for="i in 8" :key="i" :d="getSmallPetalPath(i)" fill="rgba(15, 44, 103, 0.2)"
                            stroke="rgba(15, 44, 103, 0.4)" stroke-width="0.3" />
                    </g>
                </svg>
                <div class="window-glow blue"></div>
            </div>

            <!-- 右侧小花窗 -->
            <div class="rose-window side-window right">
                <svg viewBox="0 0 100 100" class="window-svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(114, 14, 30, 0.5)" stroke-width="1.5" />
                    <circle cx="50" cy="50" r="10" fill="rgba(114, 14, 30, 0.3)" />
                    <g class="small-petals">
                        <path v-for="i in 8" :key="i" :d="getSmallPetalPath(i)" fill="rgba(114, 14, 30, 0.2)"
                            stroke="rgba(114, 14, 30, 0.4)" stroke-width="0.3" />
                    </g>
                </svg>
                <div class="window-glow red"></div>
            </div>
        </div>

        <!-- 近景：烛光效果 -->
        <div class="candlelight-layer">
            <div class="candle-glow candle-1"></div>
            <div class="candle-glow candle-2"></div>
            <div class="candle-glow candle-3"></div>
            <div class="candle-glow candle-4"></div>
        </div>

        <!-- 尘埃粒子 Canvas -->
        <canvas ref="dustCanvas" class="dust-canvas"></canvas>

        <!-- 装饰元素：哥特式边角 -->
        <div class="gothic-corners">
            <div class="corner corner-tl">
                <svg viewBox="0 0 80 80">
                    <path d="M0 0 L80 0 L80 5 L5 5 L5 80 L0 80 Z" fill="rgba(197, 160, 89, 0.15)" />
                    <path d="M10 10 L40 10 L40 12 L12 12 L12 40 L10 40 Z" fill="rgba(197, 160, 89, 0.1)" />
                    <circle cx="20" cy="20" r="3" fill="rgba(197, 160, 89, 0.2)" />
                </svg>
            </div>
            <div class="corner corner-tr">
                <svg viewBox="0 0 80 80">
                    <path d="M80 0 L0 0 L0 5 L75 5 L75 80 L80 80 Z" fill="rgba(197, 160, 89, 0.15)" />
                    <path d="M70 10 L40 10 L40 12 L68 12 L68 40 L70 40 Z" fill="rgba(197, 160, 89, 0.1)" />
                    <circle cx="60" cy="20" r="3" fill="rgba(197, 160, 89, 0.2)" />
                </svg>
            </div>
            <div class="corner corner-bl">
                <svg viewBox="0 0 80 80">
                    <path d="M0 80 L80 80 L80 75 L5 75 L5 0 L0 0 Z" fill="rgba(197, 160, 89, 0.15)" />
                    <path d="M10 70 L40 70 L40 68 L12 68 L12 40 L10 40 Z" fill="rgba(197, 160, 89, 0.1)" />
                    <circle cx="20" cy="60" r="3" fill="rgba(197, 160, 89, 0.2)" />
                </svg>
            </div>
            <div class="corner corner-br">
                <svg viewBox="0 0 80 80">
                    <path d="M80 80 L0 80 L0 75 L75 75 L75 0 L80 0 Z" fill="rgba(197, 160, 89, 0.15)" />
                    <path d="M70 70 L40 70 L40 68 L68 68 L68 40 L70 40 Z" fill="rgba(197, 160, 89, 0.1)" />
                    <circle cx="60" cy="60" r="3" fill="rgba(197, 160, 89, 0.2)" />
                </svg>
            </div>
        </div>

        <!-- 顶层：暗角遮罩 -->
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
const dustCanvas = ref<HTMLCanvasElement | null>(null)

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

// 尘埃粒子系统
interface DustParticle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    opacitySpeed: number
    inLight: boolean
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

    // 光柱区域 - 模拟烛光照射区域
    const lightZones = [
        { x: 0.1, y: 0.9, radius: 0.15 }, // 左下烛光
        { x: 0.9, y: 0.9, radius: 0.15 }, // 右下烛光
        { x: 0.3, y: 0.85, radius: 0.12 },
        { x: 0.7, y: 0.85, radius: 0.12 },
    ]

    // 创建尘埃粒子
    const createParticle = (): DustParticle => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.2 - 0.05, // 缓慢上升
        size: Math.random() * 2 + 0.5,
        opacity: 0,
        opacitySpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        inLight: false
    })

    // 初始化粒子
    for (let i = 0; i < 80; i++) {
        dustParticles.push(createParticle())
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

        dustParticles.forEach(particle => {
            // 使用 Perlin 噪声模拟的随机漂浮
            particle.vx += (Math.random() - 0.5) * 0.02
            particle.vy += (Math.random() - 0.5) * 0.01 - 0.002 // 轻微上升趋势

            // 限制速度
            particle.vx = Math.max(-0.5, Math.min(0.5, particle.vx))
            particle.vy = Math.max(-0.3, Math.min(0.1, particle.vy))

            particle.x += particle.vx
            particle.y += particle.vy

            // 检查是否在光柱中
            particle.inLight = isInLight(particle.x, particle.y)

            // 透明度呼吸效果
            if (particle.inLight) {
                particle.opacity += particle.opacitySpeed * 2
                if (particle.opacity >= 0.8) {
                    particle.opacity = 0.8
                    particle.opacitySpeed = -Math.abs(particle.opacitySpeed)
                } else if (particle.opacity <= 0.3) {
                    particle.opacity = 0.3
                    particle.opacitySpeed = Math.abs(particle.opacitySpeed)
                }
            } else {
                particle.opacity = Math.max(0, particle.opacity - 0.01)
            }

            // 边界检查
            if (particle.x < 0 || particle.x > canvas.width ||
                particle.y < 0 || particle.y > canvas.height) {
                Object.assign(particle, createParticle())
                particle.y = canvas.height + 10 // 从底部重新出现
            }

            // 绘制粒子
            if (particle.opacity > 0) {
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

                // 在光柱中的粒子呈现温暖的琥珀色
                const color = particle.inLight
                    ? `rgba(255, 200, 120, ${particle.opacity})`
                    : `rgba(180, 180, 200, ${particle.opacity * 0.5})`

                ctx.fillStyle = color
                ctx.shadowColor = particle.inLight ? 'rgba(255, 191, 0, 0.5)' : 'transparent'
                ctx.shadowBlur = particle.inLight ? 3 : 0
                ctx.fill()
            }
        })

        dustAnimationId = requestAnimationFrame(animate)
    }

    animate()
}

onMounted(() => {
    initDustSystem()
})

onUnmounted(() => {
    if (dustAnimationId) {
        cancelAnimationFrame(dustAnimationId)
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
$deep-ruby: #720e1e;
$royal-sapphire: #0f2c67;
$antique-gold: #C5A059;
$silver-mist: rgba(180, 180, 200, 0.15);

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
    background: linear-gradient(180deg,
            $obsidian-dark 0%,
            $charcoal 30%,
            color.adjust($charcoal, $lightness: -3%) 60%,
            $obsidian-dark 100%);
}

// 镜面黑曜石地面
.obsidian-floor {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 35%;
    perspective: 800px;

    .floor-surface {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg,
                transparent 0%,
                rgba(5, 5, 5, 0.9) 30%,
                $obsidian-dark 100%);
        transform: rotateX(60deg);
        transform-origin: center bottom;
    }

    .floor-reflection {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg,
                rgba($deep-ruby, 0.05) 0%,
                rgba($royal-sapphire, 0.03) 50%,
                transparent 100%);
        transform: rotateX(60deg) scaleY(-1);
        transform-origin: center bottom;
        opacity: 0.3;
        filter: blur(8px);
        animation: reflectionPulse 8s ease-in-out infinite;
    }
}

@keyframes reflectionPulse {

    0%,
    100% {
        opacity: 0.25;
    }

    50% {
        opacity: 0.35;
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
            rgba(8, 8, 12, 0.95) 0%,
            rgba(12, 12, 18, 0.9) 100%);

    &::before {
        content: '';
        position: absolute;
        top: -50px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-bottom: 50px solid rgba(8, 8, 12, 0.95);
    }

    &.spire-1 {
        left: 5%;
        width: 40px;
        height: 180px;
        opacity: 0.7;
    }

    &.spire-2 {
        left: 12%;
        width: 35px;
        height: 220px;
        opacity: 0.6;
    }

    &.spire-3 {
        right: 8%;
        width: 45px;
        height: 200px;
        opacity: 0.65;
    }

    &.spire-4 {
        right: 15%;
        width: 30px;
        height: 160px;
        opacity: 0.55;
    }
}

.flying-buttress {
    position: absolute;
    bottom: 30%;
    background: linear-gradient(45deg,
            rgba(8, 8, 12, 0.8) 0%,
            transparent 100%);

    &.buttress-1 {
        left: 3%;
        width: 80px;
        height: 100px;
        transform: skewX(-20deg);
        opacity: 0.5;
    }

    &.buttress-2 {
        right: 3%;
        width: 80px;
        height: 100px;
        transform: skewX(20deg);
        opacity: 0.5;
    }
}

// 流动薄雾
.mist-layer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    overflow: hidden;
}

.mist {
    position: absolute;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent 0%,
            $silver-mist 25%,
            $silver-mist 50%,
            transparent 75%,
            $silver-mist 100%);
    opacity: 0.4;

    &.mist-1 {
        bottom: 0;
        animation: mistDrift 60s linear infinite;
    }

    &.mist-2 {
        bottom: 5%;
        animation: mistDrift 80s linear infinite reverse;
        opacity: 0.3;
    }

    &.mist-3 {
        bottom: 10%;
        animation: mistDrift 100s linear infinite;
        opacity: 0.2;
    }
}

@keyframes mistDrift {
    0% {
        transform: translateX(-50%);
    }

    100% {
        transform: translateX(0%);
    }
}

// 玫瑰花窗层
.rose-windows-layer {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 8%;
    transition: transform 0.4s ease-out;
}

.rose-window {
    position: relative;

    &.main-window {
        width: 280px;
        height: 280px;
        animation: windowRotate 120s linear infinite;

        .window-glow {
            position: absolute;
            inset: -20%;
            background: radial-gradient(circle at center,
                    rgba($deep-ruby, 0.15) 0%,
                    rgba($royal-sapphire, 0.1) 40%,
                    transparent 70%);
            filter: blur(30px);
            animation: glowPulse 6s ease-in-out infinite;
        }
    }

    &.side-window {
        position: absolute;
        top: 20%;
        width: 120px;
        height: 120px;
        animation: windowRotate 90s linear infinite reverse;

        &.left {
            left: 10%;
        }

        &.right {
            right: 10%;
        }

        .window-glow {
            position: absolute;
            inset: -30%;
            border-radius: 50%;
            filter: blur(20px);
            animation: glowPulse 5s ease-in-out infinite;

            &.blue {
                background: radial-gradient(circle at center,
                        rgba($royal-sapphire, 0.2) 0%,
                        transparent 70%);
            }

            &.red {
                background: radial-gradient(circle at center,
                        rgba($deep-ruby, 0.2) 0%,
                        transparent 70%);
            }
        }
    }
}

.window-svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 15px rgba($deep-ruby, 0.3));
}

@keyframes windowRotate {
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
        opacity: 0.6;
        transform: scale(1);
    }

    50% {
        opacity: 0.9;
        transform: scale(1.05);
    }
}

// 烛光效果层
.candlelight-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.candle-glow {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(ellipse at center,
            rgba($amber-gold, 0.2) 0%,
            rgba($amber-gold, 0.08) 40%,
            transparent 70%);
    animation: candleFlicker 3s ease-in-out infinite;

    &.candle-1 {
        left: 5%;
        bottom: 5%;
        width: 300px;
        height: 250px;
        animation-delay: 0s;
    }

    &.candle-2 {
        right: 5%;
        bottom: 5%;
        width: 280px;
        height: 230px;
        animation-delay: -1s;
    }

    &.candle-3 {
        left: 25%;
        bottom: 8%;
        width: 200px;
        height: 180px;
        animation-delay: -0.5s;
        opacity: 0.7;
    }

    &.candle-4 {
        right: 25%;
        bottom: 8%;
        width: 200px;
        height: 180px;
        animation-delay: -1.5s;
        opacity: 0.7;
    }
}

@keyframes candleFlicker {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.8;
    }

    25% {
        transform: scale(0.97);
        opacity: 0.75;
    }

    50% {
        transform: scale(1.02);
        opacity: 0.9;
    }

    75% {
        transform: scale(0.99);
        opacity: 0.85;
    }
}

// 尘埃粒子画布
.dust-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

// 哥特式装饰边角
.gothic-corners {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .corner {
        position: absolute;
        width: 80px;
        height: 80px;
        opacity: 0.6;

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

// 暗角遮罩
.vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center,
            transparent 40%,
            rgba(0, 0, 0, 0.3) 70%,
            rgba(0, 0, 0, 0.6) 100%);
    pointer-events: none;
}
</style>
