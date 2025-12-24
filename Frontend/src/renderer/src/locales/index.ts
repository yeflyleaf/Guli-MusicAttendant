/**
 * Vue I18n 国际化配置
 * 使用自定义消息编译器避免 Electron CSP 限制
 */
import type { MessageContext } from 'vue-i18n'
import { createI18n } from 'vue-i18n'

// 导入语言包
import arSA from './ar-SA'
import enUS from './en-US'
import esES from './es-ES'
import frFR from './fr-FR'
import ruRU from './ru-RU'
import zhCN from './zh-CN'

// 支持的语言列表
export const supportedLocales = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' }
] as const

export type LocaleCode = (typeof supportedLocales)[number]['code']

/**
 * 自定义消息编译器
 * 避免使用 eval/new Function，符合 Electron CSP 策略
 *
 * 注意：此功能为实验性特性，会显示警告信息
 * 但这是在 Electron 环境下避免 CSP 限制的必要方案
 */
function customMessageCompiler(message: unknown) {
  if (typeof message === 'string') {
    // 返回一个简单的函数，处理 {key} 占位符
    return (ctx: MessageContext<unknown>) => {
      return message.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = ctx.named(key)
        return value !== undefined ? String(value) : `{${key}}`
      })
    }
  }
  // 对于非字符串消息（如嵌套对象），返回空字符串
  return () => ''
}

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
  messageCompiler: customMessageCompiler,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ar-SA': arSA,
    'fr-FR': frFR,
    'ru-RU': ruRU,
    'es-ES': esES
  }
})

/**
 * 设置当前语言
 */
export function setLocale(locale: LocaleCode) {
  i18n.global.locale.value = locale
  document.documentElement.setAttribute('lang', locale)
}

/**
 * 获取当前语言
 */
export function getLocale(): LocaleCode {
  return i18n.global.locale.value as LocaleCode
}

export default i18n
