---
type: feature
scope: workspace
audience: public
summary: 为桃花源法典增加分级导航、永久链接与实用图片交互
breaking: false
demo_ready: true
tests:
  - node --test scripts/taohuayuan-content.test.js
  - pnpm test
  - pnpm run build
  - git diff --check
  - Playwright local production preview at 1440x900 and 390x844
artifacts:
  - towns/taohuayuan/index.html
  - towns/taohuayuan/assets/css/main.css
  - towns/taohuayuan/assets/js/taohuayuan.js
  - towns/taohuayuan/README.txt
  - scripts/taohuayuan-content.test.js
---

## What changed

- 为六编法典和坐标附表增加桌面章节侧栏、移动端粘性章节菜单，并为二十七条条文提供独立永久链接。
- 顶栏与章节导航会随阅读位置更新；图片支持键盘操作的原图对话框，QQ群号改为可见文本并提供复制反馈。
- 增加内容版本与整理状态，明确页面整理日期不等同于法典生效或坐标核验日期。
- 补齐跳至正文的焦点转移、无脚本链接降级和 reduced motion 行为。
- 为独立页面的 CSS 与 JavaScript 增加资源版本，避免部署后继续命中旧缓存。

## Why it matters

桃花源页面在保留原模板气质的同时，可以承载完整法典而不让玩家迷失在长页面中。玩家能分享具体章节或条文，直接查看交通图原图并复制QQ群号；即使脚本或图片不可用，关键入口仍然存在。

## Demo posture / limitations

本轮提供的是静态内容导航和浏览器端交互，不代表法典、坐标或版本状态已接入自动同步，也不声明页面整理日期为法典生效日期。线上状态仍以 GitHub Actions 成功和正式域名 canary 为准。
