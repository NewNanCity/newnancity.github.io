/**
 * 构建时图片处理脚本
 * - 将图片转换为 WebP 格式
 * - 智能压缩到最多 1080P（等比缩放，最长边）
 * - 保持文件大小在 400KB 以下
 * - 生成文件哈希后缀以解决CDN缓存问题
 * - 更新 site-data.json 中的图片路径
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '../public')
const distDir = path.join(__dirname, '../dist')
const picSourceDir = path.join(publicDir, 'pic')
const picDistDir = path.join(distDir, 'pic')
const siteDataPath = path.join(distDir, 'site-data.json')

const MAX_DIMENSION = 1080 // 最长边
const MAX_FILE_SIZE = 400 * 1024 // 400KB（平衡压缩率和图片质量）
const MIN_QUALITY = 50 // 最低质量（防止过度压缩导致模糊）
const MAX_QUALITY = 90 // 最高质量

/**
 * 生成文件哈希（用于cache busting，避免CDN缓存旧版本）
 */
function generateFileHash(buffer) {
  const hash = crypto.createHash('md5').update(buffer).digest('hex')
  return hash.substring(0, 8) // 取前8位
}

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
    // 质量步长为2，保证更平缓的降低和更好的图片质量
    for (quality = MAX_QUALITY; quality >= MIN_QUALITY; quality -= 2) {
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

    // 生成文件哈希用于cache busting
    const fileHash = generateFileHash(buffer)
    const originalFileName = path.parse(outputPath).name
    const hashedFileName = `${originalFileName}-${fileHash}.webp`
    const hashedOutputPath = path.join(path.dirname(outputPath), hashedFileName)

    // 确保目录存在
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 写入文件（使用哈希后的文件名）
    fs.writeFileSync(hashedOutputPath, buffer)

    return {
      success: true,
      originalFileName,
      hashedFileName,
      hashedPath: `/pic/${hashedFileName}`,
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
 * @param {string} siteDataPath - site-data.json 的路径
 * @param {Map<string, string>} fileMapping - 原始文件名 -> 哈希后文件名的映射
 */
function updateSiteData(siteDataPath, fileMapping) {
  try {
    const rawData = fs.readFileSync(siteDataPath, 'utf8')
    const data = JSON.parse(rawData)

    // 遍历 gallery 中的所有图片，替换为哈希后的文件名
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = data.gallery.map((item) => {
        if (item.src && item.src.includes('/pic/')) {
          // 提取文件名（不含后缀）
          const fileName = path.parse(item.src).name

          // 检查是否在映射中
          if (fileMapping.has(fileName)) {
            return {
              ...item,
              src: fileMapping.get(fileName),
            }
          } else {
            // 如果不在映射中，说明这是一个未处理的文件或已跳过的文件
            console.warn(`⚠️  未找到图片的哈希映射: ${fileName}`)
            return item
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

  // 文件名映射：originalName -> hashedPath（用于更新site-data.json）
  const fileMapping = new Map()

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
      // 直接复制 webp 文件，但仍然需要添加哈希后缀
      const buffer = fs.readFileSync(inputPath)
      const fileHash = generateFileHash(buffer)
      const originalFileName = path.parse(file).name
      const hashedFileName = `${originalFileName}-${fileHash}.webp`
      const hashedOutputPath = path.join(picDistDir, hashedFileName)

      fs.copyFileSync(inputPath, hashedOutputPath)
      fileMapping.set(originalFileName, `/pic/${hashedFileName}`)

      successCount++
      totalOriginalSize += stats.size
      totalProcessedSize += stats.size
      console.log(`✅ ${file} (已是 WebP，已添加哈希后缀)`)
      continue
    }

    const result = await processImage(inputPath, outputPath)

    if (result.success) {
      successCount++
      totalOriginalSize += result.originalSize
      totalProcessedSize += result.processedSize

      // 保存文件名映射
      fileMapping.set(result.originalFileName, result.hashedPath)

      const ratio = ((1 - result.processedSize / result.originalSize) * 100).toFixed(1)
      const sizeInfo = `${(result.originalSize / 1024).toFixed(1)}KB → ${(result.processedSize / 1024).toFixed(1)}KB (-${ratio}%)`
      const resizeInfo = result.wasResized
        ? `(缩放至 ${result.dimensions.scaled.width}×${result.dimensions.scaled.height}, 质量 ${result.quality})`
        : `(保持原尺寸 ${result.dimensions.original.width}×${result.dimensions.original.height}, 质量 ${result.quality})`

      console.log(`✅ ${file}`)
      console.log(`   ${sizeInfo} ${resizeInfo}`)
      console.log(`   → ${result.hashedFileName} (cache busting)`)
    } else {
      failCount++
      console.error(`❌ ${file} - ${result.error}`)
    }
  }

  // 更新 site-data.json
  if (fs.existsSync(siteDataPath)) {
    console.log('\n📝 更新 site-data.json（替换为哈希后的文件名）...')
    if (updateSiteData(siteDataPath, fileMapping)) {
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
  console.log('💡 所有图片均已添加哈希后缀用于CDN cache busting')

  // 清理未哈希的文件（保留新的cache-busted版本）
  console.log('\n🧹 清理未哈希的旧文件...')
  const allFiles = fs.readdirSync(picDistDir)
  const hashedFileNames = new Set()

  // 首先收集所有已哈希的文件名（去掉哈希后缀获得原始名）
  for (const file of allFiles) {
    if (file.match(/-[a-f0-9]{8}\.webp$/)) {
      const originalName = file.replace(/-[a-f0-9]{8}\.webp$/, '')
      hashedFileNames.add(originalName)
    }
  }

  // 然后删除所有未哈希且有对应哈希版本的文件
  let cleanedCount = 0
  for (const file of allFiles) {
    if (file.endsWith('.webp') && !file.match(/-[a-f0-9]{8}\.webp$/)) {
      const baseName = file.replace(/\.webp$/, '')
      // 只删除有对应哈希版本的文件
      if (hashedFileNames.has(baseName)) {
        const filePath = path.join(picDistDir, file)
        try {
          fs.unlinkSync(filePath)
          cleanedCount++
        } catch (err) {
          console.warn(`   ⚠️  删除失败: ${file} - ${err.message}`)
        }
      }
    }
  }

  if (cleanedCount > 0) {
    console.log(`✅ 共清理 ${cleanedCount} 个未哈希的旧文件`)
  }

  if (failCount > 0) {
    console.warn(`⚠️  有 ${failCount} 个图片处理失败，但继续部署`)
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('❌ 脚本执行失败:', error)
  process.exit(1)
})
