import { useTaskContext } from '../../hooks/useTaskContext'
import './Toast.scss'

function Toast() {
  const { toast, pendingDeletion, undoDelete, dismissToast } = useTaskContext()
  if (!toast && !pendingDeletion) return null

  return (
    <div className="toast-stack">
      {pendingDeletion && (
        <div className="toast toast--pending" key={pendingDeletion.token}>
          <p className="toast__message" role="status">Завдання буде видалено через 5 секунд.</p>
          <button className="toast__button" type="button" onClick={undoDelete}>Скасувати</button>
          <div className="toast__progress" aria-hidden="true" />
        </div>
      )}
      {toast && (
        <div className={`toast toast--${toast.kind}`} key={toast.id}>
          <p className="toast__message" role={toast.kind === 'error' ? 'alert' : 'status'}>
            {toast.message}
          </p>
          <button className="toast__button" type="button" onClick={dismissToast} aria-label="Закрити повідомлення">
            Закрити
          </button>
        </div>
      )}
    </div>
  )
}

export default Toast
