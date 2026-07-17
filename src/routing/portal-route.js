const SIMPLE_ROUTES = new Map([
  ['world', 'world'],
  ['community', 'community'],
  ['archive', 'archive'],
  ['join', 'join'],
  ['map', 'map'],
])

const LEGACY_ROUTES = new Map([
  ['map', 'map'],
  ['join', 'join'],
  ['showcase', 'world'],
  ['history', 'archive'],
  ['gallery', 'archive'],
  ['spirit', 'archive'],
])

function simpleRoute(page) {
  return { page, key: page }
}

export function parsePortalRoute(hash) {
  const rawHash = typeof hash === 'string' ? hash : ''
  const rawPath = rawHash.replace(/^#/, '')

  if (rawPath === '' || rawPath === '/') return simpleRoute('home')

  if (!rawPath.startsWith('/')) {
    const legacyPage = LEGACY_ROUTES.get(rawPath)
    return legacyPage
      ? simpleRoute(legacyPage)
      : { page: 'not-found', key: `not-found:${rawPath}`, path: rawPath }
  }

  const segments = rawPath.split('/').filter(Boolean)
  if (segments.length === 1) {
    const page = SIMPLE_ROUTES.get(segments[0])
    if (page) return simpleRoute(page)
  }

  if (segments.length === 3 && segments[0] === 'world' && segments[1] === 'towns') {
    let townSlug
    try {
      townSlug = decodeURIComponent(segments[2])
    } catch {
      townSlug = ''
    }

    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(townSlug)) {
      return { page: 'town', key: `town:${townSlug}`, townSlug }
    }
  }

  return { page: 'not-found', key: `not-found:${rawPath}`, path: rawPath }
}

export function portalHref(page, townSlug) {
  if (page === 'home') return '#/'
  if (page === 'town') {
    if (!townSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(townSlug)) {
      throw new TypeError('城镇路由需要安全的 townSlug')
    }
    return `#/world/towns/${townSlug}`
  }
  if (!SIMPLE_ROUTES.has(page)) throw new TypeError(`未知门户页面: ${page}`)
  return `#/${page}`
}
