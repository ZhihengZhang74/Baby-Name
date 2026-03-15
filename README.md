# 千载吉名 - AI 智能宝宝起名应用

<div align="center">

[![Vue 3](https://img.shields.io/badge/Vue-3.5.12-green?style=flat-square)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-blue?style=flat-square)](https://vitejs.dev)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.8.4-orange?style=flat-square)](https://element-plus.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

</div>

> 基于中国传统姓名学，结合现代 AI 大模型，为宝宝生成寓意深远、音韵和谐的好名字。

## 🌟 功能特点

### 1. 智能起名
- 根据宝宝性别、出生日期、父母姓名等信息生成名字
- 支持多种风格路线：新中式典雅、古诗词风、诗词典故、国学现代解读
- 每次生成 4 个候选名字，可比较、可精修

### 2. 八字分析
- 自动排盘：年柱、月柱、日柱、时柱
- 五行分析：统计五行数量，判断强弱
- 喜用神建议：基于八字给出取名用字方向

### 3. 小名生成
- 多种风格：叠字型、动物型、食物型、自然型、英文音译
- 与正式名字关联，保持名字体系一致性

### 4. 名字评分与解读
- **音韵评分**：声调搭配、平仄和谐
- **字义评分**：单字寓意、整体意境
- **文化评分**：出处典故、文化内涵
- **实用性提示**：生僻字风险、发音难度、撞名率

### 5. 名字比较
- 并列对比多个候选名字
- 多维度评分可视化

### 6. 分享功能
- 生成精美的名字分享卡片
- 方便家人朋友参考讨论

---

## 📸 预览

```
┌─────────────────────────────────────────────────────────────┐
│                    专属命名工作台                             │
├─────────────────────────────────────────────────────────────┤
│  宝宝性别: ○ 男宝  ● 女宝                                    │
│  风格路线: [新中式典雅 ▼]                                    │
│  偏好特质: ☑ 好听 ☑ 寓意深 ☑ 独特                            │
│                                                             │
│  出生日期: [2024-01-15]                                     │
│  出生地:   [浙江省杭州市 ▼]                                  │
│  父亲姓名: [张]                                              │
│  母亲姓名: [李]                                              │
│  期待关键词: [健康快乐, 平安顺遂]                             │
│                                                             │
│                      [开始起名]                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| **Vue 3** | 渐进式前端框架 (Composition API + `<script setup>`) |
| **Vite** | 下一代构建工具 |
| **Element Plus** | 基于 Vue 3 的 UI 组件库 |
| **Axios** | HTTP 请求库 |
| **LLM API** | OpenAI API 兼容接口 (支持 GPT-4o、Claude 等) |

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/ZhihengZhang74/Baby-Name.git
cd Baby-Name
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入你的 API 配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# OpenAI API (推荐)
VITE_LLM_API_KEY=sk-xxxxx
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4o

# 或者使用其他兼容 OpenAI API 的服务
# VITE_LLM_BASE_URL=https://api.moonshot.cn/v1
# VITE_LLM_MODEL=moonshot-v1-8k
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 http://localhost:5173

### 5. 构建生产版本

```bash
npm run build
```

---

## 📖 命名原理 (调研总结)

### 八字五行

起名首要考虑 **生辰八字**。根据出生时间排出四柱八字，分析五行强弱：

- **五行统计**：木、火、土、金、水各有多少
- **喜用神**：八字缺什么、喜什么，用名字来补
- **名字用字**：选择对应五行的字来平衡命理

### 音韵学

好名字要 **朗朗上口**，注意：

- **声调搭配**：避免全是平声或全是仄声
- **平仄相间**：如"张"（阴平）+ "文"（阳平）+ "雅"（上声）
- **韵母和谐**：避免谐音歧义

### 诗词典故

名字最好有 **文化出处**：

- 《诗经》："高山仰止，景行行止"
- 《楚辞》："路漫漫其修远兮"
- 唐诗宋词：寓意美好的诗句

### 三才五格

传统姓名学还有 **三才五格** 数理分析，但现代起名更注重：

- 寓意美好
- 音韵和谐
- 书写美观
- 与八字五行相合

---

## 📁 项目结构

```
Baby-Name/
├── src/
│   ├── components/
│   │   ├── NameForm.vue          # 宝宝信息表单
│   │   ├── NameResult.vue        # 名字结果展示
│   │   ├── NicknameForm.vue      # 小名生成表单
│   │   ├── NicknameResult.vue   # 小名结果展示
│   │   ├── BaziResult.vue       # 八字分析结果
│   │   ├── ComparePanel.vue     # 名字比较面板
│   │   ├── ReportPanel.vue      # 报告面板
│   │   └── ShareCard.vue        # 分享卡片
│   ├── composables/
│   │   └── useLLM.js             # LLM API 调用
│   ├── assets/
│   │   └── style.css            # 全局样式
│   ├── App.vue                  # 主应用组件
│   └── main.js                  # 应用入口
├── public/
├── index.html
├── package.json
├── vite.config.js
└── .env.example                 # 环境变量示例
```

---

## 🔧 自定义配置

### 支持的 LLM 提供商

项目兼容任何 **OpenAI API 格式** 的接口：

| 提供商 | baseUrl 示例 | 模型示例 |
|--------|-------------|---------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o`, `gpt-4-turbo` |
| Anthropic | `https://api.anthropic.com` | `claude-3-opus` |
| Moonshot | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |
| 智谱 AI | `https://open.bigmodel.cn/api/paas/v4` | `glm-4` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-turbo` |

### 风格路线

应用内置多种起名风格：

| 风格 | 说明 |
|------|------|
| 新中式典雅 | 传统韵味 + 现代审美 |
| 古诗词风 | 诗词典故出处 |
| 国学现代解读 | 传统文化现代化表达 |
| 简洁大气 | 少即是多 |
| 独特小众 | 避免撞名 |

---

## 📝 相关资源

### 传统起名文化

- [中华姓名学](https://baike.baidu.com/item/%E4%B8%AD%E5%9B%BD%E5%90%8D%E5%AD%97%E5%AD%A6)
- [八字五行起名](https://baike.baidu.com/item/%E5%85%AB%E5%AD%97%E8%B5%90%E5%90%8D)
- [诗经起名](https://www.shijing.org/)

### 在线起名参考

- [起名网](https://www.qimingzi.net/)
- [中华名赋](https://www.qimingzi.com/)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'Add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 打开 Pull Request

---

## 📄 License

MIT License - 可以自由使用和修改

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式前端框架
- [Element Plus](https://element-plus.org/) - 优秀的 Vue 3 UI 组件库
- [OpenAI](https://openai.com/) - LLM API 支持
- 所有开源项目贡献者

---

<div align="center">

**愿每个宝宝都拥有一个寓意深远、音韵和谐的好名字** 🎋

*千载吉名 - 让名字更有温度*

</div>
