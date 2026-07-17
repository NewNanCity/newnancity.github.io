/**
 * 构建期图片管线。
 *
 * 图片按页面用途和内容特征选择策略；源文件只读，优化结果写入 dist。
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { parseSiteData } from '../src/types/site-data-validator.js'
import { ImageBudgetError, optimizeImageBuffer } from './image-optimizer.js'
import {
  getGalleryImageKeys,
  getSiteDataImagePaths,
  imageKey,
  mapImagePath,
  rewriteSiteDataImagePaths,
} from './site-data-images.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '../public')
const distDir = path.join(__dirname, '../dist')
const picSourceDir = path.join(publicDir, 'pic')
const picDistDir = path.join(distDir, 'pic')
const siteDataPath = path.join(distDir, 'site-data.json')
const indexHtmlPath = path.join(distDir, 'index.html')
const reportPath = path.join(distDir, 'image-processing-report.json')

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.bmp',
  '.gif',
])

// 只有经过视觉审查且无法在质量下限内满足预算的图片才允许加例外。
const IMAGE_OVERRIDES = Object.freeze({})

function generateFileHash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8)
}

function loadSiteData() {
  if (!fs.existsSync(siteDataPath)) {
    throw new Error(`构建数据不存在: ${siteDataPath}`)
  }
  return parseSiteData(JSON.parse(fs.readFileSync(siteDataPath, 'utf8')))
}

function updateSiteData(siteData, fileMapping) {
  const updated = rewriteSiteDataImagePaths(siteData, fileMapping)

  fs.writeFileSync(siteDataPath, JSON.stringify(updated), 'utf8')
  return updated
}

function updateHeroPreload(siteData, fileMapping) {
  const firstSlide = siteData.hero?.slides?.[0]
  if (!firstSlide) return
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`构建入口不存在: ${indexHtmlPath}`)
  }

  const mappedSlide = mapImagePath(firstSlide, fileMapping)
  const html = fs.readFileSync(indexHtmlPath, 'utf8')
  if (!html.includes(firstSlide)) {
    throw new Error(`index.html 缺少首屏图片预加载: ${firstSlide}`)
  }
  fs.writeFileSync(indexHtmlPath, html.replaceAll(firstSlide, mappedSlide), 'utf8')
}

async function validateOutputs(report, siteData) {
  const violations = []

  for (const entry of report.images) {
    const outputPath = path.join(picDistDir, entry.outputFile)
    const metadata = await sharp(outputPath).metadata()

    if (metadata.format !== 'webp') {
      violations.push(`${entry.outputFile}: 实际格式为 ${metadata.format}`)
    }
    if (entry.outputSize > entry.hardBytes) {
      violations.push(
        `${entry.outputFile}: ${entry.outputSize} bytes 超过硬预算 ${entry.hardBytes} bytes`,
      )
    }
  }

  for (const imagePath of getSiteDataImagePaths(siteData)) {
    const outputPath = path.join(distDir, imagePath.replace(/^\//, ''))
    if (!fs.existsSync(outputPath)) {
      violations.push(`部署数据引用了不存在的图片: ${imagePath}`)
    }
  }

  const firstSlide = siteData.hero?.slides?.[0]
  if (firstSlide) {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8')
    if (!indexHtml.includes(firstSlide)) {
      violations.push(`index.html 未预加载首屏图片: ${firstSlide}`)
    }
  }

  if (violations.length > 0) {
    throw new Error(`图片产物校验失败:\n- ${violations.join('\n- ')}`)
  }
}

function cleanCopiedSourceImages(generatedFiles) {
  let cleanedCount = 0

  for (const file of fs.readdirSync(picDistDir)) {
    if (!IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())) continue
    if (generatedFiles.has(file)) continue

    fs.unlinkSync(path.join(picDistDir, file))
    cleanedCount += 1
  }

  return cleanedCount
}

function formatKib(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`
}

async function main() {
  console.log('开始执行分层图片管线...\n')

  if (!fs.existsSync(picSourceDir)) {
    throw new Error(`图片源目录不存在: ${picSourceDir}`)
  }
  fs.mkdirSync(picDistDir, { recursive: true })

  const siteData = loadSiteData()
  const galleryImageKeys = getGalleryImageKeys(siteData)
  const imageFiles = fs
    .readdirSync(picSourceDir)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))

  if (imageFiles.length === 0) {
    throw new Error(`没有在 ${picSourceDir} 找到图片`)
  }

  const fileMapping = new Map()
  const generatedFiles = new Set()
  const images = []
  const failures = []

  for (const file of imageFiles) {
    const sourcePath = path.join(picSourceDir, file)
    const key = imageKey(file)
    const role = galleryImageKeys.has(key) ? 'gallery' : 'archive'

    try {
      const result = await optimizeImageBuffer({
        inputBuffer: fs.readFileSync(sourcePath),
        fileName: file,
        role,
        policyOverride: IMAGE_OVERRIDES[file],
      })
      const hash = generateFileHash(result.buffer)
      const outputFile = `${key}-${hash}.webp`
      const outputPath = path.join(picDistDir, outputFile)

      fs.writeFileSync(outputPath, result.buffer)
      generatedFiles.add(outputFile)
      fileMapping.set(key, `/pic/${outputFile}`)

      const entry = {
        sourceFile: file,
        outputFile,
        action: result.action,
        role: result.role,
        contentClass: result.contentClass,
        sourceFormat: result.sourceFormat,
        sourceSize: result.sourceSize,
        outputSize: result.outputSize,
        sourceDimensions: result.sourceDimensions,
        outputDimensions: result.outputDimensions,
        quality: result.quality,
        softBytes: result.policy.softBytes,
        hardBytes: result.policy.hardBytes,
      }
      images.push(entry)

      const sizeLabel =
        result.action === 'preserved'
          ? formatKib(result.sourceSize)
          : `${formatKib(result.sourceSize)} -> ${formatKib(result.outputSize)}`
      const qualityLabel = result.quality ? `, q${result.quality}` : ''
      console.log(
        `${result.action === 'preserved' ? '保留' : '优化'} ${file} ` +
          `[${role}/${result.contentClass}${qualityLabel}] ${sizeLabel}`,
      )
    } catch (error) {
      const details =
        error instanceof ImageBudgetError
          ? JSON.stringify(error.details)
          : error instanceof Error
            ? error.message
            : String(error)
      failures.push(`${file}: ${details}`)
    }
  }

  if (failures.length > 0) {
    throw new Error(`有 ${failures.length} 张图片处理失败:\n- ${failures.join('\n- ')}`)
  }

  const updatedSiteData = updateSiteData(siteData, fileMapping)
  updateHeroPreload(siteData, fileMapping)
  const cleanedCount = cleanCopiedSourceImages(generatedFiles)
  const sourceBytes = images.reduce((sum, item) => sum + item.sourceSize, 0)
  const outputBytes = images.reduce((sum, item) => sum + item.outputSize, 0)
  const report = {
    summary: {
      imageCount: images.length,
      preservedCount: images.filter((item) => item.action === 'preserved').length,
      optimizedCount: images.filter((item) => item.action === 'optimized').length,
      sourceBytes,
      outputBytes,
      savedBytes: sourceBytes - outputBytes,
      savingPercent: Number(((1 - outputBytes / sourceBytes) * 100).toFixed(1)),
      cleanedSourceCopies: cleanedCount,
    },
    images,
  }

  await validateOutputs(report, updatedSiteData)
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')

  console.log('\n图片管线完成:')
  console.log(`  图片: ${report.summary.imageCount}`)
  console.log(`  原样保留: ${report.summary.preservedCount}`)
  console.log(`  重新优化: ${report.summary.optimizedCount}`)
  console.log(
    `  总体积: ${formatKib(sourceBytes)} -> ${formatKib(outputBytes)} ` +
      `(-${report.summary.savingPercent}%)`,
  )
  console.log(`  构建报告: ${reportPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
