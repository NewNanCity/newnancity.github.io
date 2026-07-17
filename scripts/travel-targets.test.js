import assert from 'node:assert/strict'
import test from 'node:test'

import {
  collectTravelTargets,
  filterTravelTargets,
} from '../src/navigation/travel-targets.js'

const fixture = {
  nav: {
    links: [
      { label: '牛腩地图', icon: 'M', url: '#/map' },
      { label: '皮肤站', icon: 'S', url: 'https://skin.newnan.city' },
    ],
  },
  portal: {
    gateways: [
      {
        id: 'world',
        label: '世界',
        description: '城镇与铁路',
        href: '#/world',
        icon: 'W',
      },
      {
        id: 'community',
        label: '社区',
        description: '玩家与新闻',
        href: '#/community',
        icon: 'C',
      },
    ],
    townDirectory: [
      {
        id: 'kaysha',
        name: '凯夏镇',
        meta: '中世纪古镇',
        href: '/towns/kayshatown/',
        status: 'open',
      },
    ],
    contentSources: [
      {
        id: 'official-community',
        kind: 'official',
        name: '社区公告',
        description: '官方社区动态',
        href: '#/community',
        status: 'open',
      },
      {
        id: 'player-journal',
        kind: 'player',
        name: 'Player Journal',
        description: '玩家手记',
        href: 'https://example.com/journal',
        status: 'open',
      },
    ],
  },
}

test('should derive grouped travel targets and deduplicate destinations', () => {
  const targets = collectTravelTargets(fixture)

  assert.deepEqual(
    targets.map((target) => target.id),
    [
      'gateway:world',
      'gateway:community',
      'town:kaysha',
      'utility:#/map',
      'utility:https://skin.newnan.city/',
      'page:player-journal',
    ],
  )
  assert.deepEqual(
    targets.map((target) => target.destination),
    ['route', 'route', 'local', 'route', 'external', 'external'],
  )
})

test('should support a V3 payload without towns or registered pages', () => {
  const legacy = structuredClone(fixture)
  delete legacy.portal.townDirectory
  delete legacy.portal.contentSources

  assert.equal(collectTravelTargets(legacy).length, 4)
})

test('should filter travel targets with normalized Chinese and English queries', () => {
  const targets = collectTravelTargets(fixture)

  assert.equal(filterTravelTargets(targets, '').length, targets.length)
  assert.deepEqual(
    filterTravelTargets(targets, ' 凯 夏 ').map((target) => target.id),
    ['town:kaysha'],
  )
  assert.deepEqual(
    filterTravelTargets(targets, 'PLAYER').map((target) => target.id),
    ['page:player-journal'],
  )
  assert.deepEqual(filterTravelTargets(targets, '不存在'), [])
})
