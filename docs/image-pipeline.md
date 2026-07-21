# 图片处理管线

## 目的

图片策略同时控制清晰度、体积和可追溯性。它不以单一文件大小阈值粗暴处理所有资产，也不会因为扩展名是 `.webp` 就假设文件内容正确。

HTTP gzip 与图片压缩是两条独立链路：

- gzip/Brotli 面向 HTML、CSS、JavaScript、JSON 等文本响应。
- JPEG、PNG、WebP 已使用专用图像编码，不能依赖 GitHub Actions 的 gzip 插件解决尺寸、质量或伪格式问题。
- 浏览器始终请求规范资源路径；禁止客户端先请求 `.gz` 再自行解压。

## 主站策略

`scripts/process-images.js` 读取 `public/pic/`，通过 Sharp 检查真实格式、尺寸、透明度和熵，再调用 `scripts/image-optimizer.js`。所有结果只写入 `dist/pic/`。

### 用途层

| 用途 | 最长边上限 | 最长边下限 | 软预算 | 硬预算 | 首选质量 | 质量下限 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `gallery` | 1920 | 1280 | 420 KiB | 650 KiB | 88 | 78 |
| `archive` | 1600 | 960 | 300 KiB | 480 KiB | 86 | 76 |

Hero 和 Gallery 引用属于 `gallery`，其余图片属于 `archive`。

### 内容层

| 内容类别 | 判定 | 质量 | 预算倍率 | 编码倾向 |
| --- | --- | --- | ---: | --- |
| `graphic` | 透明或低熵 | 92，最低 86 | 1.25 | drawing、near-lossless |
| `detailed` | 高熵细节图 | 90，最低 82 | 1.15 | photo |
| `standard` | 其他图片 | 继承用途层 | 1.00 | picture |

### 决策顺序

1. 读取图片元数据与像素统计，扩展名不参与真实格式判断。
2. 仅当输入确实是 WebP、未超过软预算、尺寸不超过用途上限的 1.25 倍时原样保留。
3. 从首选质量开始，每次降低 2；达到软预算立即接受。
4. 满足硬预算但未满足软预算的候选只作为 fallback，不立即选用低质量结果。
5. 最长边按 0.85 倍逐级降低但不越过用途下限，继续寻找更高质量的软预算候选。
6. 所有尺寸都没有软预算候选时，才使用最先记录的高分辨率、高质量硬预算 fallback。
7. 在质量和尺寸下限仍无法满足硬预算时构建失败，不静默继续降质。

人工例外只能加入 `scripts/process-images.js` 的 `IMAGE_OVERRIDES`，并要求先完成视觉审查、写明理由和移除条件。

### 构建产物

- 文件名：`<source-name>-<content-hash>.webp`
- 数据引用：构建期改写 `dist/site-data.json`
- 报告：`dist/image-processing-report.json`
- 校验：所有输出必须能由 Sharp 解码为真实 WebP，引用必须存在，体积不能超过硬预算

## 城镇站策略

`towns/` 中的页面由各站依据用途生成 WebP：场景图保留细节，角色或透明图采用更高质量或无损模式，小图在重编码无收益时保留 JPEG。

源图和旧模板可以留在仓库用于追溯，但不会因此进入生产包。`scripts/copy-static-sites.js` 同时把所有 HTML 入口和 `public/site-data.json` 中的 `/towns/` 路径作为发布根，递归收集本地 HTML、CSS、JavaScript、图片和字体引用。主站城镇名片所用图片即使不再出现在城镇正文中，也不会被误删：

- 未引用的原图、Sass、模板 ZIP、旧字体与脚本不发布。
- HTML 或 `site-data.json` 的任一本地页面、资产引用缺失，或引用通过符号链接越界时构建失败。
- 可达栅格图必须能解码，扩展名与真实格式一致，并满足内容类别对应的尺寸和硬预算。
- HTML 优先直接引用 WebP；功能性图片采用无损 WebP，原始 PNG 只作仓库源图时不进入发布包。

## 验证

```bash
pnpm test
pnpm run build
```

构建后检查：

```powershell
Get-Content dist/image-processing-report.json
Get-ChildItem dist/towns -Recurse -File | Sort-Object Length -Descending
```

最终仍需在浏览器 Network 中确认实际选中的图片 URL、响应状态、解码尺寸和视觉清晰度。
