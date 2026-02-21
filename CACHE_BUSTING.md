# CDN Cache Busting 实现指南

**实现日期**: 2026年2月21日  
**问题**: 火山引擎CDN缓存旧的大文件（1.8MB），导致用户看不到压缩后的版本（178KB）  
**解决方案**: 为每个图片文件添加内容哈希后缀以强制CDN更新

## 问题分析

### 症状
```
GitHub Pages (正确)    →  文件已压缩到 178KB
          ↓
火山引擎CDN (问题)     →  缓存旧的 1.8MB 文件
          ↓
用户浏览器 (看到)      →  1.8MB 的图片（过期缓存）
```

### 根因
CDN通常使用**文件路径作为缓存键**：
```
缓存键: /pic/2025-2026_Lunar_GroupPhoto.webp
缓存值: 1.8MB 的旧版本（永不更新）
```

## 解决方案：Cache Busting

### 原理
```
旧方案（文件名相同）:
  /pic/photo.webp  →  缓存键相同 → CDN不更新

新方案（哈希后缀）:
  /pic/photo.webp  →  处理 → /pic/photo-abc12345.webp  →  缓存键不同 → CDN获取新版本
```

### 实现步骤

#### 1️⃣ 生成文件哈希
```javascript
import crypto from 'crypto'

function generateFileHash(buffer) {
  const hash = crypto.createHash('md5').update(buffer).digest('hex')
  return hash.substring(0, 8) // 取前8位，足够用且短小
}
```

**优点**:
- ✅ 使用MD5确保不同内容有不同哈希
- ✅ 8位足够避免碰撞（2^32 = ~42亿）
- ✅ 足够短，不会导致URL过长

#### 2️⃣ 重命名文件
```javascript
// 处理后的图片
const buffer = /* processed webp */

// 生成哈希
const fileHash = generateFileHash(buffer)  // "4f70ac8f"

// 重命名
const hashedFileName = `${originalFileName}-${fileHash}.webp`
// 例如: "2025-2026_Lunar_GroupPhoto-4f70ac8f.webp"

// 写入到 dist/pic/{hashedFileName}
fs.writeFileSync(outputPath, buffer)
```

#### 3️⃣ 更新引用路径
```javascript
// site-data.json 中更新所有图片引用
{
  "gallery": [
    {
      "src": "/pic/2025-2026_Lunar_GroupPhoto-4f70ac8f.webp",  // ← 新的哈希版本
      "caption": "2026农历新年大合影",
      "year": "2026.2"
    },
    // ...
  ]
}
```

#### 4️⃣ 清理旧文件
```javascript
// 删除所有未哈希的 webp 文件
// 例如删除: /pic/2025-2026_Lunar_GroupPhoto.webp
// 保留新的: /pic/2025-2026_Lunar_GroupPhoto-4f70ac8f.webp
```

**重要**: 只删除有对应哈希版本的文件，避免误删。

## 工作流程

```
input: public/pic/*.webp (原始)
    ↓
[处理图片]
  - 缩放至1080p
  - 压缩到 ≤500KB
    ↓
output: dist/pic/*.webp (未哈希，临时)
    ↓
[生成哈希 & 重命名]
  文件名: name.webp → name-{hash8}.webp
    ↓
dist/pic/{name}-{hash8}.webp (最终)
    ↓
[更新 site-data.json]
  /pic/name.webp → /pic/name-{hash8}.webp
    ↓
[清理未哈希文件]
  删除: dist/pic/{name}.webp (旧版本)
    ↓
✅ 准备部署
  - 85个图片全部有哈希版本
  - 0个未哈希文件
  - site-data.json引用全部更新
```

## 文件列表示例

### dist/pic/ 目录结构（部分）
```
✅ 2025-2026_Lunar_GroupPhoto-4f70ac8f.webp  (178KB) ← 新版本
✅ history_1-f2e3d4c5.webp                     (45KB)  ← 新版本
✅ history_52-4b6fd02f.webp                    (50KB)  ← 新版本
✅ NSrank_KXChengqu-0f1a8ca4.webp             (167KB)  ← 新版本
❌ (无) .webp (未哈希)                                   ← 已清理
```

