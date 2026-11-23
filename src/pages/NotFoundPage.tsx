import { Link } from 'react-router'

function NotFoundPage() {
  return <section><h2>Сторінку не знайдено</h2><Link to="/tasks">До завдань</Link></section>
}

export default NotFoundPage
