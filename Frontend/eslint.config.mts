import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  // 忽略编译输出和依赖目录
  { ignores: ["**/dist/**", "**/dist-electron/**", "**/node_modules/**", "**/release/**", "**/*.tsbuildinfo"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  // 自定义规则配置
  {
    files: ["**/*.vue"],
    rules: {
      // 允许单词组件名（如 Header, Sidebar, Lyrics 等）
      "vue/multi-word-component-names": "off"
    }
  }
]);
