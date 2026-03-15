# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Vue 3 + Vite 的中国宝宝起名 Web 应用（千载吉名），使用 LLM API 为新生宝宝生成具有传统文化底蕴的名字和小名。

## 开发命令

所有命令都需要在 `baby-name/` 目录下执行：

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

## 环境配置

在 `baby-name/` 目录下创建 `.env.local` 文件配置 LLM API：

```
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_API_KEY=your-api-key-here
VITE_LLM_MODEL=gpt-4o
```

参考 `.env.example` 查看可用的配置选项。API 需兼容 OpenAI Chat Completions 格式。

## 项目架构

### 目录结构

```
baby-name/
├── src/
│   ├── App.vue              # 主应用组件
│   ├── main.js              # 应用入口
│   ├── components/          # Vue 组件
│   │   ├── NameForm.vue     # 宝宝信息表单
│   │   ├── NameResult.vue   # 名字结果展示
│   │   ├── NicknameForm.vue # 小名生成表单
│   │   └── NicknameResult.vue # 小名结果展示
│   ├── composables/         # Vue Composables
│   │   └── useLLM.js        # LLM API 调用逻辑
│   └── assets/              # 静态资源
├── index.html
├── vite.config.js
└── package.json
```

### 核心技术栈

- **Vue 3**: 使用 Composition API 和 `<script setup>` 语法
- **Vite**: 构建工具和开发服务器
- **Element Plus**: UI 组件库（中文界面）
- **element-china-area-data**: 中国省市区数据

### 数据流

1. 用户在 `NameForm` 填写宝宝信息（性别、出生日期、父母姓名等）
2. `App.vue` 调用 `useLLM` composable 的 `generateNames()` 方法
3. `useLLM.js` 使用 streaming API 调用 LLM 生成 3 个名字（JSON 格式）
4. `NameResult` 展示生成的名字，包含字义、典故、五行、评分等详细信息
5. 用户可选择生成小名，`generateNicknames()` 方法处理小名生成

### LLM API 调用

- **名字生成**: 使用 streaming API (`stream: true`)，实时显示生成进度
- **小名生成**: 使用非 streaming API，返回完整结果
- 两个功能都通过精心设计的 prompt 引导 LLM 返回结构化的 JSON 数据
- 错误处理包含 API 失败、JSON 解析失败等场景

## 关键实现细节

- **流式响应处理**: `useLLM.js` 中使用 `ReadableStream` 逐行解析 SSE 格式的流式响应
- **JSON 提取**: 从 LLM 响应中通过正则提取 JSON 内容，避免 markdown 代码块等干扰
- **深度思考提示**: 如果 API 响应超过 15 秒，显示"深度思考中"提示提升用户体验
- **地区选择**: 使用级联选择器展示中国省市数据
