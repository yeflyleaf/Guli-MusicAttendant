<template>
  <!-- 启动屏幕 -->
  <SplashScreen />

  <div class="app-container">
    <!-- 自定义标题栏 -->
    <Header />

    <!-- 主内容区域 -->
    <div class="app-main">
      <!-- 侧边栏 -->
      <Sidebar />

      <!-- 页面内容 -->
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['LocalMusic', 'Favorites', 'RecentlyPlayed', 'PlaylistDetail']" :max="10">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </main>

    </div>

    <!-- 底部播放控制栏 -->
    <FooterPlayer />

    <!-- 歌词全屏覆盖层 -->
    <transition name="slide-up">
      <div v-if="playerStore.showLyrics" class="lyrics-overlay">
        <Lyrics />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import FooterPlayer from '@/components/Layout/FooterPlayer.vue'
import Header from '@/components/Layout/Header.vue'
import Sidebar from '@/components/Layout/Sidebar.vue'
import SplashScreen from '@/components/Layout/SplashScreen.vue'
import { useShortcuts } from '@/hooks/useIpc'
import { usePlayerStore } from '@/store/player.store'
import Lyrics from '@/views/Lyrics.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const playerStore = usePlayerStore()

// 设置全局快捷键监听
useShortcuts()

// 注意：数据预加载已移至 main.ts 中，在应用挂载后立即开始
// 启动屏幕显示 1.5 秒，为数据加载提供缓冲时间
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $bg-primary;
  overflow: hidden;
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: $spacing-lg;
  background: linear-gradient(180deg, $bg-secondary 0%, $bg-primary 100%);
}

.lyrics-overlay {
  position: absolute;
  top: $header-height;
  left: 0;
  width: 100%;
  height: calc(100% - $header-height);
  z-index: 1010;
  /* Below FooterPlayer (1020) but above everything else */
  background: $bg-primary;
}

/* 动画效果 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
