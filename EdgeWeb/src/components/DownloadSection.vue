<script setup lang="ts">

const platforms = [
    {
        name: 'Windows',
        icon: '🪟',
        versions: 'Windows 10+',
        command: 'npm run build:win',
        recommended: true,
    },
    {
        name: 'macOS',
        icon: '🍎',
        versions: 'macOS 10.15+',
        command: 'npm run build:mac',
        recommended: false,
    },
    {
        name: 'Linux',
        icon: '🐧',
        versions: 'AppImage / deb',
        command: 'npm run build:linux',
        recommended: false,
    },
]

const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('复制成功！');
}
</script>

<template>
    <section id="download" class="section download-section">
        <!-- 背景效果 -->
        <div class="download-bg-wrapper">
            <img src="/footer_bg_holo.png" alt="" class="download-bg-image" loading="lazy" />
            <div class="download-bg-overlay"></div>
        </div>

        <!-- 发光背景 -->
        <div class="download-glow"></div>
        <div class="download-glow-secondary"></div>

        <div class="container relative-z">
            <h2 class="section-title animate-on-scroll">
                <span class="gradient-text">下载</span>体验
            </h2>
            <p class="section-subtitle animate-on-scroll delay-1">
                跨平台支持，源码编译安装，完全开源免费
            </p>

            <div class="download-grid">
                <div v-for="(platform, index) in platforms" :key="platform.name"
                    class="download-card glass-card animate-on-scroll"
                    :class="['delay-' + (index + 1), { recommended: platform.recommended }]"
                    :id="'download-card-' + platform.name.toLowerCase()">
                    <div v-if="platform.recommended" class="recommended-badge">推荐</div>
                    <span class="platform-icon">{{ platform.icon }}</span>
                    <h3 class="platform-name">{{ platform.name }}</h3>
                    <p class="platform-versions">{{ platform.versions }}</p>
                    <code class="platform-command">{{ platform.command }}</code>
                </div>
            </div>

            <!-- 快速开始 -->
            <div class="getting-started animate-on-scroll delay-4">
                <h3 class="gs-title">🚀 快速开始</h3>
                <div class="code-block glass-card code-block-dynamic">
                    <div class="code-header">
                        <span class="code-lang">Terminal</span>
                        <button class="code-copy" id="copy-install-code" title="复制"
                            @click="copyCode('git clone https://github.com/yeflyleaf/Guli_MusicAttendant.git\ncd Guli_MusicAttendant/Frontend\nnpm install\nnpm run dev\nnpm run build:win')">📋</button>
                    </div>
                    <pre class="code-content"><code><span class="code-comment"># 克隆项目</span>
<span class="code-cmd">git clone</span> https://github.com/yeflyleaf/Guli_MusicAttendant.git
<span class="code-cmd">cd</span> Guli_MusicAttendant/Frontend

<span class="code-comment"># 安装依赖</span>
<span class="code-cmd">npm install</span>

<span class="code-comment"># 开发模式运行</span>
<span class="code-cmd">npm run</span> dev

<span class="code-comment"># 构建生产版本</span>
<span class="code-cmd">npm run</span> build:win</code></pre>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.download-section {
    position: relative;
    overflow: hidden;
    padding: 8rem 0;
}

.download-bg-wrapper {
    position: absolute;
    inset: 0;
    z-index: var(--z-background);
}

.download-bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5;
    mix-blend-mode: color-dodge;
}

.download-bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
            var(--color-bg-primary) 0%,
            rgba(10, 14, 26, 0.5) 30%,
            rgba(10, 14, 26, 0.5) 80%,
            var(--color-bg-primary) 100%);
}

