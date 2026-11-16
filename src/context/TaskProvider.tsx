import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { getErrorMessage, isAbortError } from '../api/errors'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { taskRepository } from '../repositories/taskRepository'
import type { Task, TaskDraft, TaskFilter } from '../types/task'
import { FILTER_STORAGE_KEY, isTaskFilter } from '../utils/storage'
import { TaskContext } from './TaskContext'
import type { ToastMessage } from './TaskContext'

const PAGE_SIZE = 10

function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useLocalStorage<TaskFilter>(FILTER_STORAGE_KEY, 'all', isTaskFilter)
  const [page, setPageState] = useState(1)
  const [serverTotal, setServerTotal] = useState(0)
  const [listStatus, setListStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [listError, setListError] = useState('')
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const mutationLock = useRef(false)
  const listController = useRef<AbortController | null>(null)
  const [revision, setRevision] = useState(0)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedId, selectTask] = useState<number | null>(null)
  const editingTask = tasks.find((task) => task.id === editingId) ?? null
  const activeCount = tasks.filter((task) => !task.completed).length
  const pageCount = Math.max(1, Math.ceil(serverTotal / PAGE_SIZE))

  const showToast = useCallback((message: string, kind: ToastMessage['kind'] = 'success') => {
    setToast({ id: crypto.randomUUID(), message, kind })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    listController.current = controller
    taskRepository.getAll({ limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return
        setTasks(result.tasks)
        setServerTotal(result.serverTotal)
        setListStatus('success')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return
        setListError(getErrorMessage(error))
        setListStatus('error')
      })
    return () => controller.abort()
  }, [page, reload])

  useEffect(() => {
    const previousTitle = document.title
    document.title = `Study Planner — невиконаних на сторінці: ${activeCount}`
    return () => { document.title = previousTitle }
  }, [activeCount])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(timer)
  }, [toast])

  function loadPage(nextPage: number) {
    if (mutationLock.current) return
    listController.current?.abort()
    setListStatus('loading')
    setListError('')
    setTasks([])
    setEditingId(null)
    selectTask(null)
    setPageState(Math.min(pageCount, Math.max(1, nextPage)))
    setReload((value) => value + 1)
  }

  async function mutate(operation: () => Promise<void>, message: string): Promise<boolean> {
    if (mutationLock.current) return false
    mutationLock.current = true
    setBusy(true)
    try {
      await operation()
      setRevision((value) => value + 1)
      showToast(message)
      return true
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
      return false
    } finally {
      mutationLock.current = false
      setBusy(false)
    }
  }

  function addTask(draft: TaskDraft) {
    return mutate(async () => {
      const task = await taskRepository.create(draft)
      setFilter('all')
      if (page === 1) {
        setTasks((current) => [task, ...current])
      } else {
        loadAfterCreate()
      }
    }, 'Завдання додано. Зміни доступні до перезавантаження.')
  }

  function loadAfterCreate() {
    listController.current?.abort()
    setTasks([])
    setListStatus('loading')
    setEditingId(null)
    selectTask(null)
    setPageState(1)
    setReload((value) => value + 1)
  }

  function updateTask(id: number, draft: TaskDraft) {
    return mutate(async () => {
      const task = await taskRepository.update(id, draft)
      setTasks((current) => current.map((item) => item.id === id ? task : item))
      setEditingId(null)
    }, 'Зміни збережено в поточній сесії.')
  }

  async function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id)
    if (!task) return
    await mutate(async () => {
      const updated = await taskRepository.update(id, { completed: !task.completed })
      setTasks((current) => current.map((item) => item.id === id ? updated : item))
    }, 'Статус завдання оновлено.')
  }

  function deleteTask(id: number) {
    return mutate(async () => {
      await taskRepository.delete(id)
      setTasks((current) => current.filter((item) => item.id !== id))
      if (editingId === id) setEditingId(null)
      if (selectedId === id) selectTask(null)
    }, 'Завдання видалено в поточній сесії.')
  }

  return (
    <TaskContext.Provider value={{
      tasks, filter, setFilter, page, pageCount, serverTotal, listStatus, listError,
      setPage: loadPage, reloadTasks: () => loadPage(page), busy, revision,
      editingTask, selectedId, selectTask, toast, addTask, updateTask, toggleTask, deleteTask,
      startEditing: setEditingId, cancelEditing: () => setEditingId(null),
      dismissToast: () => setToast(null),
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export default TaskProvider
