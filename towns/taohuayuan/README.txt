桃花源静态站
============

index.html 是桃花源的单页城镇志，包含小镇介绍、桃花源律和桃花源简史三个固定锚点。
页面样式由 assets/css/main.css 直接提供，不依赖构建步骤或第三方脚本。

图片策略：
- 页面优先加载 images/*.webp。
- 原始 JPG/PNG 作为源图或 picture 回退保留，不删除、不覆盖。
- 地图截图采用较高质量 WebP，普通场景图采用平衡质量 WebP。
- last.jpg 继续直接使用原 JPEG；同等可读性下转换 WebP 没有体积收益。

本地检查时，从仓库根目录启动静态服务器后访问 /towns/taohuayuan/。
