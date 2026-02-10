# CDN 部署指南

本项目已为 CDN 分发进行了优化。本文档说明如何在不同 CDN 提供商上部署。

## 📊 构建产物信息

| 文件                               | 大小（未压缩） | 大小（gzip） | 缓存策略 |
| ---------------------------------- | -------------- | ------------ | ------------ |
| `index.html`                       | 1.2 KB         | 0.7 KB       | 1小时        |
| `site-data.json`                   | 12.4 KB        | 4.7 KB       | 1小时（频繁更新） |
| `site-data.json.gz`                | 4.7 KB         | -            | 1小时（频繁更新） |
| `assets/css/style-[hash].css`      | 29.4 KB        | 6.7 KB       | 1年          |
| `assets/js/react-vendor-[hash].js` | 11.2 KB        | 4.0 KB       | 1年          |
| `assets/js/index-[hash].js`        | 199.2 KB       | 62.4 KB      | 1年          |
| 其他 `.gz 预压缩文件`              | 自动生成       | -            | 1年          |

## 🚀 部署方案

### 1. **Vercel**（推荐）

```bash
# 安装 Vercel CLI
pnpm add -D vercel

# 部署
vercel --prod
```

- 自动使用 `vercel.json` 配置
- 原生支持 gzip 压缩
- 支持 HTTP/2 Server Push
- 缓存策略自动应用

### 2. **Netlify**

```bash
# 安装 Netlify CLI
pnpm add -D netlify-cli

# 部署
netlify deploy --prod --dir dist
```

**配置文件**：`public/_headers`（会自动复制到 dist）
- 支持自定义响应头
- 支持 SPA 路由重定向
- 原生 gzip 支持

**部署前确保**：
```bash
# 确保 _headers 文件被复制到 dist
cp public/_headers dist/_headers
```

### 3. **传统 CDN + Apache**

```bash
# 确保 .htaccess 在服务器根目录
cp public/.htaccess dist/.htaccess
```

**服务器要求**：
- Apache 2.4+
- `mod_rewrite` 模块
- `mod_headers` 模块
- `mod_deflate` 模块

**启用模块**（如需要）：
```bash
a2enmod rewrite headers deflate
systemctl restart apache2
```

### 4. **Nginx**

使用 `nginx.conf.example` 的配置：

```bash
# 复制示例配置
cp nginx.conf.example /etc/nginx/sites-available/yourdomain.conf
ln -s /etc/nginx/sites-available/yourdomain.conf /etc/nginx/sites-enabled/

# 修改配置中的 server_name 和 root 路径

# 验证配置
nginx -t

# 重载
systemctl reload nginx
```

### 5. **GitHub Pages**

已在 GitHub Actions 中配置自动部署到 `page` 分支。

**启用 GitHub Pages**：
1. 仓库 Settings → Pages
2. Source → Deploy from a branch
3. Branch → page
4. 保存

提示：若需自定义域名，添加 CNAME 文件到 `dist/` 目录。

## 🔒 缓存策略详解

### HTML 和动态数据（index.html & site-data.json）
```
Cache-Control: public, max-age=3600, must-revalidate
```
- **1小时缓存**：新版本发布后客户端会更新
- **must-revalidate**：过期后必须重新验证而不能使用旧版本
- **适用场景**：
  - HTML 是应用入口，需要及时获取最新版本
  - `site-data.json` 包含服务器状态、事件信息等动态数据，内容会频繁更新

### 静态资源（assets/）
```
Cache-Control: public, max-age=31536000, immutable
```
- **1年缓存**：充分利用浏览器缓存
- **immutable**：内容永不改变（通过 content hash 保证）
- 超大缓存时间，减少 CDN 回源和浏览器重新下载

### Gzip 预压缩文件（.gz）
```
Content-Encoding: gzip
Cache-Control: public, max-age=31536000, immutable
```
- 减少传输大小 60-70%
- 自动选择（支持 gzip 的客户端优先获取 .gz）
- 无需服务端实时压缩，减少 CPU 消耗

## 🔧 常见问题

### Q: 为什么 HTML 只缓存 1 小时？
A: HTML 是应用入口，需要及时获取最新版本。资源（JS/CSS）通过 content hash 版本化，1年缓存也不怕。

### Q: gzip 文件为什么不自动删除原文件？
A: 保留原文件是为了兼容：
- 不支持 gzip 的旧客户端
- 某些 CDN 配置可能不支持 .gz 文件
- 便于手动调试

### Q: 如果 HTML 为新版本，但用户浏览器缓存了旧版本怎么办？
A: 客户端在 1 小时后会自动重新验证（must-revalidate），获取最新版本。

### Q: 可以提高 HTML 缓存时间吗？
A: 不建议。1小时是平衡点：
- 生产故障可在 1 小时内恢复
- 新功能用户 1 小时左右能看到
- 资源已经通过 hash 版本化，不用担心缓存问题

### Q: 为什么 site-data.json 也只缓存 1 小时？
A: `site-data.json` 包含服务器动态数据（在线人数、最新动态等），内容会频繁变化：
- 1小时缓存平衡了 CDN 压力和数据新鲜度
- 用户最多延迟 1 小时看到最新数据
- 可根据实际情况调整缓存时间（在 CDN 配置中修改）

## 📝 部署检查清单

- [ ] 构建产物在 `dist/` 目录
- [ ] `dist/assets/` 中的文件包含 hash
- [ ] `dist/` 中有 `.gz` 预压缩文件
- [ ] CDN 配置文件已复制到 `dist/`（如适用）
- [ ] 验证根域名显示 index.html
- [ ] 验证 `/some-route` 正确路由到 index.html
- [ ] 验证资源返回正确的 Cache-Control 头
- [ ] 验证 gzip 文件自动选择（Content-Encoding: gzip）

## 🌐 验证缓存策略

使用 curl 验证响应头：

```bash
# 验证 HTML 缓存
curl -I https://yourdomain.com/index.html | grep Cache-Control

# 验证资源缓存
curl -I https://yourdomain.com/assets/js/index-*.js | grep Cache-Control

# 验证 gzip 编码
curl -I -H "Accept-Encoding: gzip" https://yourdomain.com/assets/js/index-*.js | grep Content-Encoding
```

## 📚 相关文件

- `vite.config.ts` - Vite 构建配置
- `vercel.json` - Vercel 平台配置
- `public/_headers` - Netlify 响应头配置
- `public/.htaccess` - Apache 服务器配置
- `nginx.conf.example` - Nginx 服务器配置示例
