import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { resolveImagePolicy } from './image-policy.js'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRootDir = path.resolve(path.dirname(scriptPath), '..')
const SCANNABLE_EXTENSIONS = new Set(['.css', '.html', '.js', '.mjs'])
const RASTER_FORMATS = new Map([
  ['.jpg', 'jpeg'],
  ['.jpeg', 'jpeg'],
  ['.png', 'png'],
  ['.webp', 'webp'],
  ['.gif', 'gif'],
])

function isOutsideRoot(root, target) {
  const relative = path.relative(root, target)
  return relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)
}

function assertRealPathInside(sourceRoot, target, rawReference) {
  if (!fs.existsSync(target)) return
  const realRoot = fs.realpathSync(sourceRoot)
  const realTarget = fs.realpathSync(target)
  if (isOutsideRoot(realRoot, realTarget)) {
    throw new Error(`城镇站引用通过符号链接越出 towns 目录: ${rawReference} (${target})`)
  }
}

function extractAttributeValues(content, attribute) {
  const values = []
  const pattern = new RegExp(`\\b${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'gi')
  for (const match of content.matchAll(pattern)) {
    values.push(match[1] ?? match[2] ?? '')
  }
  return values
}

export function extractLocalReferences(content) {
  const references = [
    ...extractAttributeValues(content, 'src'),
    ...extractAttributeValues(content, 'href'),
    ...extractAttributeValues(content, 'poster'),
    ...extractAttributeValues(content, 'data-src'),
  ]

  for (const srcset of [
    ...extractAttributeValues(content, 'srcset'),
    ...extractAttributeValues(content, 'imagesrcset'),
  ]) {
    for (const candidate of srcset.split(',')) {
      const url = candidate.trim().split(/\s+/)[0]
      if (url) references.push(url)
    }
  }

  const embeddedPatterns = [
    /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi,
    /(?:document\.)?location(?:\.href)?\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?(?:"([^"]*)"|'([^']*)')/gi,
    /(?:fetch|new\s+URL)\(\s*(?:"([^"]*)"|'([^']*)')/gi,
    /@import\s+(?:url\(\s*)?(?:"([^"]*)"|'([^']*)')/gi,
  ]

  for (const pattern of embeddedPatterns) {
    for (const match of content.matchAll(pattern)) {
      const value = match.slice(1).find(Boolean)
      if (value) references.push(value)
    }
  }

  return references
}

function normalizeReference(rawReference) {
  const decodedEntities = rawReference.replaceAll('&amp;', '&').trim()
  if (
    !decodedEntities ||
    decodedEntities.startsWith('#') ||
    decodedEntities.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(decodedEntities)
  ) {
    return null
  }

  const withoutQuery = decodedEntities.split(/[?#]/, 1)[0]
  if (!withoutQuery) return null

  try {
    return decodeURIComponent(withoutQuery)
  } catch {
    return withoutQuery
  }
}

function resolveReference(sourceRoot, fromFile, rawReference) {
  const reference = normalizeReference(rawReference)
  if (!reference) return null

  let resolved
  if (reference.startsWith('/towns/')) {
    resolved = path.resolve(sourceRoot, reference.slice('/towns/'.length))
  } else if (reference.startsWith('/')) {
    return null
  } else {
    resolved = path.resolve(path.dirname(fromFile), reference)
  }

  const relative = path.relative(sourceRoot, resolved)
  if (isOutsideRoot(sourceRoot, resolved)) {
    throw new Error(`城镇站引用越出 towns 目录: ${rawReference} (${fromFile})`)
  }

  assertRealPathInside(sourceRoot, resolved, rawReference)
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    const indexFile = path.join(resolved, 'index.html')
    assertRealPathInside(sourceRoot, indexFile, rawReference)
    return indexFile
  }
  return resolved
}

export function collectStaticSiteFiles(sourceRoot) {
  const entryFiles = []
  const pendingDirectories = [sourceRoot]

  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.pop()
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        pendingDirectories.push(entryPath)
      } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.html') {
        entryFiles.push(entryPath)
      }
    }
  }

  const files = new Set(entryFiles)
  const queue = [...entryFiles]
  const missing = []

  while (queue.length > 0) {
    const currentFile = queue.shift()
    if (!SCANNABLE_EXTENSIONS.has(path.extname(currentFile).toLowerCase())) continue

    const content = fs.readFileSync(currentFile, 'utf8')
    for (const rawReference of extractLocalReferences(content)) {
      const referencedFile = resolveReference(sourceRoot, currentFile, rawReference)
      if (!referencedFile) continue

      if (!fs.existsSync(referencedFile) || !fs.statSync(referencedFile).isFile()) {
        missing.push({
          from: path.relative(sourceRoot, currentFile),
          reference: rawReference,
        })
        continue
      }

      if (!files.has(referencedFile)) {
        files.add(referencedFile)
        queue.push(referencedFile)
      }
    }
  }

  if (missing.length > 0) {
    const details = missing
      .map(({ from, reference }) => `- ${from} -> ${reference}`)
      .join('\n')
    throw new Error(`城镇静态站存在缺失的本地引用:\n${details}`)
  }

  return files
}

export async function validateStaticSiteImages(files) {
  const imageFiles = [...files].filter((file) =>
    RASTER_FORMATS.has(path.extname(file).toLowerCase()),
  )
  const violations = []

  await Promise.all(imageFiles.map(async (file) => {
    try {
      const input = sharp(file)
      const [metadata, stats] = await Promise.all([input.metadata(), sharp(file).stats()])
      const extension = path.extname(file).toLowerCase()
      const expectedFormat = RASTER_FORMATS.get(extension)

      if (!metadata.format || metadata.format !== expectedFormat) {
        violations.push(`${file}: 扩展名 ${extension} 的实际格式为 ${metadata.format ?? 'unknown'}`)
        return
      }
      if (!metadata.width || !metadata.height) {
        violations.push(`${file}: 无法读取图片尺寸`)
        return
      }

      const policy = resolveImagePolicy({
        role: 'gallery',
        metadata,
        stats,
      })
      const size = fs.statSync(file).size
      const longestEdge = Math.max(metadata.width, metadata.height)

      if (size > policy.hardBytes) {
        violations.push(
          `${file}: ${size} bytes 超过 ${policy.contentClass} 硬预算 ${policy.hardBytes} bytes`,
        )
      }
      if (longestEdge > policy.maxDimension * policy.preserveDimensionFactor) {
        violations.push(
          `${file}: 最长边 ${longestEdge}px 超过发布上限 ` +
          `${policy.maxDimension * policy.preserveDimensionFactor}px`,
        )
      }
    } catch (error) {
      violations.push(`${file}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }))

  if (violations.length > 0) {
    throw new Error(`城镇静态站图片校验失败:\n- ${violations.join('\n- ')}`)
  }

  return {
    imageCount: imageFiles.length,
    totalBytes: imageFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0),
  }
}

