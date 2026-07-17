export function nextHomeFeedIndex(currentIndex, itemCount) {
  if (!Number.isInteger(itemCount) || itemCount < 1) {
    throw new RangeError('itemCount 必须为正整数')
  }
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= itemCount) {
    throw new RangeError('currentIndex 必须位于内容列表范围内')
  }
  return (currentIndex + 1) % itemCount
}

export function selectHomeFeedItems(items, homeFeedIds) {
  if (homeFeedIds === undefined) return items
  if (!Array.isArray(homeFeedIds)) throw new TypeError('homeFeedIds 必须为数组')

  const itemById = new Map(items.map((item) => [item.id, item]))
  const selectedIds = new Set()
  return homeFeedIds.map((id, index) => {
    if (selectedIds.has(id)) throw new TypeError(`homeFeedIds[${index}] 不得重复`)
    selectedIds.add(id)
    const item = itemById.get(id)
    if (!item) throw new TypeError(`homeFeedIds[${index}] 引用了 missing feed item "${id}"`)
    return item
  })
}

export function resolveHomeFeedSource(sourceRef, towns, pages) {
  if (sourceRef === undefined) return null
  if (typeof sourceRef !== 'string') throw new TypeError('sourceRef 必须为字符串')

  const separatorIndex = sourceRef.indexOf(':')
  const kind = sourceRef.slice(0, separatorIndex)
  const id = sourceRef.slice(separatorIndex + 1)

  if (kind === 'town') {
    const town = towns.find((item) => item.id === id)
    if (!town) throw new TypeError(`sourceRef 未找到城镇 "${id}"`)
    return { kind: 'town', name: town.name, href: town.href }
  }

  if (kind === 'page') {
    const page = pages.find((item) => item.id === id)
    if (!page) throw new TypeError(`sourceRef 未找到页面 "${id}"`)
    return { kind: page.kind, name: page.name, href: page.href }
  }

  throw new TypeError(`sourceRef 类型未知: "${sourceRef}"`)
}
