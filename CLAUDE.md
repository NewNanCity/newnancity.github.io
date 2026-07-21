# 牛腩小镇官网

`newnan.city` 的静态官网：React 19 + TypeScript 5.9 + Vite 7 主站，另含独立 HTML 城镇站。内容和文档首选简体中文。

## 目录索引

- `src/`：React 组件、Context、Hooks、类型与样式。
- `public/site-data.json`：主站内容事实源；`public/pic/`：主站图片源。
- `towns/`：城镇静态站与保留源资产。
- `scripts/`：图片优化、城镇发布、JSON 压缩及测试。
- `docs/`：详细文档；未发布变更在 `docs/releases/unreleased/`。

## 常用命令

```bash
pnpm run dev
pnpm test
pnpm run build
pnpm run preview
```

Node.js 22+，pnpm 10.4.1。完整构建顺序和线上核验见 `docs/CDN-DEPLOYMENT.md`。

## 核心决策

- 正式域名统一为 `https://newnan.city/`。
- 主站采用分级哈希路由：首页按 `homeFeedIds` 聚合内容，顶栏提供派生式旅行面板，世界页承接编辑式 2.5D 城镇图鉴；详见 `docs/portal-v2-aggregation.md`、`docs/portal-v3-navigation-motion.md` 和 `docs/portal-v4-world-atlas-content.md`。
- 主站只从 `public/site-data.json` 取内容；保持字段向后兼容。
- 图片按用途、复杂度、质量下限和软/硬预算处理；源文件只读，详见 `docs/image-pipeline.md`。
- `towns/` 生产构建只复制 HTML 与 `site-data.json` 可达依赖；缺失本地引用直接失败。
- Minecraft 场景保留 `image-rendering: pixelated`。
- 地图在桌面与移动端都通过主站 `#/map` 内嵌 iframe；不修改外部地图服务。

## 编码与验收

- TypeScript strict，避免 `any`；遵循现有组件和 CSS 模式。
- 不新增依赖，除非标准库和现有工具无法合理完成且已确认维护状态。
- 每个行为变更补测试；至少运行 `pnpm test`、`pnpm run build`、`git diff --check`。
- UI 改动必须检查真实生产预览、桌面/移动布局、console/network、键盘焦点与 reduced motion。
- 完成有意义改动后新增 `docs/releases/unreleased/*.md`，TODO 只保留进行中任务。

当前开发状态见 `TODO.md`。