function assertSafeDestination(rootDir, destination) {
  const resolvedRoot = path.resolve(rootDir)
  const resolvedDestination = path.resolve(destination)
  const relative = path.relative(resolvedRoot, resolvedDestination)
  if (!relative || isOutsideRoot(resolvedRoot, resolvedDestination)) {
    throw new Error(`拒绝清理工作区之外的静态站目录: ${resolvedDestination}`)
  }
  if (fs.existsSync(resolvedDestination)) {
    const realDestination = fs.realpathSync(resolvedDestination)
    if (isOutsideRoot(fs.realpathSync(resolvedRoot), realDestination)) {
      throw new Error(`拒绝清理符号链接指向的工作区外目录: ${realDestination}`)
    }
  }
}

export function copyStaticSites(rootDir = defaultRootDir) {
  const source = path.join(rootDir, 'towns')
  const destination = path.join(rootDir, 'dist', 'towns')

  if (!fs.existsSync(source)) {
    throw new Error(`城镇静态站目录不存在: ${source}`)
  }

  const files = collectStaticSiteFiles(source)
  assertSafeDestination(rootDir, destination)
  fs.rmSync(destination, { recursive: true, force: true })

  let totalBytes = 0
  for (const sourceFile of files) {
    const relative = path.relative(source, sourceFile)
    const destinationFile = path.join(destination, relative)
    fs.mkdirSync(path.dirname(destinationFile), { recursive: true })
    fs.copyFileSync(sourceFile, destinationFile)
    totalBytes += fs.statSync(sourceFile).size
  }

  return { source, destination, files, fileCount: files.size, totalBytes }
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const result = copyStaticSites()
  const imageSummary = await validateStaticSiteImages(result.files)
  const sizeMiB = (result.totalBytes / 1024 / 1024).toFixed(2)
  console.log(
    `城镇静态站已发布: ${result.fileCount} 个文件, ${sizeMiB} MiB; ` +
    `${imageSummary.imageCount} 张图片已校验`,
  )
}
