---
type: feature
scope: workspace
audience: public
summary: 按新方案更新桃花源新人指南、法典与实用坐标
breaking: false
demo_ready: true
tests:
  - pnpm test
  - pnpm run build
  - git diff --check
  - Playwright production QA at 1440x900 and 390x844
artifacts:
  - towns/taohuayuan/index.html
  - towns/taohuayuan/assets/css/main.css
  - towns/taohuayuan/images/arrival-portal.png
  - towns/taohuayuan/images/arrival-portal.webp
  - towns/taohuayuan/images/metro-line-3.png
  - towns/taohuayuan/images/metro-line-3.webp
  - towns/taohuayuan/images/join-qq.png
  - towns/taohuayuan/images/join-qq.webp
  - towns/taohuayuan/README.txt
  - scripts/taohuayuan-content.test.js
  - scripts/copy-static-sites.js
  - scripts/copy-static-sites.test.js
  - README.md
  - CLAUDE.md
  - docs/CDN-DEPLOYMENT.md
  - docs/image-pipeline.md
---

## What changed

- 保留桃花源原有单页模板和 Minecraft 场景视觉，将正文替换为新人指南、六编二十七条《桃花源法典》以及重要设施和景点坐标表。
- 顶栏移除“桃花源简史”，把“桃花源律”改为“桃花源法典”；品牌、Hero 和各级标题不再附加英文副标题。
- 从新版内容文档引入两张交通示意图和 QQ 群二维码，以无损 WebP 作为生产格式并保留原始 PNG 源图。
- 城镇发布依赖图新增 `site-data.json` 根节点，避免城镇正文删除图片后误删主站城镇名片仍在使用的资源。

## Why it matters

玩家进入桃花源官网后可以直接查看到达方式、城镇理念、完整法典和可使用的游戏内坐标，不再需要从过时的简史和旧成员信息中寻找当前资料。功能性图片保持逐像素清晰，同时未引用的 PNG 不进入生产包；主站和城镇子站对同一图片的依赖也由构建期统一校验。

## Demo posture / limitations

本轮是静态内容更新，不代表法典、坐标或 QQ 群信息已接入自动同步；后续内容变化仍需更新事实源并重新发布。当前仅完成本地生产预览，只有对应 GitHub Actions 成功且正式域名核验通过后才视为上线。
