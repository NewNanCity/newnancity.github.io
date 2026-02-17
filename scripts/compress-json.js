/**
 * 构建后脚本：压缩 dist/site-data.json
 * - 精简 JSON（移除空格和换行）
 * - 生成 .gz 版本供浏览器使用
 *
 * 注意：此脚本只处理 dist 目录中的文件（构建后）
 * public 中的源文件保持原样，不修改
 */

import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const jsonPath = path.join(__dirname, '../dist/site-data.json')
const gzipPath = path.join(__dirname, '../dist/site-data.json.gz')

try {
  // 检查 dist 目录是否存在
  if (!fs.existsSync(jsonPath)) {
    console.error(
      '❌ dist/site-data.json 不存在，请先运行 "pnpm run build" 构建项目'
    )
    process.exit(1)
  }

  // 读取原始 JSON
  const rawData = fs.readFileSync(jsonPath, 'utf8')
  const data = JSON.parse(rawData)

  // 精简 JSON（移除空格和换行）
  const minified = JSON.stringify(data)

  // 写入精简版本
  fs.writeFileSync(jsonPath, minified, 'utf8')

  // 生成 Gzip 版本
  const gzipBuffer = zlib.gzipSync(minified, { level: 9 })
  fs.writeFileSync(gzipPath, gzipBuffer)

  // 计算压缩率
  const originalSize = Buffer.byteLength(rawData)
  const minifiedSize = Buffer.byteLength(minified)
  const gzipSize = gzipBuffer.length

  console.log('✅ JSON 压缩完成:')
  console.log(`   原始大小:    ${(originalSize / 1024).toFixed(2)} KB`)
  console.log(`   精简后:      ${(minifiedSize / 1024).toFixed(2)} KB (-${((1 - minifiedSize / originalSize) * 100).toFixed(1)}%)`)
  console.log(`   Gzip 后:     ${(gzipSize / 1024).toFixed(2)} KB (-${((1 - gzipSize / originalSize) * 100).toFixed(1)}%)`)
  process.exit(0)
} catch (error) {
  console.error('❌ JSON 压缩失败:', error.message)
  process.exit(1)
}
