import assert from 'node:assert/strict'
import test from 'node:test'
import sharp from 'sharp'

import {
  getNextTargetDimension,
  resolveImagePolicy,
  shouldPreserveOriginal,
} from './image-policy.js'
import { optimizeImageBuffer } from './image-optimizer.js'

async function createBoundaryFixture() {
  const width = 640
  const height = 360
  const raw = Buffer.alloc(width * height * 3)
  let seed = 123456789

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      const noise = ((seed >>> 24) / 255 - 0.5) * 40
      const index = (y * width + x) * 3

      raw[index] = Math.max(0, Math.min(255, 50 + (x / width) * 150 + noise))
      raw[index + 1] = Math.max(0, Math.min(255, 40 + (y / height) * 160 + noise))
      raw[index + 2] = Math.max(
        0,
        Math.min(255, 70 + ((x + y) / (width + height)) * 100 + noise),
      )
    }
  }

  return sharp(raw, {
    raw: { width, height, channels: 3 },
  })
    .png()
    .toBuffer()
}

test('should use a stricter quality floor for detailed gallery images', () => {
  const policy = resolveImagePolicy({
    role: 'gallery',
    metadata: { hasAlpha: false },
    stats: { entropy: 7.6, isOpaque: true },
  })

  assert.equal(policy.contentClass, 'detailed')
  assert.equal(policy.maxDimension, 1920)
  assert.equal(policy.preferredQuality, 90)
  assert.equal(policy.minQuality, 82)
  assert.ok(policy.hardBytes > policy.softBytes)
})

test('should protect transparent and low-entropy graphics from aggressive lossy compression', () => {
  const policy = resolveImagePolicy({
    role: 'archive',
    metadata: { hasAlpha: true },
    stats: { entropy: 5.2, isOpaque: false },
  })

  assert.equal(policy.contentClass, 'graphic')
  assert.equal(policy.nearLossless, true)
  assert.ok(policy.minQuality >= 84)
})

test('should preserve only real WebP files that meet both size and dimension budgets', () => {
  const policy = resolveImagePolicy({
    role: 'gallery',
    metadata: { hasAlpha: false },
    stats: { entropy: 6.5, isOpaque: true },
  })

  assert.equal(
    shouldPreserveOriginal({
      metadata: { format: 'webp', width: 1600, height: 900 },
      sourceSize: policy.softBytes,
      policy,
    }),
    true,
  )
  assert.equal(
    shouldPreserveOriginal({
      metadata: { format: 'png', width: 1600, height: 900 },
      sourceSize: policy.softBytes,
      policy,
    }),
    false,
  )
  assert.equal(
    shouldPreserveOriginal({
      metadata: { format: 'webp', width: 2560, height: 1440 },
      sourceSize: policy.softBytes,
      policy,
    }),
    false,
  )
  const archivePolicy = resolveImagePolicy({
    role: 'archive',
    metadata: { hasAlpha: false },
    stats: { entropy: 6.5, isOpaque: true },
  })
  assert.equal(
    shouldPreserveOriginal({
      metadata: { format: 'webp', width: 1920, height: 1080 },
      sourceSize: archivePolicy.softBytes,
      policy: archivePolicy,
    }),
    true,
  )
})

test('should lower dimensions without crossing the role minimum', () => {
  assert.equal(getNextTargetDimension(1920, 1280), 1632)
  assert.equal(getNextTargetDimension(1300, 1280), 1280)
  assert.equal(getNextTargetDimension(1280, 1280), null)
})

test('should prefer a smaller high-quality soft-budget candidate over a hard-budget fallback', async () => {
  const inputBuffer = await createBoundaryFixture()

  const result = await optimizeImageBuffer({
    inputBuffer,
    fileName: 'boundary.png',
    role: 'gallery',
    policyOverride: {
      maxDimension: 640,
      minDimension: 544,
      softBytes: 50_000,
      hardBytes: 70_000,
      preferredQuality: 88,
      minQuality: 78,
      preserveDimensionFactor: 1,
      nearLossless: false,
      preset: 'picture',
    },
  })

  assert.deepEqual(result.outputDimensions, { width: 544, height: 306 })
  assert.equal(result.quality, 86)
  assert.ok(result.outputSize <= 50_000)
})

test('should convert a PNG payload even when its filename claims WebP', async () => {
  const inputBuffer = await sharp({
    create: {
      width: 960,
      height: 540,
      channels: 3,
      background: { r: 62, g: 108, b: 57 },
    },
  })
    .png()
    .toBuffer()

  const result = await optimizeImageBuffer({
    inputBuffer,
    fileName: 'mislabeled.webp',
    role: 'gallery',
  })
  const metadata = await sharp(result.buffer).metadata()

  assert.equal(metadata.format, 'webp')
  assert.equal(result.action, 'optimized')
  assert.equal(result.sourceFormat, 'png')
})

test('should keep a compliant WebP byte-identical', async () => {
  const inputBuffer = await sharp({
    create: {
      width: 640,
      height: 360,
      channels: 3,
      background: { r: 28, g: 44, b: 68 },
    },
  })
    .webp({ quality: 88 })
    .toBuffer()

  const result = await optimizeImageBuffer({
    inputBuffer,
    fileName: 'ready.webp',
    role: 'gallery',
  })

  assert.equal(result.action, 'preserved')
  assert.deepEqual(result.buffer, inputBuffer)
})
