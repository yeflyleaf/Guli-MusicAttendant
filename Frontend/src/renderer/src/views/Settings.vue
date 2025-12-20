<template>
  <div class="settings-view">
    <h1 class="page-title">设置</h1>

    <!-- 音乐文件夹管理 -->
    <section class="settings-section">
      <h2 class="section-title">
        <el-icon>
          <Folder />
        </el-icon>
        音乐文件夹
      </h2>
      <div class="section-content">
        <div class="folder-list">
          <div v-for="folder in settingsStore.musicFolders" :key="folder" class="folder-item glass">
            <el-icon class="folder-icon">
              <FolderOpened />
            </el-icon>
            <span class="folder-path truncate" :title="folder">{{ folder }}</span>
            <el-button text type="danger" @click="handleRemoveFolder(folder)">
              <el-icon>
                <Close />
              </el-icon>
            </el-button>
          </div>
          <div v-if="settingsStore.musicFolders.length === 0" class="empty-folders">
            暂未添加音乐文件夹
          </div>
        </div>
        <div class="folder-actions">
          <el-button @click="handleAddFolder">
            <el-icon>
              <Plus />
            </el-icon>
            添加文件夹
          </el-button>
          <el-button type="primary" @click="handleScanAll" :loading="isScanning">
            <el-icon>
              <Refresh />
            </el-icon>
            扫描所有文件夹
          </el-button>
        </div>
      </div>
    </section>

    <!-- 播放设置 -->
    <section class="settings-section">
      <h2 class="section-title">
        <el-icon>
          <VideoPlay />
        </el-icon>
        播放设置
      </h2>
      <div class="section-content">
        <div class="setting-item">
          <div class="setting-label">
            <span>启动时自动扫描</span>
            <span class="setting-desc">每次启动时自动扫描音乐文件夹的新增歌曲</span>
          </div>
          <el-switch v-model="autoScan" @change="handleAutoScanChange" />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>启用音频可视化</span>
            <span class="setting-desc">播放时显示音频频谱可视化效果</span>
          </div>
          <el-switch v-model="visualizerEnabled" @change="handleVisualizerChange" />
        </div>
      </div>
    </section>

    <!-- 外观设置 -->
    <section class="settings-section">
      <h2 class="section-title">
        <el-icon>
          <Monitor />
        </el-icon>
        外观
      </h2>
      <div class="section-content">
        <div class="setting-item">
          <div class="setting-label">
            <span>主题</span>
            <span class="setting-desc">选择应用程序的外观主题</span>
          </div>
          <el-select v-model="theme" style="width: 120px" @change="handleThemeChange">
            <el-option label="深色模式" value="dark" />
            <el-option label="浅色模式" value="light" />
          </el-select>
        </div>
      </div>
    </section>

    <!-- 关于 -->
    <section class="settings-section">
      <h2 class="section-title">
        <el-icon>
          <InfoFilled />
        </el-icon>
        关于
      </h2>
      <div class="section-content">
        <div class="about-info">
          <div class="app-info">
            <span class="app-name gradient-text">故里音乐助手</span>
            <span class="app-version">版本 1.0.0</span>
          </div>
          <p class="app-desc">
            专业级本地音乐管理系统，基于 Electron + Vue 3 + TypeScript 构建。
          </p>
          <div class="tech-stack">
            <span class="tech-tag">Electron</span>
            <span class="tech-tag">Vue 3</span>
            <span class="tech-tag">TypeScript</span>
            <span class="tech-tag">Element Plus</span>
            <span class="tech-tag">SQLite</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>重置设置</span>
            <span class="setting-desc">将所有设置恢复为默认值</span>
          </div>
          <el-button type="danger" plain @click="handleResetSettings">
            重置设置
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useIpc } from '@/hooks/useIpc'
import { useLibraryStore } from '@/store/library.store'
import { useSettingsStore } from '@/store/settings.store'
import type { Theme } from '@/types/settings'
import {
  Close,
  Folder,
  FolderOpened,
  InfoFilled,
  Monitor,
  Plus,
  Refresh,
  VideoPlay
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'

const settingsStore = useSettingsStore()
const libraryStore = useLibraryStore()
const { selectFolder, resetAndScanAllFolders, confirm } = useIpc()

const isScanning = ref(false)
const autoScan = ref(true)
const visualizerEnabled = ref(true)
const theme = ref<Theme>('dark')

// 初始化设置值
onMounted(() => {
  autoScan.value = settingsStore.autoScan
  visualizerEnabled.value = settingsStore.visualizerEnabled
  theme.value = settingsStore.theme
})

// 添加文件夹
const handleAddFolder = async () => {
  const folder = await selectFolder()
  if (!folder) return

  await settingsStore.addMusicFolder(folder)
  ElMessage.success('文件夹已添加')
}

// 移除文件夹
const handleRemoveFolder = async (folder: string) => {
  const confirmed = await confirm(`确定要移除文件夹 "${folder}" 吗？\n（不会删除文件夹中的歌曲数据）`)
  if (!confirmed) return

  await settingsStore.removeMusicFolder(folder)
  ElMessage.success('文件夹已移除')
}

// 扫描所有文件夹
const handleScanAll = async () => {
  if (settingsStore.musicFolders.length === 0) {
    ElMessage.warning('请先添加音乐文件夹')
    return
  }

  isScanning.value = true
  ElMessage.info('正在扫描音乐文件...')

  try {
    const result = await resetAndScanAllFolders()
    ElMessage.success(`扫描完成：新增 ${result.added} 首歌曲`)
    await libraryStore.refreshMusic()
  } catch (error) {
    ElMessage.error('扫描失败')
  } finally {
    isScanning.value = false
  }
}

// 切换自动扫描
const handleAutoScanChange = async (value: boolean) => {
  await settingsStore.saveSettings({ autoScan: value })
}



// 切换可视化
const handleVisualizerChange = async (value: boolean) => {
  await settingsStore.saveSettings({ visualizerEnabled: value })
}

// 切换主题
const handleThemeChange = async (value: Theme) => {
  await settingsStore.setTheme(value)
}

// 重置设置
const handleResetSettings = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有设置恢复为默认值吗？', '重置设置', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await settingsStore.resetSettings()

    // 更新本地状态
    autoScan.value = settingsStore.autoScan
    visualizerEnabled.value = settingsStore.visualizerEnabled
    theme.value = settingsStore.theme

    // 刷新音乐库（此时应该为空）
    await libraryStore.refreshMusic()

    ElMessage.success('设置已重置')
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: $spacing-xl;
}

