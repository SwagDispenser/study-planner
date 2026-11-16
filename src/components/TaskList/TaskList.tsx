import { useTaskContext } from '../../hooks/useTaskContext'
import TaskItem from '../TaskItem/TaskItem'
import './TaskList.scss'

function TaskList() {
  const { tasks, filter, listStatus, listError, reloadTasks } = useTaskContext()
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed
    if (filter === 'active') return !task.completed
    return true
  })

  if (listStatus === 'loading') return <p className="task-list__empty" role="status">Завантаження завдань…</p>

  if (listStatus === 'error') return (
    <div className="task-list__empty" role="alert">
      <p>Помилка завантаження. {listError}</p>
      <button className="task-list__retry" type="button" onClick={reloadTasks}>Спробувати ще</button>
    </div>
  )

  if (filteredTasks.length === 0) {
    return (
      <p className="task-list__empty" role="status">
        {tasks.length === 0
          ? 'Завдань на цій сторінці не знайдено. Додайте завдання або перейдіть на іншу сторінку.'
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
