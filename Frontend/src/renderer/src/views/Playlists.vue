<template>
    <div class="playlists-view">
        <!-- 页面头部 -->
        <div class="page-header">
            <h1 class="page-title">
                <span class="gradient-text">我的歌单</span>
            </h1>
            <p class="page-subtitle">共 {{ libraryStore.playlists.length }} 个歌单</p>
        </div>

        <!-- 操作栏 -->
        <div class="toolbar">
            <el-button type="primary" @click="handleCreatePlaylist">
                <el-icon>
                    <Plus />
                </el-icon>
                新建歌单
            </el-button>
        </div>

        <!-- 歌单网格 -->
        <div class="playlist-grid" v-if="libraryStore.playlists.length > 0">
            <div v-for="playlist in libraryStore.playlists" :key="playlist.id" class="playlist-card glass"
                @click="$router.push(`/playlist/${playlist.id}`)">
                <!-- 封面 -->
                <div class="playlist-cover">
                    <img v-if="playlist.first_cover && playlist.first_cover.length > 5"
                        :src="`local-image://${playlist.first_cover.replace(/\\\\/g, '/')}`" alt="" loading="lazy"
                        class="cover-image" />
                    <div v-else class="cover-placeholder">
                        <el-icon>
                            <Tickets />
                        </el-icon>
                    </div>
                    <!-- 悬停遮罩 -->
                    <div class="cover-overlay">
                        <el-icon class="play-icon">
                            <VideoPlay />
                        </el-icon>
                    </div>
                    <!-- 歌曲数量标签 -->
                    <div class="song-count-badge">
                        {{ playlist.song_count }} 首
                    </div>
                </div>

                <!-- 歌单信息 -->
                <div class="playlist-info">
                    <div class="playlist-name truncate" :title="playlist.name">
                        {{ playlist.name }}
                    </div>
                    <div class="playlist-desc truncate" v-if="playlist.description">
                        {{ playlist.description }}
                    </div>
                    <div class="playlist-meta">
                        <span class="meta-item">
                            <el-icon>
                                <Calendar />
                            </el-icon>
                            {{ formatDate(playlist.created_at) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state glass" v-else>
            <el-icon class="empty-icon">
                <Tickets />
            </el-icon>
            <h3>还没有歌单</h3>
            <p>创建你的第一个歌单，开始收藏喜欢的音乐</p>
            <el-button type="primary" size="large" @click="handleCreatePlaylist">
                <el-icon>
                    <Plus />
                </el-icon>
                创建歌单
            </el-button>
        </div>

        <!-- 创建歌单对话框 -->
        <el-dialog v-model="showCreateDialog" title="创建歌单" width="400px" :close-on-click-modal="false">
            <el-form :model="newPlaylist" label-width="80px">
                <el-form-item label="歌单名称">
                    <el-input v-model="newPlaylist.name" placeholder="请输入歌单名称" maxlength="50" />
                </el-form-item>
                <el-form-item label="歌单描述">
                    <el-input v-model="newPlaylist.description" type="textarea" placeholder="添加简介（可选）" :rows="3"
                        maxlength="200" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showCreateDialog = false">取消</el-button>
                <el-button type="primary" @click="confirmCreatePlaylist">创建</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { useLibraryStore } from '@/store/library.store'
import { Calendar, Plus, Tickets, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
    name: 'Playlists'
})

const router = useRouter()
const libraryStore = useLibraryStore()

// 创建歌单相关
const showCreateDialog = ref(false)
const newPlaylist = ref({
    name: '',
    description: ''
})

const handleCreatePlaylist = () => {
    newPlaylist.value = { name: '', description: '' }
    showCreateDialog.value = true
}

const confirmCreatePlaylist = async () => {
    if (!newPlaylist.value.name.trim()) {
        ElMessage.warning('请输入歌单名称')
        return
    }

    const id = await libraryStore.createPlaylist(
        newPlaylist.value.name.trim(),
        newPlaylist.value.description.trim()
    )

    if (id) {
        ElMessage.success('创建成功')
        showCreateDialog.value = false
        router.push(`/playlist/${id}`)
    } else {
        ElMessage.error('创建失败')
    }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
</script>

<style lang="scss" scoped>
.playlists-view {
    min-height: 100%;
    padding-bottom: $spacing-xl;
}

.page-header {
    margin-bottom: $spacing-lg;

    .page-title {
        font-size: $font-size-xxl;
        font-weight: $font-weight-bold;
        margin-bottom: $spacing-xs;
    }

    .page-subtitle {
        font-size: $font-size-sm;
        color: $text-muted;
    }
}

.toolbar {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
}

// 歌单网格
.playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: $spacing-lg;
}

// 歌单卡片
.playlist-card {
    border-radius: $border-radius-lg;
    overflow: hidden;
    cursor: pointer;
    transition: all $transition-normal;

    &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-lg;

        .cover-overlay {
            opacity: 1;
        }

        .cover-image,
        .cover-placeholder {
            transform: scale(1.05);
        }
    }
}

// 歌单封面
.playlist-cover {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: $bg-tertiary;

    .cover-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform $transition-normal;
    }

    .cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $gradient-card;
        transition: transform $transition-normal;

        .el-icon {
            font-size: 64px;
            color: $text-muted;
        }
    }

    .cover-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: opacity $transition-fast;

        .play-icon {
            font-size: 48px;
            color: white;
            filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
        }
    }

    .song-count-badge {
        position: absolute;
        bottom: $spacing-sm;
        right: $spacing-sm;
        padding: 4px 8px;
        font-size: $font-size-xs;
        color: white;
        background: rgba(0, 0, 0, 0.6);
        border-radius: $border-radius-sm;
        backdrop-filter: blur(4px);
    }
}

// 歌单信息
.playlist-info {
    padding: $spacing-md;

    .playlist-name {
        font-size: $font-size-md;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        margin-bottom: $spacing-xs;
    }

    .playlist-desc {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: $spacing-sm;
    }

    .playlist-meta {
        display: flex;
        align-items: center;
        gap: $spacing-md;

        .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: $font-size-xs;
            color: $text-muted;

            .el-icon {
                font-size: 14px;
            }
        }
    }
}

// 空状态
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-xxl * 2;
    border-radius: $border-radius-xl;
    text-align: center;

    .empty-icon {
        font-size: 80px;
        color: $primary-color;
        margin-bottom: $spacing-lg;
    }

    h3 {
        font-size: $font-size-xl;
        font-weight: $font-weight-semibold;
        margin-bottom: $spacing-sm;
    }

    p {
        color: $text-secondary;
        margin-bottom: $spacing-lg;
    }
}
</style>
