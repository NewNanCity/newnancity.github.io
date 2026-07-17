function fail(path, expected) {
  throw new TypeError(`${path} 应为 ${expected}`)
}

function expectObject(value, path) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'object')
  }
  return value
}

function expectArray(value, path) {
  if (!Array.isArray(value)) fail(path, 'array')
  return value
}

function expectString(value, path) {
  if (typeof value !== 'string') fail(path, 'string')
}

function expectStringFields(value, fields, path) {
  const object = expectObject(value, path)
  for (const field of fields) expectString(object[field], `${path}.${field}`)
  return object
}

function expectObjectArray(value, path, validateItem) {
  expectArray(value, path).forEach((item, index) => validateItem(item, `${path}[${index}]`))
}

function expectStringArray(value, path) {
  expectArray(value, path).forEach((item, index) => expectString(item, `${path}[${index}]`))
}

function validateLink(value, path) {
  expectStringFields(value, ['label', 'url'], path)
}

function expectEnum(value, allowed, path) {
  if (!allowed.includes(value)) fail(path, allowed.join(' | '))
}

function expectSafeSlug(value, path) {
  expectString(value, path)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) fail(path, 'safe lowercase slug')
}

export function parseSiteData(value) {
  const root = expectObject(value, 'siteData')

  const nav = expectStringFields(root.nav, ['brand'], 'siteData.nav')
  expectObjectArray(nav.links, 'siteData.nav.links', (item, path) => {
    expectStringFields(item, ['label', 'icon', 'url'], path)
  })

  const hero = expectStringFields(
    root.hero,
    ['badge', 'titleWelcome', 'titleName', 'subtitle'],
    'siteData.hero',
  )
  expectObjectArray(hero.stats, 'siteData.hero.stats', (item, path) => {
    const stat = expectStringFields(item, ['unit', 'description'], path)
    if (stat.id !== undefined && stat.id !== 'years' && stat.id !== 'days') {
      fail(`${path}.id`, '"years" | "days"')
    }
    if (stat.value !== undefined && (typeof stat.value !== 'number' || !Number.isFinite(stat.value))) {
      fail(`${path}.value`, 'finite number')
    }
    if (stat.id === undefined && stat.value === undefined) {
      fail(path, 'stat with id or value')
    }
  })
  expectStringArray(hero.slides, 'siteData.hero.slides')

  const portal = expectObject(root.portal, 'siteData.portal')
  const gatewayIds = new Set()
  expectObjectArray(portal.gateways, 'siteData.portal.gateways', (item, path) => {
    const gateway = expectStringFields(
      item,
      ['id', 'eyebrow', 'label', 'description', 'href', 'icon', 'image'],
      path,
    )
    expectEnum(gateway.id, ['world', 'community', 'archive', 'join'], `${path}.id`)
    if (gatewayIds.has(gateway.id)) fail(`${path}.id`, 'unique gateway id')
    gatewayIds.add(gateway.id)
  })
  if (gatewayIds.size !== 4) fail('siteData.portal.gateways', 'all four portal gateways')

  const feed = expectArray(portal.feed, 'siteData.portal.feed')
  if (feed.length < 5 || feed.length > 8) {
    fail('siteData.portal.feed', 'between five and eight feed items')
  }
  const feedIds = new Set()
  feed.forEach((item, index) => {
    const path = `siteData.portal.feed[${index}]`
    const feedItem = expectStringFields(
      item,
      ['id', 'category', 'eyebrow', 'title', 'summary', 'image', 'href', 'meta', 'actionLabel'],
      path,
    )
    expectSafeSlug(feedItem.id, `${path}.id`)
    if (feedIds.has(feedItem.id)) fail(`${path}.id`, 'unique feed id')
    feedIds.add(feedItem.id)
    expectEnum(
      feedItem.category,
      ['news', 'town', 'activity', 'memory', 'scenery'],
      `${path}.category`,
    )
  })

  expectStringFields(
    portal.spotlight,
    ['eyebrow', 'title', 'summary', 'image', 'href', 'meta'],
    'siteData.portal.spotlight',
  )

  const updates = expectArray(portal.updates, 'siteData.portal.updates')
  if (updates.length > 3) fail('siteData.portal.updates', 'at most three updates')
  updates.forEach((item, index) => {
    const path = `siteData.portal.updates[${index}]`
    const update = expectStringFields(item, ['date', 'category', 'title', 'summary', 'href'], path)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(update.date)) fail(`${path}.date`, 'YYYY-MM-DD')
    expectEnum(update.category, ['town', 'community', 'archive'], `${path}.category`)
  })

  const ecosystemIds = new Set()
  expectObjectArray(portal.ecosystem, 'siteData.portal.ecosystem', (item, path) => {
    const link = expectStringFields(item, ['id', 'title', 'description', 'href', 'icon'], path)
    expectSafeSlug(link.id, `${path}.id`)
    if (ecosystemIds.has(link.id)) fail(`${path}.id`, 'unique ecosystem id')
    ecosystemIds.add(link.id)
  })
  for (const requiredId of ['towns', 'wiki', 'skin', 'id']) {
    if (!ecosystemIds.has(requiredId)) {
      fail('siteData.portal.ecosystem', `entry with id "${requiredId}"`)
    }
  }

  const townSlugs = new Set()
  expectObjectArray(portal.towns, 'siteData.portal.towns', (item, path) => {
    const town = expectStringFields(
      item,
      ['slug', 'name', 'subtitle', 'summary', 'cover', 'siteUrl'],
      path,
    )
    expectSafeSlug(town.slug, `${path}.slug`)
    if (townSlugs.has(town.slug)) fail(`${path}.slug`, 'unique town slug')
    townSlugs.add(town.slug)
    expectStringArray(town.tags, `${path}.tags`)
    expectObjectArray(town.facts, `${path}.facts`, (fact, factPath) => {
      expectStringFields(fact, ['label', 'value'], factPath)
    })
  })

  const community = expectStringFields(portal.community, ['intro'], 'siteData.portal.community')
  expectObjectArray(community.links, 'siteData.portal.community.links', (item, path) => {
    const link = expectStringFields(
      item,
      ['title', 'description', 'href', 'icon', 'kind'],
      path,
    )
    expectEnum(link.kind, ['official', 'external'], `${path}.kind`)
  })
  expectStringFields(
    community.creator,
    ['title', 'description'],
    'siteData.portal.community.creator',
  )

  const showcase = expectStringFields(root.showcase, ['intro'], 'siteData.showcase')
  expectObjectArray(showcase.badges, 'siteData.showcase.badges', (item, path) => {
    expectStringFields(item, ['icon', 'label'], path)
  })
  expectObjectArray(showcase.cards, 'siteData.showcase.cards', (item, path) => {
    expectStringFields(item, ['icon', 'title', 'desc'], path)
  })

  const tv = expectObject(root.tv, 'siteData.tv')
  const channels = expectObject(tv.channels, 'siteData.tv.channels')
  for (const [year, stories] of Object.entries(channels)) {
    expectObjectArray(stories, `siteData.tv.channels.${year}`, (item, path) => {
      const story = expectStringFields(item, ['type', 'title', 'desc'], path)
      if (!['event', 'person', 'place', 'meme'].includes(story.type)) {
        fail(`${path}.type`, 'event | person | place | meme')
      }
      if (story.date !== undefined) expectString(story.date, `${path}.date`)
    })
  }

  expectObjectArray(root.gallery, 'siteData.gallery', (item, path) => {
    expectStringFields(item, ['src', 'caption', 'year'], path)
  })
  expectStringArray(root.tips, 'siteData.tips')

  const spirit = expectStringFields(root.spirit, ['quote'], 'siteData.spirit')
  expectObjectArray(spirit.values, 'siteData.spirit.values', (item, path) => {
    expectStringFields(item, ['icon', 'title', 'desc'], path)
  })

  const join = expectStringFields(root.join, ['title', 'subtitle', 'notice'], 'siteData.join')
  expectObjectArray(join.steps, 'siteData.join.steps', (item, path) => {
    const step = expectStringFields(item, ['num', 'title', 'desc'], path)
    if (step.link !== null) expectString(step.link, `${path}.link`)
  })
  validateLink(join.ctaPrimary, 'siteData.join.ctaPrimary')
  validateLink(join.ctaSecondary, 'siteData.join.ctaSecondary')

  const footer = expectStringFields(root.footer, ['tagline', 'icp'], 'siteData.footer')
  expectObjectArray(footer.quickLinks, 'siteData.footer.quickLinks', validateLink)
  expectObjectArray(footer.socialLinks, 'siteData.footer.socialLinks', validateLink)
  validateLink(footer.follow, 'siteData.footer.follow')

  return value
}
