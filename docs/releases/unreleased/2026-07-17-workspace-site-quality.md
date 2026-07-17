---
type: feature
scope: workspace
audience: public
summary: 重构官网体验并引入分层图片与城镇站发布管线
breaking: false
demo_ready: true
tests:
  - pnpm test
  - pnpm run build
  - Playwright production QA at 1440x1000, 1366x768, and 390x844
artifacts:
  - src/components/Hero.tsx
  - src/components/RetroTV.tsx
  - scripts/image-optimizer.js
  - scripts/copy-static-sites.js
  - towns/
  - docs/image-pipeline.md
---

## What changed

- 正式域名、canonical、社交预览、sitemap 与城镇内部链接统一为 `newnan.city`。
- 主站改用真实城镇全景 Hero，重排社区优势，历史改为可访问的年份档案，加入流程归并为三阶段，移动地图改为明确入口。
- 移除强制加载遮罩、自动遮挡气泡、随机飞行历史卡片和重复 JSON/gzip 请求；修复移动菜单焦点、滚动条和 reduced motion。
- 图库增加暂停/继续控制；Hero 遵循审核规则，不再公开服务器连接地址；CI 在构建前运行回归测试。
- 城镇发布校验真实图片格式、尺寸和硬预算；GitHub Pages 部署增加并发互斥，避免旧构建覆盖新版本。
- `site-data.json` 在构建期与浏览器加载时执行同一套嵌套契约校验，异常数据进入可恢复错误态。
- Hero 图片在非地图入口从 HTML 阶段预加载，地图直达页不再产生无效预载；主页补充主内容 landmark，历史 tabs、图库可访问树和动态 reduced motion 行为同步修正。
- 主站图片按用途和内容复杂度处理，验证真实格式并设置质量下限、尺寸下限及硬预算；85 张图片由 13.57 MiB 降至 6.74 MiB。
- 重做云梦泽、未央、凯夏镇、桃花源、天元镇及其新闻/商品站、晨春与城镇评级；生产构建只发布可达依赖，城镇源目录 51.96 MiB 收敛为 2.80 MiB。

## Why it matters

页面首屏、历史阅读、键盘导航和移动地图现在具有确定行为。图片清晰度不再由单一阈值碰运气，伪 WebP、过度压缩和边界文件漏处理都会在构建期被显式识别。城镇源资料可以继续保留，而不会把模板 ZIP、旧字体、脚本和原图全部推到线上。

## Demo posture / limitations

本地生产构建与真实浏览器验收已完成，主站和城镇入口无已知 console error、失败请求、横向溢出或损坏图片。正式发布状态以对应 GitHub Actions 运行和 `newnan.city` 线上核验为准；晨春及未央的四个细分入口仍明确标记为内容筹备中，不虚构未提供资料。
