import assert from 'node:assert/strict'
import test from 'node:test'

import { nextHomeFeedIndex } from '../src/state/home-feed-state.js'

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
