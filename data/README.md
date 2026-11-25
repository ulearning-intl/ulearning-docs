# 小蜜蜂入口角色 URL 名单

`assistant-routes.json` 按角色列出不含语言前缀的文档路径：

- `admin`：`admin`、`administrator` 父目录，以及管理员极速体验。
- `student`：`student` 父目录，以及学生极速体验。
- `teacher`：`teacher` 父目录，以及教师极速体验。

名单覆盖 uLMS、uClass、uAgent 和项目内旧版 uLearning、uTest、uLCMS 的角色文档，保留已有重定向支持的旧极速体验地址。相同文档的不同语言版本共用一个路径。

首页、产品概览、公共分类页等没有角色归属的地址默认使用 `teacher`。小蜜蜂目标地址为 `https://ta.tongshike.cn/?language=zh&role=角色`。

新增、移动或删除文档后执行 `npm run generate:assistant-routes` 更新名单。角色根据产品下的第一级角色目录确定，避免将学生目录内名称包含 `teacher` 的页面误判为教师。
