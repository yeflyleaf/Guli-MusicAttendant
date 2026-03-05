<script setup lang="ts">
import { ref } from 'vue';

const features = [
    {
        icon: '🎧',
        title: '本地音乐管理',
        description: '智能扫描本地音乐文件夹，自动解析音频元数据，包括标题、艺术家、专辑、封面等信息。',
        gradient: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(29,233,182,0.06))',
        borderColor: 'rgba(0,229,255,0.2)',
    },
    {
        icon: '📝',
        title: '歌词同步',
        description: '支持 LRC 格式歌词同步滚动显示，沉浸式歌词页面，享受极致音乐体验。',
        gradient: 'linear-gradient(135deg, rgba(124,77,255,0.12), rgba(179,136,255,0.06))',
        borderColor: 'rgba(124,77,255,0.2)',
    },
    {
        icon: '🎨',
        title: '多主题切换',
        description: '炫酷暗色主题、玻璃拟态效果，支持多种动态背景，标题栏一键切换预设主题。',
        gradient: 'linear-gradient(135deg, rgba(255,128,171,0.12), rgba(255,82,82,0.06))',
        borderColor: 'rgba(255,128,171,0.2)',
    },
    {
        icon: '📋',
        title: '歌单管理',
        description: '灵活创建、编辑和删除歌单，自由管理您的音乐收藏，支持收藏和最近播放。',
        gradient: 'linear-gradient(135deg, rgba(29,233,182,0.12), rgba(0,229,255,0.06))',
        borderColor: 'rgba(29,233,182,0.2)',
    },
    {
        icon: '🌍',
        title: '六国语言',
        description: '支持中文、英文、法语、俄语、西班牙语、阿拉伯语，覆盖全球主流语种。',
        gradient: 'linear-gradient(135deg, rgba(68,138,255,0.12), rgba(0,229,255,0.06))',
        borderColor: 'rgba(68,138,255,0.2)',
    },
    {
        icon: '⚡',
        title: '极致性能',
        description: '渐进式渲染、GPU 硬件加速、并行数据预加载，大规模音乐库毫秒级响应。',
        gradient: 'linear-gradient(135deg, rgba(255,215,64,0.12), rgba(255,171,0,0.06))',
        borderColor: 'rgba(255,215,64,0.2)',
    },
]

const cardRotations = ref(features.map(() => ({ rx: 0, ry: 0, hover: false })));

const handleCardMove = (e: MouseEvent, index: number) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 计算旋转角度（-10 到 10 度）
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 反转 X 和 Y 坐标以实现逼真的 3D 旋转
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    cardRotations.value[index] = { rx: rotateX, ry: rotateY, hover: true };
}

const resetCardMove = (index: number) => {
    cardRotations.value[index] = { rx: 0, ry: 0, hover: false };
}
</script>

<template>
    <section id="features" class="section features-section">
        <div class="features-bg-wrapper">
            <img src="/features_bg_particles.png" alt="" class="features-bg-image" loading="lazy" />
            <div class="features-bg-overlay"></div>
        </div>
        <div class="features-glow-bg"></div>
        <div class="container">
            <h2 class="section-title animate-on-scroll">
                <span class="gradient-text">强大功能</span>，极致体验
            </h2>
            <p class="section-subtitle animate-on-scroll delay-1">
                精心打造的每一个细节，只为带给你最舒适的本地音乐管理体验
            </p>

            <div class="features-grid">
                <div v-for="(feature, index) in features" :key="feature.title"
                    class="feature-card glass-card animate-on-scroll"
                    :class="['delay-' + (index % 3 + 1), { 'is-hovered': cardRotations[index]?.hover }]" :style="{
                        '--card-gradient': feature.gradient,
                        '--card-border': feature.borderColor,
                        transform: `perspective(1000px) rotateX(${cardRotations[index]?.rx || 0}deg) rotateY(${cardRotations[index]?.ry || 0}deg) translateZ(${cardRotations[index]?.hover ? '20px' : '0'})`
                    }" :id="'feature-card-' + index" @mousemove="handleCardMove($event, index)"
                    @mouseleave="resetCardMove(index)">

                    <div class="feature-icon-wrapper" :style="{
                        transform: `translateZ(40px) ${cardRotations[index]?.hover ? 'scale(1.1) rotate(5deg)' : ''}`
                    }">
                        <span class="feature-icon">{{ feature.icon }}</span>
                    </div>
                    <h3 class="feature-title" :style="{ transform: 'translateZ(30px)' }">{{ feature.title }}</h3>
                    <p class="feature-description" :style="{ transform: 'translateZ(20px)' }">{{ feature.description }}
                    </p>

                    <div v-if="cardRotations[index]?.hover" class="card-glare" :style="{
                        transform: `translate(${(cardRotations[index]?.ry || 0) * -2}px, ${(cardRotations[index]?.rx || 0) * 2}px)`
                    }"></div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.features-section {
    position: relative;
    overflow: hidden;
    padding: 8rem 0;
}

.features-bg-wrapper {
    position: absolute;
    inset: 0;
    z-index: var(--z-background);
}

.features-bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.6;
    mix-blend-mode: screen;
}

.features-bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
            var(--color-bg-primary) 0%,
            rgba(10, 14, 26, 0.4) 30%,
            rgba(10, 14, 26, 0.4) 70%,
            var(--color-bg-primary) 100%);
}

.features-glow-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(0, 229, 255, 0.08), transparent 60%);
    pointer-events: none;
    z-index: 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
    position: relative;
    z-index: var(--z-base);
    perspective: 1500px;
}

.feature-card {
    padding: var(--space-8);
    background: var(--card-gradient, var(--color-bg-card)) !important;
    border-color: var(--card-border, var(--color-border)) !important;
    text-align: center;
    cursor: default;
    transition: transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    transform-style: preserve-3d;
    position: relative;
    overflow: hidden;
}

.feature-card.is-hovered {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px var(--card-border);
    transition: transform 0.1s ease, box-shadow 0.3s ease;
    z-index: 10;
}

.card-glare {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
    pointer-events: none;
    transition: transform 0.1s ease;
    opacity: 1;
}

.feature-icon-wrapper {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--space-5);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-xl);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
}

.feature-card.is-hovered .feature-icon-wrapper {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.1);
}

.feature-icon {
    font-size: 2.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.feature-title {
    font-size: var(--text-2xl);
    font-weight: 800;
    margin-bottom: var(--space-3);
    color: var(--color-text-primary);
    transition: transform 0.1s ease;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}

.feature-description {
    font-size: var(--text-base);
    color: var(--color-text-secondary);
    line-height: 1.7;
    transition: transform 0.1s ease;
}

@media (max-width: 1024px) {
    .features-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .features-grid {
        grid-template-columns: 1fr;
    }

    .feature-card {
        padding: var(--space-6);
        transform: none !important;
    }
}
</style>
