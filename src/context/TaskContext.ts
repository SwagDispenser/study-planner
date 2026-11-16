import { createContext } from 'react'
import type { Task, TaskDraft, TaskFilter } from '../types/task'

export interface ToastMessage {
  id: string
  message: string
  kind: 'success' | 'error'
}

export interface TaskContextValue {
  tasks: Task[]
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  page: number
  pageCount: number
  serverTotal: number
  setPage: (page: number) => void
  listStatus: 'loading' | 'success' | 'error'
  listError: string
  reloadTasks: () => void
  busy: boolean
  editingTask: Task | null
  selectedId: number | null
  selectTask: (id: number | null) => void
  revision: number
  toast: ToastMessage | null
  addTask: (draft: TaskDraft) => Promise<boolean>
  updateTask: (id: number, changes: TaskDraft) => Promise<boolean>
  toggleTask: (id: number) => Promise<void>
  deleteTask: (id: number) => Promise<boolean>
  startEditing: (id: number) => void
  cancelEditing: () => void
  dismissToast: () => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
