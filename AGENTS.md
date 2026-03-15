# AGENTS.md - 千载吉名 (Baby Name Generator)

## 项目概述

基于 Vue 3 + Vite 的中国宝宝起名 Web 应用，使用 LLM API 为新生宝宝生成具有传统文化底蕴的名字和小名。

**核心特性：**
- 风格化起名：支持多种命名风格路线选择
- 候选对比：并排展示最多 4 个候选名进行对比
- 本地工作区：基于 localStorage 的持久化状态管理，支持历史快照恢复
- 扩展功能：小名生成、八字分析、分享卡片、报告生成
- 流式响应：实时显示 LLM 生成过程

## 技术栈

- **框架**: Vue 3 + Vite
- **UI 组件**: Element Plus
- **HTTP 客户端**: Axios
- **地区数据**: element-china-area-data, china-area-data
- **图标**: @element-plus/icons-vue

## 项目结构

```
baby-name/
├── src/
│   ├── components/           # Vue 组件（9个，共2221行）
│   │   ├── NameForm.vue      # 命名表单（346行）
│   │   ├── NameResult.vue    # 候选名展示（476行）
│   │   ├── ComparePanel.vue  # 候选对比面板（101行）
│   │   ├── WorkspacePanel.vue # 工作区面板（263行）
│   │   ├── NicknameForm.vue  # 小名表单（142行）
│   │   ├── NicknameResult.vue # 小名展示（235行）
│   │   ├── BaziResult.vue    # 八字分析（273行）
│   │   ├── ShareCard.vue     # 分享卡片（228行）
│   │   └── ReportPanel.vue   # 报告面板（157行）
│   ├── composables/          # 业务逻辑
│   │   ├── useLLM.js         # LLM API 调用、流式处理、数据规范化
│   │   └── useNamingWorkspace.js # 状态管理、localStorage 持久化
│   ├── assets/               # 样式资源
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── index.html
├── vite.config.js            # Vite 配置（已配置代码分割）
├── package.json
└── .env.example              # 环境变量示例
```

## 开发命令

所有命令在 `baby-name/` 目录下执行：

```bash
cd baby-name

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 环境配置

在 `baby-name/` 目录下创建 `.env.local` 文件：

```bash
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_API_KEY=your-api-key-here
VITE_LLM_MODEL=gpt-4o
```

**注意**: 环境变量通过 `VITE_` 前缀暴露给客户端，敏感信息应妥善保管。

## 核心功能模块

### 1. 命名工作流 (NameForm + NameResult)
- 收集用户信息：性别、风格路线、偏好特质、出生日期/时辰、出生地、父母期待
- 支持多种风格路线选择（新中式典雅等）
- 调用 LLM API 生成候选名字
- 支持流式响应和实时显示

### 2. 状态管理 (useNamingWorkspace)
- 本地 localStorage 持久化工作区数据
- 管理候选名、收藏、对比、历史快照
- 支持最多 6 个历史快照
- 候选名支持：收藏、对比（最多4个）、选中

### 3. LLM 集成 (useLLM)
- 三大 API 调用：生成名字、生成小名、八字分析
- 流式处理和 JSON 解析容错
- 数据规范化处理（确保字段完整）
- 支持温度、token 限制等参数调优

### 4. 扩展功能
- **小名生成**：基于正式名生成昵称（叠字型等）
- **八字分析**：五行分析、喜用神、命理解读
- **候选对比**：并排展示最多4个候选名
- **分享卡片**：生成可分享的结果卡片
- **工作区面板**：收藏管理、历史快照、候选对比

## 测试与 Linting

本项目目前没有配置测试框架 (Vitest/Jest) 和 ESLint/Prettier。

如需添加，建议：
- 测试: `npm install -D vitest @vue/test-utils jsdom`
- Linting: `npm install -D eslint @eslint/js eslint-plugin-vue`

运行单个测试文件（添加 Vitest 后）：
```bash
npx vitest run src/composables/useLLM.test.js
npx vitest run --watch src/composables/useLLM.test.js
```

## 代码风格指南

### Vue 组件

- 使用 `<script setup>` 语法
- 组件使用 PascalCase 命名（如 `NameForm.vue`）
- Props 和 emits 使用 TypeScript 风格定义（即使项目是 JS）

```vue
<script setup>
const props = defineProps({
  loading: Boolean,
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'regenerate'])
</script>
```

### JavaScript 规范

- 使用 ES6+ 语法
- 变量和函数使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 优先使用 `const`，避免使用 `var`

### Imports 排序

1. Vue 内置 API (`ref`, `reactive`, `computed`, `onMounted`, etc.)
2. 第三方 Vue 生态库
3. 项目组件
4. 项目 composables
5. 其他

```javascript
import { computed, ref, watch } from 'vue'
import { pcTextArr } from 'element-china-area-data'

