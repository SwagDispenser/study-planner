import type { Task, TaskPriority } from '../../types/task'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
  onToggle: (id: Task['id']) => void
  onDelete: (id: Task['id']) => void
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className={`task-item${task.completed ? ' task-item--completed' : ''}`}>
      <div className="task-item__details">
        <div className="task-item__meta">
          <span className="task-item__category">{task.category}</span>
          <span className={`task-item__priority task-item__priority--${task.priority}`}>
            Пріоритет: {priorityLabels[task.priority]}
          </span>
        </div>
        <h3 className="task-item__title">{task.title}</h3>
        <p className="task-item__description">{task.description}</p>
      </div>
      <div className="task-item__actions">
        <label className="task-item__status">
          <input
            className="task-item__checkbox"
            type="checkbox"
            checked={task.completed}
            aria-label={`Завдання «${task.title}» виконано`}
            onChange={() => onToggle(task.id)}
          />
          {task.completed ? 'Виконано' : 'Не виконано'}
        </label>
        <button
          className="task-item__delete"
          type="button"
          aria-label={`Видалити завдання «${task.title}»`}
          onClick={() => onDelete(task.id)}
        >
          Видалити
        </button>
      </div>
    </li>
  )
}

export default TaskItem
