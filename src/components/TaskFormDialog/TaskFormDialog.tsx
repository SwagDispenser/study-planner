import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getErrorMessage } from '../../api/errors'
import { taskSchema } from '../../schemas/taskSchema'
import type { TaskFormData } from '../../schemas/taskSchema'
import type { Task } from '../../types/task'
import './TaskFormDialog.scss'

interface TaskFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
}

function TaskFormDialog({ open, mode, task, onClose, onSubmit }: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { register, handleSubmit, setError, setFocus, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '', description: task?.description ?? '',
      category: task?.category ?? '', priority: task?.priority ?? 'medium',
    },
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (open) {
      if (!dialog.open) dialog.showModal()
      setFocus('title')
    } else if (dialog.open) dialog.close()
    return () => {
      if (dialog.open) dialog.close()
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [open, setFocus])

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit({ ...data, category: data.category || 'Без категорії' })
      onClose()
    } catch (error) {
      setError('root', { message: getErrorMessage(error) })
    }
  })

  return (
    <dialog className="task-form-dialog" ref={dialogRef} aria-labelledby="task-dialog-heading"
      onCancel={(event) => { event.preventDefault(); if (!isSubmitting) onClose() }}>
      <h2 className="task-form-dialog__title" id="task-dialog-heading">
        {mode === 'create' ? 'Нове завдання' : 'Редагування завдання'}
      </h2>
      <form onSubmit={submit} noValidate aria-busy={isSubmitting}>
        <fieldset className="task-form-dialog__fields" disabled={isSubmitting}>
          <div className="task-form-dialog__field task-form-dialog__field--wide">
            <label className="task-form-dialog__label" htmlFor="task-title">Назва *</label>
            <input className="task-form-dialog__control" id="task-title" {...register('title')}
              aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'task-title-error' : undefined} />
            {errors.title && <p className="task-form-dialog__error" id="task-title-error" role="alert">{errors.title.message}</p>}
          </div>
          <div className="task-form-dialog__field task-form-dialog__field--wide">
            <label className="task-form-dialog__label" htmlFor="task-description">Опис</label>
            <textarea className="task-form-dialog__control" id="task-description" rows={3} {...register('description')}
              aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'task-description-error' : undefined} />
            {errors.description && <p className="task-form-dialog__error" id="task-description-error" role="alert">{errors.description.message}</p>}
          </div>
          <div className="task-form-dialog__field">
            <label className="task-form-dialog__label" htmlFor="task-category">Категорія</label>
            <input className="task-form-dialog__control" id="task-category" {...register('category')}
              aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'task-category-error' : undefined} />
            {errors.category && <p className="task-form-dialog__error" id="task-category-error" role="alert">{errors.category.message}</p>}
          </div>
          <div className="task-form-dialog__field">
            <label className="task-form-dialog__label" htmlFor="task-priority">Пріоритет</label>
            <select className="task-form-dialog__control" id="task-priority" {...register('priority')}
              aria-invalid={Boolean(errors.priority)} aria-describedby={errors.priority ? 'task-priority-error' : undefined}>
              <option value="low">Низький</option><option value="medium">Середній</option><option value="high">Високий</option>
            </select>
            {errors.priority && <p className="task-form-dialog__error" id="task-priority-error" role="alert">{errors.priority.message}</p>}
          </div>
          {errors.root && <p className="task-form-dialog__error task-form-dialog__field--wide" role="alert">{errors.root.message}</p>}
          <div className="task-form-dialog__actions">
            <button className="task-form-dialog__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Збереження…' : mode === 'create' ? 'Додати' : 'Зберегти зміни'}
            </button>
            <button className="task-form-dialog__cancel" type="button" onClick={onClose}>Скасувати</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  )
}

export default TaskFormDialog
