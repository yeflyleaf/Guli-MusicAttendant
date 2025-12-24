<template>
    <div class="sugarland-background" :class="{ embedded: embedded }" ref="containerRef">
        <!-- 底层：糖霜渐变天幕 -->
        <div class="frosted-sky"></div>

        <!-- 糖霜噪点纹理层 -->
        <svg class="noise-overlay" xmlns="http://www.w3.org/2000/svg">
            <filter id="sugarNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#sugarNoise)" />
        </svg>

        <!-- 中层：悬浮糖果 Canvas -->
        <canvas ref="candyCanvas" class="candy-canvas"></canvas>

        <!-- 装饰层：悬浮糖果 -->
        <div class="candies-layer" :style="parallaxStyle">
            <!-- 甜甜圈 - 中右 -->
            <div class="candy donut donut-pink">
                <div class="donut-body"></div>
                <div class="donut-glaze"></div>
                <div class="donut-hole"></div>
                <div class="donut-glow"></div>
            </div>

            <!-- 甜甜圈 - 左下 -->
            <div class="candy donut donut-blue">
                <div class="donut-body"></div>
                <div class="donut-glaze"></div>
                <div class="donut-hole"></div>
                <div class="donut-glow"></div>
            </div>

            <!-- 甜甜圈 - 左上 -->
            <div class="candy donut donut-mint">
                <div class="donut-body"></div>
                <div class="donut-glaze"></div>
                <div class="donut-hole"></div>
                <div class="donut-glow"></div>
            </div>

            <!-- 甜甜圈 - 右下 -->
            <div class="candy donut donut-lemon">
                <div class="donut-body"></div>
                <div class="donut-glaze"></div>
                <div class="donut-hole"></div>
                <div class="donut-glow"></div>
            </div>

            <!-- 棒棒糖 - 顶部中央 (彩虹螺旋) -->
            <div class="candy lollipop lollipop-1">
                <div class="lollipop-head">
                    <div class="lollipop-swirl"></div>
                    <div class="lollipop-highlight"></div>
                </div>
                <div class="lollipop-stick"></div>
                <div class="lollipop-glow"></div>
            </div>

            <!-- 棒棒糖 - 底部右侧 -->
            <div class="candy lollipop lollipop-2">
                <div class="lollipop-head">
                    <div class="lollipop-swirl"></div>
                    <div class="lollipop-highlight"></div>
                </div>
                <div class="lollipop-stick"></div>
                <div class="lollipop-glow"></div>
            </div>

            <!-- 棒棒糖 - 左上角 -->
            <div class="candy lollipop lollipop-3">
                <div class="lollipop-head">
                    <div class="lollipop-swirl"></div>
                    <div class="lollipop-highlight"></div>
                </div>
                <div class="lollipop-stick"></div>
                <div class="lollipop-glow"></div>
            </div>

            <!-- 棒棒糖 - 右上角 -->
            <div class="candy lollipop lollipop-4">
                <div class="lollipop-head">
                    <div class="lollipop-swirl"></div>
                    <div class="lollipop-highlight"></div>
                </div>
                <div class="lollipop-stick"></div>
                <div class="lollipop-glow"></div>
            </div>

            <!-- 棒棒糖 - 左下角 -->
            <div class="candy lollipop lollipop-5">
                <div class="lollipop-head">
                    <div class="lollipop-swirl"></div>
                    <div class="lollipop-highlight"></div>
                </div>
                <div class="lollipop-stick"></div>
                <div class="lollipop-glow"></div>
            </div>

            <!-- 棒棒糖 - 中左 -->
            <div class="candy lollipop lollipop-6">
                <div class="lollipop-head">
                    <div class="lollipop-swirl"></div>
                    <div class="lollipop-highlight"></div>
                </div>
                <div class="lollipop-stick"></div>
                <div class="lollipop-glow"></div>
            </div>

            <!-- 棒棒糖 - 中右 -->
            <div class="candy lollipop lollipop-7">
                <div class="lollipop-head">
                    <div class="lollipop-swirl"></div>
                    <div class="lollipop-highlight"></div>
                </div>
                <div class="lollipop-stick"></div>
                <div class="lollipop-glow"></div>
            </div>
        </div>

        <!-- 前景：彩针微粒 Canvas -->
        <canvas ref="sprinklesCanvas" class="sprinkles-canvas"></canvas>

        <!-- 顶层：柔和暗角 -->
        <div class="vignette-overlay"></div>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings.store';
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Props
defineProps<{
    embedded?: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)
