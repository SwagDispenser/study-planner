export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskFilter = 'all' | 'completed' | 'active'

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  priority: TaskPriority
  category: string
  // Client-owned metadata: DummyJSON Todos does not provide these fields.
  createdBy: string
  createdAt: string | null
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'category' | 'priority'>
