详细版提示词位置：prompts/templates/03-content-write.md

# 写入文档内容

### 格式：写入内容到指定 MDX 文件
```
使用提示词03：文件路径：【ulearning/getting-started】 语言：【zh-CN】 内容：【这里填入文档内容，支持 Markdown 和 MDX 语法】
```

**补充说明**：
- 文件路径相对于 `pages/` 目录，不包含语言后缀，后缀由语言参数自动拼接
- Title 字段可不填，会自动从内容中提取；也可手动指定 `Title：【快速入门指南】`
- 内容支持标准 Markdown 和 MDX 语法（如嵌入 `<Callout>`、`<Steps>` 等组件）
- 提示词03仅负责写入 MDX 文件内容，不涉及目录结构或 `_meta.{locale}.json` 的创建/更新

**ar 语言后缀**：`ar` 语言的 MDX 文件后缀为 `ar`（而非 `ar-AR`），如 `getting-started.ar.mdx`

---------------------------------------------------------------------