const candyCanvas = ref<HTMLCanvasElement | null>(null)
const sprinklesCanvas = ref<HTMLCanvasElement | null>(null)

// 获取全局帧率设置
const settingsStore = useSettingsStore()

// 鼠标位置用于视差效果
const mouseX = ref(0.5)
const mouseY = ref(0.5)

// 视差偏移量
const parallaxStyle = computed(() => ({
    transform: `translate(${(mouseX.value - 0.5) * -15}px, ${(mouseY.value - 0.5) * -15}px)`
}))

// 鼠标移动处理
const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    mouseX.value = e.clientX / rect.width
    mouseY.value = e.clientY / rect.height
}

// 漂浮糖果粒子系统
interface FloatingCandy {
    x: number
    y: number
    size: number
    rotation: number
    rotationSpeed: number
    floatOffset: number
    floatSpeed: number
    opacity: number
    color: string
    type: 'sphere' | 'heart' | 'star'
}

let floatingCandies: FloatingCandy[] = []
let candyAnimationId: number | null = null

const initCandyCanvas = () => {
    const canvas = candyCanvas.value
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

    // 糖果颜色 - 马卡龙色系
    const candyColors = [
        'rgba(152, 255, 152, 0.6)',  // 薄荷绿
        'rgba(255, 247, 0, 0.6)',    // 柠檬黄
        'rgba(0, 191, 255, 0.6)',    // 电光蓝
        'rgba(255, 182, 193, 0.6)',  // 粉红
        'rgba(221, 160, 221, 0.6)',  // 梅红
        'rgba(255, 218, 185, 0.6)',  // 桃色
    ]

    // 创建漂浮糖果
    const candyCount = 25
    floatingCandies = Array.from({ length: candyCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 8 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.003 + Math.random() * 0.005,
        opacity: 0.3 + Math.random() * 0.4,
        color: candyColors[Math.floor(Math.random() * candyColors.length)],
        type: ['sphere', 'heart', 'star'][Math.floor(Math.random() * 3)] as 'sphere' | 'heart' | 'star'
    }))

    // 帧率限制
    let lastFrameTime = 0
    const getFrameInterval = () => {
        const globalFPS = settingsStore.visualizationFrameRate || 60
        return 1000 / globalFPS
    }

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
        ctx.beginPath()
        const topCurveHeight = size * 0.3
        ctx.moveTo(x, y + topCurveHeight)
        // 左侧曲线
        ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight)
        // 左下曲线
        ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size)
        // 右下曲线
        ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight)
        // 右侧曲线
        ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight)
        ctx.closePath()
    }

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, points: number = 5) => {
        ctx.beginPath()
        const outerRadius = size / 2
        const innerRadius = size / 4
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (i * Math.PI) / points - Math.PI / 2
            if (i === 0) {
                ctx.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
            } else {
                ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
            }
        }
        ctx.closePath()
    }

    const animate = (currentTime: number) => {
        const frameInterval = getFrameInterval()
        if (currentTime - lastFrameTime < frameInterval) {
            candyAnimationId = requestAnimationFrame(animate)
            return
        }
        lastFrameTime = currentTime

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        floatingCandies.forEach(candy => {
            // 更新动画状态
            candy.rotation += candy.rotationSpeed
            candy.floatOffset += candy.floatSpeed

            // 计算浮动位置
            const floatY = Math.sin(candy.floatOffset) * 20
            const floatX = Math.cos(candy.floatOffset * 0.7) * 10

            const drawX = candy.x + floatX + (mouseX.value - 0.5) * 20
            const drawY = candy.y + floatY + (mouseY.value - 0.5) * 20

            ctx.save()
            ctx.translate(drawX, drawY)
            ctx.rotate(candy.rotation)
            ctx.globalAlpha = candy.opacity

            // 绘制糖果
            if (candy.type === 'sphere') {
                // 绘制软糖球体 - 带SSS效果
                const gradient = ctx.createRadialGradient(
                    -candy.size * 0.2, -candy.size * 0.2, 0,
                    0, 0, candy.size
                )
                gradient.addColorStop(0, candy.color.replace('0.6', '0.9'))
                gradient.addColorStop(0.5, candy.color)
                gradient.addColorStop(1, candy.color.replace('0.6', '0.3'))

                ctx.beginPath()
                ctx.arc(0, 0, candy.size, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()

                // 高光
                ctx.beginPath()
                ctx.arc(-candy.size * 0.3, -candy.size * 0.3, candy.size * 0.25, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
                ctx.fill()
            } else if (candy.type === 'heart') {
                ctx.fillStyle = candy.color
                drawHeart(ctx, 0, -candy.size / 2, candy.size)
                ctx.fill()

                // 高光
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
                ctx.beginPath()
                ctx.arc(-candy.size * 0.15, -candy.size * 0.1, candy.size * 0.15, 0, Math.PI * 2)
                ctx.fill()
            } else {
                ctx.fillStyle = candy.color
                drawStar(ctx, 0, 0, candy.size)
                ctx.fill()

                // 高光
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
                ctx.beginPath()
                ctx.arc(-candy.size * 0.1, -candy.size * 0.1, candy.size * 0.12, 0, Math.PI * 2)
                ctx.fill()
            }

            ctx.restore()
        })

        candyAnimationId = requestAnimationFrame(animate)
    }

    candyAnimationId = requestAnimationFrame(animate)
}

// 彩色糖针粒子系统
interface Sprinkle {
    x: number
    y: number
    length: number
    width: number
    rotation: number
    rotationSpeed: number
    floatOffset: number
    floatSpeed: number
    color: string
    blur: number
}

let sprinkles: Sprinkle[] = []
let sprinklesAnimationId: number | null = null

const initSprinklesCanvas = () => {
    const canvas = sprinklesCanvas.value
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

    // 糖针颜色
    const sprinkleColors = [
        '#FF6B6B', // 红
        '#4ECDC4', // 青
        '#FFE66D', // 黄
        '#95E1D3', // 薄荷
        '#DDA0DD', // 梅红
        '#FF9FF3', // 粉
        '#54A0FF', // 蓝
        '#5F27CD', // 紫
    ]

    // 创建糖针
    const sprinkleCount = 60
    sprinkles = Array.from({ length: sprinkleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 15 + Math.random() * 25,
        width: 4 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.002 + Math.random() * 0.004,
        color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)],
        blur: 2 + Math.random() * 4 // 失焦效果
    }))

    // 帧率限制
    let lastFrameTime = 0
    const getFrameInterval = () => {
        const globalFPS = settingsStore.visualizationFrameRate || 60
        return 1000 / globalFPS
    }

    const animate = (currentTime: number) => {
        const frameInterval = getFrameInterval()
        if (currentTime - lastFrameTime < frameInterval) {
            sprinklesAnimationId = requestAnimationFrame(animate)
            return
        }
        lastFrameTime = currentTime

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        sprinkles.forEach(sprinkle => {
            // 更新动画状态
            sprinkle.rotation += sprinkle.rotationSpeed
            sprinkle.floatOffset += sprinkle.floatSpeed

            // 计算浮动位置
            const floatY = Math.sin(sprinkle.floatOffset) * 15
            const floatX = Math.cos(sprinkle.floatOffset * 0.8) * 8

            const drawX = sprinkle.x + floatX
            const drawY = sprinkle.y + floatY

            ctx.save()
            ctx.translate(drawX, drawY)
            ctx.rotate(sprinkle.rotation)

            // 失焦模糊效果
            ctx.filter = `blur(${sprinkle.blur}px)`
            ctx.globalAlpha = 0.5

            // 绘制圆角矩形糖针
            const radius = sprinkle.width / 2
            ctx.beginPath()
            ctx.roundRect(-sprinkle.length / 2, -sprinkle.width / 2, sprinkle.length, sprinkle.width, radius)
            ctx.fillStyle = sprinkle.color
            ctx.fill()

            ctx.restore()
        })

        sprinklesAnimationId = requestAnimationFrame(animate)
    }

    sprinklesAnimationId = requestAnimationFrame(animate)
}

