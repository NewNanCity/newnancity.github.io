import assert from 'node:assert/strict'
import test from 'node:test'

import {
  nextHomeFeedIndex,
  resolveHomeFeedSource,
  selectHomeFeedItems,
} from '../src/state/home-feed-state.js'

test('should advance through the home feed and wrap to the first item', () => {
  assert.equal(nextHomeFeedIndex(0, 5), 1)
  assert.equal(nextHomeFeedIndex(3, 5), 4)
  assert.equal(nextHomeFeedIndex(4, 5), 0)
})

test('should reject invalid home feed state', () => {
  assert.throws(() => nextHomeFeedIndex(-1, 5), /currentIndex/)
  assert.throws(() => nextHomeFeedIndex(0, 0), /itemCount/)
  assert.throws(() => nextHomeFeedIndex(5, 5), /currentIndex/)
})

test('should select home feed items by stable id and preserve legacy behavior', () => {
  const items = [
    { id: 'one', title: 'One' },
    { id: 'two', title: 'Two' },
    { id: 'three', title: 'Three' },
  ]

  assert.equal(selectHomeFeedItems(items), items)
  assert.deepEqual(
    selectHomeFeedItems(items, ['three', 'one']).map((item) => item.id),
    ['three', 'one'],
  )
  assert.throws(() => selectHomeFeedItems(items, ['one', 'one']), /homeFeedIds/)
  assert.throws(() => selectHomeFeedItems(items, ['missing']), /missing/)
})

test('should resolve town and registered page content sources', () => {
  const towns = [
    { id: 'kaysha', name: '凯夏镇', href: '/towns/kayshatown/', status: 'open' },
  ]
  const pages = [
    {
      id: 'player-journal',
      kind: 'player',
      name: '玩家手记',
      href: 'https://example.com/journal',
      status: 'open',
    },
  ]

  assert.deepEqual(resolveHomeFeedSource('town:kaysha', towns, pages), {
    kind: 'town',
    name: '凯夏镇',
    href: '/towns/kayshatown/',
  })
  assert.deepEqual(resolveHomeFeedSource('page:player-journal', towns, pages), {
    kind: 'player',
    name: '玩家手记',
    href: 'https://example.com/journal',
  })
  assert.equal(resolveHomeFeedSource(undefined, towns, pages), null)
  assert.throws(() => resolveHomeFeedSource('town:missing', towns, pages), /sourceRef/)
})
