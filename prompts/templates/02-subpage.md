# 提示词 02：在产品子目录下添加页面/目录

## AI 读取说明

本文件为「AI 自读模式」提示词。用户无需复制文件内容，只需在对话框中输入：

**格式1：新增多个子项（带子项，自动创建目录结构）**
```
使用提示词02：顶部栏路径：【产品->学习管理系统/文档】 父目录【无/管理者/管理者->教学管理】 子项：【安装指南,配置说明(单页面),一级目录->二级目录,一级目录->二级目录(文件夹)】 插入位置：【插在xxx之后/最前面/最后面】
```

**格式2：新增单页面（无子项）**
```
使用提示词02：顶部栏路径：【产品->学习管理系统/文档】 父目录【无/管理者/管理者->教学管理】 子项：【】 插入位置：【最前面/最后面/插在xxx和yyy之间】
```

示例：
```
使用提示词02：顶部栏路径：【产品->学习管理系统】 父目录【无】 子项：【安装指南,配置说明(单页面)】 插入位置：【插在入门之后】
```

---

## 执行逻辑

当用户输入「使用提示词02」开头的指令时，AI 需按以下步骤执行：

### 步骤1：解析用户参数

从用户输入中提取以下信息（参数值使用中文括号【】包裹）：
- **顶部栏路径**：格式如 `产品->学习管理系统/文档`，表示从顶部栏到目标产品/页面的层级路径，`->` 分隔层级（必填）
- **父目录**：格式为 `无`（根目录）、`目录名`（一级目录）、`目录名->子目录名`（二级目录）或 `页面显示名称`（单页面），表示在哪个目录或页面下添加内容（必填）。AI 需要通过 `_meta.{locale}.json` 解析显示名称对应的实际路径
- **子项**：格式为 `标题`、`标题(单页面)`、`一级目录->二级目录` 或 `一级目录->二级目录(文件夹)`，多个子项用逗号分隔。有子项时为多个独立内容，无子项时创建单页面。标 `(单页面)` 则为单页面，不标则默认为二级目录（文件夹）。AI 根据标题自动生成英文 slug
- **插入位置**：如「插在入门之后」「插在概述和教学管理之间」「最前面」「最后面」（必填）

### 步骤2：路径类型判断

AI 首先根据顶部栏路径解析出实际的文件系统路径，然后检查父目录对应的实际文件系统对象：

#### 2.1 父路径指向目录（如 `/ulearning`、`/ulearning/admin`）

父路径对应目录存在，且该目录下有 `_meta.{locale}.json` 文件：
- 直接在该目录下添加新内容

#### 2.2 父路径指向页面文件（如 `/ulearning/getting-started`）

父路径对应一个 MDX 文件（如 `pages/ulearning/getting-started.{locale}.mdx`），需要先将页面转换为目录结构。**此操作会改变原有页面的路由结构**，必须按以下步骤执行：

1. **提醒用户并确认**：AI 必须先向用户说明当前父目录指向的是单页面文件，需要将其转换为目录结构才能添加子项。说明转换后的变化：
   - 原页面路由从 `/{path}` 变为 `/{path}/introduction`
   - 需要备份原文件并创建新目录结构
   - 询问用户是否确认执行转换

2. **备份原文件**：若用户确认，先备份所有语言版本的原 MDX 文件到临时位置（如 `pages/{parent-dir}/{slug}.{locale}.mdx.backup`）

3. **删除原文件**：删除所有语言版本的原 MDX 文件

4. **创建同名目录**：创建 `pages/{parent-dir}/{slug}/` 目录（如 `pages/ulearning/getting-started/`）

5. **复制备份到新目录**：将各语言版本的备份文件复制到新目录下，并重命名为 `introduction.{locale}.mdx`

6. **创建 `_meta.{locale}.json`**：在新目录下创建 `_meta.{locale}.json` 文件，包含原页面标题作为入口条目：`{"introduction": "原页面标题"}`

7. **更新父级目录的 `_meta.{locale}.json`**：保持原标题不变，但更新链接路径，从 `/{path}` 变为 `/{path}/introduction`

8. **清理备份文件**：转换完成后，删除所有语言版本的 `.backup` 备份文件

### 步骤3：项目约束

1. **多语言同步**：`en-US`、`zh-CN`、`fr-FR`、`ar` 四个语言目录必须同步新增文件（以 `next.config.js` 中 `i18n.locales` 为准）
2. **Frontmatter**：每个 MDX 文件头部必须有 `title` 字段，**正文内容为空**，不自动生成任何描述性文字
3. **目录结构参考**：
   - 有侧边栏的目录：参考 `pages/ulearning/admin/`（含 `_meta.{locale}.json`），子目录的 `_meta.{locale}.json` 格式为简单键值对：`{"slug": "标题"}`
   - 单页面：参考 `pages/ulearning/getting-started.{locale}.mdx`（直接在目录下的 MDX 文件）
