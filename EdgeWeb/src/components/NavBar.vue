<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const scrollProgress = ref(0)
const activeSection = ref('')

const navLinks = [
  { label: '功能', href: '#features' },
  { label: '预览', href: '#preview' },
  { label: '技术栈', href: '#tech' },
  { label: '国际化', href: '#i18n' },
  { label: '下载', href: '#download' },
]

let isScrollTicking = false
function handleScroll() {
  if (!isScrollTicking) {
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY
      const newIsScrolled = currentScrollY > 30
      if (isScrolled.value !== newIsScrolled) {
        isScrolled.value = newIsScrolled
      }

      // 计算滚动进度
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0
      // 避免过于频繁的微小更新
      if (Math.abs(scrollProgress.value - currentProgress) > 0.5) {
        scrollProgress.value = currentProgress
      }

      // 判断当前激活的章节
      const sections = ['download', 'i18n', 'tech', 'preview', 'features']
      let newActiveSection = ''
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200) {
            newActiveSection = '#' + id
            break
          }
        }
      }
      if (currentScrollY < 100) newActiveSection = ''

      if (activeSection.value !== newActiveSection) {
        activeSection.value = newActiveSection
      }

      isScrollTicking = false
    })
    isScrollTicking = true
  }
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav id="navbar" class="navbar" :class="{ scrolled: isScrolled }">
    <!-- 滚动进度条 -->
    <div class="scroll-progress" :style="{ width: scrollProgress + '%' }"></div>

    <div class="navbar-inner container">
      <a href="#" class="navbar-brand">
        <span class="brand-icon">🎵</span>
        <span class="brand-text">故里音乐助手</span>
      </a>

      <ul class="navbar-links" :class="{ open: isMobileMenuOpen }">
        <li v-for="link in navLinks" :key="link.href">
          <a :href="link.href" :class="{ active: activeSection === link.href }" @click="closeMobileMenu">{{ link.label
            }}</a>
        </li>
      </ul>

      <div class="navbar-actions">
        <a href="https://github.com/yeflyleaf/Guli-MusicAttendant" target="_blank" rel="noopener noreferrer"
          class="btn btn-secondary btn-github" id="github-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>

      <button class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen"
        :aria-label="isMobileMenuOpen ? '关闭菜单' : '打开菜单'" id="mobile-menu-toggle">
        <span :class="{ open: isMobileMenuOpen }"></span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav);
  height: var(--nav-height);
  transition: all var(--transition-base);
}

.scroll-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--gradient-accent);
  z-index: 10;
  transition: width 0.1s linear;
  box-shadow:
    0 0 10px rgba(0, 229, 255, 0.5),
    0 0 20px rgba(0, 229, 255, 0.2);
}

.navbar.scrolled {
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 4px 30px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(0, 229, 255, 0.03);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-primary) !important;
  -webkit-text-fill-color: unset;
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.brand-icon {
  font-size: 1.5rem;
  animation: float 4s ease-in-out infinite;
}

.brand-text {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.3));
}

.navbar-links {
  display: flex;
  gap: var(--space-8);
}

.navbar-links a {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.02em;
  position: relative;
  padding: var(--space-2) var(--space-1);
  transition: all 0.3s ease;
}

.navbar-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--gradient-accent);
  border-radius: 1px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
}

.navbar-links a:hover,
.navbar-links a.active {
  color: var(--color-text-primary);
}

.navbar-links a:hover::after,
.navbar-links a.active::after {
  width: 100%;
}

.navbar-links a.active {
  color: var(--color-accent-cyan);
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

.btn-github {
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  gap: var(--space-2);
  transition: all 0.3s ease;
}

.btn-github:hover {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  position: relative;
}

.mobile-menu-btn span,
.mobile-menu-btn span::before,
.mobile-menu-btn span::after {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: 1px;
  transition: all var(--transition-base);
  position: absolute;
  left: 4px;
}

.mobile-menu-btn span {
  top: 15px;
}

.mobile-menu-btn span::before {
  content: '';
  top: -7px;
}

.mobile-menu-btn span::after {
  content: '';
  top: 7px;
}

.mobile-menu-btn span.open {
  background: transparent;
}

.mobile-menu-btn span.open::before {
  top: 0;
  transform: rotate(45deg);
}

.mobile-menu-btn span.open::after {
  top: 0;
  transform: rotate(-45deg);
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }

  .navbar-links {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    right: 0;
    flex-direction: column;
    background: rgba(10, 14, 26, 0.95);
    backdrop-filter: blur(25px);
    padding: var(--space-6);
    gap: var(--space-4);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all var(--transition-base);
    border-bottom: 1px solid var(--color-border);
  }

  .navbar-links.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  .navbar-links a {
    font-size: var(--text-base);
    padding: var(--space-3) var(--space-4);
  }

  .navbar-actions {
    display: none;
  }
}
</style>
