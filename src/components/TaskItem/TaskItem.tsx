import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { getErrorMessage } from '../../api/errors'
import type { Task, TaskPriority } from '../../types/task'
import { useTaskContext } from '../../hooks/useTaskContext'
import { useAuth } from '../../hooks/useAuth'
import './TaskItem.scss'

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Низький', medium: 'Середній', high: 'Високий',
}

function TaskItem({ task }: { task: Task }) {
  const location = useLocation()
  const { toggleTask, busy } = useTaskContext()
  const { isAuthenticated } = useAuth()
  const [error, setError] = useState('')
  return (
    <li className={`task-item${task.completed ? ' task-item--completed' : ''}`}>
      <div className="task-item__details">
        <div className="task-item__meta">
          <span className="task-item__category">{task.category}</span>
          <span className={`task-item__priority task-item__priority--${task.priority}`}>Пріоритет: {priorityLabels[task.priority]}</span>
          {task.id < 0 && <span className="task-item__category">Створено в цій сесії</span>}
        </div>
        <h3 className="task-item__title">{task.title}</h3>
        <p className="task-item__description">{task.description}</p>
        {error && <p className="task-item__error" role="alert">{error}</p>}
      </div>
      <div className="task-item__actions">
        <label className="task-item__status">
          <input className="task-item__checkbox" type="checkbox" checked={task.completed}
            disabled={busy || !isAuthenticated} aria-label={`Завдання «${task.title}» виконано`}
            onChange={async () => {
              setError('')
              try { await toggleTask(task) } catch (error) { setError(getErrorMessage(error)) }
            }} />
          {task.completed ? 'Виконано' : 'Не виконано'}
        </label>
        <Link className="task-item__edit" to={`/tasks/${task.id}`} state={{ from: location.pathname + location.search }}>Деталі</Link>
      </div>
    </li>
  )
}

export default TaskItem
