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
              <el-select v-model="theme" style="width: 140px" @change="handleThemeChange">
                <el-option :label="$t('settings.appearance.themeDark')" value="dark" />
                <el-option :label="$t('settings.appearance.themeLight')" value="light" />
                <el-option :label="$t('settings.appearance.themeQuantum')" value="quantum" />
                <el-option :label="$t('settings.appearance.themeWasteland')" value="wasteland" />
                <el-option :label="$t('settings.appearance.themeGothic')" value="gothic" />
                <el-option :label="$t('settings.appearance.themePapercut')" value="papercut" />
                <el-option :label="$t('settings.appearance.themeSugarland')" value="sugarland" />
                <el-option :label="$t('settings.appearance.themeInterstellar')" value="interstellar" />
              </el-select>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.quickSwitchThemes') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.quickSwitchThemesDesc') }}</span>
              </div>
              <div class="setting-control" style="display: flex; gap: 8px;">
                <el-select v-model="quickSwitchThemes[0]" style="width: 120px" @change="handleQuickSwitchThemesChange">
                  <el-option :label="$t('settings.appearance.themeDark')" value="dark" />
                  <el-option :label="$t('settings.appearance.themeLight')" value="light" />
                  <el-option :label="$t('settings.appearance.themeQuantum')" value="quantum" />
                  <el-option :label="$t('settings.appearance.themeWasteland')" value="wasteland" />
                  <el-option :label="$t('settings.appearance.themeGothic')" value="gothic" />
                  <el-option :label="$t('settings.appearance.themePapercut')" value="papercut" />
                  <el-option :label="$t('settings.appearance.themeSugarland')" value="sugarland" />
                  <el-option :label="$t('settings.appearance.themeInterstellar')" value="interstellar" />
                </el-select>
                <el-select v-model="quickSwitchThemes[1]" style="width: 120px" @change="handleQuickSwitchThemesChange">
                  <el-option :label="$t('settings.appearance.themeDark')" value="dark" />
                  <el-option :label="$t('settings.appearance.themeLight')" value="light" />
                  <el-option :label="$t('settings.appearance.themeQuantum')" value="quantum" />
                  <el-option :label="$t('settings.appearance.themeWasteland')" value="wasteland" />
                  <el-option :label="$t('settings.appearance.themeGothic')" value="gothic" />
                  <el-option :label="$t('settings.appearance.themePapercut')" value="papercut" />
                  <el-option :label="$t('settings.appearance.themeSugarland')" value="sugarland" />
                  <el-option :label="$t('settings.appearance.themeInterstellar')" value="interstellar" />
                </el-select>
              </div>
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

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.appearance.visualizerFrameRate') }}</span>
                <span class="setting-desc">{{ $t('settings.appearance.visualizerFrameRateDesc') }} ({{
                  visualizationFrameRate }}
                  FPS)</span>
              </div>
              <div class="setting-control" style="width: 280px">
                <el-slider v-model="visualizationFrameRate" :min="30" :max="240" :step="1"
                  :marks="{ 30: '30', 60: '60', 120: '120', 165: '165', 240: '240' }"
                  @change="handleVisualizerFrameRateChange" />
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
                  <el-checkbox value="title">{{ $t('settings.appearance.headerTitle') }}</el-checkbox>
                  <el-checkbox value="artist">{{ $t('settings.appearance.headerArtist') }}</el-checkbox>
                  <el-checkbox value="album">{{ $t('settings.appearance.headerAlbum') }}</el-checkbox>
                  <el-checkbox value="duration">{{ $t('settings.appearance.headerDuration') }}</el-checkbox>
                  <el-checkbox value="created_at">{{ $t('settings.appearance.headerCreatedAt') }}</el-checkbox>
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

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.disableSplashScreen') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.disableSplashScreenDesc') }}</span>
              </div>
              <el-switch v-model="disableSplashScreen" @change="handleDisableSplashScreenChange" />
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.showSplashScreen') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.showSplashScreenDesc') }}</span>
              </div>
              <el-button @click="handleShowSplashScreen">{{ $t('settings.behavior.showSplashScreenBtn') }}</el-button>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.splashTheme') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.splashThemeDesc') }}</span>
              </div>
              <el-select v-model="splashTheme" style="width: 140px" @change="handleSplashThemeChange">
                <el-option :label="$t('settings.behavior.splashThemeCosmic')" value="cosmic" />
                <el-option :label="$t('settings.behavior.splashThemeEthereal')" value="ethereal" />
                <el-option :label="$t('settings.behavior.splashThemeMolten')" value="molten" />
                <el-option :label="$t('settings.behavior.splashThemeCyber')" value="cyber" />
                <el-option :label="$t('settings.behavior.splashThemeAbyss')" value="abyss" />
                <el-option :label="$t('settings.behavior.splashThemePrism')" value="prism" />
                <el-option :label="$t('settings.behavior.splashThemeEmerald')" value="emerald" />
                <el-option :label="$t('settings.behavior.splashThemeBrass')" value="brass" />
                <el-option :label="$t('settings.behavior.splashThemeSanctum')" value="sanctum" />
                <el-option :label="$t('settings.behavior.splashThemeSilicon')" value="silicon" />
                <el-option :label="$t('settings.behavior.splashThemeSakura')" value="sakura" />
                <el-option :label="$t('settings.behavior.splashThemeChronos')" value="chronos" />
              </el-select>
            </div>
          </div>

          <h3 class="subsection-title">{{ $t('settings.behavior.systemTray') }}</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.showTrayIcon') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.showTrayIconDesc') }}</span>
              </div>
              <el-switch v-model="showTrayIcon" @change="handleShowTrayIconChange" />
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.minimizeToTray') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.minimizeToTrayDesc') }}</span>
              </div>
              <el-switch v-model="minimizeToTray" :disabled="!showTrayIcon" @change="handleMinimizeToTrayChange" />
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.behavior.closeToTray') }}</span>
                <span class="setting-desc">{{ $t('settings.behavior.closeToTrayDesc') }}</span>
              </div>
              <el-switch v-model="closeToTray" :disabled="!showTrayIcon" @change="handleCloseToTrayChange" />
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

      <!-- 下载设置 -->
      <el-tab-pane label="下载设置">
        <template #label>
          <span class="tab-label">
            <el-icon>
              <Download />
            </el-icon>
            下载设置
          </span>
        </template>

        <div class="settings-content">
          <h2 class="section-title">音乐来源</h2>

          <div class="setting-group">
            <div class="source-list-compact">
              <div v-if="musicSources.length === 0" class="empty-sources-compact">
                暂无已安装的音乐源，请点击"自定义源管理"添加
              </div>
              <div v-for="source in musicSources" :key="source.id" class="source-item-compact">
                <el-checkbox v-model="source.enabled" @change="handleSourceEnabledChange(source)">
                  <span class="source-name">{{ source.name }}</span>
                  <span class="source-icon">{{ source.icon || '🎵' }}</span>
                  <span class="source-version">v{{ source.version || '1.0.0' }}</span>
                  <span v-if="source.initialized" class="source-status success">[初始化成功]</span>
                </el-checkbox>
              </div>
            </div>
            <div class="source-actions">
              <el-button @click="showSourceManager = true">自定义源管理</el-button>
            </div>
          </div>

          <h2 class="section-title" style="margin-top: 24px;">下载设置</h2>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>是否启用下载功能</span>
                <span class="setting-desc">启用后可从在线搜索结果下载音乐</span>
              </div>
              <el-switch v-model="downloadEnabled" @change="handleDownloadEnabledChange" />
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>下载目录存在同名的文件时跳过此下载任务</span>
                <span class="setting-desc">避免重复下载相同文件</span>
              </div>
              <el-switch v-model="downloadSkipExisting" @change="handleDownloadSkipExistingChange" />
            </div>
          </div>

          <h3 class="subsection-title">下载路径</h3>
          <div class="setting-group">
            <div class="setting-item block">
              <div class="setting-label">
                <span>当前下载路径：{{ downloadPath || '未设置（将使用第一个音乐文件夹）' }}</span>
              </div>
              <div class="setting-control mt-2">
                <el-button @click="handleChangeDownloadPath">更改</el-button>
              </div>
            </div>
          </div>

          <h3 class="subsection-title">同时下载任务数</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>同时下载任务数</span>
                <span class="setting-desc">设置过大可能会导致 IP 被封，这取决于音源</span>
              </div>
              <el-select v-model="downloadConcurrent" style="width: 80px" @change="handleDownloadConcurrentChange">
                <el-option :label="1" :value="1" />
                <el-option :label="2" :value="2" />
                <el-option :label="3" :value="3" />
                <el-option :label="5" :value="5" />
                <el-option :label="10" :value="10" />
              </el-select>
            </div>
          </div>

          <h3 class="subsection-title">文件命名方式</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>文件命名方式</span>
              </div>
              <el-radio-group v-model="downloadNamingRule" @change="handleDownloadNamingRuleChange">
                <el-radio value="name-artist">歌名 - 歌手</el-radio>
                <el-radio value="artist-name">歌手 - 歌名</el-radio>
                <el-radio value="name">歌名</el-radio>
              </el-radio-group>
            </div>
          </div>

          <h3 class="subsection-title">是否将以下内容嵌入到音频文件中</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>封面嵌入</span>
              </div>
              <el-switch v-model="downloadEmbedCover" @change="handleDownloadEmbedCoverChange" />
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>歌词嵌入</span>
              </div>
              <el-switch v-model="downloadEmbedLyrics" @change="handleDownloadEmbedLyricsChange" />
            </div>

            <div class="setting-item" v-if="downloadEmbedLyrics">
              <div class="setting-label">
                <span>同时嵌入翻译歌词（如果有）</span>
              </div>
              <el-switch v-model="downloadEmbedTranslation" @change="handleDownloadEmbedTranslationChange" />
            </div>

          </div>

          <h3 class="subsection-title">歌词下载</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>是否启用</span>
                <span class="setting-desc">同时下载歌词文件到音乐目录</span>
              </div>
              <el-switch v-model="downloadLyricsEnabled" @change="handleDownloadLyricsEnabledChange" />
            </div>

            <div class="setting-item" v-if="downloadLyricsEnabled">
              <div class="setting-label">
                <span>同时将翻译歌词写入歌词文件中（如果有）</span>
              </div>
              <el-switch v-model="downloadLyricsTranslation" @change="handleDownloadLyricsTranslationChange" />
            </div>

          </div>

          <h3 class="subsection-title">下载的歌词文件编码格式</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>歌词文件编码</span>
              </div>
              <el-radio-group v-model="downloadLyricsEncoding" @change="handleDownloadLyricsEncodingChange">
                <el-radio value="utf-8">UTF-8</el-radio>
                <el-radio value="gbk">GBK</el-radio>
              </el-radio-group>
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
              <span class="app-version">{{ $t('settings.about.version') }} 2.0.0</span>
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

          <h3 class="subsection-title">{{ $t('settings.about.contactUs') }}</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.about.author') }}</span>
                <span class="setting-desc">{{ $t('settings.about.authorDesc') }}</span>
              </div>
              <span class="contact-value">yeflyleaf</span>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.about.github') }}</span>
                <span class="setting-desc">{{ $t('settings.about.githubDesc') }}</span>
              </div>
              <el-button type="primary" link @click="handleOpenGitHub">
                <el-icon>
                  <Link />
                </el-icon>
                {{ $t('settings.about.visitGitHub') }}
              </el-button>
            </div>

            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.about.license') }}</span>
                <span class="setting-desc">{{ $t('settings.about.licenseDesc') }}</span>
              </div>
              <span class="contact-value license-tag">AGPL-3.0</span>
            </div>
          </div>

          <h3 class="subsection-title">{{ $t('settings.about.other') }}</h3>
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <span>{{ $t('settings.about.userDataPath') }}</span>
                <span class="setting-desc">{{ $t('settings.about.userDataPathDesc') }}</span>
              </div>
              <span class="contact-value user-data-path">{{ $t('settings.about.userDataPathValue') }}</span>
            </div>

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

    <!-- 自定义源管理对话框 -->
    <SourceManagerDialog v-model="showSourceManager" :sources="musicSources" @update:sources="handleSourcesUpdate"
      @import-source="handleImportSource" @remove-source="handleRemoveSource" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SettingsView' })

