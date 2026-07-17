---
type: feature
scope: workspace
audience: public
summary: 将首页升级为动态内容聚合，并补齐牛腩生态快捷入口
breaking: false
demo_ready: true
tests:
  - pnpm test
  - pnpm exec tsc -b
  - pnpm run build
  - Playwright production QA at 1440x900 and 390x844
artifacts:
  - src/components/HomeLiveFeed.tsx
  - src/pages/PortalHome.tsx
  - src/styles/portal.css
  - public/site-data.json
  - docs/portal-v2-aggregation.md
---

## What changed

- 首页原有单一焦点和三条更新被固定高度的动态播报取代，聚合新闻、城镇、活动、回忆和风景六条内容碎片；当前内容自动轮换，其他标题始终可见。
- 播报支持手动选择与暂停，鼠标悬停、键盘聚焦、页面不可见和减少动态效果设置都会停止轮换。
- 首页增加小镇名册、牛腩百科、皮肤与账号、NewNan ID 四个常用入口，世界页同时提供 Wolai 完整名册入口。
- “有你，才叫牛腩”和三条社区价值回到首页下方；安全准入、玩家页面计划、隔离方案、标准档案等内部措辞改为面向玩家的温暖表达。
- 聚合条目和生态入口进入站点数据契约；聚合图片继续由现有分层图片管线校验、压缩和哈希改写。

## Why it matters

访客不必先进入某个二级页面，就能在首页看到牛腩正在发生的事、值得认识的城镇和过去的共同记忆。常用生态网站不再藏在更多菜单或页脚深处，同时首页仍由固定模块组成，不允许随着内容增加无限变长。

## Demo posture / limitations

当前播报内容由 `site-data.json` 维护，表示动态编排而非实时数据。Wolai 城镇表可公开读取，但其接口未文档化、字段 ID 不稳定且缺少首页展示字段，因此本轮只提供完整名册入口与正式同步契约，不把抓取接入生产构建。`wiki.newnan.city` 在验收时仍出现连接关闭或超时，需要外部服务恢复后复验；外部入口的可用性由各自服务负责。
