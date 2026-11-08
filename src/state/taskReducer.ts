import { initialTasks } from '../data/initialTasks.ts'
import type { Task, TaskDraft } from '../types/task.ts'

export interface PendingDeletion {
  taskId: Task['id']
  token: string
  deadline: number
}

export interface TaskState {
  tasks: Task[]
  nextId: number
  pendingDeletion: PendingDeletion | null
}

export type TaskAction =
  | { type: 'add'; payload: TaskDraft }
  | { type: 'toggle'; payload: { id: Task['id'] } }
  | { type: 'update'; payload: { id: Task['id']; changes: TaskDraft } }
  | { type: 'requestDelete'; payload: PendingDeletion }
  | { type: 'confirmDelete'; payload: { token: string } }
  | { type: 'undoDelete'; payload: { token: string } }
  | { type: 'reset' }

export function createTaskState(tasks: Task[]): TaskState {
  return {
    tasks: tasks.map((task) => ({ ...task })),
    nextId: tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1,
    pendingDeletion: null,
  }
}

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        nextId: state.nextId + 1,
        tasks: [...state.tasks, { ...action.payload, id: state.nextId, completed: false }],
      }
    case 'toggle':
      if (state.pendingDeletion?.taskId === action.payload.id) return state
      return {
        ...state,
        tasks: state.tasks.map((task) => task.id === action.payload.id
          ? { ...task, completed: !task.completed }
          : task),
      }
    case 'update':
      if (state.pendingDeletion?.taskId === action.payload.id) return state
      return {
        ...state,
        tasks: state.tasks.map((task) => task.id === action.payload.id
          ? { ...task, ...action.payload.changes }
          : task),
      }
    case 'requestDelete':
      if (state.pendingDeletion || !state.tasks.some((task) => task.id === action.payload.taskId)) {
        return state
      }
      return { ...state, pendingDeletion: action.payload }
    case 'confirmDelete':
      if (state.pendingDeletion?.token !== action.payload.token) return state
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== state.pendingDeletion?.taskId),
        pendingDeletion: null,
      }
    case 'undoDelete':
      if (state.pendingDeletion?.token !== action.payload.token) return state
      return { ...state, pendingDeletion: null }
    case 'reset':
      return createTaskState(initialTasks)
  }
}
