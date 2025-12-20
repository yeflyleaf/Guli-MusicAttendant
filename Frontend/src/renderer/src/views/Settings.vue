<template>
  <div class="settings-view">
    <h1 class="page-title">{{ $t('settings.title') }}</h1>

    <el-tabs tab-position="left" class="settings-tabs">
      <!-- 外观设置 -->
      <el-tab-pane :label="$t('settings.appearance.title')">
        <template #label>
          <span class="tab-label">
            <el-icon>
              <Monitor />
            </el-icon>
            {{ $t('settings.appearance.title') }}
          </span>
        </template>

        <div class="settings-content">
          <h2 class="section-title">{{ $t('settings.appearance.sectionTitle') }}</h2>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.theme') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.themeDesc') }}</span>
              </div>
              <el-select v-model="theme" style="width: 120px" @change="handleThemeChange">
                <el-option :label="$t('settings.appearance.themeDark')" value="dark" />
                <el-option :label="$t('settings.appearance.themeLight')" value="light" />
              </el-select>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.language') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.languageDesc') }}</span>
              </div>
              <el-select v-model="language" style="width: 140px" @change="handleLanguageChange">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
                <el-option label="العربية" value="ar-SA" />
                <el-option label="Français" value="fr-FR" />
                <el-option label="Русский" value="ru-RU" />
                <el-option label="Español" value="es-ES" />
              </el-select>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.fontSize') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.fontSizeDesc') }} ({{ fontSize }}px)</span>
              </div>
              <div class="setting-control">
                <el-slider v-model="fontSize" :min="12" :max="20" :step="1" show-input @change="handleFontSizeChange" />
              </div>
            </div>
          </div>

          <h3 class="subsection-title">{{ $t('settings.appearance.page') }}</h3>
          <div class="setting-group">
            <div class="setting-item block">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.localMusicHeaders') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.localMusicHeadersDesc') }}</span>
              </div>
              <div class="setting-control mt-2">
                <el-checkbox-group v-model="localMusicHeaders" @change="handleHeadersChange">
                  <el-checkbox label="title">{{ $t('settings.appearance.headerTitle') }}</el-checkbox>
                  <el-checkbox label="artist">{{ $t('settings.appearance.headerArtist') }}</el-checkbox>
                  <el-checkbox label="album">{{ $t('settings.appearance.headerAlbum') }}</el-checkbox>
                  <el-checkbox label="duration">{{ $t('settings.appearance.headerDuration') }}</el-checkbox>
                  <el-checkbox label="created_at">{{ $t('settings.appearance.headerCreatedAt') }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>

          <h3 class="subsection-title">{{ $t('settings.appearance.visualization') }}</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.visualizerEnabled') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.visualizerEnabledDesc') }}</span>
              </div>
              <el-switch v-model="visualizerEnabled" @change="handleVisualizerEnabledChange" />
            </div>

            <div class="setting-item" v-if="visualizerEnabled">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.visualizerStyle') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.visualizerStyleDesc') }}</span>
              </div>
              <el-select v-model="visualizationStyle" style="width: 140px" @change="handleVisualizerStyleChange">
                <el-option :label="$t('settings.appearance.styleBars')" value="bars" />
                <el-option :label="$t('settings.appearance.styleWave')" value="wave" />
                <el-option :label="$t('settings.appearance.styleSpectrum')" value="spectrum" />
                <el-option :label="$t('settings.appearance.styleMirror')" value="mirror" />
                <el-option :label="$t('settings.appearance.styleMountain')" value="mountain" />
              </el-select>
            </div>

            <div class="setting-item" v-if="visualizerEnabled">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.visualizerFrameRate') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.visualizerFrameRateDesc') }} ({{
                  visualizationFrameRate }}
                  FPS)</span>
              </div>
              <div class="setting-control" style="width: 200px">
                <el-slider v-model="visualizationFrameRate" :min="30" :max="144" :step="10"
                  :marks="{ 30: '30', 60: '60', 144: '144' }" @change="handleVisualizerFrameRateChange" />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 行为设置 -->
      <el-tab-pane :label="$t('settings.behavior.title')">
        <template #label>
          <span class="tab-label">
            <el-icon>
              <Operation />
            </el-icon>
            {{ $t('settings.behavior.title') }}
          </span>
        </template>

        <div class="settings-content">
          <h2 class="section-title">{{ $t('settings.behavior.sectionTitle') }}</h2>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.rememberPlaybackStatus') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.rememberPlaybackStatusDesc') }}</span>
              </div>
              <el-switch v-model="rememberPlaybackStatus" @change="handleRememberPlaybackStatusChange" />
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.gaplessPlayback') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.gaplessPlaybackDesc') }}</span>
              </div>
              <el-switch v-model="gaplessPlayback" @change="handleGaplessPlaybackChange" />
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.autoScan') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.autoScanDesc') }}</span>
              </div>
              <el-switch v-model="autoScan" @change="handleAutoScanChange" />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 音乐库设置 -->
      <el-tab-pane :label="$t('settings.library.title')">
        <template #label>
          <span class="tab-label">
            <el-icon>
              <Folder />
            </el-icon>
            {{ $t('settings.library.title') }}
          </span>
        </template>

        <div class="settings-content">
          <h2 class="section-title">{{ $t('settings.library.sectionTitle') }}</h2>

          <div class="setting-group">
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
                {{ $t('settings.library.emptyFolders') }}
              </div>
            </div>
            <div class="folder-actions">
              <el-button @click="handleAddFolder">
                <el-icon>
                  <Plus />
                </el-icon>
                {{ $t('settings.library.addFolder') }}
              </el-button>
              <el-button type="primary" @click="handleScanAll" :loading="isScanning">
                <el-icon>
                  <Refresh />
                </el-icon>
                {{ $t('settings.library.scanAll') }}
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 关于 -->
      <el-tab-pane :label="$t('settings.about.title')">
        <template #label>
          <span class="tab-label">
            <el-icon>
              <InfoFilled />
            </el-icon>
            {{ $t('settings.about.title') }}
          </span>
        </template>

        <div class="settings-content">
          <h2 class="section-title">{{ $t('settings.about.sectionTitle') }}</h2>

          <div class="about-info">
            <div class="app-info">
              <span class="app-name gradient-text">{{ $t('settings.about.appName') }}</span>
              <span class="app-version">{{ $t('settings.about.version') }} 1.3.0</span>
            </div>
            <p class="app-desc">
              {{ $t('settings.about.description') }}
            </p>
            <div class="tech-stack">
              <span class="tech-tag">Electron</span>
              <span class="tech-tag">Vue 3</span>
              <span class="tech-tag">TypeScript</span>
              <span class="tech-tag">Element Plus</span>
              <span class="tech-tag">SQLite</span>
            </div>
          </div>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.about.resetSettings') }}</span>
                <span class="setting-desc">{{ $t('settings.about.resetSettingsDesc') }}</span>
              </div>
              <el-button type="danger" plain @click="handleResetSettings">
                {{ $t('settings.about.resetSettings') }}
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
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
  Operation,
  Plus,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// 初始化 i18n 以便在模板中使用 $t