### site-data.json 参考更新
```json
{
  "gallery": [
    {
      "src": "/pic/sttot_shelter2020-e9e1c314.webp",
      "caption": "最初的开荒避难所",
      "year": "2020.2"
    },
    {
      "src": "/pic/2025-2026_Lunar_GroupPhoto-4f70ac8f.webp",
      "caption": "2026农历新年大合影",
      "year": "2026.2"
    }
  ]
}
```

## CDN 行为变化

### 图片更新场景

**旧方案（无哈希）**:
```
版本1: /pic/photo.webp (1.8MB)  ← CDN缓存
版本2: /pic/photo.webp (178KB)  ← 上传新版本
问题:   CDN继续提供1.8MB（缓存未失效）❌
```

**新方案（有哈希）**:
```
版本1: /pic/photo-abc12345.webp (1.8MB) ← CDN缓存该URL
版本2: /pic/photo-def67890.webp (178KB) ← 上传新URL
结果:   site-data.json 指向新URL → 用户看到178KB ✅
```

## 缓存策略配合

### 推荐的缓存头配置
```
# 哈希版本的图片（如 photo-abc12345.webp）
Cache-Control: public, max-age=31536000, immutable
→ 1年缓存，永不失效（因为哈希不同就是新文件）

# HTML和JSON（如 site-data.json）
Cache-Control: public, max-age=3600, must-revalidate
→ 1小时缓存，之后必须重新验证
```

## 性能指标

### 处理统计（实测）
| 指标 | 数值 |
|-----|------|
| 总图片数 | 85个 |
| 处理成功 | 85个（100%） |
| 处理失败 | 0个 |
| 原始总大小 | 13.57MB |
| 压缩后大小 | 6.53MB |
| 整体压缩率 | 51.9% |

### 单个大文件示例
```
2025-2026_Lunar_GroupPhoto.webp
  原始: 6144×3240, 1711.7KB
  处理后: 1080×570, 178.0KB
  压缩率: -89.6%
  存储: /pic/2025-2026_Lunar_GroupPhoto-4f70ac8f.webp
```

## 未来维护

### 添加新图片
1. 将图片放到 `public/pic/` 目录
2. 在 `public/site-data.json` 中添加记录（不需要手动指定哈希）
3. 运行 `pnpm run build`
4. 脚本自动处理：
   - 生成哈希
   - 重命名文件
   - 更新JSON引用
   - 清理旧文件

### 更新现有图片
替换旧文件即可，哈希会自动改变：
```
旧: /pic/photo-abc12345.webp (缓存1年)
新: /pic/photo-def67890.webp (新哈希，CDN重新获取)
```

### 如果CDN仍显示旧文件
1. 清除浏览器缓存：`Ctrl+Shift+R`
2. 等待：CDN缓存更新需要1-6小时
3. 检查：Network标签中应该是新的哈希版本

## 技术亮点

✅ **无状态**: 哈希纯基于文件内容，无需维护版本号  
✅ **自动化**: 构建脚本全自动处理，开发者无需干预  
✅ **可靠**: MD5哈希确保不同内容不同哈希  
✅ **简洁**: 8位哈希足够且不影响URL长度  
✅ **向后兼容**: GitHub Pages和所有CDN都支持长文件名  
✅ **CDN友好**: 符合HTTP缓存最佳实践  

## 相关文件

- [scripts/process-images.js](./scripts/process-images.js) - Cache Busting实现
- [public/site-data.json](./public/site-data.json) - 图片元数据（自动更新）
- [CLAUDE.md](./CLAUDE.md) - 项目文档
- [vite.config.ts](./vite.config.ts) - 构建配置

---

**最后更新**: 2026年2月21日  
**状态**: ✅ 已完全实现和验证