.download-glow {
    position: absolute;
    top: -20%;
    left: 30%;
    transform: translateX(-50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(ellipse at center, rgba(124, 77, 255, 0.1), transparent 60%);
    pointer-events: none;
    z-index: 0;
    animation: drift-glow 10s ease-in-out infinite alternate;
}

.download-glow-secondary {
    position: absolute;
    bottom: -20%;
    right: 10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(ellipse at center, rgba(0, 229, 255, 0.1), transparent 60%);
    pointer-events: none;
    z-index: 0;
    animation: drift-glow-reverse 12s ease-in-out infinite alternate;
}

@keyframes drift-glow {
    0% {
        transform: translateX(-50%) translateY(0);
    }

    100% {
        transform: translateX(-40%) translateY(100px);
    }
}

@keyframes drift-glow-reverse {
    0% {
        transform: translateX(0) translateY(0);
    }

    100% {
        transform: translateX(-100px) translateY(-100px);
    }
}

.relative-z {
    position: relative;
    z-index: var(--z-base);
}

.download-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
    margin-bottom: var(--space-16);
}

.download-card {
    text-align: center;
    padding: var(--space-10) var(--space-6);
    position: relative;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    transform-style: preserve-3d;
}

.download-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.download-card.recommended {
    border-color: rgba(0, 229, 255, 0.3) !important;
    background: linear-gradient(135deg, rgba(15, 20, 40, 0.8), rgba(0, 229, 255, 0.05)) !important;
    box-shadow: var(--shadow-glow-cyan);
}

.download-card.recommended:hover {
    box-shadow: 0 0 50px rgba(0, 229, 255, 0.2), 0 20px 40px rgba(0, 0, 0, 0.5);
}

.recommended-badge {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    padding: 2px 10px;
    background: var(--gradient-accent);
    color: var(--color-bg-primary);
    font-size: var(--text-xs);
    font-weight: 700;
    border-radius: var(--radius-full);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
    animation: pulse-glow 2s infinite;
}

.platform-icon {
    font-size: 3.5rem;
    display: block;
    margin-bottom: var(--space-4);
    transition: transform 0.3s ease;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.download-card:hover .platform-icon {
    transform: translateY(-5px) scale(1.1);
}

.platform-name {
    font-size: var(--text-xl);
    font-weight: 800;
    margin-bottom: var(--space-2);
}

.platform-versions {
    font-size: var(--text-sm);
    color: var(--color-text-tertiary);
    margin-bottom: var(--space-4);
}

.platform-command {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--color-accent-teal);
    transition: all 0.3s ease;
}

.download-card:hover .platform-command {
    background: rgba(0, 229, 255, 0.1);
    border-color: rgba(0, 229, 255, 0.3);
}

/* 快速开始部分样式 */
.getting-started {
    max-width: 720px;
    margin: 0 auto;
}

.gs-title {
    font-size: var(--text-2xl);
    font-weight: 800;
    text-align: center;
    margin-bottom: var(--space-6);
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.code-block-dynamic {
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    background: rgba(5, 7, 15, 0.7) !important;
    backdrop-filter: blur(20px);
    border-radius: var(--radius-xl);
    overflow: hidden;
    position: relative;
    transition: all 0.3s ease;
}

.code-block-dynamic:hover {
    border-color: rgba(0, 229, 255, 0.3) !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 229, 255, 0.1);
    transform: translateY(-2px);
}

.code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-5);
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.code-lang {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-accent-teal);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.code-copy {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    cursor: pointer;
    font-size: var(--text-sm);
    opacity: 0.7;
    transition: all var(--transition-fast);
}

.code-copy:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.code-content {
    padding: var(--space-6) var(--space-6);
    font-size: 0.9rem;
    font-family: var(--font-mono);
    line-height: 2;
    color: var(--color-text-primary);
    overflow-x: auto;
}

.code-comment {
    color: rgba(255, 255, 255, 0.35);
}

.code-cmd {
    color: var(--color-accent-cyan);
    font-weight: 600;
}

@media (max-width: 768px) {
    .download-grid {
        grid-template-columns: 1fr;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: var(--space-12);
    }
}
</style>
