import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, isAbortError } from '../src/api/errors.ts'
import { createHttpClient } from '../src/api/httpClient.ts'
import { createTaskRepository } from '../src/repositories/taskRepository.ts'

const todo = { id: 1, todo: 'Read React docs', completed: false, userId: 1 }
const draft = { title: 'Lab 10', description: 'REST', category: 'Study', priority: 'high' }

function fixture() {
  const calls = []
  const client = async (path, options = {}) => {
    calls.push({ path, ...options })
    options.signal?.throwIfAborted()
    if (path.startsWith('/todos?')) return { todos: [todo], total: 21, skip: 0, limit: 10 }
    if (path === '/todos/add') return { ...todo, id: 255, ...JSON.parse(options.body) }
    if (options.method === 'PATCH') return { ...todo, ...JSON.parse(options.body) }
    return { ...todo }
  }
  return { repository: createTaskRepository(client), calls }
}

test('repository maps DTO, pagination and detail GET; passes AbortSignal', async () => {
  const { repository, calls } = fixture()
  const controller = new AbortController()
  const page = await repository.getAll({ limit: 10, skip: 10, signal: controller.signal })
  assert.equal(calls[0].path, '/todos?limit=10&skip=10')
  assert.equal(calls[0].signal, controller.signal)
  assert.equal(page.serverTotal, 21)
  assert.deepEqual(page.tasks[0], { id: 1, title: todo.todo, completed: false, description: '', category: 'General', priority: 'medium' })
  assert.deepEqual(await repository.getById(1, controller.signal), page.tasks[0])
  assert.equal(calls[1].path, '/todos/1')
  assert.equal(calls[1].signal, controller.signal)
})

test('successful PATCH sends only supported fields; journal survives list and detail GET', async () => {
  const { repository, calls } = fixture()
  const updated = await repository.update(1, { ...draft, completed: true })
  assert.deepEqual(JSON.parse(calls[0].body), { todo: 'Lab 10', completed: true })
  assert.equal(calls[0].method, 'PATCH')
  assert.deepEqual(updated, { id: 1, ...draft, completed: true })
  assert.deepEqual((await repository.getAll()).tasks[0], updated)
  assert.deepEqual(await repository.getById(1), updated)
})

test('DELETE is sent to API; removed records do not reappear on refresh', async () => {
  const { repository, calls } = fixture()
  await repository.delete(1)
  assert.equal(calls[0].method, 'DELETE')
  assert.equal(calls[0].path, '/todos/1')
  assert.equal((await repository.getAll()).tasks.length, 0)
  await assert.rejects(repository.getById(1), { status: 404 })
})

test('repeated simulated POST IDs stay distinct; new records support local details/edit/delete', async () => {
  const { repository, calls } = fixture()
  const first = await repository.create(draft)
  const second = await repository.create(draft)
  assert.notEqual(first.id, second.id)
  assert.ok(first.id < 0)
  assert.deepEqual(JSON.parse(calls[0].body), { todo: 'Lab 10', completed: false, userId: 1 })
  assert.equal((await repository.getAll()).tasks.length, 3)
  assert.equal((await repository.getAll({ skip: 10 })).tasks.length, 1)
  const count = calls.length
  assert.deepEqual(await repository.getById(first.id), first)
  assert.equal((await repository.update(first.id, { title: 'Edited', completed: true })).title, 'Edited')
  await repository.delete(first.id)
  assert.equal(calls.length, count)
  await assert.rejects(repository.getById(first.id), { status: 404 })
  assert.equal((await repository.getAll()).tasks.length, 2)
})

test('failed mutations leave journal unchanged and errors propagate for retry', async () => {
  let fail = true
  const repository = createTaskRepository(async (path, options = {}) => {
    if (fail && options.method) throw new ApiError('Unavailable', 503)
    if (path.startsWith('/todos?')) return { todos: [todo], total: 1 }
    return { ...todo, ...JSON.parse(options.body ?? '{}') }
  })
  await assert.rejects(repository.update(1, { title: 'Changed' }), { status: 503 })
  await assert.rejects(repository.delete(1), { status: 503 })
  await assert.rejects(repository.create(draft), { status: 503 })
  assert.equal((await repository.getAll()).tasks[0].title, todo.todo)
  fail = false
  assert.equal((await repository.update(1, { title: 'Changed' })).title, 'Changed')
})

test('repository propagates cancellation and rejects malformed API data', async () => {
  const { repository } = fixture()
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(repository.getAll({ signal: controller.signal }), isAbortError)
  await assert.rejects(repository.getById(1, controller.signal), isAbortError)
  const invalid = createTaskRepository(async () => ({ todos: [], total: -1 }))
  await assert.rejects(invalid.getAll(), ApiError)
  await assert.rejects(invalid.getById(1), ApiError)
})

test('HTTP client builds env-based URL, sends JSON and handles HTTP/network/abort errors', async (t) => {
  const client = createHttpClient('https://example.test/api/')
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.href, 'https://example.test/api/todos/add')
    assert.equal(options.headers.get('Content-Type'), 'application/json')
    assert.equal(options.headers.get('Accept'), 'application/json')
    return new Response(JSON.stringify(todo))
  })
  assert.deepEqual(await client('/todos/add', { method: 'POST', body: '{}' }), todo)
  globalThis.fetch = async () => new Response('{}', { status: 404 })
  await assert.rejects(client('/todos/1'), { status: 404 })
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(client('/todos'), ApiError)
  const controller = new AbortController()
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  })
  const pending = client('/todos', { signal: controller.signal })
  controller.abort()
  await assert.rejects(pending, isAbortError)
  await assert.rejects(createHttpClient(undefined)('/todos'), /VITE_API_URL/)
})
