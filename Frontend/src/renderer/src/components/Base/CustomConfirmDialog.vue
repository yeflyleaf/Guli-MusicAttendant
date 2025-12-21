<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="custom-confirm-overlay" @click.self="handleCancel">
        <Transition name="dialog-scale" appear>
          <div class="custom-confirm-dialog" :class="themeClass">
            <!-- 头部 -->
            <div class="dialog-header">
              <h3 class="dialog-title">{{ title || defaultTitle }}</h3>
            </div>

            <!-- 内容 -->
            <div class="dialog-content">
              <p class="dialog-message" v-html="formattedMessage"></p>
            </div>

            <!-- 底部按钮 -->
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-cancel" @click="handleCancel">
                {{ cancelText }}
              </button>
              <button class="dialog-btn dialog-btn-confirm" :class="confirmButtonClass" @click="handleConfirm">
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export interface ConfirmDialogOptions {
  title?: string
  message: string
  type?: 'info' | 'warning' | 'error' | 'success'
  confirmText?: string
  cancelText?: string
}

const props = defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  type?: 'info' | 'warning' | 'error' | 'success'
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()

// 当前主题（从 DOM 读取）
const currentTheme = ref<'dark' | 'light'>('dark')

// 检测当前主题
const detectTheme = () => {
  const htmlElement = document.documentElement
  currentTheme.value = htmlElement.classList.contains('light') ? 'light' : 'dark'
}

// 创建 MutationObserver 监听主题变化
let observer: MutationObserver | null = null

onMounted(() => {
  detectTheme()

  // 监听 html 元素的 class 变化
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        detectTheme()
      }
    })
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// 将换行符转换为 <br>
const formattedMessage = computed(() => {
  return (props.message || '').replace(/\n/g, '<br>')
})

// 内部可见状态
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 主题类
const themeClass = computed(() => {
  return currentTheme.value === 'light' ? 'light-theme' : 'dark-theme'
})

// 默认标题
const defaultTitle = computed(() => {
  switch (props.type) {
    case 'warning':
      return t('common.warning') || 'Warning'
    case 'error':
      return t('common.error') || 'Error'
    case 'success':
      return t('common.success') || 'Success'
    default:
      return t('common.confirm') || 'Confirm'
  }
})

// 确认按钮文本
const confirmText = computed(() => props.confirmText || t('common.confirm') || 'Confirm')
const cancelText = computed(() => props.cancelText || t('common.cancel') || 'Cancel')

// 确认按钮类
const confirmButtonClass = computed(() => {
  return props.type === 'error' || props.type === 'warning' ? 'btn-danger' : 'btn-primary'
})

// 处理确认
const handleConfirm = () => {
  visible.value = false
  emit('confirm')
}

// 处理取消
const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

// ESC 键关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && visible.value) {
    handleCancel()
  }
}

// 监听可见状态，添加/移除键盘事件
watch(visible, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<style lang="scss" scoped>
// ==================== 遮罩层 ====================
.custom-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

// ==================== 对话框容器 ====================
.custom-confirm-dialog {
  position: relative;
  width: 400px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  // ==================== 深色主题 ====================
  &.dark-theme {
    background: linear-gradient(145deg, #1e1e2e 0%, #151521 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);

    .dialog-header {
      background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .dialog-title {
      color: #f8fafc;
    }

    .dialog-message {
      color: #94a3b8;
    }

    .dialog-footer {
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .dialog-btn-cancel {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
      }
    }

    .dialog-btn-confirm {
      &.btn-primary {
        background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
        border: none;
        color: white;
        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);

        &:hover {
          background: linear-gradient(135deg, #9f7aea 0%, #b97cf7 100%);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
        }
      }

      &.btn-danger {
        background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
        border: none;
        color: white;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);

        &:hover {
          background: linear-gradient(135deg, #f87171 0%, #fca5a5 100%);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
        }
      }
    }
  }

  // ==================== 浅色主题 ====================
  &.light-theme {
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid rgba(0, 0, 0, 0.1);

    .dialog-header {
      background: linear-gradient(90deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .dialog-title {
      color: #0f172a;
    }

    .dialog-message {
      color: #475569;
    }

    .dialog-footer {
      background: rgba(0, 0, 0, 0.02);
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .dialog-btn-cancel {
      background: #f1f5f9;
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: #475569;

      &:hover {
        background: #e2e8f0;
        border-color: rgba(0, 0, 0, 0.15);
      }
    }

    .dialog-btn-confirm {
      &.btn-primary {
        background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
        border: none;
        color: white;
        box-shadow: 0 4px 15px rgba(124, 58, 237, 0.35);

        &:hover {
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
        }
      }

      &.btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
        border: none;
        color: white;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);

        &:hover {
          background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.45);
        }
      }
    }
  }
}

// ==================== 头部 ====================
.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
}



.dialog-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

// ==================== 内容区域 ====================
.dialog-content {
  padding: 16px 24px 24px;
}

.dialog-message {
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

// ==================== 底部按钮 ====================
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  &:active {
    transform: scale(0.97);
  }
}

// ==================== 动画 ====================
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.25s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-scale-leave-active {
  transition: all 0.2s ease;
}

.dialog-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
