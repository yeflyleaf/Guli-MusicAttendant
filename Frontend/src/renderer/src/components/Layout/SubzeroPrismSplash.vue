<template>
    <Transition name="prism-fade">
        <div v-if="visible" class="prism-splash" ref="splashContainer">
            <!-- 第0层 - 极夜天空 -->
            <div class="arctic-sky-bg" ref="skyLayer">
                <div class="sky-gradient"></div>
                <div class="stars-bg"></div>
            </div>

            <!-- 冰山与倒影层 -->
            <div class="landscape-layer" ref="landscapeLayer">
                <div class="ice-mountains"></div>
                <div class="ice-lake">
                    <div class="lake-reflection"></div>
                </div>
            </div>

            <!-- 飘落冰晶雪花层 (Canvas 纯渲染) -->
            <canvas ref="snowflakeCanvas" class="snowflake-canvas"></canvas>

            <!-- 第1层 - Canvas 粒子系统：钻石星尘 -->
            <canvas ref="crystalCanvas" class="crystal-canvas"></canvas>

            <!-- 第2层 - 极光光幕 -->
            <div class="aurora-curtains">
                <div class="aurora-band aurora-1"></div>
                <div class="aurora-band aurora-2"></div>
                <div class="aurora-band aurora-3"></div>
            </div>

            <!-- 第3层 - 寒气透镜 (霜花边框) -->
            <div class="frost-vignette">
                <div class="frost-edge frost-top"></div>
                <div class="frost-edge frost-bottom"></div>
                <div class="frost-edge frost-left"></div>
                <div class="frost-edge frost-right"></div>
                <div class="frost-corner frost-tl"></div>
                <div class="frost-corner frost-tr"></div>
                <div class="frost-corner frost-bl"></div>
                <div class="frost-corner frost-br"></div>
            </div>

            <!-- 第4层 - 装饰性元素 (已简化) -->
            <div class="decorations"></div>

            <!-- 主内容 - 冰封晶体面板 -->
            <div class="glacial-panel" :class="{ 'idle-frost': !isAscending, 'ascending': isAscending }"
                ref="glacialPanel">
                <div class="ice-texture"></div>
                <div class="panel-sheen"></div>
                <div class="sharp-border"></div>
                <div class="panel-content">
                    <!-- Logo -->
                    <div class="logo-container">
                        <div class="logo-icon">
                            <svg viewBox="0 0 100 100" class="prism-icon">
                                <defs>
                                    <linearGradient id="prismGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" style="stop-color:#00f0ff;stop-opacity:1" />
                                        <stop offset="50%" style="stop-color:#8a2be2;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#39ff14;stop-opacity:1" />
                                    </linearGradient>
                                    <filter id="prismGlow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle cx="25" cy="72" r="10" fill="url(#prismGradient)" filter="url(#prismGlow)"
                                    class="note-base" />
                                <circle cx="62" cy="65" r="10" fill="url(#prismGradient)" filter="url(#prismGlow)"
                                    class="note-base delay" />
                                <rect x="33" y="22" width="3" height="50" fill="url(#prismGradient)"
                                    filter="url(#prismGlow)" class="note-stem" />
                                <rect x="70" y="18" width="3" height="47" fill="url(#prismGradient)"
                                    filter="url(#prismGlow)" class="note-stem delay" />
                                <path d="M 36 22 Q 53 12 73 18" stroke="url(#prismGradient)" stroke-width="3"
                                    fill="none" filter="url(#prismGlow)" class="note-beam" />
                            </svg>
                        </div>
                        <div class="logo-frost-ring"></div>
                    </div>

                    <!-- 应用名称 - 冻结渐变 -->
                    <h1 class="app-name">
                        <span class="char" v-for="(char, index) in appNameChars" :key="index"
                            :style="{ animationDelay: `${index * 0.08}s` }">
                            {{ char }}
                        </span>
                    </h1>

                    <!-- 加载指示器 -->
                    <div class="loading-indicator">
                        <div class="ice-progress-bar">
                            <div class="progress-fill"></div>
                            <div class="progress-shimmer"></div>
                        </div>
                        <p class="loading-text">{{ loadingText }}</p>
                    </div>
                </div>

                <!-- 边缘冰晶生长 -->
                <div class="frost-growth" v-if="showFrostGrowth">
                    <svg class="frost-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
                        <path class="frost-pattern frost-pattern-1" d="M0,0 L20,30 L0,60 L30,50 L15,25 L0,0" />
                        <path class="frost-pattern frost-pattern-2" d="M400,0 L380,25 L400,50 L370,40 L385,20 L400,0" />
                        <path class="frost-pattern frost-pattern-3" d="M0,300 L25,275 L50,300 L40,270 L20,285 L0,300" />
                        <path class="frost-pattern frost-pattern-4"
                            d="M400,300 L375,280 L350,300 L360,270 L380,285 L400,300" />
                    </svg>
                </div>
            </div>

            <!-- 彩虹桥跃迁效果层 -->
            <div class="bifrost-layer" :class="{ active: isAscending }" ref="bifrostLayer">
                <!-- 绝对零度 - 面板冻结粉碎 -->
                <div class="absolute-zero"></div>
                <!-- 磁场爆发 - 极光光柱 -->
                <div class="magnetic-surge">
                    <div v-for="n in 12" :key="n" class="light-pillar" :style="{ '--i': n }"></div>
                </div>
                <!-- 视线抬升线条 -->
                <div class="skyward-lines">
                    <div v-for="n in 30" :key="n" class="speed-line" :style="{ '--i': n }"></div>
                </div>
                <!-- 白化过渡 -->
                <div class="whiteout"></div>
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
const isAscending = ref(false)
const showFrostGrowth = ref(true)
const crystalCanvas = ref<HTMLCanvasElement | null>(null)
const snowflakeCanvas = ref<HTMLCanvasElement | null>(null)
const splashContainer = ref<HTMLElement | null>(null)
const glacialPanel = ref<HTMLElement | null>(null)
const bifrostLayer = ref<HTMLElement | null>(null)
const skyLayer = ref<HTMLElement | null>(null)
const landscapeLayer = ref<HTMLElement | null>(null)

// 应用名称
const appNameChars = '故里音乐助手'.split('')

// 加载文字
const loadingTexts = ['初始化极光引擎...', '校准冰晶频率...', '连接北极光网络...', '准备跃迁传送...']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

let loadingTextInterval: number | null = null
let animationFrameId: number | null = null

// 工具函数
const random = (min: number, max: number) => Math.random() * (max - min) + min

// 雪花粒子系统
interface Snowflake {
    x: number
    y: number
    size: number
    rotation: number
    rotationSpeed: number
    fallSpeed: number
    swayPhase: number
    swaySpeed: number
    swayAmount: number
    opacity: number
}

let snowflakes: Snowflake[] = []
let snowflakeAnimationId: number | null = null
let snowflakeSpeedMultiplier = 1

// 初始化雪花Canvas系统
const initSnowflakeSystem = () => {
    const canvas = snowflakeCanvas.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 创建雪花 (50个大雪花)
    const snowflakeCount = 50

    const createSnowflake = (randomY = true): Snowflake => ({
        x: random(0, canvas.width),
        y: randomY ? random(-100, canvas.height) : random(-200, -50),
        size: random(20, 35),
        rotation: random(0, Math.PI * 2),
        rotationSpeed: random(-0.01, 0.01),
        fallSpeed: random(0.5, 1.5),
        swayPhase: random(0, Math.PI * 2),
        swaySpeed: random(0.01, 0.03),
        swayAmount: random(30, 80),
        opacity: random(0.6, 1)
    })

    snowflakes = Array.from({ length: snowflakeCount }, () => createSnowflake(true))

    // 绘制精美的六角雪花 (匹配参考图)
    const drawSnowflake = (x: number, y: number, size: number, rotation: number, opacity: number) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.globalAlpha = opacity

        // 创建从上到下的渐变 (浅青色到深蓝色)
        const gradient = ctx.createLinearGradient(0, -size, 0, size)
        gradient.addColorStop(0, '#a8e6ff')    // 浅青色
        gradient.addColorStop(0.3, '#5ec8f2')  // 中青色
        gradient.addColorStop(0.7, '#3ba3d9')  // 深青色
        gradient.addColorStop(1, '#2b8bc4')    // 最深蓝色

        ctx.strokeStyle = gradient
        ctx.fillStyle = gradient
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        const branchLength = size * 0.85
        const branchWidth = size * 0.12
        const subBranchLength = size * 0.3
        const subBranchWidth = size * 0.08
        const centerRadius = size * 0.18
        const centerRingWidth = size * 0.06

        // 绘制6个主分支
        for (let i = 0; i < 6; i++) {
            ctx.save()
            ctx.rotate((Math.PI / 3) * i)

            // 主分支 (粗圆角棒状)
            ctx.beginPath()
            ctx.lineWidth = branchWidth
            ctx.moveTo(0, -centerRadius)
            ctx.lineTo(0, -branchLength)
            ctx.stroke()

            // 圆形端点
            ctx.beginPath()
            ctx.arc(0, -branchLength, branchWidth / 2, 0, Math.PI * 2)
            ctx.fill()

            // 上部分叉 (左右各一个)
            const forkY = -branchLength * 0.65
            const forkAngle = Math.PI / 5

            // 左分叉
            ctx.save()
            ctx.translate(0, forkY)
            ctx.rotate(-forkAngle)
            ctx.beginPath()
            ctx.lineWidth = subBranchWidth
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -subBranchLength)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(0, -subBranchLength, subBranchWidth / 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()

            // 右分叉
            ctx.save()
            ctx.translate(0, forkY)
            ctx.rotate(forkAngle)
            ctx.beginPath()
            ctx.lineWidth = subBranchWidth
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -subBranchLength)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(0, -subBranchLength, subBranchWidth / 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()

            // 中部分叉 (更短)
            const midForkY = -branchLength * 0.4
            const midForkLength = subBranchLength * 0.7

            // 左中分叉
            ctx.save()
            ctx.translate(0, midForkY)
            ctx.rotate(-forkAngle * 0.8)
            ctx.beginPath()
            ctx.lineWidth = subBranchWidth * 0.8
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -midForkLength)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(0, -midForkLength, subBranchWidth * 0.4, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()

            // 右中分叉
            ctx.save()
            ctx.translate(0, midForkY)
            ctx.rotate(forkAngle * 0.8)
            ctx.beginPath()
            ctx.lineWidth = subBranchWidth * 0.8
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -midForkLength)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(0, -midForkLength, subBranchWidth * 0.4, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()

            ctx.restore()
        }

        // 中心圆环
        ctx.beginPath()
        ctx.lineWidth = centerRingWidth
        ctx.arc(0, 0, centerRadius, 0, Math.PI * 2)
        ctx.stroke()

        // 添加3D光泽效果 - 高光
        ctx.globalCompositeOperation = 'lighter'
        const highlightGradient = ctx.createRadialGradient(
            -size * 0.2, -size * 0.2, 0,
            0, 0, size
        )
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = highlightGradient
        ctx.beginPath()
        ctx.arc(0, 0, size, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
    }

    let snowTime = 0

    const renderSnowflakes = () => {
        snowTime += 0.016

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        snowflakes.forEach((flake) => {
            // 摇摆效果
            const sway = Math.sin(snowTime * flake.swaySpeed + flake.swayPhase) * flake.swayAmount

            // 更新位置
            flake.y += flake.fallSpeed * snowflakeSpeedMultiplier
            flake.rotation += flake.rotationSpeed

            const displayX = flake.x + sway

            // 绘制雪花
            drawSnowflake(displayX, flake.y, flake.size, flake.rotation, flake.opacity)

            // 重置离开屏幕的雪花
            if (flake.y > canvas.height + 100) {
                Object.assign(flake, createSnowflake(false))
            }
        })

        snowflakeAnimationId = requestAnimationFrame(renderSnowflakes)
    }

    renderSnowflakes()

    return {
        setSpeed: (speed: number) => {
            snowflakeSpeedMultiplier = speed
        }
    }
}

let snowflakeControls: { setSpeed: (speed: number) => void } | null = null

// 冰晶粒子系统
interface Crystal {
    x: number
    y: number
    size: number
    rotation: number
    rotationSpeed: number
    opacity: number
    twinklePhase: number
    twinkleSpeed: number
    driftX: number
    driftY: number
}

let crystals: Crystal[] = []
let time = 0
let isStretchMode = false
let stretchIntensity = 0

const initCrystalSystem = () => {
    const canvas = crystalCanvas.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 创建冰晶粒子 (约150个)
    const crystalCount = 150

    const createCrystal = (): Crystal => ({
        x: random(0, canvas.width),
        y: random(0, canvas.height),
        size: random(0.5, 2.5), // 更小，更精致
        rotation: random(0, Math.PI * 2),
        rotationSpeed: random(-0.01, 0.01), // 更慢
        opacity: random(0.4, 0.9),
        twinklePhase: random(0, Math.PI * 2),
        twinkleSpeed: random(0.02, 0.08), // 缓慢闪烁
        driftX: random(-0.1, 0.1), // 极慢漂浮
        driftY: random(-0.05, 0.05)
    })

    crystals = Array.from({ length: crystalCount }, createCrystal)

    const drawCross = (x: number, y: number, size: number, rotation: number, opacity: number) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)

        // 钻石星尘 - 锐利的十字星
        ctx.globalCompositeOperation = 'screen'

        // 核心光点
        ctx.fillStyle = `rgba(240, 255, 255, ${opacity})`
        ctx.beginPath()
        ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2)
        ctx.fill()

        // 垂直光芒
        const gradientV = ctx.createLinearGradient(0, -size * 4, 0, size * 4)
        gradientV.addColorStop(0, `rgba(0, 240, 255, 0)`)
        gradientV.addColorStop(0.5, `rgba(240, 255, 255, ${opacity})`)
        gradientV.addColorStop(1, `rgba(0, 240, 255, 0)`)

        ctx.fillStyle = gradientV
        ctx.beginPath()
        ctx.moveTo(-size * 0.2, 0)
        ctx.lineTo(0, -size * 4)
        ctx.lineTo(size * 0.2, 0)
        ctx.lineTo(0, size * 4)
        ctx.fill()

        // 水平光芒
        const gradientH = ctx.createLinearGradient(-size * 4, 0, size * 4, 0)
        gradientH.addColorStop(0, `rgba(138, 43, 226, 0)`)
        gradientH.addColorStop(0.5, `rgba(240, 255, 255, ${opacity})`)
        gradientH.addColorStop(1, `rgba(138, 43, 226, 0)`)

        ctx.fillStyle = gradientH
        ctx.beginPath()
        ctx.moveTo(0, -size * 0.2)
        ctx.lineTo(-size * 4, 0)
        ctx.lineTo(0, size * 0.2)
        ctx.lineTo(size * 4, 0)
        ctx.fill()

        ctx.restore()
    }

    const render = () => {
        time += 0.016

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        crystals.forEach((crystal) => {
            // 闪烁效果
            const twinkle = (Math.sin(time * crystal.twinkleSpeed + crystal.twinklePhase) + 1) / 2
            const currentOpacity = crystal.opacity * (0.3 + twinkle * 0.7)

            if (isStretchMode) {
                // 跃迁模式 - 拉长成光谱线条
                const stretch = stretchIntensity * 50

                ctx.save()
                ctx.translate(crystal.x, crystal.y)

                const lineGradient = ctx.createLinearGradient(0, 0, 0, -stretch)
                lineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
                lineGradient.addColorStop(0.3, `rgba(0, 240, 255, ${currentOpacity * 0.5})`)
                lineGradient.addColorStop(0.6, `rgba(138, 43, 226, ${currentOpacity * 0.7})`)
                lineGradient.addColorStop(1, `rgba(57, 255, 20, ${currentOpacity})`)

                ctx.strokeStyle = lineGradient
                ctx.lineWidth = crystal.size * (1 + stretchIntensity * 2)
                ctx.beginPath()
                ctx.moveTo(0, 0)
                ctx.lineTo(0, -stretch)
                ctx.stroke()
                ctx.restore()

                // 向上移动
                crystal.y -= stretchIntensity * 15
                if (crystal.y < -100) {
                    crystal.y = canvas.height + 50
                    crystal.x = random(0, canvas.width)
                }
            } else {
                // 常规模式 - 缓慢悬浮
                crystal.rotation += crystal.rotationSpeed
                crystal.x += crystal.driftX
                crystal.y += crystal.driftY

                // 边界环绕
                if (crystal.x < -10) crystal.x = canvas.width + 10
                if (crystal.x > canvas.width + 10) crystal.x = -10
                if (crystal.y < -10) crystal.y = canvas.height + 10
                if (crystal.y > canvas.height + 10) crystal.y = -10

                drawCross(crystal.x, crystal.y, crystal.size, crystal.rotation, currentOpacity)
            }
        })

        animationFrameId = requestAnimationFrame(render)
    }

    render()

    return {
        setStretchMode: (stretch: boolean, intensity: number = 0) => {
            isStretchMode = stretch
            stretchIntensity = intensity
        }
    }
}

