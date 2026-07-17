---
type: feature
scope: workspace
audience: public
summary: 增加全局旅行面板、可扩展内容目录和六城 2.5D 世界图鉴
breaking: false
demo_ready: true
tests:
  - pnpm test
  - pnpm exec tsc -b
  - pnpm run build
  - git diff --check
  - Playwright production QA at 1440x900, 800x700 and 390x844
  - Playwright V3 data interception, keyboard, coarse pointer and reduced motion QA
  - Playwright embedded map QA at 1440x900 and 390x844
  - Historical c4d7c88 V2 site-data validator smoke
artifacts:
  - public/site-data.json
  - scripts/home-feed-state.test.js
  - scripts/site-data-images.js
  - scripts/site-data-images.test.js
  - scripts/site-data-validator.test.js
  - scripts/travel-targets.test.js
  - src/components/HomeLiveFeed.tsx
  - src/components/Map.css
  - src/components/Map.tsx
  - src/components/Navbar.tsx
  - src/components/SEO.tsx
  - src/components/TravelPanel.tsx
  - src/components/WorldAtlas.tsx
  - src/navigation/travel-targets.js
  - src/pages/WorldPage.tsx
  - src/state/home-feed-state.js
  - src/types/SiteData.ts
  - src/types/site-data-validator.js
  - docs/CDN-DEPLOYMENT.md
  - docs/portal-v4-world-atlas-content.md
---

## What changed

- 顶栏指南针打开可搜索的原生旅行面板，从门户、城镇、工具和已登记页面来源派生 20 个去重入口；面板支持键盘焦点环、Escape 返回和移动端独立滚动。
- 首页 feed 扩展为内容目录，`homeFeedIds` 控制首页的 5 至 8 条引用；条目可关联开放城镇或审核后的页面来源，并在有真实日期时显示来源与发布日期。
- 世界页第一屏改为 6 座城镇可直达的编辑式 2.5D 图鉴；桌面提供轻量视差和城镇封面预览，769 至 900px 使用三列平面布局，手机使用两列平面布局。
- 所有地图入口继续使用站内 `#/map`，移动端与桌面端现在共用主站内 iframe，不再把玩家送到额外打开的地图页面；hash 路由切换时页面标题也会同步更新。
- 图鉴背景纳入现有分层图片管线、哈希改写与构建校验；V3 数据缺少新增字段时继续显示旧 Hero、城镇目录、交通段和完整旧 feed。

## Why it matters

玩家可以从任意页面快速找到地图、皮肤站和城镇主页，也能在进入独立城镇站前先看见更完整的世界入口。内容目录与首页引用解耦后，后续增加经过审核的城镇或玩家内容不再迫使首页无限变长；所有能力仍是静态、可验证且无新增运行时依赖的。

## Demo posture / limitations

本轮已通过本地生产预览；只有对应 GitHub Actions 成功且正式域名完成核验后才视为上线。图鉴节点只表达编辑层次，不代表真实坐标、线路或行政边界；准确位置仍以实时地图为准。内容来源仍由 `site-data.json` 人工审核维护，不代表玩家可在主站同源执行脚本，也不包含服务器状态、在线人数、个性化、真 3D、视频或后端 API。
