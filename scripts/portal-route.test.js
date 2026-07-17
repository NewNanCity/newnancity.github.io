import assert from 'node:assert/strict'
import test from 'node:test'

import { parsePortalRoute, portalHref } from '../src/routing/portal-route.js'

test('should parse portal routes and safe town slugs', () => {
  assert.deepEqual(parsePortalRoute(''), { page: 'home', key: 'home' })
  assert.deepEqual(parsePortalRoute('#/world'), { page: 'world', key: 'world' })
  assert.deepEqual(parsePortalRoute('#/community/'), { page: 'community', key: 'community' })
  assert.deepEqual(parsePortalRoute('#/world/towns/kaysha'), {
    page: 'town',
    key: 'town:kaysha',
    townSlug: 'kaysha',
  })
})

test('should preserve legacy hash destinations', () => {
  assert.equal(parsePortalRoute('#map').page, 'map')
  assert.equal(parsePortalRoute('#join').page, 'join')
  assert.equal(parsePortalRoute('#showcase').page, 'world')
  assert.equal(parsePortalRoute('#history').page, 'archive')
  assert.equal(parsePortalRoute('#gallery').page, 'archive')
})

test('should reject unknown routes and unsafe town slugs', () => {
  assert.equal(parsePortalRoute('#/missing').page, 'not-found')
  assert.equal(parsePortalRoute('#unknown').page, 'not-found')
  assert.equal(parsePortalRoute('#/world/towns/%2e%2e').page, 'not-found')
  assert.equal(parsePortalRoute('#/world/towns/KaySha').page, 'not-found')
})

test('should generate stable portal links', () => {
  assert.equal(portalHref('home'), '#/')
  assert.equal(portalHref('archive'), '#/archive')
  assert.equal(portalHref('town', 'taohuayuan'), '#/world/towns/taohuayuan')
  assert.throws(() => portalHref('town', '../outside'), /安全的 townSlug/)
  assert.throws(() => portalHref('not-found'), /未知门户页面/)
})