let crystalControls: { setStretchMode: (stretch: boolean, intensity?: number) => void } | null = null

// 触发彩虹桥跃迁动画
const triggerBifrostAscension = () => {
    isAscending.value = true
    showFrostGrowth.value = false
    const ascensionDuration = 2000

    const startTime = Date.now()
    const accelerate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / ascensionDuration, 1)
        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2

        crystalControls?.setStretchMode(true, easeProgress)

        if (progress < 1) {
            requestAnimationFrame(accelerate)
        }
    }
    accelerate()

    // 极光光带变成光柱
    const auroraBands = splashContainer.value?.querySelectorAll('.aurora-band')
    auroraBands?.forEach((band) => {
        const el = band as HTMLElement
        el.style.transition = `all ${ascensionDuration / 1000}s ease-in`
        el.style.transform = 'scaleY(5) translateY(-50%)'
        el.style.opacity = '1'
        el.style.filter = 'brightness(2)'
    })

    // 雪花加速飘落 (通过 Canvas 控制)
    const startSpeed = Date.now()
    const accelerateSnow = () => {
        const now = Date.now()
        const progress = Math.min((now - startSpeed) / ascensionDuration, 1)
        snowflakeControls?.setSpeed(1 + progress * 10)
        if (progress < 1) {
            requestAnimationFrame(accelerateSnow)
        }
    }
    accelerateSnow()

    // 面板冻结并粉碎
    setTimeout(() => {
        if (glacialPanel.value) {
            glacialPanel.value.style.transition = 'all 0.5s ease-out'
            glacialPanel.value.style.filter = 'brightness(3) saturate(0)'
            glacialPanel.value.style.transform = 'scale(1.1)'
        }
    }, ascensionDuration * 0.3)

    setTimeout(() => {
        if (glacialPanel.value) {
            glacialPanel.value.style.transition = 'all 0.3s ease-out'
            glacialPanel.value.style.opacity = '0'
            glacialPanel.value.style.transform = 'scale(0.8)'
            glacialPanel.value.style.filter = 'blur(20px) brightness(5)'
        }
    }, ascensionDuration * 0.5)

    // 霜花消失
    const frostVignette = splashContainer.value?.querySelector('.frost-vignette') as HTMLElement
    if (frostVignette) {
        frostVignette.style.transition = `all ${ascensionDuration * 0.5 / 1000}s ease-out`
        frostVignette.style.opacity = '0'
    }

    // 装饰元素下移
    const decorations = splashContainer.value?.querySelector('.decorations') as HTMLElement
    if (decorations) {
        decorations.style.transition = `all ${ascensionDuration / 1000}s ease-in`
        decorations.style.transform = 'translateY(150%)'
    }

    // 视线抬升 (Skyward Gaze) - 背景下移
    if (skyLayer.value) {
        skyLayer.value.style.transition = `all ${ascensionDuration / 1000}s cubic-bezier(0.6, 0, 0.4, 1)`
        skyLayer.value.style.transform = 'translateY(30%) scale(1.1)'
    }
    if (landscapeLayer.value) {
        landscapeLayer.value.style.transition = `all ${ascensionDuration / 1000}s cubic-bezier(0.6, 0, 0.4, 1)`
        landscapeLayer.value.style.transform = 'translateY(100%) scale(1.2)'
        landscapeLayer.value.style.opacity = '0'
    }

    // 白化过渡
    const whiteout = bifrostLayer.value?.querySelector('.whiteout') as HTMLElement
    if (whiteout) {
        setTimeout(() => {
            whiteout.style.animation = 'whiteoutFlash 0.8s ease-out forwards'
        }, ascensionDuration - 400)
    }
}

