import { useState } from 'react'
import type { SubmitEvent } from 'react'
import type { Task, TaskDraft, TaskPriority } from '../../types/task'
import { useTaskContext } from '../../hooks/useTaskContext'
import './TaskForm.scss'

function TaskForm() {
  const { editingTask } = useTaskContext()
  return <TaskFormFields key={editingTask?.id ?? 'new'} task={editingTask} />
}

function TaskFormFields({ task }: { task: Task | null }) {
  const { addTask, updateTask, cancelEditing, busy, listStatus } = useTaskContext()
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [category, setCategory] = useState(task?.category ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium')
  const [titleError, setTitleError] = useState('')

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setTitleError('Введіть назву завдання. Назва не може складатися лише з пробілів.')
      return
    }

    const draft: TaskDraft = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Без категорії',
      priority,
    }
    if (task) {
      await updateTask(task.id, draft)
      return
    }
    if (!await addTask(draft)) return

    setTitle('')
    setDescription('')
    setCategory('')
    setPriority('medium')
    setTitleError('')
  }

  return (
    <section className="task-form" aria-labelledby="task-form-heading">
      <h2 className="task-form__title" id="task-form-heading">
        {task ? 'Редагування завдання' : 'Нове завдання'}
      </h2>
      <form className="task-form__fields" onSubmit={handleSubmit} noValidate aria-busy={busy}>
        <div className="task-form__field task-form__field--wide">
          <label className="task-form__label" htmlFor="task-title">Назва *</label>
          <input
            disabled={busy}
            className="task-form__control"
            id="task-title"
            type="text"
            value={title}
            required
            autoFocus={task !== null}
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
            disabled={busy}
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
            disabled={busy}
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
            disabled={busy}
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
        <div className="task-form__actions">
          <button className="task-form__submit" type="submit" disabled={busy || listStatus !== 'success'}>
            {busy ? 'Збереження…' : task ? 'Зберегти зміни' : 'Додати'}
          </button>
          {task && (
            <button className="task-form__cancel" type="button" disabled={busy} onClick={cancelEditing}>
              Скасувати редагування
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

export default TaskForm
