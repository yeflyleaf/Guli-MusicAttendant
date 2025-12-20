<template>
    <aside class="play-queue-sidebar" :class="{ visible: playerStore.showQueue }">
        <!-- 侧边栏头部 -->
        <div class="queue-header">
            <div class="header-left">
                <el-icon class="queue-icon">
                    <List />
                </el-icon>
                <span class="queue-title">{{ $t('player.playQueue') }}</span>
                <span class="queue-count">({{ playerStore.queueLength }})</span>
            </div>
            <div class="header-actions">
                <el-tooltip :content="$t('player.clearQueue')" placement="bottom">
                    <el-button text circle size="small" @click="handleClearQueue"
                        :disabled="playerStore.queueLength === 0">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </el-tooltip>
                <el-button text circle size="small" @click="playerStore.toggleQueue">
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>
        </div>

        <!-- 当前播放 -->
        <div v-if="playerStore.currentSong" class="now-playing glass">
            <div class="now-playing-label">
                <span class="label-dot"></span>
                {{ $t('player.nowPlaying') || '正在播放' }}
            </div>
            <div class="now-playing-info">
                <div class="song-cover">
                    <img v-if="playerStore.currentSong.cover_path && playerStore.currentSong.cover_path.length > 5"
                        :src="`local-image://${playerStore.currentSong.cover_path.replace(/\\\\/g, '/')}`" alt="封面" />
                    <div v-else class="cover-placeholder">
                        <el-icon>
                            <Headset />
                        </el-icon>
                    </div>
                </div>
                <div class="song-detail">
                    <div class="song-title truncate" :title="playerStore.currentSong.title">
                        {{ playerStore.currentSong.title }}
                    </div>
                    <div class="song-artist truncate" :title="playerStore.currentSong.artist">
                        {{ playerStore.currentSong.artist }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 队列列表 -->
        <div class="queue-list" ref="queueListRef">
            <div v-if="playerStore.queueLength === 0" class="queue-empty">
                <el-icon class="empty-icon">
                    <List />
                </el-icon>
                <span>{{ $t('player.emptyQueue') }}</span>
            </div>

            <template v-else>
                <div v-for="(song, index) in playerStore.queue" :key="song.id" class="queue-item"
                    :class="{ active: playerStore.currentSong?.id === song.id }" @click="handlePlaySong(song)">
                    <!-- 序号/播放状态 -->
                    <div class="item-index">
                        <template v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying">
                            <div class="playing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </template>
                        <template v-else>
                            {{ index + 1 }}
                        </template>
                    </div>

                    <!-- 歌曲信息 -->
                    <div class="item-info">
                        <div class="item-title truncate" :title="song.title">{{ song.title }}</div>
                        <div class="item-artist truncate" :title="song.artist">{{ song.artist }}</div>
                    </div>

                    <!-- 时长 -->
                    <span class="item-duration">{{ formatDuration(song.duration) }}</span>

                    <!-- 移除按钮 -->
                    <el-icon class="item-remove" @click.stop="handleRemoveSong(song.id)">
                        <Close />
                    </el-icon>
                </div>
            </template>
        </div>

        <!-- 底部操作栏 -->
        <div v-if="playerStore.queueLength > 0" class="queue-footer glass">
            <div class="total-info">
                {{ $t('common.total') }} {{ playerStore.queueLength }} {{ $t('common.songs') }}，{{ formatTotalDuration
                }}
            </div>
            <div class="play-mode-info" @click="playerStore.togglePlayMode">
                <el-icon>
                    <component :is="playModeIcon" />
                </el-icon>
                <span>{{ playModeText }}</span>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/store/player.store'
import type { Music } from '@/types/music'
import { formatDuration } from '@/utils/format'
import {
    Close,
    Delete,
    Headset,
    List,
    Refresh,
    RefreshRight,
    Sort,
    Switch
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, ref, watch } from 'vue'

const playerStore = usePlayerStore()
const queueListRef = ref<HTMLElement | null>(null)

// 播放模式图标
const playModeIcon = computed(() => {
    switch (playerStore.playMode) {
        case 'sequence': return Sort
        case 'loop': return Refresh
        case 'single': return RefreshRight
        case 'random': return Switch
        default: return Sort
    }
})

// 播放模式文本
const playModeText = computed(() => {
    switch (playerStore.playMode) {
        case 'sequence': return '顺序播放'
        case 'loop': return '列表循环'
        case 'single': return '单曲循环'
        case 'random': return '随机播放'
        default: return '顺序播放'
    }
})

// 计算总时长
const formatTotalDuration = computed(() => {
    const totalSeconds = playerStore.queue.reduce((acc, song) => acc + (song.duration || 0), 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (hours > 0) {
        return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
})

// 播放歌曲
const handlePlaySong = (song: Music) => {
    playerStore.play(song, false)
}

// 移除歌曲
const handleRemoveSong = (songId: number) => {
    playerStore.removeFromQueue(songId)
}

// 清空队列
const handleClearQueue = async () => {
    try {
        await ElMessageBox.confirm(
            '确定要清空播放队列吗？',
            '清空队列',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        playerStore.clearQueue()
        ElMessage.success('已清空播放队列')
    } catch {
        // 用户取消
    }
}

// 当队列打开时，滚动到当前播放的歌曲
watch(() => playerStore.showQueue, (show) => {
    if (show && playerStore.currentSong) {
        nextTick(() => {
            scrollToCurrentSong()
        })
    }
})

// 滚动到当前播放的歌曲
const scrollToCurrentSong = () => {
    if (!queueListRef.value) return

    const activeItem = queueListRef.value.querySelector('.queue-item.active')
    if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
}
</script>

<style lang="scss" scoped>
$queue-width: 320px;

.play-queue-sidebar {
    position: fixed;
    top: $header-height;
    right: 0;
    width: $queue-width;
    height: calc(100vh - #{$header-height} - #{$player-height});
    background: $bg-primary;
    border-left: 1px solid $border-color;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: $z-fixed;

    &.visible {
        transform: translateX(0);
    }
}

.queue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-md $spacing-sm;
    border-bottom: 1px solid $border-color;
    flex-shrink: 0;

    .header-left {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
    }

    .queue-icon {
        font-size: 20px;
        color: $primary-color;
    }

    .queue-title {
        font-size: $font-size-md;
        font-weight: $font-weight-semibold;
        color: $text-primary;
    }

    .queue-count {
        font-size: $font-size-sm;
        color: $text-muted;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
    }
}

.now-playing {
    margin: $spacing-sm $spacing-md;
    padding: $spacing-sm;
    border-radius: $border-radius-md;
    flex-shrink: 0;

    .now-playing-label {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-xs;
        color: $primary-color;
        margin-bottom: $spacing-xs;

        .label-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: $primary-color;
            animation: pulse-dot 1.5s ease-in-out infinite;
        }
    }

    .now-playing-info {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
    }

    .song-cover {
        width: 48px;
        height: 48px;
        border-radius: $border-radius-sm;
        overflow: hidden;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .cover-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: $gradient-card;
            color: $text-muted;
            font-size: 20px;
        }
    }

    .song-detail {
        flex: 1;
        min-width: 0;

        .song-title {
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: 2px;
        }

        .song-artist {
            font-size: $font-size-xs;
            color: $text-muted;
        }
    }
}

@keyframes pulse-dot {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(0.8);
    }
}

.queue-list {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-sm 0;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 3px;

        &:hover {
            background: var(--scrollbar-thumb-hover);
        }
    }
}

