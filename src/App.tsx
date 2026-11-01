import { useState } from 'react'
import Header from './components/Header/Header'
import TaskForm from './components/TaskForm/TaskForm'
import TaskFilters from './components/TaskFilters/TaskFilters'
import TaskList from './components/TaskList/TaskList'
import TaskStats from './components/TaskStats/TaskStats'
import { initialTasks } from './data/initialTasks'
import type { Task, TaskDraft, TaskFilter } from './types/task'
import './App.scss'

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<TaskFilter>('all')

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed
    if (filter === 'active') return !task.completed
    return true
  })

  function handleAddTask(draft: TaskDraft) {
    setTasks((currentTasks) => [
      ...currentTasks,
      {
        ...draft,
        id: Math.max(0, ...currentTasks.map((task) => task.id)) + 1,
        completed: false,
      },
    ])
    setFilter('all')
  }

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
      <TaskForm onAdd={handleAddTask} />
      <section className="app__tasks" aria-labelledby="tasks-heading">
        <h2 className="app__section-title" id="tasks-heading">Навчальні завдання</h2>
        <TaskStats tasks={tasks} />
        <TaskFilters filter={filter} onFilterChange={setFilter} />
        <TaskList
          tasks={filteredTasks}
          emptyMessage={tasks.length === 0
            ? 'Завдань поки немає. Додайте перше навчальне завдання.'
            : 'За цим фільтром завдань немає.'}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      </section>
      <p className="app__note">Зміни зберігаються лише до перезавантаження сторінки.</p>
    </main>
  )
}

export default App
