import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'

import {
  copyStaticSites,
  extractLocalReferences,
  validateStaticSiteImages,
} from './copy-static-sites.js'

function makeRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'newnan-static-'))
}

function write(rootDir, relativePath, content) {
  const target = path.join(rootDir, relativePath)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, content)
}

test('should publish only files reachable from town HTML entries', () => {
  const rootDir = makeRoot()

  try {
    write(
      rootDir,
      'towns/sample/index.html',
      '<link href="assets/site.css?v=1" rel="stylesheet"><img srcset="images/hero.webp 1x, images/hero@2x.webp 2x">',
    )
    write(rootDir, 'towns/sample/assets/site.css', '.hero{background:url("../images/texture.webp")}')
    write(rootDir, 'towns/sample/images/hero.webp', 'hero')
    write(rootDir, 'towns/sample/images/hero@2x.webp', 'hero-2x')
    write(rootDir, 'towns/sample/images/texture.webp', 'texture')
    write(rootDir, 'towns/sample/images/original.png', 'unused-source')
    write(rootDir, 'towns/sample/template.zip', 'unused-template')

    const result = copyStaticSites(rootDir)

    assert.equal(result.fileCount, 5)
    assert.equal(
      fs.readFileSync(path.join(rootDir, 'dist', 'towns', 'sample', 'index.html'), 'utf8'),
      '<link href="assets/site.css?v=1" rel="stylesheet"><img srcset="images/hero.webp 1x, images/hero@2x.webp 2x">',
    )
    assert.equal(fs.existsSync(path.join(rootDir, 'dist', 'towns', 'sample', 'images', 'texture.webp')), true)
    assert.equal(fs.existsSync(path.join(rootDir, 'dist', 'towns', 'sample', 'images', 'original.png')), false)
    assert.equal(fs.existsSync(path.join(rootDir, 'dist', 'towns', 'sample', 'template.zip')), false)
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})

test('should fail when a local page or asset reference is missing', () => {
  const rootDir = makeRoot()

  try {
    write(
      rootDir,
      'towns/sample/index.html',
      '<link href="assets/missing.css" rel="stylesheet"><script>document.location = "../comingsoon.html"</script>',
    )

    assert.throws(
      () => copyStaticSites(rootDir),
      /sample\\index\.html -> assets\/missing\.css|sample\/index\.html -> assets\/missing\.css/,
    )
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})

test('should extract CSS, redirect, import, and fetch references', () => {
  const references = extractLocalReferences(`
    .hero { background: url('../images/hero.webp') }
    document.location = '../comingsoon.html'
    import data from './data.js'
    fetch('./items.json')
  `)

  assert.deepEqual(references, [
    '../images/hero.webp',
    '../comingsoon.html',
    './data.js',
    './items.json',
  ])
})

test('should validate real formats and hard budgets for published town images', async () => {
  const rootDir = makeRoot()

  try {
    const validFile = path.join(rootDir, 'valid.webp')
    const mislabeledFile = path.join(rootDir, 'mislabeled.webp')
    const oversizedFile = path.join(rootDir, 'oversized.png')

    await sharp({
      create: {
        width: 640,
        height: 360,
        channels: 3,
        background: { r: 35, g: 80, b: 52 },
      },
    }).webp({ quality: 88 }).toFile(validFile)

    await sharp({
      create: {
        width: 640,
        height: 360,
        channels: 3,
        background: { r: 35, g: 80, b: 52 },
      },
    }).png().toFile(mislabeledFile)

    const raw = Buffer.alloc(1000 * 1000 * 3)
    let seed = 987654321
    for (let index = 0; index < raw.length; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      raw[index] = seed >>> 24
    }
    await sharp(raw, { raw: { width: 1000, height: 1000, channels: 3 } })
      .png({ compressionLevel: 0 })
      .toFile(oversizedFile)

    const summary = await validateStaticSiteImages(new Set([validFile]))
    assert.equal(summary.imageCount, 1)

    await assert.rejects(
      validateStaticSiteImages(new Set([mislabeledFile])),
      /扩展名 \.webp 的实际格式为 png/,
    )
    await assert.rejects(
      validateStaticSiteImages(new Set([oversizedFile])),
      /超过 .*硬预算/,
    )
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})