.queue-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: $text-muted;
    gap: $spacing-sm;

    .empty-icon {
        font-size: 48px;
        opacity: 0.3;
    }

    .empty-hint {
        font-size: $font-size-xs;
        opacity: 0.7;
    }
}

.queue-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    cursor: pointer;
    transition: background $transition-fast;

    &:hover {
        background: $bg-hover;

        .item-remove {
            opacity: 1;
        }
    }

    &.active {
        background: $gradient-card;

        .item-title {
            color: $primary-color;
        }

        .item-index {
            color: $primary-color;
        }
    }
}

.item-index {
    width: 28px;
    font-size: $font-size-xs;
    color: $text-muted;
    text-align: center;
    flex-shrink: 0;
}

.playing-indicator {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;
    height: 14px;

    span {
        width: 3px;
        background: $primary-color;
        border-radius: 1.5px;
        animation: equalizer 0.8s ease-in-out infinite;

        &:nth-child(1) {
            animation-delay: 0s;
            height: 60%;
        }

        &:nth-child(2) {
            animation-delay: 0.2s;
            height: 100%;
        }

        &:nth-child(3) {
            animation-delay: 0.4s;
            height: 40%;
        }
    }
}

@keyframes equalizer {

    0%,
    100% {
        height: 40%;
    }

    50% {
        height: 100%;
    }
}

.item-info {
    flex: 1;
    min-width: 0;
}

.item-title {
    font-size: $font-size-sm;
    color: $text-primary;
    margin-bottom: 2px;
}

.item-artist {
    font-size: $font-size-xs;
    color: $text-muted;
}

.item-duration {
    font-size: $font-size-xs;
    color: $text-muted;
    flex-shrink: 0;
}

.item-remove {
    font-size: 26px;
    color: $text-muted;
    opacity: 0;
    transition: all $transition-fast;
    padding: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &:hover {
        color: $error-color;
        background: rgba($error-color, 0.1);
    }
}

.queue-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm $spacing-md;
    border-top: 1px solid $border-color;
    flex-shrink: 0;

    .total-info {
        font-size: $font-size-xs;
        color: $text-muted;
    }

    .play-mode-info {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-secondary;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: $border-radius-sm;
        transition: all $transition-fast;

        &:hover {
            color: $primary-color;
            background: $bg-hover;
        }
    }
}
</style>