import SourceManagerDialog from '@/components/Settings/SourceManagerDialog.vue'
import { showConfirm } from '@/hooks/useConfirm'
import { useIpc } from '@/hooks/useIpc'
import { useLibraryStore } from '@/store/library.store'
import { useSettingsStore } from '@/store/settings.store'
import type { FileNamingRule, LyricsEncoding, MusicSource, SplashTheme, Theme } from '@/types/settings'
import {
  Close,
  Download,
  Folder,
  FolderOpened,
  InfoFilled,
  Link,
  Monitor,
  Operation,
  Plus,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// 初始化 i18n 以便在模板中使用 $t
const { t } = useI18n()

const settingsStore = useSettingsStore()
const libraryStore = useLibraryStore()
const { selectFolder, resetAndScanAllFolders } = useIpc()

const isScanning = ref(false)

// 外观设置
const theme = ref<Theme>('dark')
const quickSwitchThemes = ref<[Theme, Theme]>(['dark', 'light'])
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
const disableSplashScreen = ref(false)
const splashTheme = ref<SplashTheme>('cosmic')

// 系统托盘设置
const showTrayIcon = ref(true)
const minimizeToTray = ref(false)
const closeToTray = ref(false)

// 下载设置
const downloadEnabled = ref(true)
const downloadSkipExisting = ref(true)
const downloadPath = ref('')
const downloadConcurrent = ref(3)
const downloadNamingRule = ref<FileNamingRule>('name-artist')
const downloadEmbedCover = ref(true)
const downloadEmbedLyrics = ref(true)
const downloadEmbedTranslation = ref(true)
const downloadLyricsEnabled = ref(true)
const downloadLyricsTranslation = ref(true)
const downloadLyricsEncoding = ref<LyricsEncoding>('utf-8')

// 音乐源相关 - 使用 computed 从 store 获取
const showSourceManager = ref(false)
const musicSources = computed(() => settingsStore.musicSources)

// 初始化设置值
onMounted(async () => {
  theme.value = settingsStore.theme
  quickSwitchThemes.value = [...settingsStore.quickSwitchThemes]
  language.value = settingsStore.language
  fontSize.value = settingsStore.fontSize
  localMusicHeaders.value = settingsStore.localMusicHeaders
  visualizerEnabled.value = settingsStore.visualizerEnabled
  visualizationStyle.value = settingsStore.visualizationStyle
  visualizationFrameRate.value = settingsStore.visualizationFrameRate

  rememberPlaybackStatus.value = settingsStore.rememberPlaybackStatus
  gaplessPlayback.value = settingsStore.gaplessPlayback
  autoScan.value = settingsStore.autoScan
  disableSplashScreen.value = settingsStore.disableSplashScreen
  splashTheme.value = settingsStore.splashTheme

  // 系统托盘设置
  showTrayIcon.value = settingsStore.showTrayIcon
  minimizeToTray.value = settingsStore.minimizeToTray
  closeToTray.value = settingsStore.closeToTray

  // 下载设置
  downloadEnabled.value = settingsStore.downloadEnabled
  downloadSkipExisting.value = settingsStore.downloadSkipExisting
  downloadPath.value = settingsStore.downloadPath
  downloadConcurrent.value = settingsStore.downloadConcurrent
  downloadNamingRule.value = settingsStore.downloadNamingRule
  downloadEmbedCover.value = settingsStore.downloadEmbedCover
  downloadEmbedLyrics.value = settingsStore.downloadEmbedLyrics
  downloadEmbedTranslation.value = settingsStore.downloadEmbedTranslation
  downloadLyricsEnabled.value = settingsStore.downloadLyricsEnabled
  downloadLyricsTranslation.value = settingsStore.downloadLyricsTranslation
  downloadLyricsEncoding.value = settingsStore.downloadLyricsEncoding

  // 从后端同步音乐源列表
  try {
    const sources = await window.electron.source.getAll()
    if (sources && sources.length > 0) {
      settingsStore.setMusicSourcesFromBackend(sources)
    }
  } catch (err) {
    console.error('[Settings] 加载音乐源失败:', err)
  }
})

// --- 外观设置处理 ---

const handleThemeChange = async (value: Theme) => {
  await settingsStore.setTheme(value)
}

const handleQuickSwitchThemesChange = async () => {
  await settingsStore.setQuickSwitchThemes([...quickSwitchThemes.value])
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

const handleDisableSplashScreenChange = async (value: boolean) => {
  await settingsStore.saveSettings({ disableSplashScreen: value })
}

const handleShowSplashScreen = () => {
  window.dispatchEvent(new CustomEvent('show-splash-screen'))
}

const handleSplashThemeChange = async (value: SplashTheme) => {
  await settingsStore.saveSettings({ splashTheme: value })
}

// --- 系统托盘设置处理 ---

const handleShowTrayIconChange = async (value: boolean) => {
  await settingsStore.saveSettings({ showTrayIcon: value })
  // 如果关闭托盘图标，同时关闭最小化到托盘和关闭到托盘
  if (!value) {
    minimizeToTray.value = false
    closeToTray.value = false
    await settingsStore.saveSettings({ minimizeToTray: false, closeToTray: false })
  }
}

const handleMinimizeToTrayChange = async (value: boolean) => {
  await settingsStore.saveSettings({ minimizeToTray: value })
}

const handleCloseToTrayChange = async (value: boolean) => {
  await settingsStore.saveSettings({ closeToTray: value })
}

// --- 音乐库设置处理 ---

const handleAddFolder = async () => {
  const folder = await selectFolder()
  if (!folder) return

  await settingsStore.addMusicFolder(folder)
  ElMessage.success('文件夹已添加')
}

const handleRemoveFolder = async (folder: string) => {
  const confirmed = await showConfirm({
    message: t('settings.library.confirmRemoveFolder', { folder }),
    type: 'warning'
  })
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
    if (result) {
      ElMessage.success(`扫描完成：新增 ${result.added} 首歌曲`)
    }
    await libraryStore.refreshMusic()
  } catch {
    ElMessage.error('扫描失败')
  } finally {
    isScanning.value = false
  }
}

// --- 下载设置处理 ---

const handleDownloadEnabledChange = async (value: boolean) => {
  await settingsStore.saveSettings({ downloadEnabled: value })
}

const handleDownloadSkipExistingChange = async (value: boolean) => {
  await settingsStore.saveSettings({ downloadSkipExisting: value })
}

const handleChangeDownloadPath = async () => {
  const folder = await selectFolder()
  if (!folder) return

  downloadPath.value = folder
  await settingsStore.saveSettings({ downloadPath: folder })
  ElMessage.success('下载路径已更改')
}

const handleDownloadConcurrentChange = async (value: number) => {
  await settingsStore.saveSettings({ downloadConcurrent: value })
}

const handleDownloadNamingRuleChange = async (value: FileNamingRule) => {
  await settingsStore.saveSettings({ downloadNamingRule: value })
}

const handleDownloadEmbedCoverChange = async (value: boolean) => {
  await settingsStore.saveSettings({ downloadEmbedCover: value })
}

const handleDownloadEmbedLyricsChange = async (value: boolean) => {
  await settingsStore.saveSettings({ downloadEmbedLyrics: value })
}

const handleDownloadEmbedTranslationChange = async (value: boolean) => {
  await settingsStore.saveSettings({ downloadEmbedTranslation: value })
}

const handleDownloadLyricsEnabledChange = async (value: boolean) => {
  await settingsStore.saveSettings({ downloadLyricsEnabled: value })
}

const handleDownloadLyricsTranslationChange = async (value: boolean) => {
  await settingsStore.saveSettings({ downloadLyricsTranslation: value })
}

const handleDownloadLyricsEncodingChange = async (value: LyricsEncoding) => {
  await settingsStore.saveSettings({ downloadLyricsEncoding: value })
}

// --- 音乐源处理 ---

/**
 * 刷新音乐源列表 - 从后端重新获取所有源
 */
const refreshMusicSources = async () => {
  try {
    const sources = await window.electron.source.getAll()
    if (sources) {
      settingsStore.setMusicSourcesFromBackend(sources)
    }
  } catch (err) {
    console.error('[Settings] 刷新音乐源失败:', err)
  }
}

const handleSourceEnabledChange = async (source: MusicSource) => {
  await settingsStore.toggleMusicSourceEnabled(source.id, source.enabled)
}

const handleSourcesUpdate = async (sources: MusicSource[]) => {
  // 批量更新所有音乐源
  for (const source of sources) {
    await settingsStore.updateMusicSource(source)
  }
}

const handleImportSource = async (type: 'online' | 'local', url?: string) => {
  if (type === 'online') {
    if (!url) return
    ElMessage.info(`正在从 ${url} 导入源...`)

    try {
      // 从 URL 获取脚本内容
      const result = await window.electron.dialog.fetchUrlContent(url)
      if (!result) {
        ElMessage.error('获取脚本内容失败，请检查 URL 是否正确')
        return
      }

      // 使用后端 IPC 导入源
      const importResult = await window.electron.source.import(result.content)
      if (importResult.success) {
        ElMessage.success(`成功导入音乐源: ${importResult.source?.name || '未知'}`)
        // 刷新本地源列表
        await refreshMusicSources()
      } else {
        ElMessage.error(`导入失败: ${importResult.error}`)
      }
    } catch (error) {
      console.error('[Settings] 在线导入失败:', error)
      ElMessage.error('在线导入失败')
    }
  } else {
    // 本地导入
    try {
      const result = await window.electron.dialog.selectScriptFile()
      if (!result) return

      if (result.error) {
        ElMessage.error(`读取脚本文件失败: ${result.error}`)
        return
      }

      if (!result.content) {
        ElMessage.error('脚本内容为空')
        return
      }

      // 使用后端 IPC 导入源
      const importResult = await window.electron.source.import(result.content)
      if (importResult.success) {
        ElMessage.success(`成功导入音乐源: ${importResult.source?.name || '未知'}`)
        // 刷新本地源列表
        await refreshMusicSources()
      } else {
        ElMessage.error(`导入失败: ${importResult.error}`)
      }
    } catch (error) {
      console.error('[Settings] 本地导入失败:', error)
      ElMessage.error('本地导入失败')
    }
  }
}

const handleRemoveSource = async (source: MusicSource) => {
  console.log('[Settings] handleRemoveSource called with source:', source)

  const confirmed = await showConfirm({
    message: `确定要删除音乐源"${source.name}"吗？`,
    type: 'warning'
  })
  console.log('[Settings] User confirmed:', confirmed)
  if (!confirmed) return

  try {
    console.log('[Settings] Calling electron.source.delete with id:', source.id)
    const deleted = await window.electron.source.delete(source.id)
    console.log('[Settings] Delete result:', deleted)
    if (deleted) {
      ElMessage.success(`已删除音乐源: ${source.name}`)
      // 刷新本地源列表
      await refreshMusicSources()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    console.error('[Settings] 删除源失败:', error)
    ElMessage.error('删除失败')
  }
}

// --- 其他 ---

const handleOpenGitHub = () => {
  window.open('https://github.com/yeflyleaf/Guli_MusicAttendant', '_blank')
}

const handleResetSettings = async () => {
  const confirmed = await showConfirm({ message: t('settings.about.confirmReset'), type: 'warning' })
  if (!confirmed) return

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

// 联系我们样式
.contact-value {
  font-size: $font-size-base;
  color: $text-primary;
  font-weight: $font-weight-medium;

  &.license-tag {
    padding: 4px 12px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
    border: 1px solid rgba(64, 158, 255, 0.3);
    border-radius: 20px;
    font-size: $font-size-sm;
    color: var(--el-color-primary);
  }

  &.user-data-path {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: $font-size-sm;
    color: $text-secondary;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 8px;
    border-radius: $border-radius-sm;
    border: 1px solid $border-color;
  }
}

// 音乐来源列表样式
.source-list-compact {
  margin-bottom: $spacing-md;
}

.empty-sources-compact {
  padding: $spacing-md;
  text-align: center;
  color: $text-muted;
  font-size: $font-size-sm;
}

.source-item-compact {
  padding: $spacing-xs 0;

  .source-name {
    font-weight: 500;
  }

  .source-icon {
    margin-left: $spacing-xs;
  }

  .source-version {
    font-size: $font-size-sm;
    color: $text-muted;
    margin-left: $spacing-xs;
  }

  .source-status {
    font-size: $font-size-sm;
    margin-left: $spacing-sm;

    &.success {
      color: $success-color;
    }

    &.error {
      color: $error-color;
    }
  }
}

.source-actions {
  margin-top: $spacing-sm;
}
</style>
