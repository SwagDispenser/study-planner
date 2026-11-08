import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialTasks } from '../src/data/initialTasks.ts'
import { isTaskArray, isTaskFilter, readStoredValue } from '../src/utils/storage.ts'

test('storage validates tasks, priorities, IDs and filters at runtime', () => {
  assert.equal(isTaskArray(initialTasks), true)
  assert.equal(isTaskArray([]), true)
  assert.equal(isTaskArray(null), false)
  assert.equal(isTaskArray([initialTasks[0], initialTasks[0]]), false)
  for (const invalid of [
    { title: '   ' }, { id: -1 }, { id: 1.5 }, { completed: 'false' },
    { priority: 'urgent' }, { priority: ['high'] }, { description: null }, { category: 123 },
  ]) {
    assert.equal(isTaskArray([{ ...initialTasks[0], ...invalid }]), false)
  }
  assert.equal(isTaskFilter('active'), true)
  assert.equal(isTaskFilter('unknown'), false)
})

test('hydration handles valid, empty, malformed and unavailable storage', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  try {
    for (const [raw, expected] of [
      [null, initialTasks], ['not JSON', initialTasks], ['{}', initialTasks],
      ['null', initialTasks], ['[]', []], [JSON.stringify(initialTasks), initialTasks],
    ]) {
      Object.defineProperty(globalThis, 'window', {
        configurable: true, value: { localStorage: { getItem: () => raw } },
      })
      assert.deepEqual(readStoredValue('tasks', initialTasks, isTaskArray), expected)
    }
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { get localStorage() { throw new Error('Storage blocked') } },
    })
    assert.deepEqual(readStoredValue('tasks', initialTasks, isTaskArray), initialTasks)
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else delete globalThis.window
  }
})
