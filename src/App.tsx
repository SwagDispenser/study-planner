import { useState } from 'react'
import Header from './components/Header/Header'
import TaskList from './components/TaskList/TaskList'
import { initialTasks } from './data/initialTasks'
import type { Task } from './types/task'
import './App.scss'

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  function handleToggleTask(id: Task['id']) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function handleDeleteTask(id: Task['id']) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id))
  }

  return (
    <main className="app">
      <Header />
      <section className="app__tasks" aria-labelledby="tasks-heading">
        <h2 className="app__section-title" id="tasks-heading">Навчальні завдання</h2>
        <TaskList
          tasks={tasks}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      </section>
      <p className="app__note">Зміни зберігаються лише до перезавантаження сторінки.</p>
    </main>
  )
}

export default App