onMounted(async () => {
    // 初始化雪花系统
    snowflakeControls = initSnowflakeSystem() || null

    // 初始化冰晶系统
    crystalControls = initCrystalSystem() || null

    // 加载文字轮换
    loadingTextInterval = window.setInterval(() => {
        loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
    }, 1000)

    const minDisplayTime = 2000
    const startTime = Date.now()

    // 等待数据预加载
    const preloadPromise = window.__preloadPromise
    if (preloadPromise) {
        try {
            await preloadPromise
            console.log('[SubzeroPrismSplash] Data preload finished')
        } catch (error) {
            console.error('[SubzeroPrismSplash] Preload error:', error)
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

    // 触发彩虹桥跃迁
    triggerBifrostAscension()

    // 等待动画完成
    await new Promise((resolve) => setTimeout(resolve, 2000))

    visible.value = false
    console.log('[SubzeroPrismSplash] Hidden after', Date.now() - startTime, 'ms')

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
    if (snowflakeAnimationId) {
        cancelAnimationFrame(snowflakeAnimationId)
    }
})

defineExpose({ visible })
</script>

<style lang="scss" scoped>
// ==================== 颜色变量 ====================
$polar-night: #051327;
$deep-space: #000000;
$aurora-green: #39ff14;
$electric-purple: #8a2be2;
$quantum-cyan: #00f0ff;
$glacier-white: #f0ffff;
$prism-blue: #a0e7ff;
$glacial-glass: rgba(5, 19, 39, 0.75);

.prism-splash {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: $deep-space;
}

// ==================== 第0层 - 极夜天空与地景 ====================
.arctic-sky-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: linear-gradient(180deg, $polar-night 0%, $deep-space 100%);

    .sky-gradient {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(circle at 50% -20%, rgba($aurora-green, 0.15), transparent 60%),
            radial-gradient(circle at 20% 30%, rgba($electric-purple, 0.1), transparent 50%),
            radial-gradient(circle at 80% 40%, rgba($quantum-cyan, 0.1), transparent 50%);
        mix-blend-mode: screen;
    }

    .stars-bg {
        position: absolute;
        inset: 0;
        background-image:
            radial-gradient(1px 1px at 10% 10%, white 100%, transparent),
            radial-gradient(1px 1px at 20% 20%, white 100%, transparent),
            radial-gradient(2px 2px at 30% 30%, white 100%, transparent),
            radial-gradient(1px 1px at 40% 40%, white 100%, transparent),
            radial-gradient(1px 1px at 50% 50%, white 100%, transparent),
            radial-gradient(2px 2px at 60% 60%, white 100%, transparent),
            radial-gradient(1px 1px at 70% 70%, white 100%, transparent),
            radial-gradient(1px 1px at 80% 80%, white 100%, transparent),
            radial-gradient(2px 2px at 90% 90%, white 100%, transparent);
        background-size: 500px 500px;
        opacity: 0.3;
    }
}

.landscape-layer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    z-index: 1;
    pointer-events: none;
}