onMounted(() => {
    // 添加鼠标移动监听
    if (containerRef.value) {
        containerRef.value.addEventListener('mousemove', handleMouseMove)
    }
    initCandyCanvas()
    initSprinklesCanvas()
})

onUnmounted(() => {
    if (containerRef.value) {
        containerRef.value.removeEventListener('mousemove', handleMouseMove)
    }
    if (candyAnimationId) {
        cancelAnimationFrame(candyAnimationId)
    }
    if (sprinklesAnimationId) {
        cancelAnimationFrame(sprinklesAnimationId)
    }
})
</script>

<style lang="scss" scoped>
@use "sass:color";

.sugarland-background {
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

// 糖霜渐变天幕 - 草莓奶昔粉与香草白
.frosted-sky {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
            #fff0f5 0%,
            #ffe6fa 20%,
            #ffebf5 50%,
            #fff5f8 80%,
            #ffffff 100%);
}

// 糖霜噪点纹理
.noise-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.08;
    mix-blend-mode: overlay;
    pointer-events: none;
}

// Canvas 层
.candy-canvas,
.sprinkles-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

.sprinkles-canvas {
    z-index: 10;
}

// 糖果层
.candies-layer {
    position: absolute;
    inset: 0;
    transition: transform 0.3s ease-out;
}

