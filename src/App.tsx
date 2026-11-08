import Header from './components/Header/Header'
import TaskForm from './components/TaskForm/TaskForm'
import TaskFilters from './components/TaskFilters/TaskFilters'
import TaskList from './components/TaskList/TaskList'
import TaskStats from './components/TaskStats/TaskStats'
import TaskToolbar from './components/TaskToolbar/TaskToolbar'
import Toast from './components/Toast/Toast'
import './App.scss'

function App() {
  return (
    <main className="app">
      <Header />
      <TaskForm />
      <section className="app__tasks" aria-labelledby="tasks-heading">
        <h2 className="app__section-title" id="tasks-heading">Навчальні завдання</h2>
        <TaskStats />
        <TaskFilters />
        <TaskToolbar />
        <TaskList />
      </section>
      <p className="app__note">Завдання та обраний фільтр зберігаються у цьому браузері.</p>
      <Toast />
    </main>
  )
}

export default App
