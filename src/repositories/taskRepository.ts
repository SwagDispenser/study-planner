import { ApiError } from '../api/errors.ts'
import { httpClient } from '../api/httpClient.ts'
import type { HttpClient } from '../api/httpClient.ts'
import type { Task, TaskDraft } from '../types/task.ts'

export interface ApiTodo {
  id: number
  todo: string
  completed: boolean
  userId: number
}

export interface TodosResponse {
  todos: ApiTodo[]
  total: number
  skip: number
  limit: number
}

export interface TaskPage {
  tasks: Task[]
  serverTotal: number
}

type TaskChanges = Partial<TaskDraft & Pick<Task, 'completed'>>

export function toTask(todo: ApiTodo): Task {
  if (!Number.isSafeInteger(todo.id) || todo.id <= 0 || typeof todo.todo !== 'string'
    || typeof todo.completed !== 'boolean' || !Number.isSafeInteger(todo.userId)) {
    throw new ApiError('API повернув некоректне завдання.')
  }
  return {
    id: todo.id,
    title: todo.todo,
    completed: todo.completed,
    description: '',
    category: 'General',
    priority: 'medium',
  }
}

// DummyJSON does not persist mutations. This session-only change journal keeps
// successful changes across page/detail GETs; it is never written to localStorage.
export function createTaskRepository(client: HttpClient) {
  const changes = new Map<number, TaskChanges>()
  const deleted = new Set<number>()
  const created = new Map<number, Task>()
  let nextLocalId = -1

  function applyChanges(todo: ApiTodo): Task {
    return { ...toTask(todo), ...changes.get(todo.id) }
  }

  return {
    async getAll({ limit = 10, skip = 0, signal }: { limit?: number; skip?: number; signal?: AbortSignal } = {}): Promise<TaskPage> {
      const response = await client<TodosResponse>(`/todos?limit=${limit}&skip=${skip}`, { signal })
      if (!Array.isArray(response.todos) || !Number.isSafeInteger(response.total) || response.total < 0) {
        throw new ApiError('API повернув некоректний список завдань.')
      }
      const tasks = response.todos.filter((todo) => !deleted.has(todo.id)).map(applyChanges)
      return {
        tasks: skip === 0 ? [...created.values()].reverse().concat(tasks) : tasks,
        serverTotal: response.total,
      }
    },

    async getById(id: number, signal?: AbortSignal): Promise<Task> {
      signal?.throwIfAborted()
      const localTask = created.get(id)
      if (localTask) return { ...localTask }
      if (deleted.has(id) || id < 0) throw new ApiError('Завдання вже видалено.', 404)
      const todo = await client<ApiTodo>(`/todos/${id}`, { signal })
      if (deleted.has(id)) throw new ApiError('Завдання вже видалено.', 404)
      return applyChanges(todo)
    },

    async create(draft: TaskDraft): Promise<Task> {
      const todo = await client<ApiTodo>('/todos/add', {
        method: 'POST',
        body: JSON.stringify({ todo: draft.title, completed: false, userId: 1 }),
      })
      // Each simulated POST may return the same server ID. Negative session IDs
      // prevent collisions; these records do not exist at GET /todos/:id.
      const task: Task = { ...toTask(todo), ...draft, id: nextLocalId-- }
      created.set(task.id, task)
      return task
    },

    async update(id: number, patch: TaskChanges): Promise<Task> {
      const localTask = created.get(id)
      if (localTask) {
        const task = { ...localTask, ...patch }
        created.set(id, task)
        return task
      }
      if (deleted.has(id) || id < 0) throw new ApiError('Завдання вже видалено.', 404)
      // Metadata belongs only to the client; send actual API fields exclusively.
      const body = {
        ...(patch.title === undefined ? {} : { todo: patch.title }),
        ...(patch.completed === undefined ? {} : { completed: patch.completed }),
      }
      const todo = await client<ApiTodo>(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
      toTask(todo)
      changes.set(id, { ...changes.get(id), ...patch })
      return applyChanges(todo)
    },

    async delete(id: number): Promise<void> {
      if (created.has(id)) {
        created.delete(id)
        return
      }
      if (id < 0 || deleted.has(id)) throw new ApiError('Завдання вже видалено.', 404)
      await client<unknown>(`/todos/${id}`, { method: 'DELETE' })
      deleted.add(id)
      changes.delete(id)
    },
  }
}

export const taskRepository = createTaskRepository(httpClient)
