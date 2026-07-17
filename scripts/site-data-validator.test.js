import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import { parseSiteData } from '../src/types/site-data-validator.js'

const validSiteData = JSON.parse(fs.readFileSync('public/site-data.json', 'utf8'))

test('should accept the current site data contract', () => {
  assert.equal(parseSiteData(validSiteData), validSiteData)
})

test('should accept the deployed V2 contract during the cache transition', () => {
  const legacySiteData = structuredClone(validSiteData)
  delete legacySiteData.portal.quickActions
  delete legacySiteData.portal.townDirectory

  assert.equal(parseSiteData(legacySiteData), legacySiteData)
})

test('should reject invalid nested story and link fields', () => {
  const invalidStory = structuredClone(validSiteData)
  invalidStory.tv.channels['2026'][0].type = 'unknown'
  assert.throws(
    () => parseSiteData(invalidStory),
    /siteData\.tv\.channels\.2026\[0\]\.type/,
  )

  const invalidLink = structuredClone(validSiteData)
  invalidLink.join.ctaPrimary.url = 42
  assert.throws(
    () => parseSiteData(invalidLink),
    /siteData\.join\.ctaPrimary\.url/,
  )
})

test('should enforce portal navigation and town contracts', () => {
  const duplicateGateway = structuredClone(validSiteData)
  duplicateGateway.portal.gateways[1].id = 'world'
  assert.throws(
    () => parseSiteData(duplicateGateway),
    /siteData\.portal\.gateways\[1\]\.id/,
  )

  const unsafeTown = structuredClone(validSiteData)
  unsafeTown.portal.towns[0].slug = '../kaysha'
  assert.throws(
    () => parseSiteData(unsafeTown),
    /siteData\.portal\.towns\[0\]\.slug/,
  )

  const excessUpdates = structuredClone(validSiteData)
  excessUpdates.portal.updates.push(structuredClone(excessUpdates.portal.updates[0]))
  assert.throws(
    () => parseSiteData(excessUpdates),
    /siteData\.portal\.updates/,
  )
})

test('should enforce dynamic feed and ecosystem contracts', () => {
  const feedItem = {
    id: 'news-one',
    category: 'news',
    eyebrow: 'NEWS',
    title: '一条新闻',
    summary: '来自小镇的消息。',
    image: '/pic/news.webp',
    href: '#/community',
    meta: '牛腩时报',
    actionLabel: '继续看看',
  }
  const ecosystemItem = {
    id: 'towns',
    title: '小镇名册',
    description: '查看全部小镇与聚落。',
    href: 'https://example.com/towns',
    icon: '🏘️',
  }
  const extended = structuredClone(validSiteData)
  extended.portal.feed = [
    feedItem,
    { ...feedItem, id: 'town-one', category: 'town' },
    { ...feedItem, id: 'activity-one', category: 'activity' },
    { ...feedItem, id: 'memory-one', category: 'memory' },
    { ...feedItem, id: 'scenery-one', category: 'scenery' },
  ]
  extended.portal.ecosystem = [
    ecosystemItem,
    { ...ecosystemItem, id: 'wiki' },
    { ...ecosystemItem, id: 'skin' },
    { ...ecosystemItem, id: 'id' },
  ]

  const duplicateFeed = structuredClone(extended)
  duplicateFeed.portal.feed[1].id = duplicateFeed.portal.feed[0].id
  assert.throws(
    () => parseSiteData(duplicateFeed),
    /siteData\.portal\.feed\[1\]\.id/,
  )

  const shortFeed = structuredClone(extended)
  shortFeed.portal.feed.length = 4
  assert.throws(
    () => parseSiteData(shortFeed),
    /siteData\.portal\.feed/,
  )

  const missingEcosystemEntry = structuredClone(extended)
  missingEcosystemEntry.portal.ecosystem.pop()
  assert.throws(
    () => parseSiteData(missingEcosystemEntry),
    /siteData\.portal\.ecosystem/,
  )
})

