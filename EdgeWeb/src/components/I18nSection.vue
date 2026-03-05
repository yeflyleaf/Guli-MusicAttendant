<script setup lang="ts">
import { ref } from 'vue';

const languages = [
    { code: 'zh-CN', label: '简体中文', flag: '🇨🇳', status: '完整', progress: 100, greeting: '你好世界' },
    { code: 'en-US', label: 'English', flag: '🇺🇸', status: '完整', progress: 100, greeting: 'Hello World' },
    { code: 'fr-FR', label: 'Français', flag: '🇫🇷', status: '完整', progress: 100, greeting: 'Bonjour le monde' },
    { code: 'ru-RU', label: 'Русский', flag: '🇷🇺', status: '完整', progress: 100, greeting: 'Привет мир' },
    { code: 'es-ES', label: 'Español', flag: '🇪🇸', status: '完整', progress: 100, greeting: 'Hola Mundo' },
    { code: 'ar-SA', label: 'العربية', flag: '🇸🇦', status: '完整', progress: 100, greeting: 'مرحبا بالعالم' },
]

const hoveredLang = ref<number | null>(null)
const selectedLang = ref(0)

const selectLang = (index: number) => {
    selectedLang.value = index
}
</script>

<template>
    <section id="i18n" class="section i18n-section">
        <!-- 背景发光效果 -->
        <div class="i18n-glow-1"></div>
        <div class="i18n-glow-2"></div>

        <div class="container relative-z">
            <h2 class="section-title animate-on-scroll">
                🌐 <span class="gradient-text">国际化</span>支持
            </h2>
            <p class="section-subtitle animate-on-scroll delay-1">
                覆盖全球六大主流语种，开箱即用的多语言体验
            </p>

            <!-- 问候语预览卡片 -->
            <div class="greeting-preview animate-on-scroll delay-2">
                <div class="greeting-label">当前语言预览</div>
                <div class="greeting-text">{{ languages[selectedLang]?.greeting }}</div>
                <div class="greeting-lang-name">{{ languages[selectedLang]?.label }}</div>
            </div>

            <div class="lang-grid">
                <div v-for="(lang, index) in languages" :key="lang.code" class="lang-card animate-on-scroll"
                    :class="['delay-' + ((index % 3) + 1), { 'lang-card-active': selectedLang === index }]"
                    :id="'lang-card-' + lang.code" @mouseenter="hoveredLang = index" @mouseleave="hoveredLang = null"
                    @click="selectLang(index)">
                    <span class="lang-flag" :class="{ 'flag-bounce': hoveredLang === index }">{{ lang.flag }}</span>
                    <div class="lang-info">
                        <span class="lang-label">{{ lang.label }}</span>
                        <span class="lang-code">{{ lang.code }}</span>
                    </div>
                    <span class="lang-status">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {{ lang.status }}
                    </span>

                    <!-- 激活状态指示器 -->
                    <div v-if="selectedLang === index" class="lang-active-indicator"></div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.i18n-section {
    position: relative;
    overflow: hidden;
    padding: 8rem 0;
}

.i18n-glow-1 {
    position: absolute;
    top: 0;
    right: 10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(29, 233, 182, 0.08), transparent 60%);
    filter: blur(80px);
    pointer-events: none;
    animation: float 15s ease-in-out infinite;
}

.i18n-glow-2 {
    position: absolute;
    bottom: 0;
    left: 10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(68, 138, 255, 0.08), transparent 60%);
    filter: blur(80px);
    pointer-events: none;
    animation: float 12s ease-in-out infinite reverse;
}

.relative-z {
    position: relative;
    z-index: var(--z-base);
}

/* 问候语预览 */
.greeting-preview {
    text-align: center;
    margin-bottom: var(--space-12);
    padding: var(--space-8);
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    background: rgba(15, 20, 40, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-2xl);
    backdrop-filter: blur(15px);
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
}

.greeting-preview::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(29, 233, 182, 0.4), transparent);
}

.greeting-label {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 600;
    margin-bottom: var(--space-4);
}

.greeting-text {
    font-size: var(--text-4xl);
    font-weight: 900;
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: all 0.4s ease;
    filter: drop-shadow(0 0 15px rgba(0, 229, 255, 0.3));
    margin-bottom: var(--space-2);
}

.greeting-lang-name {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
}

.lang-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-5);
    max-width: 900px;
    margin: 0 auto;
}

.lang-card {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-6);
    background: rgba(15, 20, 40, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-xl);
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.lang-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(29, 233, 182, 0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.lang-card:hover::before {
    opacity: 1;
}

.lang-card:hover {
    background: rgba(15, 20, 40, 0.7);
    border-color: rgba(0, 229, 255, 0.2);
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 229, 255, 0.05);
}

.lang-card-active {
    border-color: rgba(0, 229, 255, 0.3) !important;
    box-shadow: 0 0 25px rgba(0, 229, 255, 0.1) !important;
    background: rgba(0, 229, 255, 0.05) !important;
}

.lang-active-indicator {
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    width: 6px;
    height: 6px;
    background: var(--color-accent-cyan);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--color-accent-cyan);
    animation: pulse-glow 1.5s ease-in-out infinite;
}

.lang-flag {
    font-size: 2.5rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.flag-bounce {
    animation: flag-bounce-anim 0.5s ease;
}

@keyframes flag-bounce-anim {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2) rotate(5deg);
    }
}

.lang-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.lang-label {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-text-primary);
}

.lang-code {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    font-family: var(--font-mono);
}

.lang-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: rgba(29, 233, 182, 0.1);
    color: var(--color-accent-teal);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 700;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.lang-card:hover .lang-status {
    background: rgba(29, 233, 182, 0.2);
    box-shadow: 0 0 10px rgba(29, 233, 182, 0.2);
}

@media (max-width: 768px) {
    .lang-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .greeting-text {
        font-size: var(--text-3xl);
    }
}

@media (max-width: 480px) {
    .lang-grid {
        grid-template-columns: 1fr;
    }
}
</style>
