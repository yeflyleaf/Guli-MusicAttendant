/**
 * 自定义确认对话框 Composable
 * 替代原生 confirm() 对话框，支持深色/浅色主题
 */
import CustomConfirmDialog from '@/components/Base/CustomConfirmDialog.vue'
import i18n from '@/locales'
import { createApp, h, ref } from 'vue'

export interface ConfirmOptions {
  title?: string
  message: string
  type?: 'info' | 'warning' | 'error' | 'success'
  confirmText?: string
  cancelText?: string
}

/**
 * 显示确认对话框
 * @param options 对话框配置
 * @returns Promise<boolean> 用户点击确认返回 true，取消返回 false
 */
export function showConfirm(options: ConfirmOptions | string): Promise<boolean> {
  return new Promise((resolve) => {
    // 支持直接传入字符串作为消息
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options

    // 创建挂载容器
    const container = document.createElement('div')
    document.body.appendChild(container)

    // 响应式状态
    const visible = ref(true)

    // 清理函数
    const cleanup = () => {
      app.unmount()
      document.body.removeChild(container)
    }

    // 创建 Vue 应用
    const app = createApp({
      setup() {
        return () =>
          h(CustomConfirmDialog, {
            modelValue: visible.value,
            'onUpdate:modelValue': (val: boolean) => {
              visible.value = val
            },
            title: opts.title,
            message: opts.message,
            type: opts.type || 'info',
            confirmText: opts.confirmText,
            cancelText: opts.cancelText,
            onConfirm: () => {
              cleanup()
              resolve(true)
            },
            onCancel: () => {
              cleanup()
              resolve(false)
            }
          })
      }
    })

    app.use(i18n)

    // 挂载
    app.mount(container)
  })
}

/**
 * 显示警告确认对话框
 */
export function showWarningConfirm(message: string, title?: string): Promise<boolean> {
  return showConfirm({
    message,
    title,
    type: 'warning'
  })
}

/**
 * 显示危险操作确认对话框
 */
export function showDangerConfirm(message: string, title?: string): Promise<boolean> {
  return showConfirm({
    message,
    title,
    type: 'error'
  })
}

/**
 * useConfirm Hook
 * 在组件内使用，自动继承主题设置
 */
export function useConfirm() {
  return {
    confirm: showConfirm,
    warning: showWarningConfirm,
    danger: showDangerConfirm
  }
}
