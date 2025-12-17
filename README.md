<div align="center">

# Cubox 智能收藏 - Chrome 扩展

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![](https://img.shields.io/badge/Chrome_Extension-4285F4?style=flat-square&logo=google-chrome&logoColor=white)

> 🤖 使用 AI 智能分析网页内容，自动生成标题、描述和标签，一键收藏到 Cubox

[功能特性](#功能特性) • [快速开始](#快速开始) • [使用说明](#使用说明) • [开发指南](#开发指南) • [技术栈](#技术栈)

</div>

---

## 📖 简介

**Cubox 智能收藏** 是一款强大的 Chrome 扩展，利用 OpenAI GPT 模型和 Tavily API 智能分析网页内容，自动生成高质量的中文标题、描述和标签，并一键保存到 Cubox 知识库。

### ✨ 核心能力

- 🧠 **AI 智能分析**：使用 OpenAI GPT 模型深度理解网页内容
- 📄 **内容提取**：集成 Tavily API，精准提取网页文本和图片
- 🏷️ **智能标签**：自动生成 8-15 个精准标签，便于分类检索
- 🎯 **平台识别**：自动识别网站平台（GitHub、哔哩哔哩、稀土掘金等）并在标题和标签中标注
- ✏️ **预览编辑**：AI 分析后可在保存前预览和修改内容
- ⌨️ **快捷键支持**：默认 `Ctrl+Shift+S`（Mac: `Cmd+Shift+S`）快速打开
- ⚡ **快速分析**：支持打开扩展时自动开始分析

## 🚀 功能特性

### 核心功能

- ✅ **智能内容分析**
  - 使用 Tavily API 提取网页完整内容
  - OpenAI GPT 模型分析并生成结构化信息
  - 支持多种内容类型：文章、视频、代码仓库、博客等

- ✅ **智能标题生成**
  - 自动识别内容类型和平台
  - 代码仓库自动包含项目名称
  - 平台名称自动标注在标题末尾

- ✅ **详细描述生成**
  - 包含核心功能、技术栈、适用场景等关键信息
  - 去除冗余表述，直接描述内容本身
  - 80-150 字精炼描述

- ✅ **智能标签系统**
  - 8-15 个精准标签
  - 自动包含平台名称、技术栈、内容类型
  - 支持手动添加和删除标签

- ✅ **预览和编辑**
  - 分析完成后可预览所有生成内容
  - 支持修改标题、描述和标签
  - 确认无误后一键保存

- ✅ **一键收藏**
  - 自动保存到 Cubox 知识库
  - 包含网页快照/图片
  - 保存成功后自动关闭扩展

### 用户体验

- 🎨 **现代化 UI**：采用 Tailwind CSS，支持深色模式
- 📱 **自适应高度**：popup 窗口自动适应内容高度，无需滚动
- ⚙️ **集成设置**：设置面板集成在 popup 内，无需跳转
- 💾 **配置持久化**：所有配置保存在本地，刷新后不丢失

## 🛠️ 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite + Turborepo
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **API 集成**:
  - OpenAI API (GPT-3.5/GPT-4/GPT-4-turbo/GPT-4o-mini)
  - Tavily API (网页内容提取)
  - Cubox API (收藏保存)
- **扩展架构**: Chrome Extension Manifest V3

## 📦 快速开始

### 环境要求

- Node.js >= 22.15.1
- pnpm >= 10.11.0

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/buzaixiancn/Cubox-ChromeEx.git
cd Cubox-ChromeEx
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

创建 `.env` 文件（可选，也可在扩展设置中配置）：

```env
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_OPENAI_API_ENDPOINT=https://api.chatanywhere.tech
VITE_TAVILY_API_KEY=tvly-your-tavily-api-key
VITE_CUBOX_API_URL=https://cubox.pro/c/api/save/your-api-key
```

4. **构建扩展**

```bash
# 开发模式（自动热重载）
pnpm dev

# 生产构建
pnpm build
```

5. **加载扩展到 Chrome**

- 打开 Chrome 浏览器，访问 `chrome://extensions/`
- 开启右上角的 **开发者模式**
- 点击 **加载已解压的扩展程序**
- 选择项目的 `dist` 目录

6. **配置 API 密钥**

- 点击浏览器工具栏中的扩展图标
- 点击右上角的设置图标 ⚙️
- 填写以下配置：
  - **OpenAI API Key**: 你的 OpenAI API 密钥
  - **API 端点**: OpenAI API 端点（默认：`https://api.chatanywhere.tech`）
  - **模型名称**: 选择要使用的模型（gpt-3.5-turbo / gpt-4 / gpt-4-turbo / gpt-4o-mini）
  - **Tavily API Key**: 你的 Tavily API 密钥
  - **Cubox API URL**: 你的 Cubox 收藏 API URL
- 点击 **保存设置**

## 📖 使用说明

### 基本使用

1. **打开扩展**
   - 点击浏览器工具栏中的扩展图标，或
   - 使用快捷键 `Ctrl+Shift+S`（Mac: `Cmd+Shift+S`）

2. **分析网页**
   - 在要收藏的网页上打开扩展
   - 点击 **"分析网页内容"** 按钮
   - 等待 AI 分析完成（通常需要 5-15 秒）

3. **预览和编辑**
   - 查看 AI 生成的标题、描述和标签
   - 可以修改任何内容
   - 添加或删除标签

4. **保存到 Cubox**
   - 点击 **"确认保存到 Cubox"** 按钮
   - 保存成功后扩展会自动关闭

### 高级功能

#### 快速分析

在设置中开启 **"快速分析"** 开关后，打开扩展时会自动开始分析当前页面，无需手动点击按钮。

#### 自定义快捷键

1. 打开 Chrome 扩展管理页面：`chrome://extensions/shortcuts`
2. 找到 **Cubox 智能收藏** 扩展
3. 点击快捷键右侧的编辑图标
4. 设置你喜欢的快捷键组合

#### 支持的平台识别

扩展会自动识别以下平台并在标题和标签中标注：

- **代码平台**: GitHub, GitLab, Gitee
- **视频平台**: 哔哩哔哩, YouTube
- **技术社区**: 稀土掘金, 知乎, CSDN, 思否
- **社交媒体**: 微博, 抖音, 小红书

## 🏗️ 项目结构

```
Cubox-ChromeEx/
├── chrome-extension/          # Chrome 扩展配置
│   ├── manifest.ts           # Manifest 配置文件
│   └── src/
│       └── background/       # Background Service Worker
├── pages/
│   └── popup/                # Popup 主界面
│       └── src/
│           ├── Popup.tsx     # 主组件
│           └── components/   # UI 组件
│               ├── SettingsPanel.tsx    # 设置面板
│               ├── PreviewPanel.tsx     # 预览面板
│               ├── UrlCard.tsx          # URL 卡片
│               └── ...
├── packages/
│   ├── shared/               # 共享代码
│   │   └── lib/
│   │       └── api/
│   │           ├── openai.ts # OpenAI API 调用
│   │           ├── tavily.ts # Tavily API 调用
│   │           └── cubox.ts  # Cubox API 调用
│   ├── storage/              # 存储工具
│   ├── ui/                   # UI 组件库
│   └── ...
└── dist/                     # 构建输出目录
```

## 🔧 开发指南

### 开发模式

```bash
# 启动开发服务器（自动热重载）
pnpm dev
```

### 代码检查

```bash
# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# ESLint 检查
pnpm lint

# 自动修复
pnpm lint:fix
```

### 构建生产版本

```bash
# 构建扩展
pnpm build

# 打包为 zip 文件
pnpm zip
```

### 添加依赖

```bash
# 添加到根目录
pnpm add <package> -w

# 添加到指定模块
pnpm add <package> -F <module-name>
```

## 📝 API 配置说明

### OpenAI API

1. 获取 API Key: https://platform.openai.com/api-keys
2. 支持的模型：
   - `gpt-3.5-turbo` - 快速且经济
   - `gpt-4` - 更强的理解能力
   - `gpt-4-turbo` - 最新增强版
   - `gpt-4o-mini` - 平衡性能和成本

### Tavily API

1. 获取 API Key: https://docs.tavily.com/
2. 用于提取网页的完整文本内容和图片

### Cubox API

1. 获取 API URL: https://help.cubox.pro/save/89d3/
2. API URL 格式: `https://cubox.pro/c/api/save/{your-api-key}`

## 🐛 故障排除

### 扩展无法加载

- 确保项目路径中没有中文字符（Chrome 扩展限制）
- 检查 `dist` 目录是否存在且包含 `manifest.json`
- 查看 Chrome 扩展管理页面的错误信息

### API 调用失败

- 检查 API 密钥是否正确配置
- 确认网络连接正常
- 查看浏览器控制台（F12）的错误信息

### 内容提取失败

- Tavily API 可能无法访问某些需要登录的网页
- 某些动态加载的内容可能无法提取
- 检查 Tavily API Key 是否有效

### Popup 高度问题

- 确保浏览器窗口足够高
- 尝试关闭并重新打开扩展
- 检查是否有 CSS 样式冲突

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [OpenAI](https://openai.com/) - 强大的 AI 模型
- [Tavily](https://tavily.com/) - 网页内容提取服务
- [Cubox](https://cubox.pro/) - 知识管理工具

特别感谢 [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) 项目提供的优秀开发脚手架。

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues: [提交 Issue](https://github.com/buzaixiancn/Cubox-ChromeEx/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

Made with ❤️ by [buzaixian](https://github.com/buzaixiancn)

</div>
