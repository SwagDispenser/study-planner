import { useCallback, useEffect, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { initialTasks } from '../data/initialTasks'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createTaskState, taskReducer } from '../state/taskReducer'
import type { Task, TaskDraft, TaskFilter } from '../types/task'
import { FILTER_STORAGE_KEY, isTaskArray, isTaskFilter, readStoredValue, TASKS_STORAGE_KEY } from '../utils/storage'
import { TaskContext } from './TaskContext'
import type { ToastMessage } from './TaskContext'

export const DELETE_DELAY_MS = 5000
const TOAST_DURATION_MS = 3500

function initializeTasks() {
  return createTaskState(readStoredValue(TASKS_STORAGE_KEY, initialTasks, isTaskArray))
}

function normalizeDraft(draft: TaskDraft): TaskDraft {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category.trim() || 'Без категорії',
    priority: draft.priority,
  }
}

function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, undefined, initializeTasks)
  const [filter, setFilter] = useLocalStorage<TaskFilter>(FILTER_STORAGE_KEY, 'all', isTaskFilter)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const { tasks, pendingDeletion } = state
  const activeCount = tasks.filter((task) => !task.completed).length

  const showToast = useCallback((message: string, kind: ToastMessage['kind'] = 'success') => {
    setToast({ id: crypto.randomUUID(), message, kind })
  }, [])

  useEffect(() => {
    let errorTimer: number | undefined
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      errorTimer = window.setTimeout(() => {
        showToast('Не вдалося зберегти завдання. Зміни доступні лише в поточній вкладці.', 'error')
      }, 0)
    }
    return () => window.clearTimeout(errorTimer)
  }, [tasks, showToast])

  useEffect(() => {
    const previousTitle = document.title
    document.title = `Study Planner — невиконаних: ${activeCount}`
    return () => { document.title = previousTitle }
  }, [activeCount])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!pendingDeletion) return
    const timer = window.setTimeout(() => {
      dispatch({ type: 'confirmDelete', payload: { token: pendingDeletion.token } })
      showToast('Завдання остаточно видалено.')
    }, Math.max(0, pendingDeletion.deadline - Date.now()))
    return () => window.clearTimeout(timer)
  }, [pendingDeletion, showToast])

  function addTask(draft: TaskDraft) {
    const normalized = normalizeDraft(draft)
    if (!normalized.title) {
      showToast('Не вдалося додати завдання: введіть назву.', 'error')
      return false
    }
    dispatch({ type: 'add', payload: normalized })
    setFilter('all')
    showToast('Завдання додано.')
    return true
  }

  function canChangeTask(id: Task['id']) {
    if (!tasks.some((task) => task.id === id)) {
      showToast('Завдання вже не існує.', 'error')
      return false
    }
    if (pendingDeletion?.taskId === id) {
      showToast('Спочатку скасуйте видалення цього завдання.', 'error')
      return false
    }
    return true
  }

  function updateTask(id: Task['id'], changes: TaskDraft) {
    if (!canChangeTask(id)) return false
    const normalized = normalizeDraft(changes)
    if (!normalized.title) {
      showToast('Не вдалося зберегти завдання: введіть назву.', 'error')
      return false
    }
    dispatch({ type: 'update', payload: { id, changes: normalized } })
    showToast('Зміни збережено.')
    return true
  }

  function toggleTask(id: Task['id']) {
    if (canChangeTask(id)) dispatch({ type: 'toggle', payload: { id } })
  }

  function requestDelete(id: Task['id']) {
    if (pendingDeletion) {
      showToast('Спочатку скасуйте або дочекайтеся поточного видалення.', 'error')
      return
    }
    if (!canChangeTask(id)) return
    dispatch({
      type: 'requestDelete',
      payload: { taskId: id, token: crypto.randomUUID(), deadline: Date.now() + DELETE_DELAY_MS },
    })
    setToast(null)
  }

  function undoDelete() {
    if (!pendingDeletion) return
    dispatch({ type: 'undoDelete', payload: { token: pendingDeletion.token } })
    showToast('Видалення скасовано.')
  }

  function resetTasks() {
    dispatch({ type: 'reset' })
    setFilter('all')
    showToast('Відновлено початкові завдання.')
  }

  return (
    <TaskContext.Provider value={{
      tasks, filter, setFilter, pendingDeletion, toast,
      addTask, updateTask, toggleTask, requestDelete, undoDelete, resetTasks,
      dismissToast: () => setToast(null),
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export default TaskProvider
