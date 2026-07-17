---
type: feature
scope: workspace
audience: public
summary: 将官网首页重构为分级玩家门户并接入城镇档案
breaking: false
demo_ready: true
tests:
  - pnpm test
  - pnpm exec tsc -b
  - pnpm run build
  - Playwright production QA at 1440x900 and 390x844
artifacts:
  - src/App.tsx
  - src/pages/
  - src/routing/portal-route.js
  - src/styles/portal.css
  - public/site-data.json
  - docs/portal-v1.md
---

## What changed

- 首页收敛为紧凑 Hero、四个一级入口、一个世界焦点、最多三条更新和准入提示，不再向下平铺全部内容。
- 新增世界、社区、档案、加入四个一级页面，以及凯夏镇、桃花源、天元镇的标准城镇档案；每份档案可继续进入保留自身风格的独立城镇站。
- 建立分级哈希路由、门户内 404 和旧 `#map` 地址兼容；顶栏、移动菜单、页脚和页面标题随当前入口联动。
- 404 与未知城镇使用独立标题和单一 `noindex` 元数据，地图补齐主内容 landmark 与辅助标题。
- `site-data.json` 新增门户内容契约，并在构建期和运行时校验固定入口数量、更新预算、安全 slug、日期和城镇关联。
- 加入克制的页面进场、铁路流动和成就彩蛋；所有关键内容默认可见，减少动态效果设置会关闭非必要动画。

## Why it matters

首页现在承担导航和动态聚合职责，玩家可以先识别世界、社区、档案与加入，再按需要深入城镇、铁路、历史或独立页面。新增内容进入既有门户层级，不再通过不断增加首页区块拉长阅读路径。

## Demo posture / limitations

本版使用静态 JSON 作为内容事实源，服务器状态、注册人数等可观测指标尚未接入 API；玩家自建页面的投稿、审核、托管和脚本隔离也不在本轮范围。本条目不代表这些静态内容已经具备实时 API 或玩家自助发布能力。
