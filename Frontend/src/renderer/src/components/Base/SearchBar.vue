<template>
    <div class="search-box">
        <el-icon class="search-icon">
            <Search />
        </el-icon>
        <input v-model="searchKeyword" type="text" class="search-input" placeholder="搜索歌曲、歌手、专辑..."
            @input="handleSearch" @keyup.enter="handleSearchSubmit" />
        <el-icon v-if="searchKeyword" class="search-clear" @click="clearSearch">
            <Close />
        </el-icon>
    </div>
</template>

<script setup lang="ts">
import { useLibraryStore } from '@/store/library.store'
import { debounce } from '@/utils/debounce'
import { Close, Search } from '@element-plus/icons-vue'
import { ref } from 'vue'

const libraryStore = useLibraryStore()
const searchKeyword = ref('')

// 搜索防抖
const handleSearch = debounce(() => {
    libraryStore.search(searchKeyword.value)
}, 300)

// 搜索提交
const handleSearchSubmit = () => {
    libraryStore.search(searchKeyword.value)
}

// 清除搜索
const clearSearch = () => {
    searchKeyword.value = ''
    libraryStore.clearSearch()
}
</script>

<style lang="scss" scoped>
.search-box {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 36px;
    padding: 0 $spacing-md;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid $border-color;
    border-radius: 18px;
    transition: all $transition-fast;

    &:focus-within {
        background: rgba(255, 255, 255, 0.08);
        border-color: $border-color-active;
        box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }

    .search-icon {
        color: $text-muted;
        font-size: 16px;
        margin-right: $spacing-sm;
    }

    .search-input {
        flex: 1;
        height: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: $text-primary;
        font-size: $font-size-base;

        &::placeholder {
            color: $text-muted;
        }
    }

    .search-clear {
        color: $text-muted;
        font-size: 14px;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        transition: all $transition-fast;

        &:hover {
            color: $text-primary;
            background: rgba(255, 255, 255, 0.1);
        }
    }
}
</style>
