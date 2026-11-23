import { useSearchParams } from 'react-router'
import type { TaskFilter, TaskPriority } from '../types/task'

export function useTaskFilters() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status')
  const priorityParam = params.get('priority')
  const filter: TaskFilter = status === 'completed' || status === 'active' ? status : 'all'
  const priority: TaskPriority | 'all' = priorityParam === 'high' || priorityParam === 'medium' || priorityParam === 'low'
    ? priorityParam : 'all'

  function changeFilter(name: 'status' | 'priority', value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value === 'all') next.delete(name)
      else next.set(name, value)
      return next
    })
  }

  return { filter, priority, changeFilter }
}
