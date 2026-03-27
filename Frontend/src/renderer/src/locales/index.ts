/**
 * Vue I18n 国际化配置
 * 使用构建时预编译消息，避免 Electron CSP 限制并提升性能
 */
import { createI18n } from 'vue-i18n'

// 导入语言包
import arSA from './messages/ar-SA'
import enUS from './messages/en-US'
import esES from './messages/es-ES'
import frFR from './messages/fr-FR'
import ruRU from './messages/ru-RU'
import zhCN from './messages/zh-CN'

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

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
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
