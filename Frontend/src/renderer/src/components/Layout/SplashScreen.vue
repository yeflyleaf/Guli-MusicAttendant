<template>
    <Transition name="splash-fade">
        <div v-if="visible" class="splash-screen">
            <!-- 背景动画 -->
            <div class="splash-bg">
                <div class="bg-gradient"></div>
                <div class="bg-particles">
                    <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
                </div>
            </div>

            <!-- 主内容 -->
            <div class="splash-content">
                <!-- Logo -->
                <div class="logo-container">
                    <div class="logo-icon">
                        <svg viewBox="0 0 100 100" class="music-icon">
                            <!-- 音符图标 -->
                            <circle cx="25" cy="75" r="12" fill="currentColor" class="note-circle" />
                            <circle cx="65" cy="65" r="12" fill="currentColor" class="note-circle delay" />
                            <rect x="35" y="20" width="4" height="55" fill="currentColor" class="note-stem" />
                            <rect x="75" y="15" width="4" height="50" fill="currentColor" class="note-stem delay" />
                            <path d="M 39 20 Q 57 10 79 15" stroke="currentColor" stroke-width="4" fill="none"
                                class="note-beam" />
                        </svg>
                    </div>
                    <div class="logo-ring"></div>
                    <div class="logo-ring delay-1"></div>
                    <div class="logo-ring delay-2"></div>
                </div>

                <!-- 应用名称 -->
                <h1 class="app-name">
                    <span class="char" v-for="(char, index) in appNameChars" :key="index"
                        :style="{ animationDelay: `${index * 0.08}s` }">
                        {{ char }}
                    </span>
                </h1>

                <!-- 加载指示器 -->
                <div class="loading-indicator">
                    <div class="loading-bar">
                        <div class="loading-progress"></div>
                    </div>
                    <p class="loading-text">正在加载音乐库...</p>
                </div>
            </div>

            <!-- 底部信息 -->
            <div class="splash-footer">
                <p class="version">v1.0.0</p>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const visible = ref(true)

// 应用名称拆分为字符数组
const appNameChars = '故里音乐助手'.split('')

// 生成随机粒子样式
const particleStyle = (_index: number) => {
    const random = (min: number, max: number) => Math.random() * (max - min) + min
    return {
        left: `${random(0, 100)}%`,
        top: `${random(0, 100)}%`,
        width: `${random(2, 6)}px`,
        height: `${random(2, 6)}px`,
        animationDelay: `${random(0, 2)}s`,
        animationDuration: `${random(3, 6)}s`
    }
}

// 等待数据预加载完成和最小显示时间后隐藏启动屏
onMounted(async () => {
    const minDisplayTime = 1500 // 最小显示时间（毫秒）
    const startTime = Date.now()

    // 等待数据预加载完成
    const preloadPromise = (window as any).__preloadPromise
    if (preloadPromise) {
        try {
            await preloadPromise
            console.log('[SplashScreen] Data preload finished')
        } catch (error) {
            console.error('[SplashScreen] Preload error:', error)
        }
    }

    // 确保至少显示最小时间（让动画完成）
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minDisplayTime - elapsed)

    if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
    }

    visible.value = false
    console.log('[SplashScreen] Hidden after', Date.now() - startTime, 'ms')
})

// 暴露 visible 状态供父组件使用
defineExpose({ visible })
</script>

<style lang="scss" scoped>
.splash-screen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: $bg-primary;
    overflow: hidden;
}

// 背景
.splash-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;

    .bg-gradient {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 30% 40%, rgba($primary-color, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba($primary-light, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba($accent-color, 0.05) 0%, transparent 70%);
        animation: gradient-pulse 3s ease-in-out infinite;
    }

    .bg-particles {
        position: absolute;
        inset: 0;
    }

    .particle {
        position: absolute;
        background: rgba($primary-color, 0.3);
        border-radius: 50%;
        animation: float-up 5s ease-in-out infinite;
    }
}

@keyframes gradient-pulse {

    0%,
    100% {
        opacity: 0.8;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.05);
    }
}

@keyframes float-up {
    0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
    }

    10% {
        opacity: 1;
    }

    90% {
        opacity: 1;
    }

    100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
}

// 主内容
.splash-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
}

// Logo
.logo-container {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 32px;
}

.logo-icon {
    position: absolute;
    inset: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 2;

    .music-icon {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 0 10px rgba($primary-color, 0.5));
    }

    .note-circle {
        animation: note-bounce 1s ease-in-out infinite;

        &.delay {
            animation-delay: 0.2s;
        }
    }

    .note-stem,
    .note-beam {
        animation: note-glow 1.5s ease-in-out infinite;

        &.delay {
            animation-delay: 0.3s;
        }
    }
}

@keyframes note-bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-3px);
    }
}

@keyframes note-glow {

    0%,
    100% {
        opacity: 0.8;
    }

    50% {
        opacity: 1;
    }
}

.logo-ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba($primary-color, 0.3);
    border-radius: 50%;
    animation: ring-expand 2s ease-out infinite;

    &.delay-1 {
        animation-delay: 0.4s;
    }

    &.delay-2 {
        animation-delay: 0.8s;
    }
}

@keyframes ring-expand {
    0% {
        transform: scale(0.8);
        opacity: 1;
        border-color: rgba($primary-color, 0.6);
    }

    100% {
        transform: scale(1.5);
        opacity: 0;
        border-color: rgba($primary-color, 0);
    }
}

// 应用名称
.app-name {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 32px;
    display: flex;
    gap: 2px;

    .char {
        display: inline-block;
        background: $gradient-primary;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: char-appear 0.5s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
    }
}

@keyframes char-appear {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

// 加载指示器
.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.loading-bar {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
}

.loading-progress {
    height: 100%;
    background: $gradient-primary;
    border-radius: 2px;
    animation: loading 1.5s ease-in-out forwards;
}

@keyframes loading {
    0% {
        width: 0%;
    }

    30% {
        width: 30%;
    }

    60% {
        width: 70%;
    }

    100% {
        width: 100%;
    }
}

.loading-text {
    font-size: 1rem;
    color: $text-muted;
    animation: text-pulse 1s ease-in-out infinite;
}

@keyframes text-pulse {

    0%,
    100% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }
}

// 底部信息
.splash-footer {
    position: absolute;
    bottom: 24px;

    .version {
        font-size: $font-size-xs;
        color: $text-muted;
        opacity: 0.5;
    }
}

// 淡出过渡
.splash-fade-leave-active {
    transition: opacity 0.3s ease-out;
}

.splash-fade-leave-to {
    opacity: 0;
}
</style>