.ice-mountains {
    position: absolute;
    bottom: 30%;
    left: 0;
    width: 100%;
    height: 100%;
    background:
        linear-gradient(180deg, transparent 0%, rgba($polar-night, 0.8) 100%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 300' preserveAspectRatio='none'%3E%3Cpath d='M0,300 L0,150 L100,100 L200,200 L300,50 L450,250 L600,100 L750,200 L900,50 L1050,150 L1200,100 L1200,300 Z' fill='%23051327' opacity='0.8'/%3E%3Cpath d='M0,300 L0,200 L150,150 L300,250 L450,100 L600,200 L750,150 L900,250 L1050,100 L1200,200 L1200,300 Z' fill='%23020a15' opacity='0.9'/%3E%3C/svg%3E");
    background-size: cover;
    background-position: bottom;
    filter: drop-shadow(0 -5px 10px rgba($quantum-cyan, 0.1));
}

.ice-lake {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30%;
    background: linear-gradient(180deg, rgba($polar-night, 0.9) 0%, $deep-space 100%);
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: rgba($glacier-white, 0.5);
        box-shadow: 0 0 10px $quantum-cyan;
    }

    .lake-reflection {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba($aurora-green, 0.1), rgba($electric-purple, 0.05));
        filter: blur(10px);
        opacity: 0.3;
    }
}

