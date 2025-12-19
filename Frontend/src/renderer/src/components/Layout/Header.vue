<template>
  <header class="app-header app-drag-region">
    <!-- Logo 和标题 -->
    <div class="header-left app-no-drag">
      <div class="logo">
        <span class="logo-icon">🎵</span>
        <span class="logo-text gradient-text">故里音乐</span>
      </div>
    </div>

    <!-- 占位符，保持布局平衡 -->
    <div class="header-center app-no-drag"></div>

    <!-- 窗口控制按钮 -->
    <div class="header-right app-no-drag">
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
import { Close, CopyDocument, FullScreen, Minus } from '@element-plus/icons-vue'
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
  background: rgba($bg-secondary, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid $border-color;
  z-index: $z-sticky;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.logo {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: default;

  .logo-icon {
    font-size: 24px;
    animation: float 3s ease-in-out infinite;
  }

  .logo-text {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

.header-center {
  flex: 1;
  max-width: 500px;
  margin: 0 $spacing-xl;
}



.header-right {
  display: flex;
  align-items: center;
  gap: 2px;
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
