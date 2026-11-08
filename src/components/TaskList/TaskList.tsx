import { useTaskContext } from '../../hooks/useTaskContext'
import TaskItem from '../TaskItem/TaskItem'
import './TaskList.scss'

function TaskList() {
  const { tasks, filter } = useTaskContext()
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed
    if (filter === 'active') return !task.completed
    return true
  })

  if (filteredTasks.length === 0) {
    return (
      <p className="task-list__empty" role="status">
        {tasks.length === 0
          ? 'Завдань поки немає. Додайте перше навчальне завдання.'
          : 'За цим фільтром завдань немає.'}
      </p>
    )
  }

  return (
    <ul className="task-list">
      {filteredTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
        />
      ))}
    </ul>
  )
}

export default TaskList
