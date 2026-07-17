---
type: feature
scope: workspace
audience: public
summary: 在首页首屏加入地图、皮肤站和小镇目录，并为本站城镇主页建立统一入口
breaking: false
demo_ready: true
tests:
  - pnpm test
  - pnpm exec tsc -b
  - pnpm run build
  - git diff --check
  - Playwright production QA at 1440x900, 1366x768 and 390x844
artifacts:
  - public/site-data.json
  - scripts/site-data-validator.test.js
  - src/components/Hero.css
  - src/components/Hero.tsx
  - src/components/Navbar.tsx
  - src/pages/WorldPage.tsx
  - src/styles/portal.css
  - src/types/SiteData.ts
  - src/types/site-data-validator.js
  - docs/portal-v3-navigation-motion.md
---

## What changed

- Hero 下方改为地图、皮肤站和小镇目录三个高频快捷入口，桌面与移动端都能在第一屏直接到达。
- 世界页增加 6 个本站城镇主页的统一目录，明确区分已开放与资料整理中状态；3 个富城镇名片和 Wolai 完整名册继续保留。
- Hero 实景图增加受限的 2.5D 指针视差，铁路进入视口时补充短动效；粗指针与减少动态效果设置使用静态回退。
- 新数据字段允许 CDN 过渡期缺失，避免新版脚本遇到旧版 JSON 时白屏；字段存在时严格校验非空内容、固定快捷目标、同源本地路径和富城镇资料一致性。
- 修复桌面导航误用移动端焦点圈、导致 Tab 无法离开主导航的问题；移动端菜单的焦点约束和 Escape 返回仍保留。

## Why it matters

玩家打开首页就能进入最常用的地图和皮肤站，也能从一个稳定入口找到当前仓库实际发布的全部城镇主页。新的空间感和状态反馈不依赖 WebGL 或视频，保留 Minecraft 场景质感的同时控制了首屏体积、移动端负担和无障碍风险。

## Demo posture / limitations

本轮已经通过本地生产预览验收，但尚未提交、推送或部署到 `newnan.city`。城镇目录当前由 `site-data.json` 明确维护，不代表已经建立 Wolai 自动同步；服务器实时指标、真 3D 与视频仍未进入生产代码。`wiki.newnan.city` 的既有连接问题也不在本轮修复范围内。
