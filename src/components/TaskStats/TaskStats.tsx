import type { Task } from '../../types/task'
import './TaskStats.scss'

interface TaskStatsProps {
  tasks: Task[]
}

function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const active = total - completed

  return (
    <dl className="task-stats" aria-label="Статистика завдань" aria-live="polite">
      <div className="task-stats__item">
        <dt>Усього:</dt>
        <dd className="task-stats__value">{total}</dd>
      </div>
      <div className="task-stats__item">
        <dt>Виконано:</dt>
        <dd className="task-stats__value">{completed}</dd>
      </div>
      <div className="task-stats__item">
        <dt>Не виконано:</dt>
        <dd className="task-stats__value">{active}</dd>
      </div>
    </dl>
  )
}

export default TaskStats
