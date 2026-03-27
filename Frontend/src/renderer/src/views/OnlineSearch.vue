<template>
    <div class="online-search-container">
        <div class="search-header">
            <div class="search-input-wrapper">
                <el-input v-model="searchKeyword" placeholder="搜索歌曲、歌手、专辑..." clearable @keyup.enter="handleSearch">
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                    <template #append>
                        <el-button @click="handleSearch" :loading="loading">搜索</el-button>
                    </template>
                </el-input>
            </div>

            <div class="source-selector">
                <span class="label">音乐源：</span>
                <el-select v-model="currentSource" placeholder="选择音乐源" style="width: 150px">
                    <el-option v-for="source in sources" :key="source.id" :label="source.name" :value="source.id" />
                </el-select>
            </div>
        </div>

        <div class="search-results" v-loading="loading">
            <el-empty v-if="!hasSearched" description="输入关键词开始搜索" />
            <el-empty v-else-if="results.length === 0" description="未找到相关结果" />

            <div v-else class="result-list">
                <el-table :data="results" style="width: 100%" stripe @row-dblclick="playMusic">
                    <el-table-column type="index" width="50" />
                    <el-table-column prop="name" label="歌曲标题" min-width="200" show-overflow-tooltip />
                    <el-table-column prop="artist" label="歌手" width="150" show-overflow-tooltip />
                    <el-table-column prop="album" label="专辑" width="150" show-overflow-tooltip />
                    <el-table-column prop="duration" label="时长" width="100">
                        <template #default="scope">
                            {{ formatDuration(scope.row.duration) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" fixed="right">
                        <template #default="scope">
                            <el-button-group>
                                <el-button link type="primary" @click="playMusic(scope.row)">
                                    <el-icon>
                                        <VideoPlay />
                                    </el-icon>
                                </el-button>
                                <el-button link type="primary" @click="downloadMusic(scope.row)">
                                    <el-icon>
                                        <Download />
                                    </el-icon>
                                </el-button>
                            </el-button-group>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pagination-wrapper">
                    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
                        layout="prev, pager, next" @current-change="handlePageChange" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Download, Search, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'

interface OnlineMusic {
    id: string
    name: string
    artist: string
    album?: string
    duration?: number
    cover?: string
    source: string
    quality?: string
    playUrl?: string
}

interface Source {
    id: string
    name: string
    enabled: boolean
}

const searchKeyword = ref('')
const currentSource = ref('')
const sources = ref<Source[]>([])
const results = ref<OnlineMusic[]>([])
const loading = ref(false)
const hasSearched = ref(false)
const currentPage = ref(1)
const pageSize = ref(30)
const total = ref(0)

// 初始化
onMounted(async () => {
    await loadSources()
})

// 加载音乐源
const loadSources = async () => {
    try {
        const enabledSources = await window.electron.source.getEnabled()
        sources.value = enabledSources

        if (enabledSources.length > 0) {
            currentSource.value = enabledSources[0].id
        }
    } catch (error) {
        console.error('Failed to load sources:', error)
        ElMessage.error('加载音乐源失败')
    }
}

// 搜索
const handleSearch = async () => {
    if (!searchKeyword.value.trim()) {
        return
    }

    if (!currentSource.value) {
        ElMessage.warning('请先选择音乐源')
        return
    }

    loading.value = true
    hasSearched.value = true
    results.value = []

    try {
        const res = await window.electron.online.search({
            keyword: searchKeyword.value,
            source: currentSource.value,
            page: currentPage.value,
            pageSize: pageSize.value
        })

        results.value = res.list
        total.value = res.total
    } catch (error) {
        console.error('Search failed:', error)
        ElMessage.error(error instanceof Error ? error.message : '搜索失败')
    } finally {
        loading.value = false
    }
}

// 翻页
const handlePageChange = () => {
    handleSearch()
}

// 播放音乐
const playMusic = async (music: OnlineMusic) => {
    try {
        // 获取播放链接
        const url = await window.electron.online.getPlayUrl({
            id: music.id,
            source: music.source,
            quality: '128k',
            extra: (music as OnlineMusic & { extra?: Record<string, unknown> }).extra
        })

        if (!url) {
            throw new Error('无法获取播放链接')
        }

        // TODO: 调用播放器播放
        // 这里暂时只打印，实际应该调用播放器 store 或 IPC
        console.log('Playing:', url)
        ElMessage.success(`开始播放: ${music.name}`)

        // 临时方案：如果播放器支持通过 URL 播放，可以调用
        // window.electron.player.playUrl(url)
    } catch (error) {
        console.error('Play failed:', error)
        ElMessage.error('播放失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

// 下载音乐
const downloadMusic = async (music: OnlineMusic) => {
    try {
        ElMessage.info('开始下载...')
        const res = await window.electron.online.download({
            music,
        })

        if (res.success) {
            ElMessage.success('下载成功')
        } else {
            throw new Error(res.error || '下载失败')
        }
    } catch (error) {
        console.error('Download failed:', error)
        ElMessage.error('下载失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

// 格式化时长
const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00'
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.online-search-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
}

.search-header {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    align-items: center;
}

.search-input-wrapper {
    flex: 1;
    max-width: 500px;
}

.source-selector {
    display: flex;
    align-items: center;
    gap: 10px;
}

.label {
    font-size: 14px;
    color: var(--el-text-color-regular);
}

.search-results {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.result-list {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
}

.pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
</style>