useI18n()

const settingsStore = useSettingsStore()
const libraryStore = useLibraryStore()
const { selectFolder, resetAndScanAllFolders, confirm } = useIpc()

const isScanning = ref(false)

// 外观设置
const theme = ref<Theme>('dark')
const language = ref('zh-CN')
const fontSize = ref(14)
const localMusicHeaders = ref<string[]>([])
const visualizerEnabled = ref(true)
const visualizationStyle = ref('bars')
const visualizationFrameRate = ref(60)

// 行为设置
const rememberPlaybackStatus = ref(true)
const gaplessPlayback = ref(false)
const autoScan = ref(true)

// 初始化设置值
onMounted(() => {
  theme.value = settingsStore.theme
  language.value = settingsStore.language
  fontSize.value = settingsStore.fontSize
  localMusicHeaders.value = settingsStore.localMusicHeaders
  visualizerEnabled.value = settingsStore.visualizerEnabled
  visualizationStyle.value = settingsStore.visualizationStyle
  visualizationFrameRate.value = settingsStore.visualizationFrameRate

  rememberPlaybackStatus.value = settingsStore.rememberPlaybackStatus
  gaplessPlayback.value = settingsStore.gaplessPlayback
  autoScan.value = settingsStore.autoScan
})

// --- 外观设置处理 ---

const handleThemeChange = async (value: Theme) => {
  await settingsStore.setTheme(value)
}

