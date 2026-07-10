# 提示词 03：写入文档内容到 MDX 文件

## AI 读取说明

本文件为「AI 自读模式」提示词。用户无需复制文件内容，只需在对话框中输入：

```
使用提示词03：文件路径：【页面路径】 语言：【语言】 内容：【文档内容】
```

示例：
```
使用提示词03：文件路径：【ulearning/getting-started】 语言：【zh-CN】 内容：【# 快速入门\n\n这是快速入门文档的内容...】
```

---

## 执行逻辑

当用户输入「使用提示词03」开头的指令时，AI 需按以下步骤执行：

### 步骤1：解析用户参数

从用户输入中提取以下信息：
- **文件路径**：MDX 文件相对于 `pages/` 目录的路径（不含语言后缀），必填
- **语言**：目标语言版本，必填（如 `en-US`、`zh-CN`、`fr-FR`、`ar`）
- **内容**：用户提供的文档内容，支持 Markdown 和 MDX 语法，必填
- **Title**（可选）：frontmatter 中的 `title` 字段，未填写时由 AI 根据内容自动提取

### 步骤2：确定文件路径

根据语言参数拼接完整的文件名：
- `en-US` → `{path}.en-US.mdx`
- `zh-CN` → `{path}.zh-CN.mdx`
- `fr-FR` → `{path}.fr-FR.mdx`
- `ar` → `{path}.ar.mdx`

文件完整路径为 `pages/{path}.{locale}.mdx`。

**注意**：`ar` 语言的 MDX 文件后缀为 `ar`（而非 `ar-AR`）。

### 步骤3：生成 Frontmatter

自动生成文件头部：
```yaml
---
title: {title}
---
```

- 若用户在参数中指定了 `Title`，直接使用指定值
- 若未指定，AI 从内容中提取首个 `#` 标题作为 `title` 值
- 若内容无标题，则以文件路径中的最后一段作为 `title`（如 `ulearning/getting-started` → `Getting Started`）

### 步骤4：写入文件

将 frontmatter 和用户内容合并后写入目标文件：
- 文件不存在时：直接创建新文件
- 文件已存在时：**覆盖**文件内容（保留原有 frontmatter 中的 `title`，其他字段由用户内容决定）

### 步骤5：输出要求

1. 列出目标文件的完整路径
2. 显示文件的完整内容（含 frontmatter）
3. 提示用户是否需要同步写入其他语言版本

---

## 执行约束

1. **仅写入文件内容**：提示词03仅负责将内容写入 MDX 文件，**不涉及**目录结构或 `_meta.{locale}.json` 的创建/更新
2. **语言后缀**：MDX 文件语言后缀以 `next.config.js` 中 `i18n.locales` 为准，`ar` 语言后缀为 `ar`
3. **内容兼容性**：支持标准 Markdown 语法和 MDX 语法（如 `<Callout>`、`<Steps>`、`<Tabs>` 等组件嵌入）
4. **正文内容**：用户提供的内容即为准，无论长短，AI 不自动补充任何描述性文字
5. **MDX 语法安全**：用户内容中的尖括号 `<>` 会被 MDX 解析器当作 JSX 标签处理，必须进行转义：`<` → `&lt;`，`>` → `&gt;`。例如 `openspec/changes/<name>/` 需要转换为 `openspec/changes/&lt;name&gt;/`

---

## 示例

### 示例1：写入已有文件

**输入：**
```
使用提示词03：文件路径：【ulearning/getting-started】 语言：【zh-CN】 内容：【# 快速入门\n\n欢迎使用 ULearning 学习管理系统。本指南将帮助你快速上手。\n\n## 环境要求\n\n- Node.js 18+\n- npm 9+\n\n## 安装步骤\n\n1. 克隆仓库\n2. 运行 npm install\n3. 配置环境变量\n\n<Callout type="warning">\n请确保 Node.js 版本符合要求。\n</Callout>】}
```

**预期执行：**
- 确定文件路径：`pages/ulearning/getting-started.zh-CN.mdx`
- 提取 title：`快速入门`
- 生成 frontmatter：`title: 快速入门`
- 写入完整文件内容

---

### 示例2：写入新文件（指定 title）

**输入：**
```
使用提示词03：文件路径：【ulearning/admin/user-management】 语言：【en-US】 Title：【User Management】 内容：【# User Management\n\nThis section covers user management features...】}
```

**预期执行：**
- 确定文件路径：`pages/ulearning/admin/user-management.en-US.mdx`
- 使用指定 title：`User Management`
- 写入完整文件内容
