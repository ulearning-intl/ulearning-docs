# ULearning Docs - AI 开发规范

## 项目简介

ULearning Docs 是一个基于 Nextra（Next.js + MDX）的多语言在线文档站点，面向全球教育机构用户，介绍 ULearning 智能教育平台的产品功能和使用方法。

技术栈：Next.js 13 + nextra-theme-docs + MDX + Tailwind CSS

## 目录结构

```
ulearning-docs/
├── pages/                    # 所有文档页面（MDX）
│   ├── _meta.{locale}.json   # 各语言的导航配置（JSON 格式）
│   ├── index.{locale}.mdx    # 首页
│   ├── blog.{locale}.mdx      # 博客/变更日志
│   └── {product}/             # 产品子目录
│       ├── _meta.{locale}.json
│       └── {page}.{locale}.mdx
├── components/               # React 组件
├── public/                   # 静态资源
├── translations/             # 主题文案翻译
│   └── text.js               # 导航/页脚等国际化文案
├── theme.config.js           # Nextra 主题配置（顶部栏/页脚/logo等）
└── prompts/                  # AI 提示词示例库
    ├── templates/            # AI 自读模式提示词模板（不可修改）
    │   └── 01-topbar-menu.md
    └── demos/                # 可复制使用的 demo 模板（可复制修改）
        └── 01-topbar-menu.md
```

## 页面类型说明

### 单页面（type: "page"）
单个 MDX 文件，无子页面。侧边栏的有无由文件结构决定。

**有侧边栏（默认）**：创建文件夹结构，如 `pages/solutions/`，链接格式为 `/{path}/introduction`
```json
"solutions": {
  "title": "解决方案",
  "type": "page",
  "href": "/solutions/introduction"
}
```

**无侧边栏**：创建单个 MDX 文件，如 `pages/blog.{locale}.mdx`，链接格式为 `/{path}`
```json
"blog": {
  "title": "变更日志",
  "type": "page",
  "href": "/blog"
}
```

### 下拉菜单（type: "menu"）
点击后在顶部栏展开子项目列表。每个子项可以独立设置侧边栏，由文件结构决定。

**有侧边栏（默认）**：子项创建文件夹结构，链接格式为 `/{item-path}/introduction`
```json
"products": {
  "title": "产品",
  "type": "menu",
  "items": {
    "ULearning": { "title": "学习管理系统", "href": "/ulearning/getting-started" },
    "UClass":   { "title": "智慧教室",        "href": "/uclass/start" }
  }
}
```

**混合侧边栏**（部分子项有侧边栏，部分无）：
```json
"advanced-products": {
  "title": "高级产品",
  "type": "menu",
  "items": {
    "smart-scheduling": { "title": "智能排课", "href": "/smart-scheduling/introduction" },
    "data-analysis": { "title": "数据分析", "href": "/data-analysis" }
  }
}
```

## 编写规范约束

### 1. 命名与路径
- 路由路径使用 kebab-case（如 `ulcms-introduction`）
- MDX 文件名：`{slug}.{locale}.mdx`（如 `getting-started.zh-CN.mdx`）
- 目录名使用产品英文名（如 `ulearning/`、`utest/`）

### 2. 文件头部 Frontmatter
每个 MDX 文件必须包含：
```yaml
---
title: 页面标题
---
```
可选字段：`searchable`（是否可搜索）、`display`（hidden 时不出现在侧边栏）

**注意**：MDX 文件正文内容应为空，不自动生成任何描述性文字。页面内容由用户后续手动填写。

### 3. 多语言文件
- **所有语言必须同步新增**：新增一个页面时，需要同时在所有已激活语言目录下创建对应文件
- 当前已激活语言：`en-US`、`zh-CN`、`fr-FR`、`ar`
- 新增页面时请在 `next.config.js` 的 `locales` 数组中确认语言已激活

### 4. 导航配置
- 顶部栏：在 `pages/_meta.{locale}.json` **根目录**配置中添加条目（子目录的 `_meta.{locale}.json` 只控制侧边栏）
- 下拉菜单：设置 `"type": "menu"` 并在 `"items"` 中列出子项
- 位置排序：JSON 中条目顺序即为顶部栏从左到右的显示顺序
- **子目录 _meta 结构**：产品子目录（如 `pages/ulearning/_meta.{locale}.json`）中的配置格式为简单键值对，用于定义侧边栏导航，格式为：
  ```json
  {
    "getting-started": "入门",
    "admin": "管理者"
  }
  ```
- **隐藏条目规则**：当下拉菜单中的子项链接到一个独立的页面目录（如 `/test2/overview`），且该目录不是顶部栏的直接导航项时，必须在根 `_meta.{locale}.json` 中添加 `"display": "hidden"` 条目，否则该目录会自动出现在顶部栏中。示例：
  ```json
  "test2": {
    "title": "测试2",
    "type": "page",
    "display": "hidden"
  }
  ```
- **侧边栏控制**：侧边栏的有无由文件结构决定，与 `theme.sidebar` 无关
  - **有侧边栏**（默认）：创建文件夹结构，如 `pages/ulearning/`，包含 `_meta.{locale}.json` 和入口 MDX 文件，链接格式为 `/{path}/introduction`
  - **无侧边栏**：创建单个 MDX 文件，如 `pages/blog.{locale}.mdx`，直接在 pages 目录下，链接格式为 `/{path}`

### 5. 组件使用
- 使用 MDX 标准语法引入 React 组件
- 组件文件放在 `components/` 目录下

### 6. AI 辅助规则
- 生成新页面后，请确认已同步创建所有语言版本
- 新增下拉菜单时，同时更新所有语言的 `_meta.{locale}.json`
- 新增产品子目录后，在 `pages/{product}/` 下创建 `_meta.{locale}.json` 并添加入口条目
- **禁止自行运行构建命令**：AI 不得在未经用户明确指令的情况下运行 `npm run build`、`npm run dev` 等命令

### 7. 提示词文件约束
- `prompts/templates/` 目录下的文件为 AI 自读模式的提示词模板，**禁止修改**。这些文件定义了 AI 执行任务的逻辑和规则。
- `prompts/demos/` 目录下的文件为用户可复制使用的 demo 模板，用户可以复制这些内容到对话框中使用。
- 两个目录下的文件名保持一一对应，便于查找和管理。