const handleLanguageChange = async (value: string) => {
  await settingsStore.setLanguage(value)
}

const handleFontSizeChange = async (value: number) => {
  await settingsStore.saveSettings({ fontSize: value })
}

const handleHeadersChange = async (value: string[]) => {
  await settingsStore.saveSettings({ localMusicHeaders: value })
}

const handleVisualizerEnabledChange = async (value: boolean) => {
  await settingsStore.saveSettings({ visualizerEnabled: value })
}

const handleVisualizerStyleChange = async (value: string) => {
  await settingsStore.saveSettings({ visualizationStyle: value })
}

const handleVisualizerFrameRateChange = async (value: number) => {
  await settingsStore.saveSettings({ visualizationFrameRate: value })
}

// --- 行为设置处理 ---

const handleRememberPlaybackStatusChange = async (value: boolean) => {
  await settingsStore.saveSettings({ rememberPlaybackStatus: value })
}

const handleGaplessPlaybackChange = async (value: boolean) => {
  await settingsStore.saveSettings({ gaplessPlayback: value })
}

const handleAutoScanChange = async (value: boolean) => {
  await settingsStore.saveSettings({ autoScan: value })
}

// --- 音乐库设置处理 ---

const handleAddFolder = async () => {
  const folder = await selectFolder()
  if (!folder) return

  await settingsStore.addMusicFolder(folder)
  ElMessage.success('文件夹已添加')
}

const handleRemoveFolder = async (folder: string) => {
  const confirmed = await confirm(`确定要移除文件夹 "${folder}" 吗？\n（不会删除文件夹中的歌曲数据）`)
  if (!confirmed) return

  await settingsStore.removeMusicFolder(folder)
  ElMessage.success('文件夹已移除')
}

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

// --- 其他 ---

const handleResetSettings = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有设置恢复为默认值吗？', '重置设置', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await settingsStore.resetSettings()

    // 更新本地状态
    theme.value = settingsStore.theme
    language.value = settingsStore.language
    fontSize.value = settingsStore.fontSize
    localMusicHeaders.value = settingsStore.localMusicHeaders
    visualizerEnabled.value = settingsStore.visualizerEnabled
    visualizationStyle.value = settingsStore.visualizationStyle
    visualizationFrameRate.value = settingsStore.visualizationFrameRate
    rememberPlaybackStatus.value = settingsStore.rememberPlaybackStatus
    gaplessPlayback.value = settingsStore.gaplessPlayback
    autoScan.value = settingsStore.autoScan

    // 刷新音乐库
    await libraryStore.refreshMusic()

    ElMessage.success('设置已重置')
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.settings-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: $spacing-lg;
  box-sizing: border-box;
}

.page-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-lg;
}

.settings-tabs {
  flex: 1;
  height: 0; // 允许 flex 子元素滚动

  :deep(.el-tabs__content) {
    height: 100%;
    overflow-y: auto;
    padding-left: $spacing-xl;
  }

  :deep(.el-tabs__item) {
    font-size: $font-size-md;
    height: 48px;
    line-height: 48px;

    &.is-active {
      font-weight: $font-weight-bold;
    }
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.settings-content {
  max-width: 800px;
  padding-bottom: $spacing-xl;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $border-color-light;
}

.subsection-title {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  margin: $spacing-xl 0 $spacing-md;
  color: $text-primary;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--border-color-hover);
  }

  &.block {
    display: block;

    .setting-control {
      margin-top: $spacing-md;
    }
  }

  .setting-label {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span:first-child {
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $text-primary;
    }

    .setting-desc {
      font-size: $font-size-sm;
      color: $text-muted;
    }
  }
}

.mt-2 {
  margin-top: $spacing-sm;
}

// 文件夹列表样式
.folder-list {
  margin-bottom: $spacing-md;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-sm;
  background: rgba(255, 255, 255, 0.02);

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
  border: 1px dashed $border-color;
  border-radius: $border-radius-md;
}

.folder-actions {
  display: flex;
  gap: $spacing-sm;
}

// 关于页面样式
.about-info {
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;

  .app-info {
    display: flex;
    align-items: baseline;
    gap: $spacing-md;
    margin-bottom: $spacing-sm;

    .app-name {
      font-size: $font-size-xl;
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
