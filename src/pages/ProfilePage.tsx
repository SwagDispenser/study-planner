import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import './ProfilePage.scss'

function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  if (!user || !isAuthenticated) return null
  return (
    <section className="profile-page" aria-labelledby="profile-heading">
      <h2 className="profile-page__heading" id="profile-heading">Профіль</h2>
      <dl className="profile-page__fields">
        <div><dt>Ім’я користувача</dt><dd>{user.username}</dd></div>
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Статус</dt><dd>Авторизовано</dd></div>
      </dl>
      <button className="profile-page__logout" type="button" onClick={() => { logout(); void navigate('/login', { replace: true }) }}>Вийти</button>
    </section>
  )
}

export default ProfilePage
