import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, getErrorMessage, isAbortError } from '../api/errors'
import { requireSession } from '../auth/authSession'
import { taskRepository } from '../repositories/taskRepository'
import type { Task, TaskDraft } from '../types/task'
import { TaskContext } from './TaskContext'
import type { ToastMessage } from './TaskContext'

const PAGE_SIZE = 10

function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
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
    setPageState(Math.min(pageCount, Math.max(1, nextPage)))
    setReload((value) => value + 1)
  }

  async function mutate(operation: () => Promise<void>, message: string): Promise<void> {
    requireSession()
    if (mutationLock.current) throw new ApiError('Дочекайтеся завершення поточної операції.')
    mutationLock.current = true
    setBusy(true)
    try {
      await operation()
      setRevision((value) => value + 1)
      showToast(message)
    } finally {
      mutationLock.current = false
      setBusy(false)
    }
  }

  function addTask(draft: TaskDraft) {
    return mutate(async () => {
      const task = await taskRepository.create(draft)
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
    setPageState(1)
    setReload((value) => value + 1)
  }

  function updateTask(id: number, draft: TaskDraft) {
    return mutate(async () => {
      const task = await taskRepository.update(id, draft)
      setTasks((current) => current.map((item) => item.id === id ? task : item))
    }, 'Зміни збережено в поточній сесії.')
  }

  async function toggleTask(task: Task) {
    const id = task.id
    await mutate(async () => {
      const updated = await taskRepository.update(id, { completed: !task.completed })
      setTasks((current) => current.map((item) => item.id === id ? updated : item))
    }, 'Статус завдання оновлено.')
  }

  function deleteTask(id: number) {
    return mutate(async () => {
      await taskRepository.delete(id)
      setTasks((current) => current.filter((item) => item.id !== id))
    }, 'Завдання видалено в поточній сесії.')
  }

  return (
    <TaskContext.Provider value={{
      tasks, page, pageCount, serverTotal, listStatus, listError,
      setPage: loadPage, reloadTasks: () => loadPage(page), busy, revision,
      toast, addTask, updateTask, toggleTask, deleteTask,
      dismissToast: () => setToast(null),
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export default TaskProvider
