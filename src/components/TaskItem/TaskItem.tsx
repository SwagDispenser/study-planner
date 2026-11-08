import type { Task, TaskPriority } from '../../types/task'
import { useTaskContext } from '../../hooks/useTaskContext'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, requestDelete, pendingDeletion, editingTask, startEditing } = useTaskContext()
  const isPending = pendingDeletion?.taskId === task.id
  const isEditing = editingTask?.id === task.id
  return (
    <li className={`task-item${task.completed ? ' task-item--completed' : ''}${isPending ? ' task-item--pending' : ''}${isEditing ? ' task-item--editing' : ''}`}>
      <div className="task-item__details">
        <div className="task-item__meta">
          <span className="task-item__category">{task.category}</span>
          <span className={`task-item__priority task-item__priority--${task.priority}`}>
            Пріоритет: {priorityLabels[task.priority]}
          </span>
        </div>
        <h3 className="task-item__title">{task.title}</h3>
        <p className="task-item__description">{task.description}</p>
        {isPending && <p className="task-item__pending">Буде видалено. Можна скасувати.</p>}
      </div>
      <div className="task-item__actions">
        <label className="task-item__status">
          <input
            className="task-item__checkbox"
            type="checkbox"
            checked={task.completed}
            disabled={isPending}
            aria-label={`Завдання «${task.title}» виконано`}
            onChange={() => toggleTask(task.id)}
          />
          {task.completed ? 'Виконано' : 'Не виконано'}
        </label>
        <div className="task-item__buttons">
          <button
            className="task-item__edit"
            type="button"
            aria-label={`Редагувати завдання «${task.title}»`}
            aria-pressed={isEditing}
            disabled={isPending}
            onClick={() => startEditing(task.id)}
          >
            Редагувати
          </button>
          <button
            className="task-item__delete"
            type="button"
            aria-label={`Видалити завдання «${task.title}»`}
            disabled={pendingDeletion !== null}
            onClick={() => requestDelete(task.id)}
          >
            Видалити
          </button>
        </div>
      </div>
    </li>
  )
}

export default TaskItem
