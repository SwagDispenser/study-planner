import type { Task } from '../../types/task'
import TaskItem from '../TaskItem/TaskItem'
import './TaskList.scss'

interface TaskListProps {
  tasks: Task[]
  emptyMessage?: string
  onToggle: (id: Task['id']) => void
  onDelete: (id: Task['id']) => void
}

function TaskList({
  tasks,
  emptyMessage = 'Завдань поки немає. Додайте перше навчальне завдання.',
  onToggle,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="task-list__empty" role="status">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TaskList
