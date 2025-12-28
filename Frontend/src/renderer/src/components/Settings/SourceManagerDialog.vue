<template>
  <el-dialog v-model="visible" title="自定义源管理" width="600px" :close-on-click-modal="false" class="source-manager-dialog">
    <!-- 源列表 -->
    <div class="source-list">
      <div v-if="sources.length === 0" class="empty-sources">
        <el-icon class="empty-icon">
          <DocumentRemove />
        </el-icon>
        <p>暂无已安装的音乐源</p>
        <p class="hint">点击下方按钮导入自定义源</p>
      </div>

      <div v-for="source in sources" :key="source.id" class="source-item">
        <div class="source-header">
          <div class="source-info">
            <span class="source-name">{{ source.name }}</span>
            <span class="source-icon">{{ source.icon || '🎵' }}</span>
            <span class="source-version">v{{ source.version || '1.0.0' }}</span>
          </div>
          <el-button type="danger" text circle @click="handleRemoveSource(source)">
            <el-icon>
              <Close />
            </el-icon>
          </el-button>
        </div>
        <div class="source-options">
          <el-checkbox v-model="source.allowUpdatePopup" @change="handleUpdateSourceOption">
            允许显示更新弹窗
          </el-checkbox>
        </div>
      </div>
    </div>

    <!-- 说明和提示 -->
    <div class="source-footer">
      <p class="warning-text">
        <el-icon>
          <Warning />
        </el-icon>
        提示：虽然已经尽可能地隔离了脚本的运行环境，但导入包含恶意行为的脚本仍可能会影响你的系统，请谨慎导入。
      </p>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" @click="handleOnlineImport">
          在线导入
        </el-button>
        <el-button size="large" @click="handleLocalImport">
          本地导入
        </el-button>
      </div>
    </template>

    <!-- 在线导入对话框 -->
    <el-dialog v-model="onlineImportVisible" title="在线导入" width="500px" append-to-body>
      <el-form>
        <el-form-item label="源地址">
          <el-input v-model="onlineImportUrl" placeholder="请输入源脚本的 URL 地址" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="onlineImportVisible = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="confirmOnlineImport">
          导入
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import type { MusicSource } from '@/types/settings';
import { Close, DocumentRemove, Warning } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean
  sources: MusicSource[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:sources': [sources: MusicSource[]]
  'import-source': [type: 'online' | 'local', url?: string]
  'remove-source': [source: MusicSource]
}>()

const visible = ref(props.modelValue)
const sources = ref<MusicSource[]>([...props.sources])
const onlineImportVisible = ref(false)
const onlineImportUrl = ref('')
const importing = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.sources, (val) => {
  sources.value = [...val]
}, { deep: true })

const handleRemoveSource = (source: MusicSource) => {
  emit('remove-source', source)
}

const handleUpdateSourceOption = () => {
  emit('update:sources', sources.value)
}

const handleOnlineImport = () => {
  onlineImportUrl.value = ''
  onlineImportVisible.value = true
}

const handleLocalImport = async () => {
  emit('import-source', 'local')
}

const confirmOnlineImport = async () => {
  if (!onlineImportUrl.value.trim()) {
    ElMessage.warning('请输入源地址')
    return
  }

  importing.value = true
  try {
    emit('import-source', 'online', onlineImportUrl.value)
    onlineImportVisible.value = false
    ElMessage.success('正在导入源...')
  } finally {
    importing.value = false
  }
}
</script>

<style lang="scss" scoped>
.source-manager-dialog {
  :deep(.el-dialog__body) {
    padding-top: 10px;
  }
}

.source-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: $spacing-lg;
}

.empty-sources {
  text-align: center;
  padding: $spacing-xl;
  color: $text-muted;

  .empty-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
    opacity: 0.5;
  }

  .hint {
    font-size: $font-size-sm;
    margin-top: $spacing-xs;
  }
}

.source-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }
}

.source-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
}

.source-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .source-name {
    font-weight: 500;
    font-size: $font-size-base;
  }

  .source-icon {
    font-size: 16px;
  }

  .source-version {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.source-options {
  padding-left: $spacing-xs;
}

.source-footer {
  border-top: 1px solid $border-color-light;
  padding-top: $spacing-md;

  .warning-text {
    display: flex;
    align-items: flex-start;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: $warning-color;
    background: rgba(230, 162, 60, 0.1);
    padding: $spacing-sm;
    border-radius: $border-radius-sm;

    .el-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
}

.dialog-footer {
  display: flex;
  gap: $spacing-md;
  justify-content: center;

  .el-button {
    min-width: 120px;
  }
}
</style>
