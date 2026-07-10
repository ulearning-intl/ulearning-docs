# 提示词 04：翻译文档内容

## AI 读取说明

本文件为「AI 自读模式」提示词。用户无需复制文件内容，只需在对话框中输入：

```
使用提示词04：...
```

---

## 执行逻辑

当用户输入「使用提示词04」开头的指令时，AI 需按以下步骤执行。

### 步骤1：解析用户参数

从用户输入中提取以下信息：

| 参数 | 说明 | 必填 |
|---|---|---|
| `场景` | `单文件` 或 `文件夹` | 是 |
| `源文件路径` | 翻译基准语言的文件相对路径（相对于 `pages/`），不含语言后缀 | 场景=单文件时必填 |
| `源语言` | 源文件的语言，如 `zh-CN`、`en-US`、`fr-FR`、`ar` | 是 |
| `目标语言` | 需要翻译到的语言，如 `en-US`、`fr-FR`、`ar`、`zh-CN`，留空表示翻译到**所有其他语言** | 否 |
| `文件夹路径` | 待翻译的文件夹相对路径（相对于 `pages/`），不含语言后缀 | 场景=文件夹时必填 |
| `是否覆盖` | `是`：直接覆盖目标语言文件；`否`：仅翻译写入空文件或正文为空的已有文件 | 场景=单文件时可选，默认 `否` |

### 步骤2：确认语言后缀

根据 `next.config.js` 中 `i18n.locales` 确认所有已激活语言及其文件后缀：

| 语言 | 文件后缀 |
|---|---|
| `en-US` | `.en-US.mdx` |
| `zh-CN` | `.zh-CN.mdx` |
| `fr-FR` | `.fr-FR.mdx` |
| `ar` | `.ar.mdx` |

**注意**：`ar` 语言的 MDX 文件和 `_meta.json` 后缀为 `ar`（而非 `ar-AR`）。

### 步骤3：读取源文件内容

读取源语言文件（MDX 和对应的 `_meta.{locale}.json`），提取完整内容用于翻译。

---

## 场景一：翻译单个文件

### 执行流程

#### 步骤 A：读取源文件

读取以下文件内容：
- `pages/{源文件路径}.{源语言后缀}.mdx`
- `pages/{源文件路径}/_meta.{源语言后缀}.json`（若存在）

#### 步骤 B：确定目标语言列表

- 用户指定了 `目标语言` → 仅翻译到指定语言
- 用户未指定 → 翻译到**所有其他已激活语言**

#### 步骤 C：对每个目标语言执行翻译写入

遍历目标语言列表，对每个目标语言按以下三层判断：

**第一层：文件是否存在**

- **不存在** → 进入第二层
- **存在** → 读取文件内容，进入第二层

**第二层：文件是否为空**

读取文件内容（排除 frontmatter `---` 分隔符）判断正文是否为空：

- **正文为空**（仅有 frontmatter `title` 或完全空白）：视为可写入，进入第三层
- **正文有内容**：
  - `是否覆盖=是` → 进入第三层
  - `是否覆盖=否` → **跳过**，输出 `已存在，跳过（正文有内容且未选择覆盖）`

**第三层：翻译写入**

- MDX 文件：翻译正文内容和 frontmatter `title`，写入目标语言文件
- `_meta.{locale}.json`：翻译 `title` 字段，写入目标语言文件

---

## 场景二：翻译文件夹下所有文件

### 执行流程

#### 步骤 A：定位文件夹

确认文件夹路径为 `pages/{文件夹路径}/`。

#### 步骤 B：扫描文件

列出文件夹下**所有语言后缀匹配源语言**的 MDX 文件和 `_meta.{locale}.json` 文件：

- MDX 文件：`*.{源语言后缀}.mdx`
- 导航配置：`_meta.{源语言后缀}.json`

**递归说明**：默认**递归遍历所有子目录**，确保子目录中的文件也一并翻译。

#### 步骤 C：对每个源文件执行翻译

对每个找到的源文件，重复场景一的步骤 B~C：

1. 确定对应目标语言文件
2. 判断目标文件状态（不存在 / 正文为空 / 正文有内容）
3. 根据 `是否覆盖` 参数决定写入或跳过

#### 步骤 D：文件夹层级处理

当文件夹中存在**子目录**（如 `first-level-directory/`、`first-level-directory/second-level-directory-folder/`）时：

1. 将源子目录的 `_meta.{源语言后缀}.json` 翻译为各目标语言的 `_meta.{目标语言后缀}.json`
2. 将源子目录中的 MDX 文件翻译为各目标语言版本
3. 子目录中的子目录同理，递归处理

---

## 翻译规则

翻译时遵循以下原则：

- **翻译内容**：正文内容完整翻译为目标语言
- **保留 MDX 组件**：`<Callout>`、`<Steps>`、`<Tabs>` 等组件标签保留原文不做翻译
- **翻译 frontmatter title**：frontmatter 中的 `title` 也翻译为目标语言
- **保留代码块**：代码片段内容不翻译，仅翻译注释
- **MDX 语法安全**：源内容中的尖括号 `<>` 会被 MDX 解析器当作 JSX 标签处理，翻译时需转义：`<` → `&lt;`，`>` → `&gt;`

