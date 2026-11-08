import type { TaskFilter } from '../../types/task'
import { useTaskContext } from '../../hooks/useTaskContext'
import './TaskFilters.scss'

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'completed', label: 'Виконані' },
  { value: 'active', label: 'Не виконані' },
]

function TaskFilters() {
  const { filter, setFilter } = useTaskContext()
  return (
    <div className="task-filters" role="group" aria-label="Фільтр завдань">
      {filters.map(({ value, label }) => (
        <button
          className={`task-filters__button${filter === value ? ' task-filters__button--active' : ''}`}
          key={value}
          type="button"
          aria-pressed={filter === value}
          onClick={() => setFilter(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default TaskFilters
