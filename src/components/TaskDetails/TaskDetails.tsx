import { useEffect, useState } from 'react'
import { getErrorMessage, isAbortError } from '../../api/errors'
import { useTaskContext } from '../../hooks/useTaskContext'
import { taskRepository } from '../../repositories/taskRepository'
import type { Task } from '../../types/task'
import './TaskDetails.scss'

type DetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; task: Task }

const priorityLabels = { low: 'Низький', medium: 'Середній', high: 'Високий' }

function TaskDetails({ id }: { id: number }) {
  const { selectTask } = useTaskContext()
  const [state, setState] = useState<DetailState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

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

  return (
    <section className="task-details" aria-labelledby="task-details-heading" aria-busy={state.status === 'loading'}>
      <div className="task-details__header">
        <h2 className="task-details__heading" id="task-details-heading">Деталі завдання</h2>
        <button className="task-details__button" type="button" onClick={() => selectTask(null)}>Закрити деталі</button>
      </div>
      {state.status === 'loading' && <p role="status">Завантаження деталей…</p>}
      {state.status === 'error' && (
        <div role="alert">
          <p>{state.message}</p>
          <button className="task-details__button" type="button" onClick={() => {
            setState({ status: 'loading' })
            setAttempt((value) => value + 1)
          }}>Спробувати ще</button>
        </div>
      )}
      {state.status === 'success' && (
        <>
          <h3 className="task-details__title">{state.task.title}</h3>
          <p className="task-details__description">{state.task.description || 'Опис не вказано.'}</p>
          <dl className="task-details__fields">
            <div><dt>Категорія</dt><dd>{state.task.category}</dd></div>
            <div><dt>Пріоритет</dt><dd>{priorityLabels[state.task.priority]}</dd></div>
            <div><dt>Стан</dt><dd>{state.task.completed ? 'Виконано' : 'Не виконано'}</dd></div>
          </dl>
          {id < 0 && <p>Це нове завдання поточної сесії. DummyJSON не зберігає його на сервері.</p>}
        </>
      )}
    </section>
  )
}

export default TaskDetails