// 糖果基础样式
.candy {
    position: absolute;
}

// ==================== 甜甜圈 ====================
.donut {
    width: 150px;
    height: 150px;
    animation: donutFloat 10s ease-in-out infinite;

    &.donut-pink {
        top: 30%;
        right: 10%;
        animation-delay: -2s;

        .donut-body {
            background: radial-gradient(circle at 40% 40%,
                    #ffd1dc 0%,
                    #ffb6c1 50%,
                    #ff69b4 100%);
        }

        .donut-glaze {
            background: linear-gradient(135deg,
                    rgba(255, 105, 180, 0.8) 0%,
                    rgba(255, 182, 193, 0.6) 50%,
                    rgba(255, 20, 147, 0.4) 100%);
        }

        .donut-glow {
            background: radial-gradient(circle at center,
                    rgba(255, 105, 180, 0.3) 0%,
                    transparent 70%);
        }
    }

    &.donut-blue {
        bottom: 20%;
        left: 8%;
        animation-delay: -6s;
        transform: scale(0.85) rotate(-20deg);

        .donut-body {
            background: radial-gradient(circle at 40% 40%,
                    #b0e0e6 0%,
                    #87ceeb 50%,
                    #00bfff 100%);
        }

        .donut-glaze {
            background: linear-gradient(135deg,
                    rgba(0, 191, 255, 0.8) 0%,
                    rgba(135, 206, 235, 0.6) 50%,
                    rgba(70, 130, 180, 0.4) 100%);
        }

        .donut-glow {
            background: radial-gradient(circle at center,
                    rgba(0, 191, 255, 0.3) 0%,
                    transparent 70%);
        }
    }

    &.donut-mint {
        top: 5%;
        left: 5%;
        animation-delay: 0s;
        transform: scale(0.9) rotate(10deg);

        .donut-body {
            background: radial-gradient(circle at 40% 40%,
                    #b8f5b8 0%,
                    #98ff98 50%,
                    #66cd66 100%);
        }

        .donut-glaze {
            background: linear-gradient(135deg,
                    rgba(152, 255, 152, 0.8) 0%,
                    rgba(144, 238, 144, 0.6) 50%,
                    rgba(60, 179, 113, 0.4) 100%);
        }

        .donut-glow {
            background: radial-gradient(circle at center,
                    rgba(152, 255, 152, 0.3) 0%,
                    transparent 70%);
        }
    }

    &.donut-lemon {
        bottom: 10%;
        right: 8%;
        animation-delay: -4s;
        transform: scale(0.8) rotate(15deg);

        .donut-body {
            background: radial-gradient(circle at 40% 40%,
                    #fff8b0 0%,
                    #fff700 50%,
                    #daa520 100%);
        }

        .donut-glaze {
            background: linear-gradient(135deg,
                    rgba(255, 247, 0, 0.8) 0%,
                    rgba(255, 223, 0, 0.6) 50%,
                    rgba(218, 165, 32, 0.4) 100%);
        }

        .donut-glow {
            background: radial-gradient(circle at center,
                    rgba(255, 247, 0, 0.3) 0%,
                    transparent 70%);
        }
    }

    .donut-body {
        position: absolute;
        inset: 10%;
        border-radius: 50%;
        box-shadow:
            inset -10px -10px 25px rgba(0, 0, 0, 0.2),
            inset 10px 10px 25px rgba(255, 255, 255, 0.4),
            0 15px 40px rgba(0, 0, 0, 0.15);
    }

    .donut-glaze {
        position: absolute;
        inset: 5%;
        border-radius: 50%;
        opacity: 0.8;
        animation: glazeShine 4s ease-in-out infinite;
    }

    .donut-hole {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 35%;
        height: 35%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: linear-gradient(180deg,
                #fff0f5 0%,
                #ffe6fa 100%);
        box-shadow: inset 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .donut-glow {
        position: absolute;
        inset: -25%;
        border-radius: 50%;
        filter: blur(20px);
    }
}

@keyframes donutFloat {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    25% {
        transform: translateY(-15px) rotate(5deg);
    }

    50% {
        transform: translateY(-20px) rotate(0deg);
    }

    75% {
        transform: translateY(-15px) rotate(-5deg);
    }
}

@keyframes glazeShine {

    0%,
    100% {
        opacity: 0.7;
    }

    50% {
        opacity: 0.9;
    }
}

// ==================== 棒棒糖 (彩虹螺旋) ====================
.lollipop {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: lollipopFloat 9s ease-in-out infinite;

    &.lollipop-1 {
        top: 5%;
        left: 50%;
        transform: translateX(-50%) rotate(-25deg);
        animation-delay: -2s;
    }

    &.lollipop-2 {
        bottom: 5%;
        right: 35%;
        transform: scale(0.75) rotate(15deg);
        animation-delay: -6s;
    }

    &.lollipop-3 {
        top: 12%;
        left: 25%;
        transform: scale(0.65) rotate(-35deg);
        animation-delay: 0s;
    }

    &.lollipop-4 {
        top: 5%;
        right: 8%;
        transform: scale(0.7) rotate(30deg);
        animation-delay: -4s;
    }

    &.lollipop-5 {
        bottom: 15%;
        left: 33%;
        transform: scale(0.6) rotate(-20deg);
        animation-delay: -7s;
    }

    &.lollipop-6 {
        top: 40%;
        left: 2%;
        transform: scale(0.55) rotate(25deg);
        animation-delay: -3s;
    }

    &.lollipop-7 {
        top: 50%;
        right: 3%;
        transform: scale(0.5) rotate(-15deg);
        animation-delay: -8s;
    }

    .lollipop-head {
        position: relative;
        width: 90px;
        height: 90px;
        border-radius: 50%;
        overflow: hidden;
        box-shadow:
            inset -6px -6px 20px rgba(0, 0, 0, 0.15),
            inset 6px 6px 20px rgba(255, 255, 255, 0.4),
            0 10px 30px rgba(0, 0, 0, 0.15);
        z-index: 2;
    }

    .lollipop-swirl {
        position: absolute;
        inset: 0;
        // 彩虹螺旋条纹 - 使用 conic-gradient 实现
        background: conic-gradient(from 0deg,
                #ff9ecd 0deg, // 粉色
                #c99eff 25.7deg, // 紫色
                #9ec5ff 51.4deg, // 蓝色
                #9effea 77.1deg, // 青色
                #9eff9e 102.8deg, // 绿色
                #fdff9e 128.5deg, // 黄色
                #ffcc9e 154.2deg, // 橙色
                #ff9ecd 180deg, // 粉色
                #c99eff 205.7deg, // 紫色
                #9ec5ff 231.4deg, // 蓝色
                #9effea 257.1deg, // 青色
                #9eff9e 282.8deg, // 绿色
                #fdff9e 308.5deg, // 黄色
                #ffcc9e 334.2deg, // 橙色
                #ff9ecd 360deg // 粉色
            );
        animation: lollipopSpin 20s linear infinite;
    }

    .lollipop-highlight {
        position: absolute;
        top: 12px;
        left: 18px;
        width: 20px;
        height: 15px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        filter: blur(4px);
        z-index: 3;
    }

    .lollipop-stick {
        width: 12px;
        height: 70px;
        background: linear-gradient(90deg,
                #f5d0e0 0%,
                #e8b4cc 30%,
                #d4a0b8 50%,
                #e8b4cc 70%,
                #f5d0e0 100%);
        border-radius: 0 0 6px 6px;
        margin-top: -5px;
        box-shadow:
            inset -2px 0 4px rgba(0, 0, 0, 0.1),
            2px 4px 10px rgba(0, 0, 0, 0.1);
        z-index: 1;
    }

    .lollipop-glow {
        position: absolute;
        top: -10%;
        left: -30%;
        width: 160%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(circle at center,
                rgba(255, 200, 220, 0.35) 0%,
                transparent 70%);
        filter: blur(20px);
        z-index: 0;
    }
}

@keyframes lollipopFloat {

    0%,
    100% {
        transform: translateY(0) rotate(-25deg);
    }

    25% {
        transform: translateY(-12px) rotate(-20deg);
    }

    50% {
        transform: translateY(-20px) rotate(-25deg);
    }

    75% {
        transform: translateY(-12px) rotate(-30deg);
    }
}

@keyframes lollipopSpin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

// 暗角遮罩 - 柔和的粉色暗角
.vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center,
            transparent 40%,
            rgba(255, 200, 220, 0.15) 80%,
            rgba(255, 180, 200, 0.25) 100%);
    pointer-events: none;
}
</style>
