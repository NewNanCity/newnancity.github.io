# 新南城 OnlineShop 网站项目 - 开发指南

## 📋 项目概述

一个展示新南城（Minecraft服务器）社区建筑、活动和成员的官方网站。包含多个社区主题页面的展示柜和图片库。

**全称**: New NanCity Official Website
**仓库**: NewNanCity/newnancity.github.io
**部署**: GitHub Pages (page 分支)
**框架**: React + TypeScript + Vite

## 🏗️ 技术栈

### 核心框架
- **React 19.2.4** - UI框架
- **TypeScript 5.9.3** - 类型安全
- **Vite 7.3.1** - 快速构建工具
- **React Helmet Async** - SEO和meta标签管理

### 样式和UI
- **CSS3 + PostCSS** - 样式处理
- **Responsive Design** - 移动端适配
- 使用SASS/SCSS进行高级样式定义（在public子项目中）

### 性能优化
- **图片压缩**: process-images.js (Sharp库)
  - 自动转换为WebP格式
  - 缩放至1080p最长边
  - 目标文件大小≤500KB
  - **Cache Busting**: 添加内容哈希后缀解决CDN缓存问题
    - 文件格式: `name-{md5:8}.webp` (例如: `photo-4f70ac8f.webp`)
    - 自动删除未哈希的旧文件
    - 更新site-data.json中的引用路径

- **JavaScript压缩**: Terser (通过Vite)
- **代码分割**: React vendor分离
- **Gzip预压缩**: vite-plugin-compression
  - 自动生成.gz文件供CDN传输
  - gzip压缩率通常60-70%

### 构建和部署
- **包管理**: pnpm 10.4.1
- **CI/CD**: GitHub Actions
  - 自动构建、图片处理、压缩、部署

- **CDN配置文件**:
  - Netlify 配置 (public/_headers)
  - Apache 配置 (public/.htaccess)
  - Nginx 示例配置

## 📁 项目结构

```
MainPage/
├── src/                           # React 源代码
│   ├── components/               # React组件
│   │   ├── Hero.tsx             # 首页英雄区
│   │   ├── Gallery.tsx          # 图片库展示
│   │   ├── Navbar.tsx           # 导航栏
│   │   ├── ParticleCanvas.tsx   # 粒子效果背景
│   │   └── ...其他组件
│   ├── hooks/                   # 自定义React Hooks
│   ├── context/                 # React Context (全局状态)
│   ├── config/                  # 配置文件 (SEO等)
│   ├── types/                   # TypeScript类型定义
│   ├── styles/                  # 全局样式
│   └── main.tsx                 # React入口
│
├── public/                       # 静态资源
│   ├── site-data.json           # 图片和活动数据（被process-images.js处理）
│   ├── pic/                     # 社区图片库（来自process-images.js的source）
│   ├── _headers                 # Netlify CDN配置
│   ├── .htaccess                # Apache配置
│   ├── CharmingSpring/          # 魅力春天社区主题
│   ├── Fctinue/                 # 另一个主题
│   ├── kayshatown/              # kayshatown主题
│   ├── taohuayuan/              # 桃花源主题
│   ├── tyansec/                 # tyansec主题
│   └── chenchun/                # chenchun主题
│
├── scripts/                     # 构建脚本
│   ├── process-images.js        # ★ 图片优化（Sharp库）
│   │   - 转换为WebP格式
│   │   - 等比缩放到1080p
│   │   - 循环压缩到≤500KB
│   │   - 更新site-data.json
│   │
│   ├── compress-json.js         # JSON压缩脚本
│   └── batch_convert.py         # Python图片转换脚本（备用）
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions工作流
│           - Node.js 22环境
│           - tsc编译TypeScript
│           - vite build
│           - 执行process-images.js
│           - 执行compress-json.js
│           - 部署到page分支
│
├── docs/                        # 文档
│   ├── CDN-DEPLOYMENT.md       # CDN部署指南
│   └── 牛腩史书.md             # 项目历史
│
├── vite.config.ts              # Vite构建配置
│   - outDir: ./dist
│   - emptyOutDir: true
│   - copyPublicDir: true
│   - gzip预压缩配置
│   - 资源分类输出（js/css/img/fonts）
│
├── tsconfig.json               # TypeScript编译配置
├── package.json                # 项目依赖和脚本
└── pnpm-lock.yaml             # 依赖锁定文件
```

## 🚀 常用命令

```bash
# 安装依赖
pnpm install

# 本地开发（热加载）
pnpm run dev
# 访问 http://localhost:5173

# 构建生产版本（执行完整流程）
pnpm run build
# 流程：TypeScript编译 → Vite构建 → 图片处理 → JSON压缩

# 预览生产构建
pnpm run preview
```

## 🖼️ 图片处理详解

### 智能压缩策略（2026更新）

**核心原则**：
1. **WebP格式** → 直接复制保持原质量（不重新编码）
2. **其他格式（JPG/PNG等）** → 转换为WebP并智能压缩

**为何采用此策略**：
- 已存在的WebP文件通常经过最优化处理
- 重新编码会导致二次压缩和质量损失
- WebP本身是高效格式，保留原始质量是最佳选择
- 避免过度压缩问题（如原890KB的图片被压到86KB导致模糊）

### 自动化流程
```
public/pic/xxx.jpg (原始)
         ↓
  (vite build 复制)
         ↓
  dist/pic/xxx.jpg (1.67MB)
         ↓
  (process-images.js 处理)
         ↓
  dist/pic/xxx.webp (178KB, 缩放至1080×570)
         ↓
  (GitHub Actions 部署)
         ↓
  GitHub Pages 上的最终文件
```

