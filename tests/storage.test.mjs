import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isTaskFilter, readStoredValue } from '../src/utils/storage.ts'

test('only supported UI filters can be restored from storage', () => {
  assert.equal(isTaskFilter('active'), true)
  assert.equal(isTaskFilter('completed'), true)
  assert.equal(isTaskFilter('unknown'), false)
  assert.equal(isTaskFilter(null), false)
})

test('UI filter hydration handles malformed and unavailable storage', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  try {
    for (const [raw, expected] of [
      [null, 'all'], ['not JSON', 'all'], ['{}', 'all'], ['null', 'all'],
      ['"active"', 'active'], ['"completed"', 'completed'], ['"unknown"', 'all'],
    ]) {
      Object.defineProperty(globalThis, 'window', {
        configurable: true, value: { localStorage: { getItem: () => raw } },
      })
      assert.equal(readStoredValue('filter', 'all', isTaskFilter), expected)
    }
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { get localStorage() { throw new Error('Storage blocked') } },
    })
    assert.equal(readStoredValue('filter', 'all', isTaskFilter), 'all')
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else delete globalThis.window
  }
})
