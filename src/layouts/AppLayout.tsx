import { NavLink, Outlet, useNavigate } from 'react-router'
import Header from '../components/Header/Header'
import Toast from '../components/Toast/Toast'
import { useAuth } from '../hooks/useAuth'
import './AppLayout.scss'

function AppLayout() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="app-layout">
      <Header />
      <nav className="app-layout__navigation" aria-label="Основна навігація">
        <NavLink className="app-layout__link" to="/tasks">Завдання</NavLink>
        <NavLink className="app-layout__link" to="/profile">Профіль</NavLink>
        {isAuthenticated
          ? <button className="app-layout__logout" type="button" onClick={() => { logout(); void navigate('/login', { replace: true }) }}>Вийти</button>
          : <NavLink className="app-layout__link" to="/login">Вхід</NavLink>}
      </nav>
      <main className="app-layout__content"><Outlet /></main>
      <p className="app-layout__note">DummyJSON симулює зміни завдань. Зміни та сесія входу діють до перезавантаження вкладки; фільтри зберігаються в URL.</p>
      <Toast />
    </div>
  )
}

export default AppLayout
