import sharp from 'sharp'

import {
  getNextTargetDimension,
  resolveImagePolicy,
  shouldPreserveOriginal,
} from './image-policy.js'

export class ImageBudgetError extends Error {
  constructor(message, details) {
    super(message)
    this.name = 'ImageBudgetError'
    this.details = details
  }
}

async function encodeCandidate(inputBuffer, targetDimension, quality, policy) {
  return sharp(inputBuffer)
    .rotate()
    .resize({
      width: targetDimension,
      height: targetDimension,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality,
      alphaQuality: 100,
      effort: 5,
      smartSubsample: true,
      nearLossless: policy.nearLossless,
      preset: policy.preset,
    })
    .toBuffer()
}

export async function optimizeImageBuffer({
  inputBuffer,
  fileName,
  role,
  policyOverride,
}) {
  const [metadata, stats] = await Promise.all([
    sharp(inputBuffer).metadata(),
    sharp(inputBuffer).stats(),
  ])

  if (!metadata.width || !metadata.height || !metadata.format) {
    throw new Error(`${fileName}: 无法读取图片尺寸或格式`)
  }

  const policy = resolveImagePolicy({
    role,
    metadata,
    stats,
    override: policyOverride,
  })
  const sourceSize = inputBuffer.length

  if (shouldPreserveOriginal({ metadata, sourceSize, policy })) {
    return {
      buffer: inputBuffer,
      action: 'preserved',
      role,
      contentClass: policy.contentClass,
      sourceFormat: metadata.format,
      sourceSize,
      outputSize: sourceSize,
      sourceDimensions: { width: metadata.width, height: metadata.height },
      outputDimensions: { width: metadata.width, height: metadata.height },
      quality: null,
      policy,
    }
  }

  const sourceLongestEdge = Math.max(metadata.width, metadata.height)
  let targetDimension = Math.min(sourceLongestEdge, policy.maxDimension)
  const minDimension = Math.min(sourceLongestEdge, policy.minDimension)
  let smallestCandidate = null
  let hardBudgetFallback = null

  while (targetDimension >= minDimension) {
    for (
      let quality = policy.preferredQuality;
      quality >= policy.minQuality;
      quality -= policy.qualityStep
    ) {
      const buffer = await encodeCandidate(
        inputBuffer,
        targetDimension,
        quality,
        policy,
      )
      const candidate = { buffer, quality, targetDimension }

      if (!smallestCandidate || buffer.length < smallestCandidate.buffer.length) {
        smallestCandidate = candidate
      }
      if (buffer.length <= policy.softBytes) {
        return buildOptimizedResult({
          candidate,
          fileName,
          role,
          metadata,
          sourceSize,
          policy,
        })
      }
      if (!hardBudgetFallback && buffer.length <= policy.hardBytes) {
        hardBudgetFallback = candidate
      }
    }

    const nextDimension = getNextTargetDimension(targetDimension, minDimension)
    if (nextDimension === null) break
    targetDimension = nextDimension
  }

  if (hardBudgetFallback) {
    return buildOptimizedResult({
      candidate: hardBudgetFallback,
      fileName,
      role,
      metadata,
      sourceSize,
      policy,
    })
  }

  throw new ImageBudgetError(`${fileName}: 在质量下限内无法满足硬预算`, {
    role,
    contentClass: policy.contentClass,
    sourceFormat: metadata.format,
    sourceSize,
    sourceDimensions: { width: metadata.width, height: metadata.height },
    smallestOutputSize: smallestCandidate?.buffer.length ?? null,
    policy,
  })
}

async function buildOptimizedResult({
  candidate,
  fileName,
  role,
  metadata,
  sourceSize,
  policy,
}) {
  const outputMetadata = await sharp(candidate.buffer).metadata()
  if (
    outputMetadata.format !== 'webp' ||
    !outputMetadata.width ||
    !outputMetadata.height
  ) {
    throw new Error(`${fileName}: 优化结果不是有效 WebP`)
  }

  return {
    buffer: candidate.buffer,
    action: 'optimized',
    role,
    contentClass: policy.contentClass,
    sourceFormat: metadata.format,
    sourceSize,
    outputSize: candidate.buffer.length,
    sourceDimensions: { width: metadata.width, height: metadata.height },
    outputDimensions: {
      width: outputMetadata.width,
      height: outputMetadata.height,
    },
    quality: candidate.quality,
    policy,
  }
}
