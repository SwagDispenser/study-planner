import type { TaskFilter } from '../../types/task'
import './TaskFilters.scss'

interface TaskFiltersProps {
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'completed', label: 'Виконані' },
  { value: 'active', label: 'Не виконані' },
]

function TaskFilters({ filter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="task-filters" role="group" aria-label="Фільтр завдань">
      {filters.map(({ value, label }) => (
        <button
          className={`task-filters__button${filter === value ? ' task-filters__button--active' : ''}`}
          key={value}
          type="button"
          aria-pressed={filter === value}
          onClick={() => onFilterChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default TaskFilters