.page-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-xl;
}

.settings-section {
  margin-bottom: $spacing-xl;

  .section-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-md;

    .el-icon {
      color: $primary-color;
    }
  }

  .section-content {
    padding: $spacing-lg;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid $border-color;
    border-radius: $border-radius-lg;
  }
}

.folder-list {
  margin-bottom: $spacing-md;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-sm;

  .folder-icon {
    font-size: 20px;
    color: $primary-color;
  }

  .folder-path {
    flex: 1;
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.empty-folders {
  padding: $spacing-lg;
  text-align: center;
  color: $text-muted;
}

.folder-actions {
  display: flex;
  gap: $spacing-sm;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md 0;
  border-bottom: 1px solid $border-color-light;

  &:last-child {
    border-bottom: none;
  }

  .setting-label {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span:first-child {
      font-size: $font-size-base;
      color: $text-primary;
    }

    .setting-desc {
      font-size: $font-size-sm;
      color: $text-muted;
    }
  }
}

.about-info {
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-lg;
  border-bottom: 1px solid $border-color-light;

  .app-info {
    display: flex;
    align-items: baseline;
    gap: $spacing-md;
    margin-bottom: $spacing-sm;

    .app-name {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
    }

    .app-version {
      font-size: $font-size-sm;
      color: $text-muted;
    }
  }

  .app-desc {
    color: $text-secondary;
    margin-bottom: $spacing-md;
    line-height: 1.6;
  }

  .tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .tech-tag {
    padding: 4px 12px;
    background: $gradient-card;
    border: 1px solid $border-color;
    border-radius: 20px;
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}
</style>
