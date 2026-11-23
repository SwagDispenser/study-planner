import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Введіть назву завдання.'),
  description: z.string().trim(),
  category: z.string().trim(),
  priority: z.enum(['low', 'medium', 'high'], { message: 'Оберіть пріоритет.' }),
})

export type TaskFormData = z.infer<typeof taskSchema>