---

## 输出要求

1. 列出本次所有写入操作的文件及其操作类型
2. 明确标注每个文件是「翻译生成（空文件新建）」、「翻译覆盖」还是「跳过」
3. 若涉及文件夹场景，按文件夹层级分组列出
4. 标注跳过的文件及其跳过原因
5. 完成后提示用户检查各语言版本

---

## 示例

### 示例1：翻译单个文件（默认不覆盖）

**输入：**
```
使用提示词04：场景：【单文件】 源文件路径：【ulearning/getting-started】 源语言：【zh-CN】
```

**源文件 `zh-CN` 内容：**
```mdx
---
title: 快速入门
---

# 快速入门

欢迎使用 ULearning。
```

**各目标语言处理结果：**

| 目标语言 | 文件状态 | 处理结果 |
|---|---|---|
| `en-US` | 不存在 | 翻译生成（空文件新建） |
| `fr-FR` | 正文有内容 | 跳过（正文有内容且未选择覆盖） |
| `ar` | 正文为空 | 翻译生成（空文件新建） |

**输出：**
```
本次操作：
- pages/ulearning/getting-started.en-US.mdx（翻译生成，空文件新建）
- pages/ulearning/getting-started.fr-FR.mdx（已存在，跳过（正文有内容且未选择覆盖））
- pages/ulearning/getting-started.ar.mdx（翻译生成，空文件新建）

提示：fr-FR 版本已有内容未覆盖，如需强制翻译请设置「是否覆盖：是」。
```

---

### 示例2：翻译单个文件（强制覆盖）

**输入：**
```
使用提示词04：场景：【单文件】 源文件路径：【ulearning/getting-started】 源语言：【zh-CN】 目标语言：【en-US】 是否覆盖：【是】
```

**输出：**
```
本次操作：
- pages/ulearning/getting-started.en-US.mdx（翻译覆盖）

提示：已强制覆盖 en-US 版本原有内容。
```

---

### 示例3：翻译文件夹下所有文件（默认不覆盖）

**输入：**
```
使用提示词04：场景：【文件夹】 文件夹路径：【smart-scheduling】 源语言：【zh-CN】
```

**扫描到的源文件：**
```
smart-scheduling/introduction.zh-CN.mdx
smart-scheduling/_meta.zh-CN.json
smart-scheduling/configuration-guide.zh-CN.mdx
smart-scheduling/installation-guide/_meta.zh-CN.json
smart-scheduling/installation-guide/introduction.zh-CN.mdx
smart-scheduling/first-level-directory/_meta.zh-CN.json
smart-scheduling/first-level-directory/second-level-directory.zh-CN.mdx
smart-scheduling/first-level-directory/second-level-directory-folder/_meta.zh-CN.json
```

**处理结果（按层级分组）：**

```
文件夹：smart-scheduling/
├── introduction.en-US.mdx（翻译生成）
├── introduction.ar.mdx（翻译生成）
├── _meta.en-US.json（翻译生成）
├── _meta.ar.json（翻译生成）
├── configuration-guide.en-US.mdx（翻译生成）
├── configuration-guide.ar.mdx（正文有内容，跳过）
│
├── installation-guide/
│   ├── _meta.en-US.json（翻译生成）
│   ├── _meta.ar.json（翻译生成）
│   └── introduction.en-US.mdx（翻译生成）
│   └── introduction.ar.mdx（翻译生成）
│
├── first-level-directory/
│   ├── _meta.en-US.json（翻译生成）
│   ├── _meta.ar.json（翻译生成）
│   ├── second-level-directory.en-US.mdx（翻译生成）
│   ├── second-level-directory.ar.mdx（翻译生成）
│   │
│   └── second-level-directory-folder/
│       ├── _meta.en-US.json（翻译生成）
│       └── _meta.ar.json（翻译生成）

提示：fr-FR 版本因未提供目标语言未处理；部分已有内容的文件已跳过，如需覆盖请设置「是否覆盖：是」。
```

---

### 示例4：翻译文件夹（指定目标语言 + 强制覆盖）

**输入：**
```
使用提示词04：场景：【文件夹】 文件夹路径：【smart-scheduling】 源语言：【zh-CN】 目标语言：【en-US】 是否覆盖：【是】
```

**输出：**
```
本次操作（目标语言：en-US）：
- pages/smart-scheduling/introduction.en-US.mdx（翻译覆盖）
- pages/smart-scheduling/_meta.en-US.json（翻译覆盖）
- pages/smart-scheduling/configuration-guide.en-US.mdx（翻译覆盖）
- pages/smart-scheduling/installation-guide/_meta.en-US.json（翻译覆盖）
- pages/smart-scheduling/installation-guide/introduction.en-US.mdx（翻译覆盖）
- pages/smart-scheduling/first-level-directory/_meta.en-US.json（翻译覆盖）
- pages/smart-scheduling/first-level-directory/second-level-directory.en-US.mdx（翻译覆盖）
- pages/smart-scheduling/first-level-directory/second-level-directory-folder/_meta.en-US.json（翻译覆盖）

提示：已强制覆盖所有 en-US 版本文件。
```
