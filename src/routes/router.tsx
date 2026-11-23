import { createBrowserRouter, redirect } from 'react-router'
import AppLayout from '../layouts/AppLayout'
import TasksPage from '../pages/TasksPage'
import TaskDetailsPage from '../pages/TaskDetailsPage'
import LoginPage from '../pages/LoginPage'
import ProfilePage from '../pages/ProfilePage'
import NotFoundPage from '../pages/NotFoundPage'
import { profileLoader } from './authLoader'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, loader: () => redirect('/tasks') },
      { path: 'tasks', Component: TasksPage },
      { path: 'tasks/:taskId', Component: TaskDetailsPage },
      { path: 'login', Component: LoginPage },
      { path: 'profile', loader: profileLoader, Component: ProfilePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
