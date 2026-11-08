import { createContext } from 'react'
import type { Task, TaskDraft, TaskFilter } from '../types/task'
import type { PendingDeletion } from '../state/taskReducer'

export interface ToastMessage {
  id: string
  message: string
  kind: 'success' | 'error'
}

export interface TaskContextValue {
  tasks: Task[]
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  pendingDeletion: PendingDeletion | null
  toast: ToastMessage | null
  addTask: (draft: TaskDraft) => boolean
  updateTask: (id: Task['id'], changes: TaskDraft) => boolean
  toggleTask: (id: Task['id']) => void
  requestDelete: (id: Task['id']) => void
  undoDelete: () => void
  resetTasks: () => void
  dismissToast: () => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
