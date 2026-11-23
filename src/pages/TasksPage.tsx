import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import TaskFilters from '../components/TaskFilters/TaskFilters'
import TaskList from '../components/TaskList/TaskList'
import TaskStats from '../components/TaskStats/TaskStats'
import TaskToolbar from '../components/TaskToolbar/TaskToolbar'
import TaskFormDialog from '../components/TaskFormDialog/TaskFormDialog'
import { useAuth } from '../hooks/useAuth'
import { useTaskContext } from '../hooks/useTaskContext'
import type { TaskFormData } from '../schemas/taskSchema'
import './TasksPage.scss'

function TasksPage() {
  const { isAuthenticated } = useAuth()
  const { addTask, busy, listStatus } = useTaskContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  function openCreate() {
    if (!isAuthenticated) {
      void navigate(`/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    setDialogOpen(true)
  }

  async function create(data: TaskFormData) {
    await addTask(data)
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('status')
      next.delete('priority')
      return next
    })
  }

  return (
    <section className="tasks-page" aria-labelledby="tasks-heading">
      <div className="tasks-page__header">
        <h2 className="tasks-page__heading" id="tasks-heading">Навчальні завдання</h2>
        <button className="tasks-page__create" type="button" aria-label="Створити завдання"
          disabled={busy || (isAuthenticated && listStatus !== 'success')} onClick={openCreate}>+</button>
      </div>
      {!isAuthenticated && <p className="tasks-page__hint">Увійдіть, щоб створювати, редагувати та видаляти завдання.</p>}
      <TaskStats /><TaskFilters /><TaskToolbar /><TaskList />
      {dialogOpen && isAuthenticated && <TaskFormDialog open mode="create" onClose={() => setDialogOpen(false)} onSubmit={create} />}
    </section>
  )
}

export default TasksPage
