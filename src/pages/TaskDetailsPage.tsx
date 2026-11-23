import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { getErrorMessage, isAbortError } from '../api/errors'
import TaskFormDialog from '../components/TaskFormDialog/TaskFormDialog'
import { useAuth } from '../hooks/useAuth'
import { useTaskContext } from '../hooks/useTaskContext'
import { taskRepository } from '../repositories/taskRepository'
import type { Task } from '../types/task'
import './TaskDetailsPage.scss'

type DetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; task: Task }

const priorityLabels = { low: 'Низький', medium: 'Середній', high: 'Високий' }

function TaskDetailsPage() {
  const { taskId } = useParams()
  const { revision } = useTaskContext()
  const id = Number(taskId)
  if (!taskId || !/^-?[1-9]\d*$/.test(taskId) || !Number.isSafeInteger(id)) {
    return <p role="alert">Некоректний ідентифікатор завдання. <Link to="/tasks">До списку</Link></p>
  }
  return <TaskDetailsView key={`${id}:${revision}`} id={id} />
}

function TaskDetailsView({ id }: { id: number }) {
  const { isAuthenticated } = useAuth()
  const { updateTask, deleteTask, busy } = useTaskContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState<DetailState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [operationError, setOperationError] = useState('')
  const from = (location.state as { from?: string } | null)?.from
  const backTo = from?.startsWith('/tasks?') ? from : '/tasks'

  useEffect(() => {
    const controller = new AbortController()
    taskRepository.getById(id, controller.signal)
      .then((task) => {
        if (!controller.signal.aborted) setState({ status: 'success', task })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && !isAbortError(error)) {
          setState({ status: 'error', message: getErrorMessage(error) })
        }
      })
    return () => controller.abort()
  }, [id, attempt])

  function authorize(): boolean {
    if (isAuthenticated) return true
    void navigate(`/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`)
    return false
  }

  async function remove() {
    if (!authorize()) return
    setOperationError('')
    try {
      await deleteTask(id)
      await navigate(backTo)
    } catch (error) {
      setOperationError(getErrorMessage(error))
    }
  }

  return (
    <section className="task-details-page" aria-labelledby="task-details-heading" aria-busy={state.status === 'loading'}>
      <div className="task-details-page__header">
        <h2 className="task-details-page__heading" id="task-details-heading">Деталі завдання</h2>
        <Link className="task-details-page__button" to={backTo}>До списку</Link>
      </div>
      {state.status === 'loading' && <p role="status">Завантаження деталей…</p>}
      {state.status === 'error' && <div role="alert">
        <p>{state.message}</p>
        <button className="task-details-page__button" type="button" onClick={() => {
          setState({ status: 'loading' }); setAttempt((value) => value + 1)
        }}>Спробувати ще</button>
      </div>}
      {state.status === 'success' && <>
        <h3 className="task-details-page__title">{state.task.title}</h3>
        <p className="task-details-page__description">{state.task.description || 'Опис не вказано.'}</p>
        <dl className="task-details-page__fields">
          <div><dt>Категорія</dt><dd>{state.task.category}</dd></div>
          <div><dt>Пріоритет</dt><dd>{priorityLabels[state.task.priority]}</dd></div>
          <div><dt>Стан</dt><dd>{state.task.completed ? 'Виконано' : 'Не виконано'}</dd></div>
          <div><dt>Хто створив</dt><dd>{state.task.createdBy}</dd></div>
          <div><dt>Дата створення</dt><dd>{state.task.createdAt ? new Date(state.task.createdAt).toLocaleString('uk-UA') : 'Не надана API'}</dd></div>
        </dl>
        <p className="task-details-page__note">Автор і дата — клієнтські metadata. Для серверних записів автор визначається за userId, дата невідома.</p>
        {id < 0 && <p>Це нове завдання поточної сесії. DummyJSON не зберігає його на сервері.</p>}
        <div className="task-details-page__actions">
          <button className="task-details-page__button" type="button" disabled={busy || confirming}
            onClick={() => { if (authorize()) setEditing(true) }}>Редагувати</button>
          <button className="task-details-page__button" type="button" disabled={busy || confirming}
            onClick={() => { if (authorize()) setConfirming(true) }}>Видалити</button>
        </div>
        {confirming && isAuthenticated && <div className="task-details-page__confirmation" role="group" aria-label="Підтвердження видалення">
          <p>Видалити «{state.task.title}»?</p>
          <div className="task-details-page__actions">
            <button className="task-details-page__button" type="button" disabled={busy} onClick={() => { void remove() }}>{busy ? 'Видалення…' : 'Так, видалити'}</button>
            <button className="task-details-page__button" type="button" disabled={busy} onClick={() => setConfirming(false)}>Скасувати</button>
          </div>
        </div>}
        {operationError && <p className="task-details-page__error" role="alert">{operationError}</p>}
        {editing && isAuthenticated && <TaskFormDialog open mode="edit" task={state.task} onClose={() => setEditing(false)}
          onSubmit={async (data) => { await updateTask(id, data) }} />}
      </>}
    </section>
  )
}

export default TaskDetailsPage
