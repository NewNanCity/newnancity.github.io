import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getGalleryImageKeys,
  getSiteDataImagePaths,
  rewriteSiteDataImagePaths,
} from './site-data-images.js'

const fixture = {
  hero: { slides: ['/pic/hero.webp'] },
  gallery: [{ src: '/pic/gallery.webp', caption: 'Gallery', year: '2026' }],
  portal: {
    gateways: [
      { id: 'world', image: '/towns/kaysha/cover.webp' },
      { id: 'archive', image: '/pic/archive.webp' },
    ],
    feed: [
      { id: 'news', image: '/pic/feed.webp' },
      { id: 'town', image: '/towns/kaysha/feed.webp' },
    ],
    worldAtlas: { backgroundImage: '/pic/world-atlas.webp' },
    spotlight: { image: '/pic/spotlight.webp' },
    towns: [{ slug: 'kaysha', cover: '/towns/kaysha/cover.webp' }],
  },
}

test('should rewrite every optimized portal image and preserve town assets', () => {
  const mapping = new Map([
    ['hero', '/pic/hero-hash.webp'],
    ['gallery', '/pic/gallery-hash.webp'],
    ['archive', '/pic/archive-hash.webp'],
    ['feed', '/pic/feed-hash.webp'],
    ['world-atlas', '/pic/world-atlas-hash.webp'],
    ['spotlight', '/pic/spotlight-hash.webp'],
  ])

  const updated = rewriteSiteDataImagePaths(fixture, mapping)

  assert.equal(updated.hero.slides[0], '/pic/hero-hash.webp')
  assert.equal(updated.gallery[0].src, '/pic/gallery-hash.webp')
  assert.equal(updated.portal.gateways[0].image, '/towns/kaysha/cover.webp')
  assert.equal(updated.portal.gateways[1].image, '/pic/archive-hash.webp')
  assert.equal(updated.portal.feed[0].image, '/pic/feed-hash.webp')
  assert.equal(updated.portal.feed[1].image, '/towns/kaysha/feed.webp')
  assert.equal(updated.portal.worldAtlas.backgroundImage, '/pic/world-atlas-hash.webp')
  assert.equal(updated.portal.spotlight.image, '/pic/spotlight-hash.webp')
  assert.equal(updated.portal.towns[0].cover, '/towns/kaysha/cover.webp')
})

test('should collect portal images for role selection and deployment validation', () => {
  assert.deepEqual(
    [...getGalleryImageKeys(fixture)].sort(),
    ['archive', 'feed', 'gallery', 'hero', 'spotlight', 'world-atlas'],
  )
  assert.equal(getSiteDataImagePaths(fixture).length, 9)
})

test('should fail when an optimized portal image has no build mapping', () => {
  assert.throws(
    () => rewriteSiteDataImagePaths(fixture, new Map()),
    /未找到图片的构建映射: \/pic\/hero\.webp/,
  )
})
