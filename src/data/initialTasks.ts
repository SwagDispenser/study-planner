import type { Task } from '../types/task'

export const initialTasks: Task[] = [
  {
    id: 1,
    title: 'React Components',
    description: 'Опрацювати базові принципи компонентів React і передачу props.',
    completed: false,
    priority: 'high',
    category: 'React',
  },
  {
    id: 2,
    title: 'TypeScript Exercises',
    description: 'Виконати практичні вправи з типами та інтерфейсами.',
    completed: true,
    priority: 'medium',
    category: 'TypeScript',
  },
  {
    id: 3,
    title: 'SCSS та BEM',
    description: 'Повторити правила іменування класів і організацію стилів.',
    completed: false,
    priority: 'low',
    category: 'Стилізація',
  },
]
