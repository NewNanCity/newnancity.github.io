function canonicalHref(href) {
  if (href.startsWith('#') || href.startsWith('/')) return href
  return new URL(href).href
}

function destinationFor(href) {
  if (href.startsWith('#')) return 'route'
  if (href.startsWith('/')) return 'local'
  return 'external'
}

function normalizeSearchText(value) {
  return value.toLocaleLowerCase('zh-CN').replace(/\s+/g, '')
}

export function collectTravelTargets(siteData) {
  const targets = []
  const seenDestinations = new Set()

  const append = (target) => {
    const href = canonicalHref(target.href)
    if (seenDestinations.has(href)) return
    seenDestinations.add(href)
    targets.push({
      ...target,
      href,
      destination: destinationFor(href),
    })
  }

  siteData.portal.gateways.forEach((gateway) => {
    append({
      id: `gateway:${gateway.id}`,
      group: 'portal',
      label: gateway.label,
      description: gateway.description,
      icon: gateway.icon,
      href: gateway.href,
    })
  })

  ;(siteData.portal.townDirectory ?? []).forEach((town) => {
    append({
      id: `town:${town.id}`,
      group: 'town',
      label: town.name,
      description: town.meta,
      icon: '◆',
      href: town.href,
      status: town.status,
    })
  })

  siteData.nav.links.forEach((link) => {
    append({
      id: `utility:${canonicalHref(link.url)}`,
      group: 'utility',
      label: link.label,
      description: '牛腩常用入口',
      icon: link.icon,
      href: link.url,
    })
  })

  ;(siteData.portal.contentSources ?? []).forEach((source) => {
    append({
      id: `page:${source.id}`,
      group: 'page',
      label: source.name,
      description: source.description,
      icon: source.kind === 'player' ? '✦' : '●',
      href: source.href,
      status: source.status,
    })
  })

  return targets
}

export function filterTravelTargets(targets, query) {
  const normalizedQuery = normalizeSearchText(query)
  if (normalizedQuery.length === 0) return targets

  return targets.filter((target) => normalizeSearchText(
    `${target.label} ${target.description} ${target.href}`,
  ).includes(normalizedQuery))
}
