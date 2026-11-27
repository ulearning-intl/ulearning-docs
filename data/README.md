# 小蜜蜂入口角色与文章路由

`assistant-routes.json` 按角色列出不含语言前缀的文档路径：

- `admin`：`admin`、`administrator` 目录，以及管理员极速体验。
- `student`：`student` 目录，以及学生极速体验。
- `teacher`：`teacher` 目录，以及教师极速体验。
- `supervisor`：`supervisor`、`reviewer` 目录。

生成脚本扫描 `pages` 和 `assistant-content` 下各产品的角色文档，相同文档的不同语言版本共用一个路径，并保留已有重定向支持的旧极速体验地址。

导航栏与悬浮助手共用 `utils/assistant-routing.js`，打开同服务的 `/assistant`，携带当前语种、角色、产品及文章路径。目录首页的 `/index` 后缀与旧极速体验链接会转换为索引使用的文章路径。首页、产品概览等没有角色归属的地址默认使用 `teacher`。

新增、移动或删除文档后执行 `npm run generate:assistant-routes` 更新名单。问答索引运行时自动扫描 Markdown 与 MDX，并识别管理员目录及极速体验文档。当前分支直接使用整理后的 uLMS、uClass、uAgent 文章与中英图片，导入资料（包括 uRecord）使用 `assistant-content` 下的中文文章。

旧资料的 `ulearning` 产品标识统一归入 `ulms`，旧文章 ID 保持可用，避免问答目录显示两个同名的 uLMS 产品。
