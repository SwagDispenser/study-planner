import { useTaskContext } from '../../hooks/useTaskContext'
import './TaskToolbar.scss'

function TaskToolbar() {
  const { page, pageCount, serverTotal, setPage, reloadTasks, busy } = useTaskContext()
  return (
    <nav className="task-toolbar" aria-label="Сторінки завдань">
      <p className="task-toolbar__position" role="status">
        Сторінка {page} з {pageCount} · На сервері: {serverTotal}
      </p>
      <div className="task-toolbar__actions">
        <button className="task-toolbar__button" type="button" disabled={busy || page <= 1} onClick={() => setPage(page - 1)}>Попередня</button>
        <button className="task-toolbar__button" type="button" disabled={busy || page >= pageCount} onClick={() => setPage(page + 1)}>Наступна</button>
        <button className="task-toolbar__button" type="button" disabled={busy} onClick={reloadTasks}>Оновити список</button>
      </div>
      <p className="task-toolbar__note">Фільтр і статистика стосуються поточної сторінки. Нові завдання додаються на першу сторінку понад 10 серверних записів.</p>
    </nav>
  )
}

export default TaskToolbar
