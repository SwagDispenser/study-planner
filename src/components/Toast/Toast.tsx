import { useTaskContext } from '../../hooks/useTaskContext'
import './Toast.scss'

function Toast() {
  const { toast, dismissToast } = useTaskContext()
  if (!toast) return null
  return (
    <div className="toast-stack">
      <div className={`toast toast--${toast.kind}`} key={toast.id}>
        <p className="toast__message" role={toast.kind === 'error' ? 'alert' : 'status'}>{toast.message}</p>
        <button className="toast__button" type="button" onClick={dismissToast} aria-label="Закрити повідомлення">Закрити</button>
      </div>
    </div>
  )
}

export default Toast