### 脚本配置参数

**转换格式的压缩参数** (对JPG/PNG等应用):

```javascript
// scripts/process-images.js 中的设置
const MAX_DIMENSION = 1080      // 最长边像素数
const MAX_FILE_SIZE = 400 * 1024 // 目标文件大小（400KB）
const MIN_QUALITY = 50          // WebP最低质量（防止过度压缩）
const MAX_QUALITY = 90          // WebP最高质量

// 动态质量调节（针对大于400KB的非WebP文件）
// - 400-600KB: 质量下限 70
// - 600-900KB: 质量下限 75
// - >900KB:   质量下限 80
```

**WebP文件处理**：
- 无视大小限制，直接复制到dist目录（保持100%原始质量）
- 仅添加内容哈希后缀用于CDN cache busting

### 示例压缩结果
| 原始文件            | 处理后            | 压缩率 |
| ------------------- | ----------------- | ------ |
| 6144×3240, 1711.7KB | 1080×570, 178.0KB | -89.6% |
| 4914×3076, 978.7KB  | 1080×677, 49.7KB  | -94.9% |
| 1024×540, 516.6KB   | 1024×540, 94.0KB  | -81.8% |

## 🌐 网站结构

### 主要页面
- `/` - 首页（React应用入口）
- `/pic/` - 社区图片库（来自site-data.json）
- `/CharmingSpring/` - 魅力春天主题页面
- `/Fctinue/` - Fctinue主题页面
- `/kayshatown/` - kayshatown主题页面
- `/taohuayuan/` - 桃花源主题页面
- `/tyansec/` - tyansec主题页面

### 数据管理
**site-data.json** 包含：
- 图片库数据（path, caption, date等）
- 社区信息
- 事件日期
- 排行榜数据

**process-images.js 会自动更新图片路径**：
- 原: `/pic/photo.jpg`
- 处理后: `/pic/photo.webp`

## 📊 性能指标

### 构建产物大小
| 文件                   | 大小（未压缩） | 大小（gzip） |
| ---------------------- | -------------- | ------------ |
| index.html             | 1.2 KB         | 0.7 KB       |
| site-data.json         | 33.17 KB       | 12.78 KB     |
| react-vendor-[hash].js | 11.21 KB       | 3.97 KB      |
| index-[hash].js        | 221.34 KB      | 69.42 KB     |
| 全部图片（处理后）     | 6.53 MB        | ~2.6 MB*     |

*实际gzip大小取决于图片内容的可压缩性

### 缓存策略
```
index.html: 1小时（频繁更新）
site-data.json: 1小时（动态内容）
assets/*: 1年（通过content-hash版本化）
```

## 🔧 开发流程

### 添加新图片
1. 将图片放到 `public/pic/` 目录
2. 在 `public/site-data.json` 中添加记录
3. 运行 `pnpm run build` 本地测试
4. 检查 `dist/pic/` 中的压缩结果
5. 提交并推送，GitHub Actions会自动处理

### 修改页面样式
1. 编辑 `src/components/*.css` 文件
2. React组件中自动热更新
3. 最终会被Vite打包和压缩

### 更新社区主题页面
1. 编辑 `public/CharmingSpring/`, `public/Fctinue/` 等目录下的HTML
2. 这些是静态页面，不经过React编译，直接复制到dist
3. Gzip压缩会自动应用

## 🐛 常见问题排查

### 构建失败
```bash
# 清理并重新构建
rm -r dist node_modules
pnpm install
pnpm run build
```

### 图片没有压缩
1. 检查 `dist/pic/` 中的文件大小
2. 运行 `node scripts/process-images.js` 手动测试
3. 查看脚本输出，找出哪些文件处理失败

### 网站加载慢
1. 检查浏览器开发者工具 Network 标签
2. 验证图片是否是 WebP 格式，大小应≤200KB
3. 检查是否有未压缩的大文件

### GitHub Pages 更新慢
1.清除浏览器缓存（Ctrl+Shift+R）
2. GitHub Pages 通常需要 1-2 分钟更新
3. 检查 GitHub Actions 工作流是否成功

## 📝 代码规范

### TypeScript
- 使用严格模式：`"strict": true`
- 类型注解必须清晰
- 避免 `any` 类型

### React
- 函数式组件优先
- 使用 React Hooks (useState, useContext, useEffect等)
- Props 应定义 interface 类型

### 文件和命名
- 组件文件用 PascalCase（首字母大写）
- 其他文件用 kebab-case（小写-分隔）
- CSS 模块与组件同名

## 🔐 安全性

### 版本管理
- 使用 pnpm 的 lock 文件确保版本一致
- 定期检查依赖安全漏洞：`pnpm audit`

### 环境变量
- 仅在构建时需要的敏感信息放在 .env 文件
- 不要提交 .env 到版本控制库

## 📚 参考文档

- [Vite 官方文档](https://vite.dev/)
- [React 官网](https://react.dev/)
- [Sharp 图片处理库](https://sharp.pixelplumbing.com/)
- [CDN 部署指南](./docs/CDN-DEPLOYMENT.md)
- [图片优化分析报告](./IMAGE_OPTIMIZATION_REPORT.md)

---

**最后更新**: 2026年2月21日
**维护者**: NewNanCity 开发团队
