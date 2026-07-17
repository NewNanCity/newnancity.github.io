import path from 'node:path'

export function imageKey(imagePath) {
  return path.parse(imagePath).name
}

export function mapImagePath(imagePath, fileMapping) {
  if (typeof imagePath !== 'string' || !imagePath.includes('/pic/')) {
    return imagePath
  }

  const mappedPath = fileMapping.get(imageKey(imagePath))
  if (!mappedPath) throw new Error(`未找到图片的构建映射: ${imagePath}`)
  return mappedPath
}

export function getSiteDataImagePaths(siteData) {
  return [
    ...(siteData.hero?.slides ?? []),
    ...(siteData.gallery ?? []).map((item) => item.src),
    ...(siteData.portal?.gateways ?? []).map((gateway) => gateway.image),
    ...(siteData.portal?.feed ?? []).map((item) => item.image),
    siteData.portal?.worldAtlas?.backgroundImage,
    siteData.portal?.spotlight?.image,
    ...(siteData.portal?.towns ?? []).map((town) => town.cover),
  ].filter((imagePath) => typeof imagePath === 'string' && imagePath.length > 0)
}

export function getGalleryImageKeys(siteData) {
  return new Set(
    getSiteDataImagePaths(siteData)
      .filter((imagePath) => imagePath.includes('/pic/'))
      .map(imageKey),
  )
}

export function rewriteSiteDataImagePaths(siteData, fileMapping) {
  return {
    ...siteData,
    hero: {
      ...siteData.hero,
      slides: siteData.hero.slides.map((slide) => mapImagePath(slide, fileMapping)),
    },
    gallery: siteData.gallery.map((item) => ({
      ...item,
      src: mapImagePath(item.src, fileMapping),
    })),
    portal: {
      ...siteData.portal,
      gateways: siteData.portal.gateways.map((gateway) => ({
        ...gateway,
        image: mapImagePath(gateway.image, fileMapping),
      })),
      feed: siteData.portal.feed.map((item) => ({
        ...item,
        image: mapImagePath(item.image, fileMapping),
      })),
      ...(siteData.portal.worldAtlas
        ? {
            worldAtlas: {
              ...siteData.portal.worldAtlas,
              backgroundImage: mapImagePath(
                siteData.portal.worldAtlas.backgroundImage,
                fileMapping,
              ),
            },
          }
        : {}),
      spotlight: {
        ...siteData.portal.spotlight,
        image: mapImagePath(siteData.portal.spotlight.image, fileMapping),
      },
      towns: siteData.portal.towns.map((town) => ({
        ...town,
        cover: mapImagePath(town.cover, fileMapping),
      })),
    },
  }
}
