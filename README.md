# 牛腩小镇官网

牛腩小镇（NewNanCity）的静态官网，正式域名为 [newnan.city](https://newnan.city/)。主站使用 React、TypeScript 与 Vite，城镇站点保留为独立静态 HTML。

## 本地开发

要求 Node.js 22+ 与 pnpm 10.4.1。

```bash
pnpm install --frozen-lockfile
pnpm run dev
pnpm test
pnpm run build
pnpm run preview
```

- `pnpm test`：验证图片策略和城镇站可达依赖发布。
- `pnpm run build`：依次执行 TypeScript、Vite、城镇站发布、图片处理和 JSON 压缩。
- `pnpm run preview`：预览 `dist/` 中的真实生产产物。

## 目录

```text
src/                      React 主站
public/site-data.json     主站内容事实源
public/pic/               主站图片源文件
towns/                    城镇静态站与保留源资产
scripts/                  构建期图片及静态站发布脚本
docs/                     架构、部署与历史文档
docs/releases/unreleased/ 未发布变更事实源
```

## 关键约定

- 正式 URL 一律使用 `https://newnan.city/`。
- 主站采用“首页聚合 → 一级入口 → 城镇名片 → 独立城镇站”的分层结构；动态播报、生态入口与首页内容预算见 [首页动态聚合 V2](docs/portal-v2-aggregation.md)。
- 主站内容从 `public/site-data.json` 读取，不在组件里复制业务文案。
- `public/pic/` 是只读源目录；优化图片、哈希文件名与改写后的 JSON 只生成到 `dist/`。
- 图片按页面用途和内容复杂度分层，已合规的真实 WebP 才会原样保留；具体策略见 [图片管线](docs/image-pipeline.md)。
- `towns/` 可以保留原图与旧模板作为源资料，但生产构建只发布 HTML 实际可达的依赖；缺失本地引用会直接让构建失败。
- Minecraft 场景图保留 `image-rendering: pixelated`，这是视觉语言的一部分。
- HTTP gzip 只压缩 HTML、CSS、JS、JSON 等文本响应，不替代 JPEG、PNG、WebP 的图片编码。

## 页面

- `/#/`：动态聚合首页
- `/#/world`：世界、城镇与铁路入口
- `/#/world/towns/kaysha`：凯夏镇城镇名片；桃花源与天元镇使用各自 slug
- `/#/community`：社区新闻、玩家作品与公共平台
- `/#/archive`：历史、风光与牛腩精神
- `/#/join`：入服流程
- `/#/map`：牛腩实时地图；旧地址 `/#map` 保持兼容，移动端提供外部地图入口
- `/towns/town-rate.html`：城镇评级
- `/towns/CharmingSpring/`：云梦泽
- `/towns/Fctinue/`：未央
- `/towns/kayshatown/`：凯夏镇
- `/towns/taohuayuan/`：桃花源
- `/towns/tyansec/`：天元镇
- `/towns/tyansec/news/`：天元新闻
- `/towns/tyansec/shop/`：天元商品

## 发布

`.github/workflows/deploy.yml` 在 `main` 或 `master` 推送后运行完整构建，并把 `dist/` 发布到 `page` 分支。部署与缓存检查见 [CDN 部署指南](docs/CDN-DEPLOYMENT.md)。

发布前至少执行：

```bash
pnpm test
pnpm run build
git diff --check
```

前端改动还必须在生产预览中检查桌面与移动视口、console、失败请求、横向溢出、键盘焦点和实际图片解码。
