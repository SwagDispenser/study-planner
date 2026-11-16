import { useState } from 'react'
import type { Task, TaskPriority } from '../../types/task'
import { useTaskContext } from '../../hooks/useTaskContext'
import './TaskItem.scss'

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Низький', medium: 'Середній', high: 'Високий',
}

function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask, busy, editingTask, startEditing, selectTask } = useTaskContext()
  const [confirming, setConfirming] = useState(false)
  const isEditing = editingTask?.id === task.id
  return (
    <li className={`task-item${task.completed ? ' task-item--completed' : ''}${isEditing ? ' task-item--editing' : ''}`}>
      <div className="task-item__details">
        <div className="task-item__meta">
          <span className="task-item__category">{task.category}</span>
          <span className={`task-item__priority task-item__priority--${task.priority}`}>
            Пріоритет: {priorityLabels[task.priority]}
          </span>
          {task.id < 0 && <span className="task-item__category">Створено в цій сесії</span>}
        </div>
        <h3 className="task-item__title">{task.title}</h3>
        <p className="task-item__description">{task.description}</p>
      </div>
      <div className="task-item__actions">
        <label className="task-item__status">
          <input className="task-item__checkbox" type="checkbox" checked={task.completed}
            disabled={busy || confirming} aria-label={`Завдання «${task.title}» виконано`}
            onChange={() => { void toggleTask(task.id) }} />
          {task.completed ? 'Виконано' : 'Не виконано'}
        </label>
        <div className="task-item__buttons">
          <button className="task-item__edit" type="button" onClick={() => selectTask(task.id)}>Деталі</button>
          <button className="task-item__edit" type="button" disabled={busy || confirming}
            aria-label={`Редагувати завдання «${task.title}»`} aria-pressed={isEditing}
            onClick={() => startEditing(task.id)}>Редагувати</button>
          <button className="task-item__delete" type="button" disabled={busy || confirming}
            aria-label={`Видалити завдання «${task.title}»`}
            onClick={() => setConfirming(true)}>Видалити</button>
        </div>
        {confirming && (
          <div className="task-item__confirmation" role="group" aria-label="Підтвердження видалення">
            <p className="task-item__question">Видалити «{task.title}»?</p>
            <div className="task-item__buttons">
              <button className="task-item__delete" type="button" disabled={busy}
                onClick={async () => { if (await deleteTask(task.id)) setConfirming(false) }}>
                {busy ? 'Видалення…' : 'Так, видалити'}
              </button>
              <button className="task-item__edit" type="button" disabled={busy} onClick={() => setConfirming(false)}>Скасувати</button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

export default TaskItem