// ==================== 飘落冰晶雪花 Canvas ====================
.snowflake-canvas {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
}

// ==================== 第1层 - Canvas 冰晶 ====================
.crystal-canvas {
    position: absolute;
    inset: 0;
    z-index: 2;
}

// ==================== 第2层 - 极光光幕 ====================
.aurora-curtains {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    overflow: hidden;
}

.aurora-band {
    position: absolute;
    top: -10%;
    width: 40%;
    height: 80%;
    background: linear-gradient(180deg,
            rgba($aurora-green, 0.3) 0%,
            rgba($quantum-cyan, 0.2) 30%,
            rgba($electric-purple, 0.2) 60%,
            transparent 100%);
    filter: blur(60px);
    mix-blend-mode: screen;
    animation: auroraWave 15s ease-in-out infinite;
    transform-origin: top center;

    &.aurora-1 {
        left: 10%;
        animation-delay: 0s;
    }

    &.aurora-2 {
        left: 40%;
        width: 35%;
        animation-delay: 4s;
        background: linear-gradient(180deg,
                rgba($electric-purple, 0.4) 0%,
                rgba($aurora-green, 0.3) 40%,
                rgba($quantum-cyan, 0.2) 70%,
                transparent 100%);
    }

    &.aurora-3 {
        right: 5%;
        left: auto;
        width: 30%;
        animation-delay: 8s;
        background: linear-gradient(180deg,
                rgba($quantum-cyan, 0.4) 0%,
                rgba($electric-purple, 0.3) 50%,
                transparent 100%);
    }
}

