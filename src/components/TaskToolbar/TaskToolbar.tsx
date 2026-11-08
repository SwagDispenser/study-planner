import { useTaskContext } from '../../hooks/useTaskContext'
import './TaskToolbar.scss'

function TaskToolbar() {
  const { resetTasks } = useTaskContext()
  return (
    <div className="task-toolbar">
      <button className="task-toolbar__button" type="button" onClick={resetTasks}>Скинути дані</button>
    </div>
  )
}

export default TaskToolbar
