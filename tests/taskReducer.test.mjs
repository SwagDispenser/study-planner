import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialTasks } from '../src/data/initialTasks.ts'
import { createTaskState, taskReducer } from '../src/state/taskReducer.ts'

const draft = { title: 'Практика', description: 'Опис', category: 'React', priority: 'high' }
const deletion = { taskId: 1, token: 'delete-1', deadline: 5000 }

function freezeDeep(value) {
  Object.freeze(value)
  Object.values(value).forEach((child) => {
    if (child && typeof child === 'object') freezeDeep(child)
  })
  return value
}

test('add generates distinct IDs and does not mutate the previous state', () => {
  const before = freezeDeep(createTaskState(initialTasks))
  const after = taskReducer(before, { type: 'add', payload: draft })
  const twice = taskReducer(after, { type: 'add', payload: draft })
  assert.equal(before.tasks.length, 3)
  assert.equal(twice.tasks.length, 5)
  assert.equal(new Set(twice.tasks.map((task) => task.id)).size, 5)
  assert.equal(after.tasks.at(-1).completed, false)
  assert.deepEqual(taskReducer(before, { type: 'add', payload: draft }), after)
})

test('toggle and update copy objects, preserving ID and completion on edit', () => {
  const before = freezeDeep(createTaskState(initialTasks))
  const toggled = taskReducer(before, { type: 'toggle', payload: { id: 1 } })
  const updated = taskReducer(toggled, { type: 'update', payload: { id: 1, changes: draft } })
  assert.equal(before.tasks[0].completed, false)
  assert.deepEqual(updated.tasks[0], { ...draft, id: 1, completed: true })
  assert.equal(updated.tasks[1], before.tasks[1])
})

test('requestDelete retains tasks; undo restores the ordinary state', () => {
  const before = freezeDeep(createTaskState(initialTasks))
  const pending = taskReducer(before, { type: 'requestDelete', payload: deletion })
  assert.equal(pending.tasks, before.tasks)
  assert.deepEqual(pending.pendingDeletion, deletion)
  const undone = taskReducer(pending, { type: 'undoDelete', payload: { token: deletion.token } })
  assert.equal(undone.pendingDeletion, null)
  assert.deepEqual(undone.tasks, before.tasks)
  assert.equal(taskReducer(undone, { type: 'confirmDelete', payload: { token: deletion.token } }), undone)
})

test('confirmDelete removes exactly the pending task and cannot repeat', () => {
  const pending = freezeDeep(taskReducer(createTaskState(initialTasks), {
    type: 'requestDelete', payload: deletion,
  }))
  const after = taskReducer(pending, { type: 'confirmDelete', payload: { token: deletion.token } })
  assert.deepEqual(after.tasks.map((task) => task.id), [2, 3])
  assert.equal(pending.tasks.length, 3)
  assert.equal(after.pendingDeletion, null)
  assert.equal(taskReducer(after, { type: 'confirmDelete', payload: { token: deletion.token } }), after)
})

test('only one deletion is active; unrelated operations do not replace its deadline', () => {
  const pending = taskReducer(createTaskState(initialTasks), { type: 'requestDelete', payload: deletion })
  assert.equal(taskReducer(pending, {
    type: 'requestDelete', payload: { taskId: 2, token: 'other', deadline: 9000 },
  }), pending)
  const added = taskReducer(pending, { type: 'add', payload: draft })
  assert.equal(added.pendingDeletion, pending.pendingDeletion)
  assert.equal(taskReducer(pending, { type: 'toggle', payload: { id: 1 } }), pending)
  assert.equal(taskReducer(pending, { type: 'update', payload: { id: 1, changes: draft } }), pending)
})

test('stale callbacks cannot confirm or undo a newer deletion', () => {
  const pending = taskReducer(createTaskState(initialTasks), { type: 'requestDelete', payload: deletion })
  assert.equal(taskReducer(pending, { type: 'confirmDelete', payload: { token: 'stale' } }), pending)
  assert.equal(taskReducer(pending, { type: 'undoDelete', payload: { token: 'stale' } }), pending)
})

test('reset restores initial data, cancels pending deletion and ignores its stale callback', () => {
  const pending = taskReducer(createTaskState([]), { type: 'add', payload: draft })
  const deleting = taskReducer(pending, { type: 'requestDelete', payload: deletion })
  const reset = taskReducer(deleting, { type: 'reset' })
  assert.deepEqual(reset.tasks, initialTasks)
  assert.notEqual(reset.tasks[0], initialTasks[0])
  assert.equal(reset.pendingDeletion, null)
  assert.equal(taskReducer(reset, { type: 'confirmDelete', payload: { token: deletion.token } }), reset)
})

test('missing tasks cannot be scheduled for deletion', () => {
  const before = createTaskState([])
  assert.equal(taskReducer(before, { type: 'requestDelete', payload: deletion }), before)
})
