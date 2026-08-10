import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const townDir = path.join(rootDir, 'towns', 'moscow')
const html = fs.readFileSync(path.join(townDir, 'index.html'), 'utf8')
const css = fs.readFileSync(path.join(townDir, 'assets', 'moscow.css'), 'utf8')
const script = fs.readFileSync(path.join(townDir, 'assets', 'moscow.js'), 'utf8')

test('should expose the Moscow town page at its production canonical URL', () => {
  assert.match(html, /<title>莫斯科 \| 牛腩小镇<\/title>/)
  assert.match(html, /<link rel="canonical" href="https:\/\/newnan\.city\/towns\/moscow\/">/)
  assert.match(html, /<main id="main-content" tabindex="-1">/)
  assert.match(html, /href="assets\/moscow\.css\?v=20260810-2"/)
  assert.match(html, /src="assets\/moscow\.js\?v=20260810-2" defer/)
})

test('should preserve the supplied town facts, districts, governance and contacts', () => {
  const districts = [...html.matchAll(/<li><span>0\d<\/span><strong>([^<]+)<\/strong><\/li>/g)]
    .map((match) => match[1])

  assert.deepEqual(districts, [
    '莫斯科主区',
    '勒让德格勒',
    '克拉克格勒',
    '两岛居住区',
    '西伯利亚',
  ])
  assert.match(html, /VGBVHH<\/strong> 与一众玩家于 2020 年共同建立/)
  assert.match(html, /现任镇长<\/dt><dd>hopelessman<\/dd>/)
  assert.match(html, /“专制 \+ 民主”/)
  assert.match(html, /红石设计师兼总指挥/)
  assert.match(html, /通过公投提出罢免/)
  assert.match(html, /在 30 天内自行处置/)
  assert.match(html, /<strong>964630439<\/strong>/)
  assert.match(html, /<strong>QQ 2641309160<\/strong>/)
})

test('should publish seven community agreements and the complete inaugural archive', () => {
  const compactList = html.match(/<ol class="compact-list"[\s\S]*?<\/ol>/)?.[0] ?? ''
  assert.equal([...compactList.matchAll(/<li>/g)].length, 7)
  assert.match(compactList, /不拿性取向或黄色内容开玩笑/)
  assert.match(compactList, /不做损害其他城镇玩家体验的事/)
  assert.match(html, /第一次<\/span><strong>提醒与警告/)
  assert.match(html, /第二次<\/span><strong>退出莫斯科/)
  assert.match(html, /<time datetime="2026-07-18">2026\.07\.18<\/time>/)
  assert.match(html, /北扩计划/)
  assert.match(html, /内务部以后只作为 2020 年入服的元老级玩家团体/)
  assert.match(html, /莫斯科第七任镇长 hopelessman/)
})

test('should expose ten WebP scenes with progressive image viewing', () => {
  const sceneSources = [...html.matchAll(/<a href="(images\/[^"]+\.webp)" data-scene-target/g)]
    .map((match) => match[1])

  assert.equal(sceneSources.length, 10)
  assert.equal(new Set(sceneSources).size, 10)
  assert.equal(sceneSources[0], 'images/hero-night-station.webp')
  assert.equal(sceneSources.at(-1), 'images/snow-square.webp')
  assert.doesNotMatch(html, /images\/[^"]+\.png/)
  assert.match(html, /class="image-dialog"/)
  assert.match(css, /image-rendering:\s*pixelated/)
  assert.match(script, /data-scene-target/)
  assert.match(script, /showModal/)
  assert.match(script, /navigator\.clipboard\?\.writeText/)
  assert.match(script, /prefers-reduced-motion/)
})

test('should keep hero and primary scenes at 1920px while sizing archive scenes to 1600px', async () => {
  const expectedWidths = new Map([
    ['hero-night-station.webp', 1920],
    ['stone-monument.webp', 1920],
    ['night-street.webp', 1600],
    ['hillside-farms.webp', 1600],
    ['stadium.webp', 1600],
    ['riverside-emblem.webp', 1920],
    ['central-avenue.webp', 1920],
    ['industrial-district.webp', 1600],
    ['harbor.webp', 1920],
    ['snow-square.webp', 1920],
  ])

  for (const [fileName, expectedWidth] of expectedWidths) {
    const filePath = path.join(townDir, 'images', fileName)
    const metadata = await sharp(filePath).metadata()
    assert.equal(metadata.format, 'webp', fileName)
    assert.equal(metadata.width, expectedWidth, fileName)
    assert.ok(fs.statSync(filePath).size < 650 * 1024, fileName)
  }
})
