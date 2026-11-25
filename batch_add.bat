@echo off
setlocal

REM 这是一个批处理脚本示例
REM 该脚本执行了 generate-locales 命令来生成本地化文件

mkdir .\pages\utest\teacher\appendix

node cli.js generate-locales --folder .\pages\utest\teacher\appendix\ --filename creating-a-new-course.mdx
node cli.js generate-locales --folder .\pages\utest\teacher\appendix\ --filename creating-classes.mdx
node cli.js generate-locales --folder .\pages\utest\teacher\appendix\ --filename adding-students-to-class.mdx
node cli.js generate-locales --folder .\pages\utest\teacher\appendix\ --filename viewing-class-roster.mdx
node cli.js generate-locales --folder .\pages\utest\teacher\appendix\ --filename adding-teacher-to-course.mdx
node cli.js generate-locales --folder .\pages\utest\teacher\appendix\ --filename assigning-teacher-to-class.mdx

endlocal