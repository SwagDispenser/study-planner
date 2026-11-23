import type { TaskFilter } from '../../types/task'
import { useTaskFilters } from '../../hooks/useTaskFilters'
import './TaskFilters.scss'

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'completed', label: 'Виконані' },
  { value: 'active', label: 'Не виконані' },
]

function TaskFilters() {
  const { filter, priority, changeFilter } = useTaskFilters()
  return (
    <div className="task-filters" role="group" aria-label="Фільтр завдань">
      {filters.map(({ value, label }) => (
        <button
          className={`task-filters__button${filter === value ? ' task-filters__button--active' : ''}`}
          key={value}
          type="button"
          aria-pressed={filter === value}
          onClick={() => changeFilter('status', value)}
        >
          {label}
        </button>
      ))}
      <label className="task-filters__label" htmlFor="priority-filter">Пріоритет</label>
      <select className="task-filters__select" id="priority-filter" value={priority}
        onChange={(event) => changeFilter('priority', event.target.value)}>
        <option value="all">Усі</option><option value="low">Низький</option>
        <option value="medium">Середній</option><option value="high">Високий</option>
      </select>
    </div>
  )
}

export default TaskFilters
