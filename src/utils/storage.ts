import type { Task, TaskFilter } from '../types/task.ts'

export const TASKS_STORAGE_KEY = 'study-planner.tasks'
export const FILTER_STORAGE_KEY = 'study-planner.filter'

export function readStoredValue<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  try {
    const saved = window.localStorage.getItem(key)
    if (saved === null) return fallback
    const value: unknown = JSON.parse(saved)
    return isValid(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function isTaskArray(value: unknown): value is Task[] {
  if (!Array.isArray(value)) return false
  const valid = value.every((task: unknown) => {
    if (typeof task !== 'object' || task === null) return false
    const candidate = task as Record<string, unknown>
    return typeof candidate.id === 'number'
      && Number.isSafeInteger(candidate.id) && candidate.id > 0
      && typeof candidate.title === 'string' && candidate.title.trim().length > 0
      && typeof candidate.description === 'string'
      && typeof candidate.completed === 'boolean'
      && (candidate.priority === 'low' || candidate.priority === 'medium' || candidate.priority === 'high')
      && typeof candidate.category === 'string'
  })
  return valid && new Set(value.map((task: Task) => task.id)).size === value.length
}

export function isTaskFilter(value: unknown): value is TaskFilter {
  return value === 'all' || value === 'completed' || value === 'active'
}
