import Header from './components/Header/Header'
import TaskForm from './components/TaskForm/TaskForm'
import TaskFilters from './components/TaskFilters/TaskFilters'
import TaskList from './components/TaskList/TaskList'
import TaskStats from './components/TaskStats/TaskStats'
import TaskToolbar from './components/TaskToolbar/TaskToolbar'
import Toast from './components/Toast/Toast'
import TaskDetails from './components/TaskDetails/TaskDetails'
import { useTaskContext } from './hooks/useTaskContext'
import './App.scss'

function App() {
  const { selectedId, revision } = useTaskContext()
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
        {selectedId !== null && <TaskDetails key={`${selectedId}:${revision}`} id={selectedId} />}
      </section>
      <p className="app__note">DummyJSON симулює зміни: створення, редагування й видалення діють до перезавантаження. Опис, категорія та пріоритет зберігаються лише в поточній сесії; у браузері зберігається тільки фільтр.</p>
      <Toast />
    </main>
  )
}

export default App