@keyframes auroraWave {

    0%,
    100% {
        transform: skewX(-5deg) scaleY(1) translateX(0);
        opacity: 0.6;
    }

    25% {
        transform: skewX(3deg) scaleY(1.1) translateX(5%);
        opacity: 0.8;
    }

    50% {
        transform: skewX(-3deg) scaleY(0.95) translateX(-3%);
        opacity: 0.5;
    }

    75% {
        transform: skewX(5deg) scaleY(1.05) translateX(2%);
        opacity: 0.7;
    }
}

// ==================== 第3层 - 霜花边框 ====================
.frost-vignette {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    transition: opacity 1s ease-out;
}

.frost-edge {
    position: absolute;
    background: radial-gradient(ellipse at center, rgba($glacier-white, 0.4), transparent 70%);

    &.frost-top {
        top: 0;
        left: 0;
        width: 100%;
        height: 15%;
        background: linear-gradient(180deg, rgba($glacier-white, 0.3), transparent);
    }

    &.frost-bottom {
        bottom: 0;
        left: 0;
        width: 100%;
        height: 15%;
        background: linear-gradient(0deg, rgba($glacier-white, 0.3), transparent);
    }

    &.frost-left {
        top: 0;
        left: 0;
        width: 15%;
        height: 100%;
        background: linear-gradient(90deg, rgba($glacier-white, 0.3), transparent);
    }

    &.frost-right {
        top: 0;
        right: 0;
        width: 15%;
        height: 100%;
        background: linear-gradient(-90deg, rgba($glacier-white, 0.3), transparent);
    }
}

.frost-corner {
    position: absolute;
    width: 150px;
    height: 150px;
    background:
        radial-gradient(circle at center, rgba($glacier-white, 0.5) 0%, transparent 70%);
    filter: blur(20px);

    &.frost-tl {
        top: -30px;
        left: -30px;
    }

    &.frost-tr {
        top: -30px;
        right: -30px;
    }

    &.frost-bl {
        bottom: -30px;
        left: -30px;
    }

    &.frost-br {
        bottom: -30px;
        right: -30px;
    }
}

// ==================== 第4层 - 装饰性元素 ====================
.decorations {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    transition: transform 2s ease-in;
}

.ice-monolith {
    position: absolute;
    background: linear-gradient(180deg,
            rgba($glacier-white, 0.1) 0%,
            rgba($quantum-cyan, 0.1) 50%,
            rgba($polar-night, 0.8) 100%);
    clip-path: polygon(20% 100%, 40% 0%, 60% 0%, 80% 100%); // 塔状
    border-top: 2px solid rgba($quantum-cyan, 0.8);
    box-shadow:
        0 0 30px rgba($quantum-cyan, 0.2),
        inset 0 0 20px rgba($glacier-white, 0.1);

    &::after {
        content: '';
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        height: 80%;
        background: linear-gradient(180deg, $aurora-green, transparent);
        box-shadow: 0 0 10px $aurora-green;
        opacity: 0.8;
    }

    &.monolith-1 {
        left: 3%;
        bottom: 18%;
        width: 60px;
        height: 180px;
        animation: monolithGlow 6s ease-in-out infinite;
    }

    &.monolith-2 {
        left: 8%;
        bottom: 18%;
        width: 45px;
        height: 140px;
        animation: monolithGlow 6s ease-in-out infinite 2s;
    }

    &.monolith-3 {
        right: 5%;
        bottom: 18%;
        width: 50px;
        height: 160px;
        animation: monolithGlow 6s ease-in-out infinite 4s;
    }
}

