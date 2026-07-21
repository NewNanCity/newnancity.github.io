# `newnan.city` 部署与缓存

## 当前事实源

- 正式域名：`https://newnan.city/`
- 托管：GitHub Pages
- 工作流：`.github/workflows/deploy.yml`
- 发布分支：`page`
- 发布目录：`dist/`

推送到 `main` 或 `master` 后，GitHub Actions 使用 Node.js 22 与 pnpm 10.4.1 执行 `pnpm run build`，再把生产产物发布到 `page` 分支。发布和推送属于线上副作用，必须由维护者明确授权。

工作流以分支为 concurrency group，并取消尚未完成的旧任务，避免较旧构建晚完成后覆盖新版本。

## 构建顺序

```text
TypeScript 检查
  -> Vite 主站构建
  -> 城镇 HTML 与主站内容数据的可达依赖发布
  -> 主站图片分层优化与引用改写
  -> site-data.json 精简和 gzip 产物
```

城镇站复制必须发生在 Vite 清理 `dist/` 之后。主站图片处理必须发生在 Vite 复制 `public/` 之后。

## 压缩边界

`vite-plugin-compression` 和 `compress-json.js` 会生成 `.gz` 文件，但是否直接提供预压缩文件取决于托管平台。GitHub Pages/CDN 通常针对原始 URL 协商传输压缩；浏览器不得显式请求 `.gz` 文件。

图片不依赖 gzip。主站图片由 Sharp 管线生成 WebP，城镇站发布经过可达依赖筛选，详见 [图片处理管线](image-pipeline.md)。

## 缓存

- `assets/**` 与 `pic/*-<hash>.webp` 可以长期缓存，因为文件名包含内容哈希。
- `index.html`、`site-data.json`、`sitemap.xml` 和城镇 HTML 应保持较短缓存并允许重新验证。
- `public/_headers` 与 `public/.htaccess` 会进入 `dist/`，但 GitHub Pages 不读取 Apache 或 Netlify 专用配置；实际响应头以线上 `curl` 结果为准。

## 发布前验证

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm run preview
git diff --check
```

生产预览至少检查：

- `/` 在 1440x1000、1366x768、390x844 无横向溢出。
- 主 CTA 在移动首屏可见，下一内容带有露出。
- 移动菜单关闭时无可聚焦链接，打开后焦点进入菜单，Escape 回到按钮。
- 历史年份支持键盘切换，图库在 reduced motion 下不自动轮播。
- `/#map` 与 `/#/map` 在桌面、平板和移动端都加载主站内地图 iframe。
- 所有 `/towns/**` 入口返回 200，图片无解码失败，本地链接无缺失。
- console、page error 和失败请求为 0。

## 线上核验

```bash
curl -I https://newnan.city/
curl -I https://newnan.city/site-data.json
curl -I https://newnan.city/towns/tyansec/
curl -I -H "Accept-Encoding: gzip" https://newnan.city/assets/js/<hashed-file>.js
```

检查 canonical、`sitemap.xml`、真实 `Content-Encoding`、`Cache-Control` 与图片 URL。不要根据仓库中存在 `.gz` 文件推断 CDN 一定会自动选择它。
