import { useState } from 'react'
import type { SubmitEvent } from 'react'
import type { TaskDraft, TaskPriority } from '../../types/task'
import './TaskForm.scss'

interface TaskFormProps {
  onAdd: (task: TaskDraft) => void
}

function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [titleError, setTitleError] = useState('')

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setTitleError('Введіть назву завдання. Назва не може складатися лише з пробілів.')
      return
    }

    onAdd({
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Без категорії',
      priority,
    })

    setTitle('')
    setDescription('')
    setCategory('')
    setPriority('medium')
    setTitleError('')
  }

  return (
    <section className="task-form" aria-labelledby="task-form-heading">
      <h2 className="task-form__title" id="task-form-heading">Нове завдання</h2>
      <form className="task-form__fields" onSubmit={handleSubmit} noValidate>
        <div className="task-form__field task-form__field--wide">
          <label className="task-form__label" htmlFor="task-title">Назва *</label>
          <input
            className="task-form__control"
            id="task-title"
            type="text"
            value={title}
            required
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'task-title-error' : undefined}
            onChange={(event) => {
              setTitle(event.target.value)
              setTitleError('')
            }}
          />
          {titleError && (
            <p className="task-form__error" id="task-title-error" role="alert">
              {titleError}
            </p>
          )}
        </div>
        <div className="task-form__field task-form__field--wide">
          <label className="task-form__label" htmlFor="task-description">Опис</label>
          <textarea
            className="task-form__control task-form__control--description"
            id="task-description"
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="task-form__field">
          <label className="task-form__label" htmlFor="task-category">Категорія</label>
          <input
            className="task-form__control"
            id="task-category"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </div>
        <div className="task-form__field">
          <label className="task-form__label" htmlFor="task-priority">Пріоритет</label>
          <select
            className="task-form__control"
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            <option value="low">Низький</option>
            <option value="medium">Середній</option>
            <option value="high">Високий</option>
          </select>
        </div>
        <button className="task-form__submit" type="submit">Додати</button>
      </form>
    </section>
  )
}

export default TaskForm
