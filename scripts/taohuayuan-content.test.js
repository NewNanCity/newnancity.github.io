import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const html = fs.readFileSync(
  path.join(rootDir, 'towns', 'taohuayuan', 'index.html'),
  'utf8',
)
const script = fs.readFileSync(
  path.join(rootDir, 'towns', 'taohuayuan', 'assets', 'js', 'taohuayuan.js'),
  'utf8',
)

function textContent(fragment) {
  return fragment.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

test('should expose only the current Taohuayuan navigation and Chinese headings', () => {
  assert.match(html, /<main id="main-content" tabindex="-1">/)
  const headings = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/g)]
    .map((match) => textContent(match[1]))

  assert.match(html, /<title>桃花源<\/title>/)
  assert.match(html, /href="#laws" data-section-link="laws">桃花源法典<\/a>/)
  assert.doesNotMatch(html, /桃花源简史|桃花源律|href="#history"|id="history"/)
  assert.doesNotMatch(headings.join('\n'), /[A-Za-z]/)
})

test('should replace the old town body with the complete newcomer guide', () => {
  assert.match(html, /桃花源新人指南/)
  assert.match(html, /桃花源是中式古风小镇，也是牛腩第一个五星小镇/)
  assert.match(html, /桃花源秉承自由、友善、正义的理念/)
  assert.match(html, /images\/arrival-portal\.webp/)
  assert.match(html, /images\/metro-line-3\.webp/)
  assert.match(html, /images\/join-qq\.webp/)
  assert.doesNotMatch(
    html,
    /images\/(?:arrival-portal|metro-line-3|join-qq)\.png/,
  )
  assert.doesNotMatch(html, /成员介绍|backlight|Blackbaker|LOGICALITY/)
})

test('should publish all 27 code articles and both coordinate tables', () => {
  const articles = [...html.matchAll(
    /<li id="article-(\d+)">\s*<a class="article-anchor" href="#article-\1"[^>]*>(第[^<]+条)<\/a>/g,
  )]
  const articleNumbers = articles.map((match) => Number(match[1]))
  const articleLabels = articles.map((match) => match[2])

  assert.equal(articleLabels.length, 27)
  assert.equal(new Set(articleLabels).size, 27)
  assert.deepEqual(articleNumbers, Array.from({ length: 27 }, (_, index) => index + 1))
  assert.equal(articleLabels[0], '第一条')
  assert.equal(articleLabels.at(-1), '第二十七条')
  assert.match(html, /桃花源重要设施位置/)
  assert.match(html, /桃花源系统商店与官方村交所/)
  assert.match(html, /桃花源景点位置/)
  assert.match(html, /独乐寺（桃花源法院）/)
})

test('should expose responsive chapter navigation and honest source status', () => {
  const chapterTargets = [...html.matchAll(/data-chapter-link="([^"]+)"/g)]
    .map((match) => match[1])
  const uniqueTargets = [...new Set(chapterTargets)]

  assert.deepEqual(uniqueTargets, [
    'chapter-one',
    'chapter-two',
    'chapter-three',
    'chapter-four',
    'chapter-five',
    'chapter-six',
    'appendix-title',
  ])
  assert.equal(chapterTargets.length, uniqueTargets.length * 2)
  assert.match(html, /class="chapter-jump"/)
  assert.match(html, /class="chapter-nav"/)
  assert.match(html, /<dt>内容版本<\/dt><dd>2026\.07<\/dd>/)
  assert.match(html, /<time datetime="2026-07-21">2026-07-21<\/time>/)
  assert.match(html, /页面整理日期不等同于法典生效或坐标核验日期/)
})

test('should keep functional images and the QQ group usable without image text', () => {
  const zoomImages = [...html.matchAll(/data-zoom-image="([^"]+)"/g)]
    .map((match) => match[1])

  assert.deepEqual(zoomImages, [
    'images/arrival-portal.webp',
    'images/metro-line-3.webp',
    'images/join-qq.webp',
  ])
  assert.match(html, /<strong>1129324923<\/strong>/)
  assert.match(html, /data-copy-text="1129324923"/)
  assert.match(html, /class="image-dialog"/)
  assert.match(html, /href="assets\/css\/main\.css\?v=20260721-1"/)
  assert.match(html, /src="assets\/js\/taohuayuan\.js\?v=20260721-1" defer/)
  assert.match(script, /navigator\.clipboard\?\.writeText/)
  assert.match(script, /data-zoom-image/)
  assert.match(script, /data-section-link/)
  assert.match(script, /data-chapter-link/)
})
