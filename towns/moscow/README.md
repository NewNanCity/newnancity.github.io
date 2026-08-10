# 莫斯科城镇官网

`index.html` 是莫斯科的独立静态城镇页，正式地址为 `https://newnan.city/towns/moscow/`。页面不依赖主站 React，也不依赖第三方脚本或外部字体。

## 内容约定

- 页面依据镇方提供的 `莫斯科网页.rar` 整理；压缩包是编辑源资料，不是生产构建依赖，也不随页面发布。
- 镇史、五个区域、现任镇长、治理方式、离镇资产期限、联系方式与 2026 年 7 月 18 日演说均保留原始事实。
- “七大不”在正文中整理为面向玩家的七条共同约定：不改变约束范围，但把容易伤人的口语改成尊重、清楚、可执行的公开表达。
- 完整就职演说以折叠档案呈现，默认收起以控制页面长度，正文内容不因折叠而依赖 JavaScript。

## 文件结构

```text
index.html             页面内容与语义结构
assets/moscow.css      视觉、响应式与 reduced-motion 降级
assets/moscow.js       实景切换、大图、复制、导航与轻量动效
images/*.webp          从镇方 PNG 截图生成的发布图片
```

修改 CSS 或 JavaScript 后，需同步递增 `index.html` 中资源查询参数，避免正式域名继续命中旧缓存。

## 图片策略

- 首屏图使用 1920px、WebP Q90，优先保留暗部建筑轮廓与灯光边缘。
- 重点城市实景使用 1920px、WebP Q88-Q90；画面密度较低或只在图集中展示的档案图使用 1600px、WebP Q88。
- 十张发布图合计约 1.57 MiB；原始十张 PNG 合计约 53 MiB。页面不引用原始 PNG。
- 所有 Minecraft 实景统一保留 `image-rendering: pixelated`。
- 原图与发布图对应关系由语义文件名表达；重新生成时必须从镇方原始 PNG 开始，不应反复转码已有 WebP。

## 交互与降级

- 实景缩略图、前后按钮和键盘左右方向键共用同一选图状态；点击主图可打开原尺寸对话框。
- 群号与镇长 QQ 均保留可选择文本，并提供复制按钮；剪贴板 API 不可用时回退到本地复制方式。
- 无 JavaScript 时，首张实景、全部缩略图链接、完整演说和联系号码仍可直接访问。
- 页面尊重 `prefers-reduced-motion`，关闭滚动揭示、视差与过渡动效。

## 验证

```bash
node --test scripts/moscow-content.test.js
pnpm test
pnpm run build
git diff --check
```

本地启动开发服务器后访问 `/towns/moscow/`；生产验收应从 `dist/towns/moscow/` 检查真实发布依赖。
