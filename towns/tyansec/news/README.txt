天元新闻静态站
==============

index.html 展示天元镇新闻时间线与截至 2021-02-27 的成员列表。页面不依赖 jQuery、外部字体或构建步骤。

图片策略：

- 新闻场景：保持原始分辨率，以高质量有损 WebP 发布。
- 成员缩略图：按页面最大显示密度缩到 720px 宽，使用较高质量和完整色度采样，减少白底角色边缘色散。
- fulls/ 原始成员图只在用户打开详情时请求，继续保留原始 JPEG。
- 原始 JPG/PNG 不删除。

本地预览：在仓库根目录运行 `python -m http.server 4178 --bind 127.0.0.1`，打开 `/towns/tyansec/news/`。

Original template by HTML5 UP, licensed under CCA 3.0. See LICENSE.txt.