4. **导航配置**：子目录的 `_meta.{locale}.json` 只影响侧边栏导航，不影响顶部栏
5. **路径规则**：
   - 顶部栏路径解析：根据用户输入的 `顶部栏路径`（如 `产品->学习管理系统`）映射到实际目录，`学习管理系统` 对应 `/ulearning`，`文档` 对应 `/docs`
   - 父目录解析：`无` 对应根目录，`管理者` 对应 `/ulearning/admin`，`管理者->教学管理` 对应 `/ulearning/admin/teaching-administration`
   - 目录：创建 `pages/{parent-dir}/{slug}/` 目录，仅包含 `_meta.{locale}.json`，**不创建** `introduction.mdx` 入口文件
   - 单页面：创建 `pages/{parent-dir}/{slug}.{locale}.mdx` 文件

### 步骤4：生成内容

#### 4.1 链接自动生成规则

根据标题自动生成路由路径，规则如下：
- 中文标题：翻译为英文，空格用连字符 `-` 连接，全部小写，如「安装指南」→ `installation-guide`
- 英文标题：全部小写，空格用连字符 `-` 连接，如「API Docs」→ `api-docs`
- 目录：路径为 `/{parent-path}/{slug}`（仅包含 `_meta.json`，无子页面时点击展开）
- 单页面时：路径为 `/{parent-path}/{slug}`（直接在目录下的 MDX 文件）

#### 4.2 新增多个子项（带子项）

在父目录下为每个子项创建独立的内容：
- 每个子项根据其标题自动生成英文 slug
- 根据子项类型创建对应的文件或目录结构
- 更新父目录的 `_meta.{locale}.json`，按顺序添加所有子项条目

#### 4.3 新增单页面（无子项）

当子项为空时，在父目录下创建单个 MDX 文件：
- AI 根据父目录名称生成英文 slug
- 创建 `pages/{parent-dir}/{slug}.{locale}.mdx` 文件（标题为父目录名称）
- 更新父目录的 `_meta.{locale}.json`，添加新页面条目

#### 4.4 子项格式详解

当包含「子项」时，子项支持以下四种格式：
- **二级目录（默认）**：子项标题无标记（如「安装指南」），根据标题自动生成英文 slug，创建 `pages/{parent-dir}/{sub-slug}/` 目录，仅包含 `_meta.{locale}.json`（空对象 `{}`），**不创建** `introduction.mdx` 入口文件
- **单页面**：子项标题标 `(单页面)`（如「配置说明(单页面)」），根据标题自动生成英文 slug，创建 `pages/{parent-dir}/{sub-slug}.{locale}.mdx` 文件，链接格式：`/{parent-path}/{sub-slug}`
- **一级目录->二级目录（默认单页面）**：子项格式为 `一级标题->二级标题`（如「教程->快速开始」），创建 `pages/{parent-dir}/{first-slug}/` 一级目录，仅包含 `_meta.{locale}.json`（配置子项：`{"second-slug": "二级标题"}`），**不创建** `introduction.mdx`；在一级目录下创建 `second-slug.{locale}.mdx` 单页面文件，链接格式：`/{parent-path}/{first-slug}/{second-slug}`
- **一级目录->二级目录(文件夹)**：子项格式为 `一级标题->二级标题(文件夹)`，创建 `pages/{parent-dir}/{first-slug}/` 一级目录，仅包含 `_meta.{locale}.json`（配置子项：`{"second-slug": "二级标题"}`），**不创建** `introduction.mdx`；在一级目录下创建 `second-slug/` 二级目录，仅包含 `_meta.{locale}.json`（空对象 `{}`），**不创建** `introduction.mdx`

### 步骤5：输出要求

1. 列出所有需要新建的文件及其完整内容（含文件路径）
2. 列出所有需要修改的文件及其具体改动内容（含文件路径和改动位置）
3. 描述完成后在侧边栏的效果

---

## 当前产品目录结构参考

供用户参考父目录路径：

**学习管理系统 (`/ulearning`)**
- `/ulearning` - 学习管理系统根目录
  - `/ulearning/getting-started` - 入门（页面文件）
  - `/ulearning/admin` - 管理者（目录）
    - `overview` - 概述
    - `teaching-administration` - 教学管理
    - `data-and-reports` - 数据和报告
    - `system-settings` - 系统设置
  - `/ulearning/teacher` - 老师（目录）
  - `/ulearning/student` - 学生（目录）

**智慧教室 (`/uclass`)**
- `/uclass` - 智慧教室根目录
  - `/uclass/start` - 快速开始（页面文件）
  - `/uclass/interactive` - 互动教学（目录）
  - `/uclass/active` - 课堂活动（目录）
  - `/uclass/personalSpace` - 个人空间（目录）

---

## 参数解析规则

| 参数 | 格式 | 示例 |
|---|---|---|
| 顶部栏路径 | `层级1->层级2/层级3`，`->` 分隔层级 | `产品->学习管理系统` / `产品->智慧教室/文档` |
| 父目录 | `无` / `目录名` / `目录名->子目录名` / `页面显示名称` | `无` / `管理者` / `管理者->教学管理` / `入门` |
| 子项 | `标题`、`标题(单页面)`、`一级目录->二级目录` 或 `一级目录->二级目录(文件夹)`，逗号分隔 | 安装指南,配置说明(单页面),教程->快速开始,教程->进阶指南(文件夹) |
| 插入位置 | 自然语言 | 插在入门之后 / 最前面 / 最后面 |

