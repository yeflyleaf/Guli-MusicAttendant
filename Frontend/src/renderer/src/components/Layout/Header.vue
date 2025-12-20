<template>
  <header class="app-header app-drag-region">
    <!-- Logo 和标题 + 导航图标 -->
    <div class="header-left app-no-drag">
      <div class="logo" @click="$router.push('/')">
        <span class="logo-icon">🎵</span>
        <span class="logo-text gradient-text">故里音乐</span>
      </div>

      <!-- 导航图标区域 -->
      <div class="nav-icons">
        <!-- 首页 -->
        <el-tooltip content="首页" placement="bottom" :show-after="300">
          <router-link to="/" class="nav-icon-btn" :class="{ active: $route.path === '/' }">
            <el-icon>
              <HomeFilled />
            </el-icon>
          </router-link>
        </el-tooltip>

        <!-- 本地音乐 -->
        <el-tooltip content="本地音乐" placement="bottom" :show-after="300">
          <router-link to="/local-music" class="nav-icon-btn" :class="{ active: $route.path === '/local-music' }">
            <el-icon>
              <Headset />
            </el-icon>
          </router-link>
        </el-tooltip>

        <!-- 我喜欢 -->
        <el-tooltip content="我喜欢" placement="bottom" :show-after="300">
          <router-link to="/favorites" class="nav-icon-btn" :class="{ active: $route.path === '/favorites' }">
            <el-icon>
              <Star />
            </el-icon>
          </router-link>
        </el-tooltip>

        <!-- 最近播放 -->
        <el-tooltip content="最近播放" placement="bottom" :show-after="300">
          <router-link to="/recently-played" class="nav-icon-btn"
            :class="{ active: $route.path === '/recently-played' }">
            <el-icon>
              <Clock />
            </el-icon>
          </router-link>
        </el-tooltip>

        <!-- 歌单 -->
        <el-tooltip content="我的歌单" placement="bottom" :show-after="300">
          <router-link to="/playlists" class="nav-icon-btn"
            :class="{ active: $route.path === '/playlists' || $route.path.startsWith('/playlist/') }">
            <el-icon>
              <Tickets />
            </el-icon>
          </router-link>
        </el-tooltip>
      </div>
    </div>

    <!-- 占位符，保持布局平衡 -->
    <div class="header-center app-no-drag"></div>

    <!-- 窗口控制按钮 -->
    <div class="header-right app-no-drag">
      <!-- 设置 -->
      <el-tooltip content="设置" placement="bottom" :show-after="300">
        <router-link to="/settings" class="nav-icon-btn settings-btn" :class="{ active: $route.path === '/settings' }">
          <el-icon>
            <Setting />
          </el-icon>
        </router-link>
      </el-tooltip>

      <div class="header-divider"></div>

      <!-- 最小化 -->
      <button class="window-btn" @click="handleMinimize" title="最小化">
        <el-icon>
          <Minus />
        </el-icon>
      </button>

      <!-- 最大化/还原 -->
      <button class="window-btn" @click="handleMaximize" title="最大化">
        <el-icon>
          <FullScreen v-if="!isMaximized" />
          <CopyDocument v-else />
        </el-icon>
      </button>

      <!-- 关闭 -->
      <button class="window-btn window-btn-close" @click="handleClose" title="关闭">
        <el-icon>
          <Close />
        </el-icon>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useIpc } from '@/hooks/useIpc'
import {
  Clock,
  Close,
  CopyDocument,
  FullScreen,
  Headset,
  HomeFilled,
  Minus,
  Setting,
  Star,
  Tickets
} from '@element-plus/icons-vue'
import { onMounted, onUnmounted, ref } from 'vue'

const { minimizeWindow, maximizeWindow, closeWindow, isMaximized: checkMaximized } = useIpc()

const isMaximized = ref(false)

// 检查窗口状态
const updateMaximizedState = async () => {
  isMaximized.value = await checkMaximized()
}

// 窗口控制
const handleMinimize = () => {
  minimizeWindow()
}

const handleMaximize = async () => {
  maximizeWindow()
  // 延迟更新状态
  setTimeout(updateMaximizedState, 100)
}

const handleClose = () => {
  closeWindow()
}

onMounted(() => {
  updateMaximizedState()

  // 监听窗口状态变化
  window.addEventListener('resize', updateMaximizedState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMaximizedState)
})
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0 $spacing-md;
  background: rgba($bg-secondary-rgb, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid $border-color;
  z-index: $z-sticky;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.logo {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  padding-right: $spacing-md;
  border-right: 1px solid $border-color-light;
  transition: opacity $transition-fast;

  &:hover {
    opacity: 0.8;
  }

  .logo-icon {
    font-size: 22px;
    animation: float 3s ease-in-out infinite;
  }

  .logo-text {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2px);
  }
}

// 导航图标区域
.nav-icons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: $text-secondary;
  text-decoration: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  .el-icon {
    font-size: 20px;
  }

  &:hover {
    color: $text-primary;
    background: $bg-hover;
  }

  &.active {
    color: $primary-color;
    background: rgba(var(--primary-color-rgb), 0.15);

    .el-icon {
      color: $primary-color;
    }
  }
}

.header-center {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

// 设置按钮（右侧）
.settings-btn {
  margin-right: 4px;
}

// 分隔线
.header-divider {
  width: 1px;
  height: 20px;
  background: $border-color-light;
  margin: 0 4px;
}

.window-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 32px;
  background: transparent;
  border: none;
  color: $text-secondary;
  cursor: pointer;
  transition: all $transition-fast;
  border-radius: $border-radius-sm;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: $text-primary;
  }

  &.window-btn-close:hover {
    background: $error-color;
    color: white;
  }
}
</style>
