---
type: feature
scope: workspace
audience: public
summary: 新增莫斯科独立城镇官网，集中呈现城市实景、五个区域、社区约定、治理档案与联系入口。
breaking: false
demo_ready: true
tests:
  - node --test scripts/moscow-content.test.js
  - pnpm test
  - pnpm run build
  - git diff --check
artifacts:
  - towns/moscow/index.html
  - towns/moscow/assets/moscow.css
  - towns/moscow/assets/moscow.js
  - towns/moscow/images/*.webp
  - towns/moscow/README.md
  - scripts/moscow-content.test.js
---

## What changed

新增 `https://newnan.city/towns/moscow/` 对应的独立静态页面。页面以镇方提供的十张 Minecraft 实景和四份文字资料为事实源，组织为城市概览、五片区域、可切换实景、七条共同约定、治理方式、完整就职演说与联系入口；同时提供键盘换图、原尺寸对话框、复制号码、导航高亮、轻量视差和 reduced-motion 降级。

十张原始 2560px PNG 按角色分层转为 1600px 或 1920px WebP，发布图片合计约 1.57 MiB，并继续使用 `image-rendering: pixelated`。生产构建只复制页面可达的 13 个文件，不会发布原始 RAR、PNG 或文字资料。

## Why it matters

莫斯科现在拥有与自身建筑风格和社区历史相匹配的正式页面，而不是套用通用城镇模板。玩家可以在一个紧凑页面里先看到城市实景，再按需展开制度与长篇档案；联系方式也不再依赖图片文字。

新增的内容测试固定了五个区域、七条约定、治理事实、联系号码、演说档案、十张实景和两档图片尺寸，防止后续视觉调整误删镇方资料或重新引用未压缩 PNG。

## Demo posture / limitations

页面已通过本地生产构建与桌面、移动、短屏浏览器验收，可以作为发布候选；这不代表代码已推送、GitHub Actions 已运行或正式域名已经上线。本轮没有把莫斯科加入主站城镇图鉴或首页入口，也没有接入动态 API；这些属于后续独立集成任务。