@keyframes monolithGlow {

    0%,
    100% {
        box-shadow:
            0 0 30px rgba($quantum-cyan, 0.3),
            inset 0 0 20px rgba($glacier-white, 0.2);
    }

    50% {
        box-shadow:
            0 0 60px rgba($aurora-green, 0.4),
            0 0 100px rgba($electric-purple, 0.2),
            inset 0 0 30px rgba($glacier-white, 0.4);
    }
}

.bokeh-snowflake {
    position: absolute;
    width: 60px; // 更大
    height: 60px;
    background: radial-gradient(circle, rgba($glacier-white, 0.4), transparent 70%);
    border-radius: 50%;
    filter: blur(15px); // 更模糊
    animation: snowflakeDrift linear infinite;
    z-index: 20; // 最前景

    &::before {
        content: '';
        position: absolute;
        inset: 20%;
        background: radial-gradient(circle, rgba($glacier-white, 0.8), transparent 70%);
        border-radius: 50%;
    }
}

@keyframes snowflakeDrift {
    0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0;
    }

    10% {
        opacity: 0.3;
    }

    90% {
        opacity: 0.3;
    }

    100% {
        transform: translate(100px, 100vh) rotate(360deg);
        opacity: 0;
    }
}

// ==================== 主面板 - 冰封晶体 ====================
.glacial-panel {
    position: relative;
    z-index: 10;
    width: 400px;
    padding: 60px 40px;
    background: rgba(5, 19, 39, 0.4); // 更通透
    backdrop-filter: blur(15px) brightness(1.1);
    border: 1px solid rgba($glacier-white, 0.4);
    box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.5),
        inset 0 0 0 1px rgba($glacier-white, 0.1);
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    clip-path: polygon(20px 0, 100% 0,
            100% calc(100% - 20px), calc(100% - 20px) 100%,
            0 100%, 0 20px); // 切角设计

    &.idle-frost {
        animation: panelBreathe 4s ease-in-out infinite;
    }

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
            linear-gradient(135deg,
                rgba($glacier-white, 0.1) 0%,
                transparent 50%,
                rgba($quantum-cyan, 0.05) 100%);
        pointer-events: none;
    }
}

@keyframes panelBreathe {

    0%,
    100% {
        box-shadow:
            0 0 40px rgba($quantum-cyan, 0.2),
            inset 0 0 30px rgba($glacier-white, 0.05);
    }

    50% {
        box-shadow:
            0 0 60px rgba($quantum-cyan, 0.3),
            0 0 100px rgba($aurora-green, 0.1),
            inset 0 0 40px rgba($glacier-white, 0.1);
    }
}

.ice-texture {
    position: absolute;
    inset: 0;
    background:
        url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.5;
    pointer-events: none;
}

.panel-sheen {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba($glacier-white, 0.15), transparent);
    transform: skewX(-20deg);
    animation: sheenMove 8s ease-in-out infinite;
    pointer-events: none;
}

@keyframes sheenMove {

    0%,
    100% {
        left: -100%;
    }

    50% {
        left: 150%;
    }
}

.sharp-border {
    position: absolute;
    inset: 0;
    pointer-events: none;

    // 冰裂纹高光边框
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid rgba($glacier-white, 0.5);
        clip-path: polygon(20px 0, 100% 0,
                100% calc(100% - 20px), calc(100% - 20px) 100%,
                0 100%, 0 20px);
        filter: drop-shadow(0 0 2px $quantum-cyan);
    }

    // 角落加固
    &::after {
        content: '';
        position: absolute;
        inset: -2px;
        background:
            linear-gradient(135deg, $glacier-white 10px, transparent 0) top left,
            linear-gradient(-135deg, $glacier-white 10px, transparent 0) bottom right;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        filter: drop-shadow(0 0 5px $quantum-cyan);
    }
}

.panel-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px;
}

// Logo
.logo-container {
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-icon {
    width: 80px;
    height: 80px;
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

.prism-icon {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 15px rgba($quantum-cyan, 0.5));

    .note-base,
    .note-stem,
    .note-beam {
        animation: iconPulse 2s ease-in-out infinite;
    }

    .delay {
        animation-delay: 0.3s;
    }
}

@keyframes iconPulse {

    0%,
    100% {
        opacity: 0.8;
    }

    50% {
        opacity: 1;
    }
}

.logo-frost-ring {
    position: absolute;
    inset: -15px;
    border: 1px solid rgba($glacier-white, 0.3);
    border-radius: 50%;
    animation: frostRingPulse 3s ease-in-out infinite;
}

@keyframes frostRingPulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.3;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.6;
    }
}

