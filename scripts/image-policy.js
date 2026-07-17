const KIB = 1024

const ROLE_PROFILES = {
  gallery: {
    maxDimension: 1920,
    minDimension: 1280,
    softBytes: 420 * KIB,
    hardBytes: 650 * KIB,
    preferredQuality: 88,
    minQuality: 78,
    preserveDimensionFactor: 1.25,
  },
  archive: {
    maxDimension: 1600,
    minDimension: 960,
    softBytes: 300 * KIB,
    hardBytes: 480 * KIB,
    preferredQuality: 86,
    minQuality: 76,
    preserveDimensionFactor: 1.25,
  },
}

const CONTENT_PROFILES = {
  graphic: {
    preferredQuality: 92,
    minQuality: 86,
    budgetMultiplier: 1.25,
    nearLossless: true,
    preset: 'drawing',
  },
  detailed: {
    preferredQuality: 90,
    minQuality: 82,
    budgetMultiplier: 1.15,
    nearLossless: false,
    preset: 'photo',
  },
  standard: {
    preferredQuality: null,
    minQuality: null,
    budgetMultiplier: 1,
    nearLossless: false,
    preset: 'picture',
  },
}

function getContentClass(metadata, stats) {
  const entropy = Number.isFinite(stats.entropy) ? stats.entropy : 6
  const hasTransparency = metadata.hasAlpha === true && stats.isOpaque === false

  if (hasTransparency || entropy < 4) return 'graphic'
  if (entropy >= 7.2) return 'detailed'
  return 'standard'
}

export function resolveImagePolicy({ role, metadata, stats, override = {} }) {
  const roleProfile = ROLE_PROFILES[role]
  if (!roleProfile) {
    throw new Error(`未知图片用途: ${role}`)
  }

  const contentClass = getContentClass(metadata, stats)
  const contentProfile = CONTENT_PROFILES[contentClass]
  const multiplier = contentProfile.budgetMultiplier

  return {
    role,
    contentClass,
    maxDimension: override.maxDimension ?? roleProfile.maxDimension,
    minDimension: override.minDimension ?? roleProfile.minDimension,
    softBytes: override.softBytes ?? Math.round(roleProfile.softBytes * multiplier),
    hardBytes: override.hardBytes ?? Math.round(roleProfile.hardBytes * multiplier),
    preferredQuality:
      override.preferredQuality ??
      contentProfile.preferredQuality ??
      roleProfile.preferredQuality,
    minQuality:
      override.minQuality ?? contentProfile.minQuality ?? roleProfile.minQuality,
    preserveDimensionFactor:
      override.preserveDimensionFactor ?? roleProfile.preserveDimensionFactor,
    qualityStep: 2,
    resizeFactor: 0.85,
    nearLossless: override.nearLossless ?? contentProfile.nearLossless,
    preset: override.preset ?? contentProfile.preset,
  }
}

export function shouldPreserveOriginal({ metadata, sourceSize, policy }) {
  if (metadata.format !== 'webp') return false
  if (!metadata.width || !metadata.height) return false

  return (
    sourceSize <= policy.softBytes &&
    Math.max(metadata.width, metadata.height) <=
      policy.maxDimension * policy.preserveDimensionFactor
  )
}

export function getNextTargetDimension(currentDimension, minDimension) {
  if (currentDimension <= minDimension) return null
  return Math.max(minDimension, Math.floor(currentDimension * 0.85))
}

export const imagePolicyDefaults = Object.freeze({
  roles: ROLE_PROFILES,
  content: CONTENT_PROFILES,
})