import NameForm from './components/NameForm.vue'
import NameResult from './components/NameResult.vue'
import { useLLM } from './composables/useLLM'
import { useNamingWorkspace } from './composables/useNamingWorkspace'
```

### 响应式状态

- 基础类型使用 `ref()`
- 对象使用 `reactive()`（表单数据等）
- 计算属性使用 `computed()`

```javascript
const formData = reactive({
  gender: 'male',
  birthDate: '',
  birthHour: ''
})

const selectedName = computed(() => candidates.value[0]?.name || '')
```

### 错误处理

- API 调用使用 try/catch
- 错误信息存储在 ref 中供 UI 显示
- 使用 `console.error` 记录详细错误

```javascript
try {
  const response = await generateNames(formData)
  setCandidates(response.names)
} catch (err) {
  console.error('Failed to generate names', err)
  error.value = err.message || '生成名字时发生错���'
}
```

### 数据规范化

LLM 返回的数据必须经过规范化处理，确保字段完整：

```javascript
const ensureText = (value, fallback) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  return fallback
}

const normalizeCandidate = (candidate, index) => ({
  id: createCandidateId(index),
  name: ensureText(candidate?.name, `灵感方案${index + 1}`),
  // ...其他字段
})
```

### 样式规范

- 使用 `<style scoped>` 限制作用域
- 使用 CSS 自定义属性管理主题色
- 移动端优先的响应式设计
- 使用 clamp() 实现流体排版

```css
.hero-copy h1 {
  font-size: clamp(48px, 7vw, 78px);
}

@media (max-width: 768px) {
  .app-shell {
    padding: 16px 14px 40px;
  }
}
```

### 组件通信

- 父子组件：通过 props/emit
- 跨组件：使用 composables 共享状态
- 避免使用 provide/inject（除非必要）

### 目录结构

```
src/
├── components/      # Vue 组件
├── composables/     # 可复用逻辑 (useXXX)
├── assets/         # 静态资源
├── App.vue         # 根组件
└── main.js        # 入口文件
```

### 注意事项

1. **LLM Prompt**: 所有中文命名相关的 prompt 使用中文编写，以确保生成结果符合中文语境
2. **JSON 解析**: LLM 返回的 JSON 必须经过容错处理，使用正则提取并 try/catch 解析
3. **流式响应**: 使用 ReadableStream 处理 streaming API，逐块更新 UI
4. **环境变量**: 敏感信息只能通过 VITE_ 前缀的 env 变量访问（暴露给客户端）

### 常用工具函数位置

- `useLLM.js`: LLM API 调用、流式处理、JSON 解析
- `useNamingWorkspace.js`: 候选名管理、收藏、对比、历史快照

## 性能优化

### 代码分割

Vite 已配置自动代码分割，主要依赖分离为独立 chunk：
- `element-plus`: UI 组件库
- `china-area-data`: 地区数据
- `vue`: Vue 框架

### 构建输出

生产构建会生成以下文件：
- `dist/index.html`: 入口 HTML
- `dist/assets/`: 分割后的 JS 和 CSS 文件

## 常见问题

### 如何调试 LLM 流式响应？

在 `useLLM.js` 中的 `requestCompletion` 函数添加日志：
```javascript
reader.read().then(({ done, value }) => {
  if (!done) {
    console.log('Chunk:', new TextDecoder().decode(value))
  }
})
```

### 如何扩展新的命名风格？

1. 在 `NameForm.vue` 的 `styleProfiles` 中添加新选项
2. 在 `useLLM.js` 的 `buildNamePrompt` 中添加对应的 prompt 逻辑
3. 在 `useNamingWorkspace.js` 中确保状态管理支持新字段

### 如何本地测试不同的 LLM 模型？

修改 `.env.local` 中的 `VITE_LLM_MODEL`：
```bash
VITE_LLM_MODEL=gpt-4-turbo
VITE_LLM_MODEL=gpt-3.5-turbo
```

## 部署建议

1. **环境变量**: 在部署平台（Vercel、Netlify 等）配置 `VITE_LLM_API_KEY`
2. **CORS**: 如果 LLM API 有 CORS 限制，考虑使用后端代理
3. **缓存**: 生产构建的 assets 可配置长期缓存（hash 文件名）
4. **监控**: 添加错误追踪（Sentry 等）监控 LLM API 调用失败