---

## 示例

### 示例1：在学习管理系统根目录下新增多个子项

**输入：**
```
使用提示词02：顶部栏路径：【产品->学习管理系统】 父目录【无】 子项：【安装指南,配置说明(单页面),教程->快速开始,教程->进阶指南(文件夹)】 插入位置：【插在入门之后】
```

**预期执行：**
- AI 根据子项标题自动生成英文 slug：「安装指南」→ `installation-guide`，「配置说明」→ `configuration-guide`，「教程」→ `tutorials`，「快速开始」→ `quick-start`，「进阶指南」→ `advanced-guide`
- 根据顶部栏路径 `产品->学习管理系统` 解析出实际目录 `/ulearning`
- 父目录「无」对应 `/ulearning`（根目录）
- 创建 `pages/ulearning/installation-guide/` 目录及 `_meta.{locale}.json`（空对象 `{}`），不创建 `introduction.mdx`
- 创建 `pages/ulearning/configuration-guide.{locale}.mdx` 文件（单页面，标题为「配置说明」）
- 创建 `pages/ulearning/tutorials/` 一级目录及 `_meta.{locale}.json`（配置子项：`{"quick-start": "快速开始", "advanced-guide": "进阶指南"}`），不创建 `introduction.mdx`
- 在 `pages/ulearning/tutorials/` 下创建 `quick-start.{locale}.mdx` 文件（单页面，标题为「快速开始」）
- 在 `pages/ulearning/tutorials/` 下创建 `advanced-guide/` 目录及 `_meta.{locale}.json`（空对象 `{}`），不创建 `introduction.mdx`
- 更新 `pages/ulearning/_meta.{locale}.json`，在「入门」之后添加所有子项条目
- 同步生成 `en-US`、`zh-CN`、`fr-FR`、`ar` 四个语言版本

**效果：**
侧边栏显示：`入门` → `安装指南` → `配置说明` → `教程`（展开后显示 `快速开始`、`进阶指南`）→ `管理者`

---

### 示例2：在管理者目录下新增单页面

**输入：**
```
使用提示词02：顶部栏路径：【产品->学习管理系统】 父目录【管理者】 子项：【常见问题】 插入位置：【最前面】
```

**预期执行：**
- AI 根据子项标题自动生成英文 slug：「常见问题」→ `faq`
- 根据顶部栏路径 `产品->学习管理系统` 解析出实际目录 `/ulearning`
- 父目录「管理者」对应 `/ulearning/admin`（目录）
- 创建 `pages/ulearning/admin/faq.{locale}.mdx` 文件（标题为「常见问题」）
- 更新 `pages/ulearning/admin/_meta.{locale}.json`，在最前面添加「常见问题」条目
- 同步生成四个语言版本

**效果：**
侧边栏显示：`常见问题` → `概述` → `教学管理` → `数据和报告` → `系统设置`

---

### 示例3：在管理者目录下新增多个子项

**输入：**
```
使用提示词02：顶部栏路径：【产品->学习管理系统】 父目录【管理者】 子项：【安全设置,插件管理】 插入位置：【插在系统设置之后】
```

**预期执行：**
- AI 根据子项标题自动生成英文 slug：「安全设置」→ `security-settings`，「插件管理」→ `plugin-management`
- 根据顶部栏路径 `产品->学习管理系统` 解析出实际目录 `/ulearning`
- 父目录「管理者」对应 `/ulearning/admin`（目录）
- 创建 `pages/ulearning/admin/security-settings/` 目录及 `_meta.{locale}.json`（空对象 `{}`），不创建 `introduction.mdx`
- 创建 `pages/ulearning/admin/plugin-management/` 目录及 `_meta.{locale}.json`（空对象 `{}`），不创建 `introduction.mdx`
- 更新 `pages/ulearning/admin/_meta.{locale}.json`，在「系统设置」之后添加所有子项条目
- 同步生成四个语言版本

**效果：**
管理者侧边栏显示：`概述` → `教学管理` → `数据和报告` → `系统设置` → `安全设置` → `插件管理`

---

### 示例4：在学习管理系统根目录下新增目录

**输入：**
```
使用提示词02：顶部栏路径：【产品->学习管理系统】 父目录【无】 子项：【API参考】 插入位置：【最后面】
```

**预期执行：**
- AI 根据子项标题自动生成英文 slug：「API参考」→ `api-reference`
- 根据顶部栏路径 `产品->学习管理系统` 解析出实际目录 `/ulearning`
- 父目录「无」对应 `/ulearning`（根目录）
- 创建 `pages/ulearning/api-reference/` 目录
- 在目录中创建 `_meta.{locale}.json`（空对象 `{}`），不创建 `introduction.mdx`
- 更新 `pages/ulearning/_meta.{locale}.json`，在最后面添加「API参考」条目
- 同步生成四个语言版本

**效果：**
侧边栏显示：`入门` → `管理者` → `老师` → `学生` → `API参考`