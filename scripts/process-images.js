/**
 * 构建时图片处理脚本
 * - 将图片转换为 WebP 格式
 * - 智能压缩到最多 1080P（等比缩放，最长边）
 * - 保持文件大小在 500KB 以下
 * - 更新 site-data.json 中的图片路径
 */

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '../public')
const distDir = path.join(__dirname, '../dist')
const picSourceDir = path.join(publicDir, 'pic')
const picDistDir = path.join(distDir, 'pic')
const siteDataPath = path.join(distDir, 'site-data.json')

const MAX_DIMENSION = 1080 // 最长边
const MAX_FILE_SIZE = 500 * 1024 // 500KB
const MIN_QUALITY = 40 // 最低质量
const MAX_QUALITY = 90 // 最高质量

/**
 * 获取等比缩放的宽高
 */
function getScaledDimensions(width, height, maxDimension) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height }
  }

  const ratio = width / height
  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / ratio),
    }
  } else {
    return {
      width: Math.round(maxDimension * ratio),
      height: maxDimension,
    }
  }
}

/**
 * 处理单个图片
 */
async function processImage(inputPath, outputPath) {
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    const { width, height } = metadata

    // 计算缩放后的尺寸
    const scaled = getScaledDimensions(width, height, MAX_DIMENSION)
    const wasResized = scaled.width !== width || scaled.height !== height

    let quality = MAX_QUALITY
    let buffer
    let fileSize

    // 循环压缩直到文件大小符合要求
    for (quality = MAX_QUALITY; quality >= MIN_QUALITY; quality -= 5) {
      const processor = sharp(inputPath)
        .resize(scaled.width, scaled.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })

      buffer = await processor.toBuffer()
      fileSize = buffer.length

      // 如果文件大小符合要求，或已降到最低质量，则停止
      if (fileSize <= MAX_FILE_SIZE) {
        break
      }
    }

    // 确保目录存在
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 写入文件
    fs.writeFileSync(outputPath, buffer)

    return {
      success: true,
      originalSize: fs.statSync(inputPath).size,
      processedSize: fileSize,
      wasResized,
      dimensions: { original: { width, height }, scaled },
      quality,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * 更新 site-data.json 中的图片路径
 */
function updateSiteData(siteDataPath) {
  try {
    const rawData = fs.readFileSync(siteDataPath, 'utf8')
    const data = JSON.parse(rawData)

    // 遍历 gallery 中的所有图片
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = data.gallery.map((item) => {
        if (item.src && item.src.includes('/pic/')) {
          // 确保文件名以 .webp 结尾
          const basePath = item.src.replace(/\.[^.]+$/, '')
          return {
            ...item,
            src: basePath.endsWith('.webp') ? basePath : `${basePath}.webp`,
          }
        }
        return item
      })
    }

    // 写回精简的 JSON
    const minified = JSON.stringify(data)
    fs.writeFileSync(siteDataPath, minified, 'utf8')

    return true
  } catch (error) {
    console.error('❌ 更新 site-data.json 失败:', error.message)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🖼️  开始处理图片...\n')

  // 检查源目录是否存在
  if (!fs.existsSync(picSourceDir)) {
    console.warn(`⚠️  源目录不存在: ${picSourceDir}`)
    return
  }

  // 检查 dist 目录的 pic 文件夹是否存在
  if (!fs.existsSync(picDistDir)) {
    fs.mkdirSync(picDistDir, { recursive: true })
  }

  const files = fs.readdirSync(picSourceDir)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif']
  const imageFiles = files.filter((file) =>
    imageExtensions.includes(path.extname(file).toLowerCase())
  )

  if (imageFiles.length === 0) {
    console.warn('⚠️  未找到任何图片文件')
    return
  }

  let successCount = 0
  let failCount = 0
  let totalOriginalSize = 0
  let totalProcessedSize = 0

  console.log(`📊 找到 ${imageFiles.length} 个图片文件\n`)

  // 处理每个图片
  for (const file of imageFiles) {
    const inputPath = path.join(picSourceDir, file)
    const outputFileName = path.parse(file).name + '.webp'
    const outputPath = path.join(picDistDir, outputFileName)

    // 跳过已经是 webp 的文件，除非需要重新压缩
    const stats = fs.statSync(inputPath)
    if (
      path.extname(file).toLowerCase() === '.webp' &&
      stats.size <= MAX_FILE_SIZE
    ) {
      // 直接复制 webp 文件
      fs.copyFileSync(inputPath, outputPath)
      successCount++
      totalOriginalSize += stats.size
      totalProcessedSize += stats.size
      console.log(`✅ ${file} (已是 WebP，无需处理)`)
      continue
    }

    const result = await processImage(inputPath, outputPath)

    if (result.success) {
      successCount++
      totalOriginalSize += result.originalSize
      totalProcessedSize += result.processedSize

      const ratio = ((1 - result.processedSize / result.originalSize) * 100).toFixed(1)
      const sizeInfo = `${(result.originalSize / 1024).toFixed(1)}KB → ${(result.processedSize / 1024).toFixed(1)}KB (-${ratio}%)`
      const resizeInfo = result.wasResized
        ? `(缩放至 ${result.dimensions.scaled.width}×${result.dimensions.scaled.height}, 质量 ${result.quality})`
        : `(保持原尺寸 ${result.dimensions.original.width}×${result.dimensions.original.height}, 质量 ${result.quality})`

      console.log(`✅ ${file}`)
      console.log(`   ${sizeInfo} ${resizeInfo}`)
    } else {
      failCount++
      console.error(`❌ ${file} - ${result.error}`)
    }
  }

  // 更新 site-data.json
  if (fs.existsSync(siteDataPath)) {
    console.log('\n📝 更新 site-data.json...')
    if (updateSiteData(siteDataPath)) {
      console.log('✅ site-data.json 更新完成')
    }
  }

  // 输出统计信息
  console.log('\n' + '='.repeat(50))
  console.log('📊 处理完成统计:')
  console.log(`   成功: ${successCount} 个`)
  console.log(`   失败: ${failCount} 个`)
  console.log(
    `   原始总大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`
  )
  console.log(
    `   处理后总大小: ${(totalProcessedSize / 1024 / 1024).toFixed(2)} MB`
  )
  console.log(
    `   总体压缩率: ${((1 - totalProcessedSize / totalOriginalSize) * 100).toFixed(1)}%`
  )
  console.log('='.repeat(50))

  if (failCount > 0) {
    console.warn(`⚠️  有 ${failCount} 个图片处理失败，但继续部署`)
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('❌ 脚本执行失败:', error)
  process.exit(1)
})
