import type { TaskFilter } from '../types/task.ts'

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

export function isTaskFilter(value: unknown): value is TaskFilter {
  return value === 'all' || value === 'completed' || value === 'active'
}
