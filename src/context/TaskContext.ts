import { createContext } from 'react'
import type { Task, TaskDraft } from '../types/task'

export interface ToastMessage {
  id: string
  message: string
  kind: 'success' | 'error'
}

export interface TaskContextValue {
  tasks: Task[]
  page: number
  pageCount: number
  serverTotal: number
  setPage: (page: number) => void
  listStatus: 'loading' | 'success' | 'error'
  listError: string
  reloadTasks: () => void
  busy: boolean
  revision: number
  toast: ToastMessage | null
  addTask: (draft: TaskDraft) => Promise<void>
  updateTask: (id: number, changes: TaskDraft) => Promise<void>
  toggleTask: (task: Task) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  dismissToast: () => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