test('should enforce hero quick actions and the local town directory', () => {
  assert.deepEqual(
    validSiteData.portal.quickActions.map((item) => item.id),
    ['map', 'skin', 'towns'],
  )
  assert.deepEqual(
    new Set(validSiteData.portal.townDirectory.map((item) => item.id)),
    new Set(['charming-spring', 'fctinue', 'kaysha', 'taohuayuan', 'tyansec', 'chenchun']),
  )

  const duplicateQuickAction = structuredClone(validSiteData)
  duplicateQuickAction.portal.quickActions[1].id = 'map'
  assert.throws(
    () => parseSiteData(duplicateQuickAction),
    /siteData\.portal\.quickActions\[1\]\.id/,
  )

  const unsafeQuickAction = structuredClone(validSiteData)
  unsafeQuickAction.portal.quickActions[0].href = 'javascript:alert(1)'
  assert.throws(
    () => parseSiteData(unsafeQuickAction),
    /siteData\.portal\.quickActions\[0\]\.href/,
  )

  const swappedQuickActions = structuredClone(validSiteData)
  const mapHref = swappedQuickActions.portal.quickActions[0].href
  swappedQuickActions.portal.quickActions[0].href = swappedQuickActions.portal.quickActions[2].href
  swappedQuickActions.portal.quickActions[2].href = mapHref
  assert.throws(
    () => parseSiteData(swappedQuickActions),
    /siteData\.portal\.quickActions\[0\]\.href/,
  )

  const duplicateTown = structuredClone(validSiteData)
  duplicateTown.portal.townDirectory[1].id = duplicateTown.portal.townDirectory[0].id
  assert.throws(
    () => parseSiteData(duplicateTown),
    /siteData\.portal\.townDirectory\[1\]\.id/,
  )

  const invalidStatus = structuredClone(validSiteData)
  invalidStatus.portal.townDirectory[0].status = 'unknown'
  assert.throws(
    () => parseSiteData(invalidStatus),
    /siteData\.portal\.townDirectory\[0\]\.status/,
  )

  const unsafeTownLink = structuredClone(validSiteData)
  unsafeTownLink.portal.townDirectory[0].href = 'data:text/html,unsafe'
  assert.throws(
    () => parseSiteData(unsafeTownLink),
    /siteData\.portal\.townDirectory\[0\]\.href/,
  )

  for (const unsafeHref of ['//evil.example/town', '/\\evil.example/town', '/not-a-town/']) {
    const authorityTownLink = structuredClone(validSiteData)
    authorityTownLink.portal.townDirectory[0].href = unsafeHref
    assert.throws(
      () => parseSiteData(authorityTownLink),
      /siteData\.portal\.townDirectory\[0\]\.href/,
    )
  }

  const emptyTownName = structuredClone(validSiteData)
  emptyTownName.portal.townDirectory[0].name = ''
  assert.throws(
    () => parseSiteData(emptyTownName),
    /siteData\.portal\.townDirectory\[0\]\.name/,
  )

  const mismatchedProfileTown = structuredClone(validSiteData)
  const profileDirectoryEntry = mismatchedProfileTown.portal.townDirectory.find(
    (item) => item.id === mismatchedProfileTown.portal.towns[0].slug,
  )
  profileDirectoryEntry.name = '错误名称'
  assert.throws(
    () => parseSiteData(mismatchedProfileTown),
    /siteData\.portal\.townDirectory\[\d+\]\.name/,
  )

  const missingProfileTown = structuredClone(validSiteData)
  missingProfileTown.portal.townDirectory = missingProfileTown.portal.townDirectory.filter(
    (item) => item.id !== missingProfileTown.portal.towns[0].slug,
  )
  assert.throws(
    () => parseSiteData(missingProfileTown),
    /siteData\.portal\.townDirectory/,
  )
})