// 应用名称
.app-name {
    font-family: 'Roboto', 'Microsoft YaHei', sans-serif;
    font-size: 2rem;
    font-weight: 100;
    letter-spacing: 0.3em;
    color: $glacier-white;
    text-shadow:
        0 0 20px rgba($quantum-cyan, 0.5),
        0 0 40px rgba($aurora-green, 0.3);
    display: flex;
    gap: 2px;

    .char {
        display: inline-block;
        background: linear-gradient(180deg,
                rgba($glacier-white, 0.9) 0%,
                rgba($glacier-white, 0.6) 50%,
                transparent 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: charFreeze 2s ease-out forwards;
        opacity: 0;
        transform: translateY(-10px);
    }
}

@keyframes charFreeze {
    0% {
        opacity: 0;
        transform: translateY(-10px);
        filter: blur(5px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
    }
}

// 加载指示器
.loading-indicator {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.ice-progress-bar {
    width: 200px;
    height: 4px;
    background: rgba($glacier-white, 0.1);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, $quantum-cyan, $aurora-green, $electric-purple);
    animation: progressFill 2s ease-in-out infinite;
    border-radius: 2px;
}

@keyframes progressFill {
    0% {
        width: 0;
        left: 0;
    }

    50% {
        width: 60%;
        left: 20%;
    }

    100% {
        width: 0;
        left: 100%;
    }
}

.progress-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba($glacier-white, 0.4), transparent);
    animation: shimmerMove 1.5s ease-in-out infinite;
}

@keyframes shimmerMove {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.loading-text {
    font-family: 'Roboto', 'Microsoft YaHei', sans-serif;
    font-size: 0.85rem;
    font-weight: 300;
    color: rgba($glacier-white, 0.7);
    letter-spacing: 0.1em;
    animation: textPulse 2s ease-in-out infinite;
}

@keyframes textPulse {

    0%,
    100% {
        opacity: 0.5;
    }

    50% {
        opacity: 1;
    }
}

// 霜生长效果
.frost-growth {
    position: absolute;
    inset: -10px;
    pointer-events: none;
    overflow: visible;
}

.frost-svg {
    width: 100%;
    height: 100%;
}

.frost-pattern {
    fill: none;
    stroke: rgba($glacier-white, 0.4);
    stroke-width: 1;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: frostGrow 8s ease-in-out infinite;

    &.frost-pattern-2 {
        animation-delay: 2s;
    }

    &.frost-pattern-3 {
        animation-delay: 4s;
    }

    &.frost-pattern-4 {
        animation-delay: 6s;
    }
}

@keyframes frostGrow {

    0%,
    100% {
        stroke-dashoffset: 100;
        opacity: 0;
    }

    20%,
    80% {
        stroke-dashoffset: 0;
        opacity: 0.6;
    }
}

// ==================== 彩虹桥跃迁层 ====================
.bifrost-layer {
    position: absolute;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;

    &.active {
        opacity: 1;
    }
}

.absolute-zero {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba($glacier-white, 0.8), transparent 70%);
    opacity: 0;
    animation: none;
}

.magnetic-surge {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    overflow: hidden;
}

.light-pillar {
    position: absolute;
    bottom: 0;
    width: 8px;
    height: 0;
    background: linear-gradient(180deg,
            rgba($aurora-green, 0.8),
            rgba($quantum-cyan, 0.6),
            rgba($electric-purple, 0.8));
    filter: blur(4px);
    left: calc(5% + var(--i) * 7.5%);
    opacity: 0;

    .active & {
        animation: pillarRise 1.5s ease-out forwards;
        animation-delay: calc(var(--i) * 0.05s);
    }
}

@keyframes pillarRise {
    0% {
        height: 0;
        opacity: 0;
    }

    50% {
        height: 120%;
        opacity: 0.8;
    }

    100% {
        height: 150%;
        opacity: 1;
        filter: blur(8px) brightness(1.5);
    }
}

.skyward-lines {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.speed-line {
    position: absolute;
    left: calc(var(--i) * 3.3%);
    bottom: 50%;
    width: 2px;
    height: 0;
    background: linear-gradient(0deg, transparent, rgba($glacier-white, 0.6));
    opacity: 0;

    .active & {
        animation: speedLineRise 1s ease-out forwards;
        animation-delay: calc(0.5s + var(--i) * 0.02s);
    }
}

@keyframes speedLineRise {
    0% {
        height: 0;
        opacity: 0;
    }

    100% {
        height: 100vh;
        opacity: 0.5;
    }
}

.whiteout {
    position: absolute;
    inset: 0;
    background: $glacier-white;
    opacity: 0;
}

@keyframes whiteoutFlash {
    0% {
        opacity: 0;
    }

    60% {
        opacity: 0.8;
    }

    100% {
        opacity: 1;
    }
}

// ==================== 底部信息 ====================
.splash-footer {
    position: absolute;
    bottom: 20px;
    left: 0;
    width: 100%;
    text-align: center;
    z-index: 5;

    .version {
        font-family: 'Roboto', 'Microsoft YaHei', sans-serif;
        font-size: 0.75rem;
        font-weight: 300;
        color: rgba($glacier-white, 0.4);
        letter-spacing: 0.1em;
    }
}

// ==================== 过渡动画 ====================
.prism-fade-leave-active {
    animation: prismFadeOut 0.8s ease-in-out;
}

.prism-fade-enter-from,
.prism-fade-leave-to {
    opacity: 0;
}
</style>
```
