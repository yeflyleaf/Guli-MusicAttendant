<script setup lang="ts">
import { onMounted, ref } from 'vue'

const currentYear = new Date().getFullYear()
const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 300)
})
</script>

<template>
  <footer id="footer" class="footer">
    <!-- 顶部动画边框 -->
    <div class="footer-top-line"></div>

    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="brand-icon">🎵</span>
            <span class="brand-name gradient-text">故里音乐助手</span>
          </div>
          <p class="footer-desc">
            基于 Electron + Vue 3 的现代化本地音乐管理系统<br />
            开源免费，隐私安全
          </p>

          <!-- 社交 / 快捷链接 -->
          <div class="footer-social">
            <a
              href="https://github.com/yeflyleaf/Guli_MusicAttendant"
              target="_blank"
              rel="noopener noreferrer"
              class="social-icon"
              title="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
            </a>
          </div>
        </div>

        <div class="footer-links-group">
          <div class="footer-col">
            <h4 class="footer-col-title">项目</h4>
            <ul>
              <li><a href="#features">功能特性</a></li>
              <li><a href="#preview">应用预览</a></li>
              <li><a href="#tech">技术架构</a></li>
              <li><a href="#download">下载安装</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">资源</h4>
            <ul>
              <li>
                <a
                  href="https://github.com/yeflyleaf/Guli_MusicAttendant"
                  target="_blank"
                  rel="noopener noreferrer"
                  >GitHub</a
                >
              </li>
              <li>
                <a
                  href="https://github.com/yeflyleaf/Guli_MusicAttendant/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  >问题反馈</a
                >
              </li>
              <li>
                <a
                  href="https://github.com/yeflyleaf/Guli_MusicAttendant/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  >开源许可</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copyright">
          © {{ currentYear }}
          <a href="https://github.com/yeflyleaf" target="_blank" rel="noopener noreferrer"
            >yeflyleaf</a
          >. All Rights Reserved.
        </p>
        <p class="footer-license"><span class="license-badge">AGPL-3.0</span> License</p>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <a href="#" class="back-to-top" title="回到顶部">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </a>
  </footer>
</template>

<style scoped>
.footer {
  padding: var(--space-16) 0 var(--space-8);
  background: linear-gradient(180deg, var(--color-bg-primary), rgba(5, 7, 15, 1));
  position: relative;
  overflow: hidden;
}

.footer-top-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 229, 255, 0.3) 20%,
    rgba(124, 77, 255, 0.3) 50%,
    rgba(29, 233, 182, 0.3) 80%,
    transparent
  );
  animation: shimmer-line 4s ease-in-out infinite;
}

@keyframes shimmer-line {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

.footer-top {
  display: flex;
  justify-content: space-between;
  gap: var(--space-12);
  margin-bottom: var(--space-12);
}

.footer-brand {
  max-width: 360px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.brand-icon {
  font-size: 1.5rem;
  animation: float 5s ease-in-out infinite;
}

.brand-name {
  font-size: var(--text-xl);
  font-weight: 800;
  filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.3));
}

.footer-desc {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  line-height: 1.8;
  margin-bottom: var(--space-6);
}

.footer-social {
  display: flex;
  gap: var(--space-3);
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary) !important;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.social-icon:hover {
  background: rgba(0, 229, 255, 0.1);
  border-color: rgba(0, 229, 255, 0.3);
  color: var(--color-accent-cyan) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 229, 255, 0.15);
}

.footer-links-group {
  display: flex;
  gap: var(--space-16);
}

.footer-col-title {
  font-size: var(--text-sm);
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: var(--space-5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  padding-bottom: var(--space-2);
}

.footer-col-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 24px;
  height: 2px;
  background: var(--gradient-accent);
  border-radius: 1px;
}

.footer-col ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.footer-col a {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  transition: all 0.3s ease;
  position: relative;
  padding-left: 0;
}

.footer-col a:hover {
  color: var(--color-text-primary);
  padding-left: var(--space-2);
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-8);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.footer-copyright {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.footer-copyright a {
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.footer-copyright a:hover {
  color: var(--color-accent-cyan);
}

.footer-license {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.license-badge {
  padding: 2px 8px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.15);
  border-radius: var(--radius-sm);
  color: var(--color-accent-cyan);
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: 0.7rem;
}

/* 回到顶部按钮样式 */
.back-to-top {
  position: absolute;
  bottom: var(--space-8);
  right: var(--space-8);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(15, 20, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--color-text-secondary) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.back-to-top:hover {
  background: rgba(0, 229, 255, 0.1);
  border-color: rgba(0, 229, 255, 0.3);
  color: var(--color-accent-cyan) !important;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 229, 255, 0.15);
}

@media (max-width: 768px) {
  .footer-top {
    flex-direction: column;
    gap: var(--space-8);
  }

  .footer-links-group {
    gap: var(--space-8);
  }

  .footer-bottom {
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
  }

  .back-to-top {
    right: var(--space-4);
    bottom: var(--space-4);
  }
}
</style>
