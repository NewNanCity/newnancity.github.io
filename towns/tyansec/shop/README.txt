天元商品静态站
==============

index.html 直接展示商品目录、非卖品、合作伙伴与原材料提供信息，不再依赖模板模态框、jQuery 或外部字体。

图片策略：

- 工业区首屏复用天元镇高质量场景 WebP。
- 带游戏文字的小型物品截图使用无损 WebP，不缩放，保护像素与 NBT 字样。
- 大尺寸角色截图按实际展示密度缩到 960px，使用高质量有损 WebP。
- 原始 JPG/PNG 全部保留。

本地预览：在仓库根目录运行 `python -m http.server 4178 --bind 127.0.0.1`，打开 `/towns/tyansec/shop/`。

Original template by HTML5 UP, licensed under CCA 3.0. See LICENSE.txt.
